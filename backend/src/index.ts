import {
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import express from "express";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { PrismaClient } from "@prisma/client";
import { generateMnemonic } from "bip39";
import nacl from "tweetnacl";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authMiddleware } from "./middleware";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export const prisma = new PrismaClient();
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const app = express();
app.use(express.json());

export const JWT_SECRET = "secret";

app.post("/api/v1/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const mnemonic = await generateMnemonic();
    const seed = await mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/1'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);
    // console.log(keypair);
    const publicKey = keypair.publicKey.toBase58();
    const privateKey = Buffer.from(keypair.secretKey).toString("hex");
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        publicKey,
        privateKey,
        mnemonic,
      },
      select: { id: true, username: true, publicKey: true },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        publicKey: user.publicKey,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Failed to create user",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        publicKey: user.publicKey,
      },
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(500).json({ message: "Server error during sign-in" });
  }
});

app.get("/api/v1/wallet", authMiddleware, async (req, res) => {
  //@ts-ignore
  const userid = req.user.id;
  const user = await prisma.user.findUnique({
    where: {
      id: userid,
    },
  });
  if (user) {
    const balance = await connection.getBalance(new PublicKey(user.publicKey));
    res.status(200).json({
      publicKey: user.publicKey,
      privateKey: user.privateKey,
      balance: balance / LAMPORTS_PER_SOL,
    });
    return;
  }
  res.status(400).json({
    message: "Cant find the user",
  });
});

app.get("/api/v1/seedPhrase", authMiddleware, async (req, res) => {
  //@ts-ignore
  const userid = req.user.id;
  const user = await prisma.user.findUnique({
    where: {
      id: userid,
    },
  });
  if (user) {
    res.status(200).json({
      seedphrase: user.mnemonic,
    });
    return;
  }
  res.status(400).json({
    message: "Cant find the user",
  });
});

app.post("/api/v1/widthdraw", authMiddleware, async (req, res) => {
  const { all, amount, address } = req.body;
  if (all === undefined) {
    res.status(400).json({ message: "Please specify 'all' parameter" });
    return;
  }
  if (!all && (!amount || amount <= 0)) {
    res.status(400).json({
      message: "When 'all' is false, a valid amount must be provided",
    });
    return;
  }
  //@ts-ignore
  const userid = req.user.id;
  const user = await prisma.user.findUnique({
    where: {
      id: userid,
    },
  });
  if (user) {
    const lamports = await connection.getBalance(new PublicKey(user.publicKey));

    // 5k lamports is the fees of a transfer transaction
    const lamportsAfterfees = lamports - 5000
    if (all) {
      const transactionWidthdrawAll = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(user.publicKey),
          toPubkey: new PublicKey(address),
          lamports: lamportsAfterfees  ,
        })
      );
      const secretKey = new Uint8Array(Buffer.from(user.privateKey, "hex"));
      const keypair = Keypair.fromSecretKey(secretKey);
      await sendAndConfirmTransaction(connection, transactionWidthdrawAll, [
        keypair,
      ]);

      res.status(200).json({ message: "The whole wallet if empty" });
      return;
    }
    const transactionWidthdraw = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(user.publicKey),
        toPubkey: new PublicKey(address),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
    const secretKey = new Uint8Array(Buffer.from(user.privateKey, "hex"));
    const keypair = Keypair.fromSecretKey(secretKey);
    await sendAndConfirmTransaction(connection, transactionWidthdraw, [
      keypair,
    ]);
    res.status(200).json({ message: "withdrawl done !" });
  }
});

app.post("/api/v1/buy",authMiddleware, async (req,res) =>{
  
})





app.listen(3000);
