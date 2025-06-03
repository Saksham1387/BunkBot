"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWallet, getSeedAction } from "@/lib/api";
import { NavBar } from "./nav-bar";
import { Copy, X } from "lucide-react";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { TokenPurchaseComponent } from "./token-buy";

export default function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState(null as any);
  const [actionType, setActionType] = useState<string | null>(null);
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [isAllBalance, setIsAllBalance] = useState(false);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [istransaction, setIstransaction] = useState(false);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.privateKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    });
    toast({
      title: "Copied !",
    });
    console.log(copied);
  };
  const handleWithdraw = async () => {
    setIstransaction(true);
    const token = localStorage.getItem("token");
    if (isAllBalance) {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/v1/widthdraw`,
        {
          all: true,
          address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status == 202) {
        toast({
          title: "No Funds to Withdraw",
        });
        setIstransaction(false);
      }
      if (res.status == 404) {
        toast({
          title: "Something went wrong",
        });
        setIstransaction(false);
      }
      if (res.status == 200) {
        toast({
          title: "The whole wallet is empty",
        });
        setIstransaction(false);
      }
      setIstransaction(false);
    }

    if (!isAllBalance) {
      setIstransaction(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/v1/widthdraw`,
        {
          all: false,
          address,
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status == 404) {
        toast({
          title: `something went wrong`,
        });
        setIstransaction(false);
      }
      if (res.status == 200) {
        toast({
          title: `${amount} SOL has been withdrawn from the wallet`,
        });
        setIstransaction(false);
      }
    }
  };

  const handleAction = async (action: string) => {
    try {
      let res;
      setActionType(action);

      switch (action) {
        case "wallet-info":
          res = await getWallet();
          break;
        case "buy":
          res = "something";
          break;
        case "deposit":
          res = await getWallet();
          break;
        case "withdraw":
          res = "something";
          break;
        case "get-seed":
          res = await getSeedAction();
          break;
        default:
          throw new Error("Invalid action");
      }

      setResult(res);
      setIsResultVisible(true);
    } catch (error) {
      console.error("Action error:", error);
      setResult({ error });
      setIsResultVisible(true);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.error) {
      return <p className="text-red-500">Error: {result.error}</p>;
    }

    if (actionType === "wallet-info" && typeof result === "object") {
      return (
        <div className="space-y-2">
          <p>
            <strong>Public Key:</strong> {result.publicKey}
          </p>
          <div className="flex items-center ">
            <strong>Private Key:</strong>
            <p className="w-20 ml-2">
              {result.privateKey.length > 10
                ? result.privateKey.slice(0, 15) + "...."
                : result.privateKey}
            </p>
            <button onClick={handleCopy} className=" text-white ml-20">
              <Copy></Copy>
            </button>
          </div>
          <p>
            <strong>Balance:</strong> {result.balance}
          </p>
        </div>
      );
    }

    if (actionType === "deposit" && typeof result === "object") {
      return (
        <div className="text-center gap-3 flex flex-col">
          <div>
            <p>
              <strong>Send SOL here</strong>
            </p>
          </div>
          <div>
            <p>{result.publicKey}</p>
          </div>
        </div>
      );
    }

    if (actionType === "get-seed" && typeof result === "object") {
      return (
        <div>
          <h1 className="text-center">Your Seed Phrase is </h1>
          {result.seedphrase}
        </div>
      );
    }

    if (actionType === "withdraw") {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-balance"
              checked={isAllBalance}
              className="bg-white text-black"
              onCheckedChange={(checked) => setIsAllBalance(!!checked)}
            />
            <Label htmlFor="all-balance" className="text-white">
              Withdraw All Balance
            </Label>
          </div>

          {!isAllBalance && (
            <div className="space-y-2">
              <Label className="text-white">Amount (SOL) </Label>
              <Input
                type="number"
                placeholder="Enter withdrawal amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-zinc-800 text-white border-zinc-700"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-white">Withdrawal Address</Label>
            <Input
              type="text"
              placeholder="Enter withdrawal address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-zinc-800 text-white border-zinc-700"
            />
          </div>
          {istransaction ? (
            "On goining Transaciont"
          ) : (
            <Button
              onClick={handleWithdraw}
              className="w-full bg-zinc-800 hover:bg-zinc-700"
            >
              Withdraw
            </Button>
          )}
        </div>
      );
    }

    if (actionType === "buy") {
      return (
        <div className="text-black">
          <TokenPurchaseComponent></TokenPurchaseComponent>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <p>
          <strong>
            {actionType!.charAt(0).toUpperCase() + actionType!.slice(1)} Result:
          </strong>
        </p>
        <pre className="text-sm bg-gray-100 p-2 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b relative">
      <NavBar />

      <div className="max-w-2xl mx-auto relative">
        <Card className="p-5 mt-10 bg-zinc-900 border-none relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Bunk Bot Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 ">
              <Button
                onClick={() => handleAction("buy")}
                className="bg-zinc-800 hover:bg-zinc-700 "
              >
                Buy
              </Button>
              <Button
                onClick={() => handleAction("deposit")}
                className="bg-zinc-800 hover:bg-zinc-700"
              >
                Deposit
              </Button>
              <Button
                onClick={() => handleAction("withdraw")}
                className="bg-zinc-800 hover:bg-zinc-700"
              >
                Withdraw
              </Button>
              <Button
                onClick={() => handleAction("get-seed")}
                className="bg-zinc-800  hover:bg-zinc-700 "
              >
                Get Seed
              </Button>
              <Button
                onClick={() => handleAction("wallet-info")}
                className="col-span-2 bg-zinc-800 hover:bg-zinc-700 "
              >
                Wallet Info
              </Button>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {isResultVisible && result && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-full left-0 w-full mt-4"
            >
              <Card className="bg-zinc-900 border-none text-white relative">
                <button
                  onClick={() => setIsResultVisible(false)}
                  className="absolute top-3 right-3 text-white hover:text-gray-300"
                >
                  <X size={24} />
                </button>
                <CardContent className="p-5">{renderResult()}</CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
