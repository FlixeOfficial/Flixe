import React from "react";
import Image from "next/image";
import { fetchIPFSJson } from "@/service/pinataService";
import { useRouter } from "next/navigation";
import MarketplaceInteraction from "@/contracts/interaction/MarketplaceInteraction";
import { formatPrice } from "@/lib/format";
import { Separator } from "./ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import useSWR from "swr";
import { toChecksumAddress } from 'web3-utils';

interface ArtCardProps {
  owner: string;
  seller: string;
  isArt: boolean;
  price: number;
  sold: boolean;
  tokenId: number;
}

// Define a fetcher function
const fetchNFTData = async (tokenId: any) => {
  const marketplace = MarketplaceInteraction();
  const artURI = await marketplace.tokenURI(tokenId);
  const result = await fetchIPFSJson(artURI);
  const categoryResponse = await axios.get(
    `/api/category/${result.categoryId}`
  );
  return {
    ...result,
    category: categoryResponse.data,
  };
};

function SkeletonCard() {
  return (
    <div className="group hover:shadow-sm border rounded-lg p-2 h-full transition-all duration-300 transform hover:scale-105 overflow-hidden hover:bg-card hover:p-0">
      {/* Skeleton for Image */}
      <div className="w-full aspect-[16/9] rounded-md overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      {/* Skeleton for Text and Details Inside */}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col justify-end h-full p-5 space-y-2">
          {/* Skeleton for Title */}
          <Skeleton className="h-6 w-3/4 rounded" />
          {/* Skeleton for Category and NFT Type */}
          <div className="flex flex-row gap-2">
            <Skeleton className="h-4 w-1/4 rounded" />
            <div className="flex items-center justify-center w-1/12">
              {/* Mimicking Separator */}
              <Skeleton className="h-[50%] w-1 bg-muted-foreground" />
            </div>
            <Skeleton className="h-4 w-1/4 rounded" />
          </div>
          {/* Skeleton for Price */}
          <Skeleton className="h-4 w-1/4 rounded" />
        </div>
      </div>
    </div>
  );
}

const ArtCard: React.FC<ArtCardProps> = ({
  owner,
  seller,
  isArt,
  price,
  sold,
  tokenId,
}) => {
  const router = useRouter();

  // Use SWR for data fetching
  const { data, error } = useSWR(`nft-${tokenId}`, () => fetchNFTData(tokenId));

  const handleCardClick = () => {
    if (!data) return;
    console.log(toChecksumAddress(owner))
      ;

    const artData = {
      ...data,
      owner: toChecksumAddress(owner),
      seller: toChecksumAddress(seller),
      price: price.toString(),
      tokenId: tokenId,
      sold,
    };
    console.log(artData.tokenId);
    localStorage.setItem(`artData-${tokenId}`, JSON.stringify(artData));
    router.push(
      `/artistry/${tokenId}/${encodeURIComponent(data?.title || "")}`
    );
  };

  // if (error) return <div>Failed to load</div>;
  if (!data) return <SkeletonCard />;

  return (
    <div
      className="group hover:shadow-sm border rounded-lg p-2 h-full transition-all duration-300 transform hover:scale-105 overflow-hidden hover:bg-card hover:p-0"
      onClick={handleCardClick}
    >
      <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden flex justify-center items-center">
        <Image
          width={150}
          height={50}
          layout="responsive"
          className="object-cover object-center"
          alt={data.title}
          src={data.imageUrl}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col justify-end h-full p-5 space-y-2">
          <div className="text-xl font-bold text-secondary dark:text-card-foreground line-clamp-2">
            {data.title}
          </div>
          <div className="flex flex-row gap-2">
            <p className="text-sm text-secondary dark:text-card-foreground font-medium">
              {data.category}
            </p>
            <div className="flex items-center h-full">
              {/* This is your parent container */}
              <Separator
                orientation="vertical"
                className="h-[50%] bg-muted-foreground mx-auto"
              />
            </div>
            <p className="text-sm text-secondary dark:text-card-foreground font-medium">
              {data.nftType} NFT
            </p>
          </div>

          <p className="text-sm font-semibold text-secondary dark:text-card-foreground">
            {!sold && price !== null ? formatPrice(price) : "Not For Sale"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArtCard;
