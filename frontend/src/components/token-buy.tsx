import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TokenDetails {
  extra_info: {
    logoURI: string;
    name: string;
    symbol: string;
    daily_volume: number;
    // Add other properties as needed
  };
  token_price: {
    price: number;
  };
  // Add other properties of tokenDetails if any
}

export const TokenPurchaseComponent = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [error, setError] = useState(null);
  const [isTransaction, setIsTransaction] = useState(false);
  const url = useRef("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleGetPrice = async () => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/v1/getPrice`,
        {
          token_address: tokenAddress,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data1 = response.data;
      setTokenDetails(data1);
      console.log(data1);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError(err as any);
      } else if (err && typeof err === "object" && "response" in err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError((err as any).response.data.message);
      }
    }
  };

  const handleBuyToken = async (actionType: string) => {
    setIsTransaction(true);
    const token = localStorage.getItem("token");
    let realAmounttoBuy = 0;
    if (actionType == "buy") {
      realAmounttoBuy = purchaseAmount;
    }
    if (actionType == "directPurchase1Sol") {
      realAmounttoBuy = 1;
    }
    if (actionType == "directPurchase0.1Sol") {
      realAmounttoBuy = 0.1;
    }
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_URL}/api/v1/buy`,
      {
        token_address: tokenAddress,
        amount: realAmounttoBuy,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.status == 200) {
      setIsTransaction(false);
      url.current = res.data.url;
    }
    setIsTransaction(false);
  };

  return (
    <div className="space-y-4">
      <Card className=" bg-zinc-900 border-none text-white">
        <CardHeader>
          <CardTitle>Token Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Token Address Input and Get Price */}
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Enter Token Address"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="bg-zinc-800 text-white border-zinc-700"
            />
            <Button
              className="bg-zinc-800 hover:bg-zinc-700"
              onClick={_handleGetPrice}
            >
              Get Price
            </Button>
          </div>

          {/* Token Details Display */}
          {tokenDetails && (
            <div className="mb-4 p-3 text-white ">
              <h3 className="font-semibold mb-2">Token Details</h3>
              <div className="flex-row flex gap-2 py-2 items-center">
                <img
                  src={tokenDetails.extra_info.logoURI}
                  className="rounded-full h-8 w-8"
                ></img>
                <p>Name: {tokenDetails.extra_info.name}</p>
              </div>
              <p className="text-md font-light">
                Symbol: {tokenDetails.extra_info.symbol}
              </p>
              <p>Daily Volume: ${tokenDetails.extra_info.daily_volume}</p>
              <p>Current Price: ${tokenDetails.token_price.price}</p>

              {/* Purchase Section - Only shown when token details are available */}
              <div className="space-y-3 mt-4">
                <Input
                  type="number"
                  placeholder="Enter SOL Amount"
                  value={purchaseAmount || ""}
                  className="border-none bg-zinc-800"
                  onChange={(e) => {
                    const value = e.target.value;
                    setPurchaseAmount(value === "" ? 0 : Number(value));
                  }}
                />

                <div className="flex space-x-2 flex-col">
                  {isTransaction ? (
                    "Transaction ongoing"
                  ) : (
                    <div className="flex flex-row gap-3">
                      <Button
                        onClick={() => handleBuyToken("buy")}
                        className="flex-grow bg-zinc-800"
                      >
                        Buy with Custom Amount
                      </Button>
                      <Button
                        onClick={() => handleBuyToken("directPurchase1Sol")}
                        variant="secondary"
                      >
                        Buy 1 SOL
                      </Button>
                      <Button
                        onClick={() => handleBuyToken("directPurchase0.1Sol")}
                        variant="secondary"
                      >
                        Buy 0.1 SOL
                      </Button>
                    </div>
                  )}

                  <div className="mt-3 flex items-center space-x-3">
                    <p className="w-80 overflow-hidden">
                      Last Transaction URL: {url.current || "No URL available"}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard
                          .writeText(url.current || "No URL available")
                          .then(() => {
                            toast({
                              title: "Copied!",
                            });
                          })
                          .catch((err) => {
                            console.error("Failed to copy:", err);
                          });
                      }}
                      className=" text-white"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Handling */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
