"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/components/ui/use-toast";
import MarketplaceInteraction from "@/contracts/interaction/MarketplaceInteraction";
import useIsNFTOwned from "@/hooks/useIsNFTOwned";

interface FlixEnrollButtonProps {
  price: number;
  flixId: string;
  flixNftId: number;
  nftType: "AUCTION" | "SALE" | "RENT";
}

export const FlixEnrollButton = ({
  price,
  flixId,
  flixNftId,
  nftType,
}: FlixEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(price);
  const { toast } = useToast();

  const nftMarketplace = MarketplaceInteraction();

  // Fetch current auction price
  const fetchCurrentPrice = async () => {
    if (nftType === "AUCTION") {
      try {
        const price = await nftMarketplace.getAuctionPrice(flixNftId);
        setCurrentPrice(price);
      } catch (error) {
        console.error("Error fetching auction price: ", error);
      }
    }
  };

  useEffect(() => {
    if (nftType === "AUCTION") {
      fetchCurrentPrice();
      const interval = setInterval(fetchCurrentPrice, 30000); // Update price every 30 seconds
      return () => clearInterval(interval);
    }
  }, [flixNftId, nftType]);

  const onRefreshClick = async () => {
    setIsLoading(true);
    await fetchCurrentPrice();
    setIsLoading(false);
  };

  const onClick = async () => {
    try {
      setIsLoading(true);

      let newOwnerAddress = "";

      try {
        if (flixNftId) {
          if (nftType === "AUCTION") {
            newOwnerAddress = await nftMarketplace.buyNFTFromAuction(flixNftId);
          } else if (nftType === "SALE") {
            newOwnerAddress = await nftMarketplace.purchaseNFT(flixNftId);
          }
          toast({
            title: "Purchase successful",
            description: "You have Successfully bought this Flix NFT.",
          });
        } else {
          throw new Error("flixNftId is not defined, null, or empty.");
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Uh oh! Error while purchase teh NFT.",
          description: error.message || " Error while purchase teh NFT.",
        });
        throw new Error(" Error while purchase teh NFT");
      }
      if (!newOwnerAddress) {
        throw new Error(
          "newOwnerAddress is not defined - error in nft transfer."
        );
      }

      let payload = {
        userId: newOwnerAddress,
        price: null,
        discountPercentage: null,
        flixSaleStatus: "STREAM",
      };

      await axios.post(`/api/flixs/${flixId}/checkout`, payload);

      toast({
        title: "Purchase successfully",
        description: "You have successfully bought in this Flix NFT.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh-Oh! Something went wrong.",
        description: "Something had went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return !useIsNFTOwned(flixNftId) ? (
    <div className="flex gap-3">
      {nftType === "AUCTION" && (
        <Button
          onClick={onRefreshClick}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="w-full md:w-auto"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
      <Button
        onClick={onClick}
        disabled={isLoading}
        size="sm"
        className="w-full md:w-auto mb-2"
      >
        Buy for{" "}
        {nftType === "AUCTION" ? formatPrice(currentPrice) : formatPrice(price)}
      </Button>
    </div>
  ) : (
    <p className="px-4 py-2 text-green-200 rounded-2xl bg-opacity-80 tracking-wider uppercase">
      On Sale For <b>{formatPrice(price)}</b>
    </p>
  );
};
