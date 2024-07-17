'use client';

import Web3 from 'web3';
import abi from '../abis/MarketplaceAbi.json';

const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

const MIN_GAS_PRICE_GWEI = process.env.NEXT_PUBLIC_MIN_GAS_PRICE_GWEI || '2';
const DEFAULT_GAS_LIMIT =
  process.env.NEXT_PUBLIC_DEFAULT_GAS_LIMIT || '3000000';

const getAdjustedGasPrice = async (web3: Web3): Promise<string> => {
  const gasPrice = await web3.eth.getGasPrice(); // This is a bigint
  const minGasPriceWei = BigInt(web3.utils.toWei(MIN_GAS_PRICE_GWEI, 'gwei')); // Convert to bigint
  const adjustedGasPrice =
    gasPrice > minGasPriceWei ? gasPrice : minGasPriceWei;
  return adjustedGasPrice.toString();
};

interface NFTMarketplaceContract {
  setPlatformFee: (fee: number) => Promise<any>;
  getPlatformFee: () => Promise<any>;
  mintNFT: (tokenURI: string, isArt: boolean) => Promise<any>;
  mintAndListNFT: (
    tokenURI: string,
    price: number,
    isArt: boolean
  ) => Promise<any>;
  listNFTForSale: (tokenId: number, price: number) => Promise<any>;
  relistNFT: (tokenId: number, price: number) => Promise<any>;
  unlistNFT: (tokenId: number) => Promise<any>;
  purchaseNFT: (tokenId: number) => Promise<any>;
  startNFTAuction: (
    tokenId: number,
    startPrice: number,
    bottomPrice: number,
    discountRate: number,
    duration: number
  ) => Promise<any>;
  cancelNFTAuction: (tokenId: number) => Promise<any>;
  buyNFTFromAuction: (tokenId: number) => Promise<any>;
  getAuctionPrice: (tokenId: number) => Promise<any>;
  withdrawFunds: () => Promise<any>;
  fetchAllNFTs: () => Promise<any>;
  fetchAllNFTsOnSale: () => Promise<any>;
  fetchNFTsOwnedByUser: (user: string) => Promise<any>;
  fetchNFTDetails: (tokenId: number) => Promise<any>;
  getNFTStatusPrice: (tokenId: number) => Promise<any>;
  fetchNFTTotalCount: () => Promise<any>;
  fetchOwnedNFTsNotOnSale: (owner: string) => Promise<any>;
  fetchOwnedNFTsOnSale: (owner: string) => Promise<any>;
  fetchNFTsOnAuction: () => Promise<any>;
  checkPendingWithdrawal: (user: string) => Promise<any>;
  auctions: (tokenId: number) => Promise<any>;
  discountInterval: () => Promise<any>;
  ownerOf: (tokenId: number) => Promise<any>;
  tokenURI: (tokenId: number) => Promise<any>;
  listNFTForRent: (tokenId: number, dailyPrice: number) => Promise<any>;
  rentNFT: (tokenId: number, duration: number) => Promise<any>;
  unlistNFTFromRental: (tokenId: number) => Promise<any>;
  hasActivePass: (user: string) => Promise<boolean>;
  purchaseStandardPass: (duration: FlixPassDuration) => Promise<any>;
  purchasePremiumPass: (duration: FlixPassDuration) => Promise<any>;
  checkRentAddOnStatus: (user: string) => Promise<any>;
  purchaseRentAddOn: () => Promise<any>;
  calculateRentAddOnCost: (user: string) => Promise<string>;
  getCurrentPassType: (user: string) => Promise<string>;
  hasPremiumPass: (user: string) => Promise<boolean>;
  setRentalPeriod: (
    tokenId: number,
    rentalStart: number,
    rentalEnd: number
  ) => Promise<any>;
  checkRentNFTAccess: (tokenId: number, user: string) => Promise<any>;
  checkNFTRentStatus: (tokenId: number) => Promise<any>;
  calculateRentalPrice: (
    dailyPrice: number,
    duration: number
  ) => Promise<number>;
  fetchMyOwnedIsArtNFTs: () => Promise<any>;
  fetchAllAvailableIsArtNFTs: () => Promise<any>;
  fetchAllIsArtNFTs: () => Promise<any>;
  setApprovalForAll: (operator: string, approved: boolean) => Promise<any>;
  checkIfApprovedForAll: (owner: string, operator: string) => Promise<any>;
  getPassDetails: (user: string) => Promise<{
    passType: string;
    remainingDays: number;
    rentAddOnActive: boolean;
  }>;
  getNFTOwner: (tokenId: number) => Promise<string>;
}

export enum FlixPassDuration {
  Monthly = 'Monthly',
  Annual = 'Annual',
}

const MarketplaceInteraction = (): NFTMarketplaceContract => {
  let web3: Web3;
  let nftMarketplaceContract: any;

  if (typeof window !== 'undefined' && (window as any).ethereum) {
    web3 = new Web3((window as any).ethereum);
    try {
      (window as any).ethereum.enable(); // Request account access if needed
    } catch (error) {
      console.error('User denied account access...');
    }
  } else {
    web3 = new Web3(RPC_URL);
  }

  nftMarketplaceContract = new web3.eth.Contract(abi, contractAddress);

  if (!nftMarketplaceContract) {
    throw new Error('Contract not initialized');
  }

  // Set the platform fee
  const setPlatformFee = async (fee: number) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      return await nftMarketplaceContract.methods.setPlatformFee(fee).send({
        from: accounts[0],
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetch the platform fee
  const getPlatformFee = async () => {
    try {
      return await nftMarketplaceContract.methods.getPlatformFee().call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Mint an NFT with the given token URI
  const mintNFT = async (tokenURI: string, isArt: boolean) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      const receipt = await nftMarketplaceContract.methods
        .mintNFT(tokenURI, isArt)
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
        });

      return await fetchNFTTotalCount();

      // if (mintEvent) {
      //   const newTokenId = mintEvent.returnValues.tokenId;
      //   console.log("Minted NFT ID:", newTokenId);
      //   return Number(newTokenId);
      // } else {
      //   console.log("NFT Minted event not found.");
      // }
    } catch (error) {
      console.error('Error while minting NFT:', error);
      throw error;
    }
  };

  // Mint and list an NFT with the given token URI and price
  const mintAndListNFT = async (
    tokenURI: string,
    price: number,
    isArt: boolean
  ) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      const priceInWei = web3.utils.toWei(String(price), 'ether');

      await nftMarketplaceContract.methods
        .mintAndListNFT(tokenURI, priceInWei)
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
        });

      return await fetchNFTTotalCount();

      // if (receipt.status) {
      //   const mintAndListEvent = receipt.events?.NFTMintedAndListed;
      //   if (mintAndListEvent) {
      //     const newTokenId = mintAndListEvent.returnValues.tokenId;
      //     console.log("Minted and Listed NFT ID:", newTokenId);
      //     return Number(newTokenId);
      //   } else {
      //     console.log("NFT Minted and Listed event not found.");
      //   }
      // } else {
      //   throw new Error("Minting and listing transaction failed");
      // }
    } catch (error) {
      console.error('Error in minting and listing NFT:', error);
      throw error;
    }
  };

  // List an NFT for sale with the given token ID and price
  const listNFTForSale = async (tokenId: number, price: number) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      const priceInWei = web3.utils.toWei(String(price), 'ether');
      return await nftMarketplaceContract.methods
        .listNFTForSale(tokenId, priceInWei)
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
        });
    } catch (error) {
      console.log('error: ', error);
      throw error;
    }
  };

  // Relist an NFT with the given token ID and price
  const relistNFT = async (tokenId: number, price: number) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      const priceInWei = web3.utils.toWei(String(price), 'ether');
      return await nftMarketplaceContract.methods
        .relistNFT(tokenId, priceInWei)
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
        });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Unlist an NFT using its token ID
  const unlistNFT = async (tokenId: number) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      return await nftMarketplaceContract.methods.unlistNFT(tokenId).send({
        from: accounts[0],
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Purchase an NFT using its token ID - return new owner address
  const purchaseNFT = async (tokenId: number) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      const nftDetail = await fetchNFTDetails(tokenId);
      await nftMarketplaceContract.methods.purchaseNFT(tokenId).send({
        from: accounts[0],
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
        value: nftDetail.price,
      });
      const newOwner = await ownerOf(tokenId);
      return newOwner;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Start an auction for an NFT
  const startNFTAuction = async (
    tokenId: number,
    startPrice: number,
    bottomPrice: number,
    discountRate: number, // not percentage (how much about to be reduced every 30min)
    duration: number // seconds
  ) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      const startPriceInWei = web3.utils.toWei(String(startPrice), 'ether');
      const bottomPriceInWei = web3.utils.toWei(String(bottomPrice), 'ether');
      const discountRateInWei = web3.utils.toWei(String(discountRate), 'ether');

      return await nftMarketplaceContract.methods
        .startNFTAuction(
          tokenId,
          startPriceInWei,
          bottomPriceInWei,
          discountRateInWei,
          duration
        )
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
        });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Cancel an ongoing auction for an NFT
  const cancelNFTAuction = async (tokenId: number) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      return await nftMarketplaceContract.methods
        .cancelNFTAuction(tokenId)
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
        });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Purchase an NFT from an ongoing auction - return new owner address
  const buyNFTFromAuction = async (tokenId: number) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      const auctionPriceEther = await getAuctionPrice(tokenId);
      const auctionPriceWei = web3.utils.toWei(
        auctionPriceEther.toString(),
        'ether'
      );

      const receipt = await nftMarketplaceContract.methods
        .buyNFTFromAuction(tokenId)
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
          value: auctionPriceWei,
        });

      // Check receipt status
      if (!receipt.status) {
        throw new Error('Transaction failed');
      }

      // Get the new owner of the NFT
      const newOwner = await ownerOf(tokenId);
      return newOwner;
    } catch (error) {
      console.error('Error in buying NFT from auction:', error);
      throw error;
    }
  };

  // Get the current auction price of an NFT
  const getAuctionPrice = async (tokenId: number) => {
    try {
      const auctionPriceWei = await nftMarketplaceContract.methods
        .getAuctionPrice(tokenId)
        .call();
      return web3.utils.fromWei(auctionPriceWei, 'ether');
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const listNFTForRent = async (tokenId: number, dailyPrice: number) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);
      const dailyPriceInWei = web3.utils.toWei(String(dailyPrice), 'ether');

      return await nftMarketplaceContract.methods
        .listNFTForRent(tokenId, dailyPriceInWei)
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
        });
    } catch (error) {
      console.error('Error in listing NFT for rent:', error);
      throw error;
    }
  };

  // Rent an NFT
  const rentNFT = async (tokenId: number, duration: number) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      return await nftMarketplaceContract.methods
        .rentNFT(tokenId, duration)
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
        });
    } catch (error) {
      console.error('Error in renting NFT:', error);
      throw error;
    }
  };

  // Unlist an NFT from rental
  const unlistNFTFromRental = async (tokenId: number) => {
    const accounts = await web3.eth.getAccounts();
    const adjustedGasPrice = await getAdjustedGasPrice(web3);

    return await nftMarketplaceContract.methods
      .unlistNFTFromRental(tokenId)
      .send({
        from: accounts[0],
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
      });
  };

  // Set rental period for an NFT
  const setRentalPeriod = async (
    tokenId: number,
    rentalStart: number,
    rentalEnd: number
  ) => {
    const accounts = await web3.eth.getAccounts();
    const adjustedGasPrice = await getAdjustedGasPrice(web3);

    return await nftMarketplaceContract.methods
      .setRentalPeriod(tokenId, rentalStart, rentalEnd)
      .send({
        from: accounts[0],
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
      });
  };

  // Check if a user has an active pass
  const hasActivePass = async (user: string) => {
    return await nftMarketplaceContract.methods.hasActivePass(user).call();
  };

  // Purchase a Standard Pass
  const purchaseStandardPass = async (duration: FlixPassDuration) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      let priceInEther;
      let type = 0;

      switch (duration) {
        case FlixPassDuration.Monthly:
          priceInEther = '70'; // monthlyStandardPassPrice
          type = 0;
          break;
        case FlixPassDuration.Annual:
          priceInEther = '700'; // annualStandardPassPrice
          type = 1;
          break;
        default:
          throw new Error('Invalid duration for standard pass');
      }

      return await nftMarketplaceContract.methods
        .purchaseStandardPass(type)
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
          value: web3.utils.toWei(priceInEther, 'ether'),
        });
    } catch (error) {
      console.error('Error purchasing standard pass:', error);
      throw error;
    }
  };

  // Purchase a Premium Pass
  const purchasePremiumPass = async (duration: FlixPassDuration) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      let priceInEther;
      let type = 0;

      switch (duration) {
        case FlixPassDuration.Monthly:
          priceInEther = 140; // monthlyPremiumPassPrice
          type = 0;
          break;
        case FlixPassDuration.Annual:
          priceInEther = 1400; // annualPremiumPassPrice
          type = 1;
          break;
        default:
          throw new Error('Invalid duration for premium pass');
      }

      return await nftMarketplaceContract.methods
        .purchasePremiumPass(type)
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
          value: web3.utils.toWei(priceInEther, 'ether'),
        });
    } catch (error) {
      console.error('Error purchasing premium pass:', error);
      throw error;
    }
  };

  // Check Rent Add-On Status
  const checkRentAddOnStatus = async (user: string) => {
    try {
      return await nftMarketplaceContract.methods
        .checkRentAddOnStatus(user)
        .call();
    } catch (error) {
      console.error('Error checking rent add-on status:', error);
      throw error;
    }
  };

  // Purchase Rent Add-On
  const purchaseRentAddOn = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      const rentAddOnCost = await calculateRentAddOnCost(accounts[0]);

      return await nftMarketplaceContract.methods.purchaseRentAddOn().send({
        from: accounts[0],
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
        callValue: rentAddOnCost,
      });
    } catch (error) {
      console.error('Error purchasing rent add-on:', error);
      throw error;
    }
  };

  // Calculate Rent Add-On Cost
  const calculateRentAddOnCost = async (user: string): Promise<string> => {
    try {
      return await nftMarketplaceContract.methods
        .calculateRentAddOnCost(user)
        .call();
    } catch (error) {
      console.error('Error calculating rent add-on cost:', error);
      throw error;
    }
  };

  // Get current pass type for a user
  const getCurrentPassType = async (user: string) => {
    return await nftMarketplaceContract.methods.getCurrentPassType(user).call();
  };

  // Check if a user has a Premium Pass
  const hasPremiumPass = async (user: string) => {
    return await nftMarketplaceContract.methods.hasPremiumPass(user).call();
  };

  // Check if a user has access to a rented NFT or via a Flix Pass
  const checkRentNFTAccess = async (tokenId: number, user: string) => {
    try {
      return await nftMarketplaceContract.methods
        .checkRentNFTAccess(tokenId, user)
        .call();
    } catch (error) {
      console.error('Error in checking rent NFT access:', error);
      throw error;
    }
  };

  // Check the rent status
  const checkNFTRentStatus = async (tokenId: number) => {
    try {
      return await nftMarketplaceContract.methods
        .checkNFTRentStatus(tokenId)
        .call();
    } catch (error) {
      console.error('Error in checking NFT rent status:', error);
      throw error;
    }
  };

  // Calculate rental price with possible discounts
  const calculateRentalPrice = async (dailyPrice: number, duration: number) => {
    try {
      const dailyPriceInWei = web3.utils.toWei(String(dailyPrice), 'ether');
      return await nftMarketplaceContract.methods
        .calculateRentalPrice(dailyPriceInWei, duration)
        .call()
        .then((totalPriceInWei: string) =>
          web3.utils.fromWei(totalPriceInWei, 'ether')
        );
    } catch (error) {
      console.error('Error in calculating rental price:', error);
      throw error;
    }
  };

  // Withdraw funds from the contract
  const withdrawFunds = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      return await nftMarketplaceContract.methods.withdrawFunds().send({
        from: accounts[0],
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetch all NFTs available in the contract
  const fetchAllNFTs = async () => {
    try {
      return await nftMarketplaceContract.methods.fetchAllNFTs().call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetch all NFTs currently on sale
  const fetchAllNFTsOnSale = async () => {
    try {
      return await nftMarketplaceContract.methods.fetchAllNFTsOnSale().call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetch NFTs owned by a specific user
  const fetchNFTsOwnedByUser = async (user: string) => {
    try {
      return await nftMarketplaceContract.methods
        .fetchNFTsOwnedByUser(user)
        .call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetch details of a specific NFT using its token ID
  const fetchNFTDetails = async (tokenId: number) => {
    try {
      return await nftMarketplaceContract.methods
        .fetchNFTDetails(tokenId)
        .call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetch the status and price of a specific NFT using its token ID
  const getNFTStatusPrice = async (tokenId: number) => {
    return await nftMarketplaceContract.methods
      .getNFTStatusPrice(tokenId)
      .call();

    //       // Check if the NFT is in an auction
    // Auction storage auction = auctions[tokenId];
    // if (auction.tokenId == tokenId && auction.expiresAt > block.timestamp) {
    //     return ("Auction", getAuctionPrice(tokenId));
    // }

    // // Check if the NFT is listed for rent
    // Rental storage rental = _rentals[tokenId];
    // if (rental.tokenId == tokenId) {
    //     return ("Rent", rental.dailyPrice);
    // }

    // // Check if the NFT is on a fixed sale
    // MarketItem storage item = _idToMarketItem[tokenId];
    // if (item.owner == address(this) && !item.sold) {
    //     return ("Fixed", item.price);
    // }

    // // If none of the above, the NFT is not currently on sale or rent
    // return ("None", 0)

    // {0: 'None', 1: 0n, __length__: 2, status: 'None', currentPrice: 0n}
  };

  // Fetch total count of NFTs in the marketplace
  const fetchNFTTotalCount = async () => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 10000));
      const nftCount = await nftMarketplaceContract.methods
        .fetchNFTTotalCount()
        .call();
      return Number(nftCount);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetch NFTs owned by a user but not on sale
  const fetchOwnedNFTsNotOnSale = async (owner: string) => {
    try {
      return await nftMarketplaceContract.methods
        .fetchOwnedNFTsNotOnSale(owner)
        .call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetch NFTs that are owned by a user and are on sale
  const fetchOwnedNFTsOnSale = async (owner: string) => {
    try {
      const ownerNFTCount = await nftMarketplaceContract.methods
        .fetchOwnedNFTsOnSale(owner)
        .call();

      if (Array.isArray(ownerNFTCount)) {
        return ownerNFTCount.map((num) => Number(num));
      } else {
        return [Number(ownerNFTCount)];
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetch NFTs that are currently on auction
  const fetchNFTsOnAuction = async () => {
    try {
      return await nftMarketplaceContract.methods.fetchNFTsOnAuction().call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetches all isArt NFTs owned by the caller
  const fetchMyOwnedIsArtNFTs = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      return await nftMarketplaceContract.methods
        .fetchMyOwnedIsArtNFTs()
        .call({ from: accounts[0] });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetches all available isArt NFTs
  const fetchAllAvailableIsArtNFTs = async () => {
    try {
      return await nftMarketplaceContract.methods
        .fetchAllAvailableIsArtNFTs()
        .call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Fetches all NFTs marked as isArt, regardless of their sale status
  const fetchAllIsArtNFTs = async () => {
    try {
      return await nftMarketplaceContract.methods.fetchAllIsArtNFTs().call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Check pending withdrawals for a user
  const checkPendingWithdrawal = async (user: string) => {
    try {
      return await nftMarketplaceContract.methods
        .checkPendingWithdrawal(user)
        .call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Get auction details for a specific NFT using its token ID
  const auctions = async (tokenId: number) => {
    try {
      return await nftMarketplaceContract.methods.auctions(tokenId).call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Get the discount interval
  const discountInterval = async () => {
    try {
      return await nftMarketplaceContract.methods.discountInterval().call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Get the owner of a specific NFT using its token ID
  const ownerOf = async (tokenId: number) => {
    try {
      return await nftMarketplaceContract.methods.ownerOf(tokenId).call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Get the token URI for a specific NFT using its token ID
  const tokenURI = async (tokenId: number) => {
    try {
      return await nftMarketplaceContract.methods.tokenURI(tokenId).call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Function to set approval for all NFTs
  const setApprovalForAll = async (operator: string, approved: boolean) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      const transaction = await nftMarketplaceContract.methods
        .setApprovalForAll(operator, approved)
        .send({
          from: accounts[0], // sender address
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
        });
      console.log('Approval transaction:', transaction);
      return transaction;
    } catch (error) {
      console.error('Failed to set approval:', error);
      throw error;
    }
  };

  // Function to check if an operator is approved to manage all NFTs of an owner
  const checkIfApprovedForAll = async (owner: string, operator: string) => {
    try {
      const isApproved = await nftMarketplaceContract.methods
        .isApprovedForAll(owner, operator)
        .call();
      console.log('Is approved for all:', isApproved);
      return isApproved;
    } catch (error) {
      console.error('Failed to check approval status:', error);
      throw error;
    }
  };

  const getPassDetails = async (user: string) => {
    try {
      const details = await nftMarketplaceContract.methods
        .getPassDetails(user)
        .call();
      return {
        passType: details.passType,
        remainingDays: Number(details.remainingDays),
        rentAddOnActive: details.rentAddOnActive,
      };
    } catch (error) {
      console.error('Error fetching pass details:', error);
      throw error;
    }
  };

  const getNFTOwner = async (tokenId: number) => {
    try {
      const ownerAddress = await nftMarketplaceContract.methods
        .getNFTOwner(tokenId)
        .call();
      return ownerAddress;
    } catch (error) {
      console.error('Error fetching NFT owner:', error);
      throw error;
    }
  };

  return {
    // NFT Minting and Management
    mintNFT, // Creates a new NFT with a specified token URI.
    mintAndListNFT, // Mints a new NFT and immediately lists it for sale.
    listNFTForSale, // Lists a specific NFT for sale by its token ID.
    relistNFT, // Relists an NFT for sale, possibly with a new price.
    unlistNFT, // Removes an NFT from being listed for sale.
    fetchNFTDetails, // Provides detailed information about a specific NFT.
    getNFTStatusPrice, // Retrieves the status and price of an NFT.
    fetchNFTTotalCount, // Returns the total number of NFTs minted.
    fetchOwnedNFTsNotOnSale, // Gets NFTs owned by a user that are not listed for sale.
    fetchOwnedNFTsOnSale, // Retrieves NFTs owned by a user that are listed for sale.
    fetchMyOwnedIsArtNFTs, // Fetches all isArt NFTs owned by the caller.
    fetchAllAvailableIsArtNFTs, // Fetches all available isArt NFTs.
    fetchAllIsArtNFTs, // Fetches all isArt NFTs, regardless of their sale status.
    ownerOf, // Determines the current owner of a specific NFT.
    tokenURI, // Retrieves the unique URI of an NFT.

    // Auction Management
    startNFTAuction, // Initiates an auction for an NFT.
    cancelNFTAuction, // Cancels an ongoing auction for an NFT.
    buyNFTFromAuction, // Enables purchase of an NFT from an auction.
    getAuctionPrice, // Retrieves the current auction price of an NFT.
    fetchNFTsOnAuction, // Fetches all NFTs currently on auction.
    auctions, // Retrieves details of a specific auction.

    // NFT Rentals
    listNFTForRent, // Lists an NFT for rent.
    rentNFT, // Allows renting of an NFT for a duration.
    unlistNFTFromRental, // Removes an NFT from rental listings.
    setRentalPeriod, // Sets the rental period for an NFT.
    checkRentNFTAccess, // Checks user access to a rented NFT.
    checkNFTRentStatus, // Checks the rental status of an NFT.
    calculateRentalPrice, // Calculates the rental price for an NFT.

    // User and Marketplace Interactions
    purchaseNFT, // Enables purchase of a listed NFT.
    withdrawFunds, // Allows withdrawal of funds from the marketplace.
    fetchAllNFTs, // Fetches all NFTs in the marketplace.
    fetchAllNFTsOnSale, // Retrieves all NFTs currently on sale.
    fetchNFTsOwnedByUser, // Gets all NFTs owned by a specific user.
    checkPendingWithdrawal, // Checks pending withdrawals for a user.
    discountInterval, // Gets the interval for auction price reduction.

    // Pass Management
    hasActivePass, // Checks if a user has an active pass.
    purchaseStandardPass, // Purchases a standard pass for a user.
    purchasePremiumPass, // Purchases a premium pass for a user.
    purchaseRentAddOn, // Purchases the rent add-on for a user.
    checkRentAddOnStatus, // Checks the status of the rent add-on for a user.
    calculateRentAddOnCost, // Calculates the cost of the rent add-on for a user.
    getCurrentPassType, // Determines the user's current pass type.
    hasPremiumPass, // Checks if a user has a premium pass.

    // Platform Configuration
    setPlatformFee, // Sets the platform fee for transactions.
    getPlatformFee, // Retrieves the current platform fee.

    // NFT Approval Management
    setApprovalForAll, // Sets approval for an operator to manage all NFTs of an owner.
    checkIfApprovedForAll, // Checks if an operator is approved to manage all NFTs of an owner.

    getPassDetails, // Fetches details of the user's pass.
    getNFTOwner, // Fetches the owner of a specific NFT.
  };
};

export default MarketplaceInteraction;
