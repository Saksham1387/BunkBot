"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.prisma = void 0;
const web3_js_1 = require("@solana/web3.js");
const express_1 = __importDefault(require("express"));
const bip39_1 = require("bip39");
const ed25519_hd_key_1 = require("ed25519-hd-key");
const client_1 = require("@prisma/client");
const bip39_2 = require("bip39");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const middleware_1 = require("./middleware");
const web3_js_2 = require("@solana/web3.js");
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
exports.prisma = new client_1.PrismaClient();
const connection = new web3_js_2.Connection("https://api.mainnet-beta.solana.com");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
exports.JWT_SECRET = "secret";
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: "Username and password are required" });
        return;
    }
    try {
        const existingUser = yield exports.prisma.user.findUnique({
            where: { username },
        });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const mnemonic = yield (0, bip39_2.generateMnemonic)();
        const seed = yield (0, bip39_1.mnemonicToSeed)(mnemonic);
        const path = `m/44'/501'/1'/0'`;
        const derivedSeed = (0, ed25519_hd_key_1.derivePath)(path, seed.toString("hex")).key;
        const secret = tweetnacl_1.default.sign.keyPair.fromSeed(derivedSeed).secretKey;
        const keypair = web3_js_1.Keypair.fromSecretKey(secret);
        // console.log(keypair);
        const publicKey = keypair.publicKey.toBase58();
        const privateKey = Buffer.from(keypair.secretKey).toString("hex");
        const user = yield exports.prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                publicKey,
                privateKey,
                mnemonic,
            },
            select: { id: true, username: true, publicKey: true },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, exports.JWT_SECRET, {
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
    }
    catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Failed to create user",
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield exports.prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, exports.JWT_SECRET, {
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
    }
    catch (error) {
        console.error("Sign-in error:", error);
        res.status(500).json({ message: "Server error during sign-in" });
    }
}));
app.get("/api/v1/wallet", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userid = req.user.id;
    const user = yield exports.prisma.user.findUnique({
        where: {
            id: userid,
        },
    });
    if (user) {
        const balance = yield connection.getBalance(new web3_js_2.PublicKey(user.publicKey));
        res.status(200).json({
            publicKey: user.publicKey,
            privateKey: user.privateKey,
            balance: balance / web3_js_2.LAMPORTS_PER_SOL,
        });
        return;
    }
    res.status(400).json({
        message: "Cant find the user",
    });
}));
app.get("/api/v1/seedPhrase", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userid = req.user.id;
    const user = yield exports.prisma.user.findUnique({
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
}));
app.post("/api/v1/widthdraw", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const user = yield exports.prisma.user.findUnique({
        where: {
            id: userid,
        },
    });
    if (user) {
        const lamports = yield connection.getBalance(new web3_js_2.PublicKey(user.publicKey));
        if (lamports == 0) {
            res.status(202).json({
                message: "No Funds to Withdraw",
            });
            return;
        }
        // 5k lamports is the fees of a transfer transaction
        const lamportsAfterfees = lamports - 5000;
        if (all) {
            const transactionWidthdrawAll = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                fromPubkey: new web3_js_2.PublicKey(user.publicKey),
                toPubkey: new web3_js_2.PublicKey(address),
                lamports: lamportsAfterfees,
            }));
            const secretKey = new Uint8Array(Buffer.from(user.privateKey, "hex"));
            const keypair = web3_js_1.Keypair.fromSecretKey(secretKey);
            yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transactionWidthdrawAll, [
                keypair,
            ]);
            res.status(200).json({ message: "Withdrew entire wallet balance" });
            return;
        }
        // When all is false and a specific amount is provided
        const transactionWidthdraw = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: new web3_js_2.PublicKey(user.publicKey),
            toPubkey: new web3_js_2.PublicKey(address),
            lamports: amount * web3_js_2.LAMPORTS_PER_SOL,
        }));
        const secretKey = new Uint8Array(Buffer.from(user.privateKey, "hex"));
        const keypair = web3_js_1.Keypair.fromSecretKey(secretKey);
        console.log("transaction started ");
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transactionWidthdraw, [
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
}));
app.post("/api/v1/getPrice", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token_address = req.body.token_address;
    const price = yield axios_1.default.get(`https://api.jup.ag/price/v2?ids=${token_address},So11111111111111111111111111111111111111112`);
    try {
        const extra = yield axios_1.default.get(`https://tokens.jup.ag/token/${token_address}`);
        res.status(200).json({
            token_price: price.data.data[token_address],
            // quote: data,
            extra_info: extra.data,
        });
        return;
    }
    catch (error) {
        res.status(303).json({ message: "Enter the correct Token address" });
    }
}));
app.post("/api/v1/buy", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token_address = req.body.token_address;
        const amount = req.body.amount;
        const finalAmount = amount * web3_js_2.LAMPORTS_PER_SOL;
        const quoteResponse = yield (yield fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112\&outputMint=${token_address}\&amount=${finalAmount}\&slippageBps=50`)).json();
        //@ts-ignore
        const userid = req.user.id;
        const user = yield exports.prisma.user.findUnique({
            where: {
                id: userid,
            },
        });
        if (!user) {
            res.status(404).json({ message: "user not found" });
            return;
        }
        const secretKey = new Uint8Array(Buffer.from(user.privateKey, "hex"));
        const keypair = web3_js_1.Keypair.fromSecretKey(secretKey);
        const { swapTransaction } = yield (yield fetch("https://quote-api.jup.ag/v6/swap", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey: user === null || user === void 0 ? void 0 : user.publicKey.toString(),
                wrapAndUnwrapSol: true,
            }),
        })).json();
        const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
        if (!swapTransactionBuf || swapTransactionBuf.length === 0) {
            res.status(500).json({ error: "Failed to process swap transaction" });
            return;
        }
        var transaction = web3_js_1.VersionedTransaction.deserialize(swapTransactionBuf);
        transaction.sign([keypair]);
        const latestBlockHash = yield connection.getLatestBlockhash();
        const rawTransaction = transaction.serialize();
        const txid = yield connection.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 2,
        });
        const url = `https://solscan.io/tx/${txid}`;
        res.status(200).json({
            message: "Transaction initiated",
            txid: txid,
            url: url,
        });
        return;
    }
    catch (error) {
        console.error("Error in buy endpoint:", error);
        res.status(500).json({ error: "An unexpected error occurred" });
        return;
    }
}));
app.get("/api/v1/health", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        message: "healthy",
    });
}));
app.listen(5001);
