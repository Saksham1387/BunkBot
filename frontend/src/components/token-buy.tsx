import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

export const TokenPurchaseComponent = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenDetails, setTokenDetails] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [error, setError] = useState(null);

  const handleGetPrice = async () => {
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
    } catch (err) {
      console.log(err);
      setError(err.response.data.message);
    }
  };

  const handleBuyToken = async (actionType) => {
    setError(null);
    try {
      if (!tokenAddress) {
        return;
      }

      const result = await handleTokenPurchase(
        tokenAddress,
        actionType === "buy"
          ? purchaseAmount
          : actionType === "directPurchase1Sol"
          ? 1
          : 0.1,
        actionType
      );

      if (result) {
        // Handle successful purchase
        alert("Purchase successful!");
      }
    } catch (err) {
      setError(err.message);
    }
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
              onClick={handleGetPrice}
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
                  value={purchaseAmount}
                  className="border-none bg-zinc-800"
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                />

                <div className="flex space-x-2">
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
