import {
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  VersionedTransaction,
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
import axios from "axios";
import cors from "cors";
export const prisma = new PrismaClient();
const connection = new Connection("https://api.mainnet-beta.solana.com");

const app = express();
app.use(express.json());
app.use(cors());
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

    res.status(200).json({
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

    res.status(200).json({
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
    if (lamports == 0) {
      res.status(202).json({
        message: "No Funds to Withdraw",
      });
      return;
    }
    // 5k lamports is the fees of a transfer transaction
    const lamportsAfterfees = lamports - 5000;
    if (all) {
      const transactionWidthdrawAll = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(user.publicKey),
          toPubkey: new PublicKey(address),
          lamports: lamportsAfterfees,
        })
      );
      const secretKey = new Uint8Array(Buffer.from(user.privateKey, "hex"));
      const keypair = Keypair.fromSecretKey(secretKey);
      await sendAndConfirmTransaction(connection, transactionWidthdrawAll, [
        keypair,
      ]);

      res.status(200).json({ message: "Withdrew entire wallet balance" });
      return;
    }

    // When all is false and a specific amount is provided
    const transactionWidthdraw = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(user.publicKey),
        toPubkey: new PublicKey(address),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
    const secretKey = new Uint8Array(Buffer.from(user.privateKey, "hex"));
    const keypair = Keypair.fromSecretKey(secretKey);
    console.log("transaction started ");
    await sendAndConfirmTransaction(connection, transactionWidthdraw, [
      keypair,
    ]);
    console.log("transaction completed ");

    // Added response for the partial withdrawal case
    res.status(200).json({
      message: "Partial withdrawal successful",
      amount: amount,
    });
    return;
  }

  res.status(404).json({ message: "user not found" });
});

app.post("/api/v1/getPrice", async (req, res) => {
  const token_address = req.body.token_address;

  const price = await axios.get(
    `https://api.jup.ag/price/v2?ids=${token_address},So11111111111111111111111111111111111111112`
  );

  try {
    const extra = await axios.get(
      `https://tokens.jup.ag/token/${token_address}`
    );
    res.status(200).json({
      token_price: price.data.data[token_address],
      // quote: data,
      extra_info: extra.data,
    });
    return;
  } catch (error) {
    res.status(303).json({ message: "Enter the correct Token address" });
  }
});

// app.post("/api/v1/buy", authMiddleware, async (req, res) => {
//   const token_address = req.body.token_address;
//   const amount = req.body.amount;
//   const finalAmount = amount * LAMPORTS_PER_SOL;
//   const quoteResponse = await (
//     await fetch(
//       `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112\&outputMint=${token_address}\&amount=${finalAmount}\&slippageBps=50`
//     )
//   ).json();
//   // const data = await quoteResponse.json();
//   //@ts-ignore
//   const userid = req.user.id;
//   const user = await prisma.user.findUnique({
//     where: {
//       id: userid,
//     },
//   });
//   if (!user) {
//     res.status(404).json({ message: "user not found" });
//     return;
//   }
//   const secretKey = new Uint8Array(Buffer.from(user!.privateKey, "hex"));
//   const keypair = Keypair.fromSecretKey(secretKey);
//   const { swapTransaction } = await (
//     await fetch("https://quote-api.jup.ag/v6/swap", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         // quoteResponse from /quote api
//         quoteResponse,
//         // user public key to be used for the swap
//         userPublicKey: user?.publicKey.toString(),
//         // auto wrap and unwrap SOL. default is true
//         wrapAndUnwrapSol: true,
//         // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
//         // feeAccount: "fee_account_public_key"
//       }),
//     })
//   ).json();
//   /// ---------------------------
//   const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
//   if (!swapTransactionBuf || swapTransactionBuf.length === 0) {
//     console.error("Invalid swap transaction");
//     res.status(500).json({ error: "Failed to process swap transaction" });
//     return;
//   }
//   var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
//   console.log(transaction);

//   transaction.sign([keypair]);
//   const latestBlockHash = await connection.getLatestBlockhash();
//   const rawTransaction = transaction.serialize();
//   const txid = await connection.sendRawTransaction(rawTransaction, {
//     skipPreflight: true,
//     maxRetries: 2,
//   });
//   console.log("Awaiting for trnsaciton confirm");
//   connection.confirmTransaction({
//     blockhash: latestBlockHash.blockhash,
//     lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
//     signature: txid,
//   });
//   console.log(`https://solscan.io/tx/${txid}`);

//   res.status(200).json({
//     message: "Transaction initiated",
//     tsxid: txid,
//     url: `https://solscan.io/tx/${txid}`,
//   });
//   return
// });


app.post("/api/v1/buy", authMiddleware, async (req, res) => {
  try {
    const token_address = req.body.token_address;
    const amount = req.body.amount;
    const finalAmount = amount * LAMPORTS_PER_SOL;
    const quoteResponse = await (
      await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112\&outputMint=${token_address}\&amount=${finalAmount}\&slippageBps=50`
      )
    ).json();
    //@ts-ignore
    const userid = req.user.id;
    const user = await prisma.user.findUnique({
      where: {
        id: userid,
      },
    });

    if (!user) {
      res.status(404).json({ message: "user not found" });
      return 
    }

    const secretKey = new Uint8Array(Buffer.from(user!.privateKey, "hex"));
    const keypair = Keypair.fromSecretKey(secretKey);
    const { swapTransaction } = await (
      await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: user?.publicKey.toString(),
          wrapAndUnwrapSol: true,
        }),
      })
    ).json();

    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
    if (!swapTransactionBuf || swapTransactionBuf.length === 0) {
      res.status(500).json({ error: "Failed to process swap transaction" });
      return 
    }

    var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    transaction.sign([keypair]);
    const latestBlockHash = await connection.getLatestBlockhash();
    const rawTransaction = transaction.serialize();
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2,
    });

    const url = `https://solscan.io/tx/${txid}`;
    
    res.status(200).json({
      message: "Transaction initiated",
      txid: txid,
      url: url,
    });
    return 
  } catch (error) {
    console.error("Error in buy endpoint:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
    return 
  }
});


app.post("/api/v1/health", authMiddleware, async (req, res) => {
  res.status(200).json({
    message: "healthy",
  });
});

app.listen(5001);
