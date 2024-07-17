'use client';

import { useState, useEffect } from 'react';
import MarketplaceInteraction from '@/contracts/interaction/MarketplaceInteraction';
import { toast } from '@/components/ui/use-toast';
import { toChecksumAddress } from 'web3-utils';
import { useWalletStore } from '@/store/walletStore';

const useIsNFTOwned = (flixNftId: number) => {
  const nftMarketplace = MarketplaceInteraction();
  const [isOwned, setIsOwned] = useState<boolean>(false);
  const { address: walletAddress } = useWalletStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (walletAddress) {
          const ownerHex = await nftMarketplace.ownerOf(flixNftId);
          const owner = toChecksumAddress(ownerHex);
          console.log('owner: ', owner);

          if (owner === walletAddress) {
            setIsOwned(true);
            return;
          }

          const nftsOnSale = await nftMarketplace.fetchOwnedNFTsOnSale(
            walletAddress
          );

          if (nftsOnSale.includes(flixNftId)) {
            setIsOwned(true);
            return;
          }

          const auctionDetails = await nftMarketplace.auctions(flixNftId);
          const auctionSeller = toChecksumAddress(auctionDetails.seller);
          console.log('auctionDetails: ', auctionDetails);

          if (auctionSeller === walletAddress) {
            setIsOwned(true);
            return;
          }

          setIsOwned(false);
        }
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Error while checking NFT ownership.',
          description: err.message || 'Error occurred.',
        });
      }
    };

    fetchData();
  }, [flixNftId, nftMarketplace, walletAddress]);

  return isOwned;
};

export default useIsNFTOwned;
