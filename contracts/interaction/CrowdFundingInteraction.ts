'use client';

import Web3 from 'web3';
import abi from '../abis/CrowdFundingAbi.json';

const contractAddress = process.env.NEXT_PUBLIC_CROWDFUNDING_CONTRACT_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

const MIN_GAS_PRICE_GWEI = process.env.NEXT_PUBLIC_MIN_GAS_PRICE_GWEI || '2';
const DEFAULT_GAS_LIMIT =
  process.env.NEXT_PUBLIC_DEFAULT_GAS_LIMIT || '3000000';

const getAdjustedGasPrice = async (web3: Web3): Promise<string> => {
  const gasPrice = await web3.eth.getGasPrice();
  const minGasPriceWei = BigInt(web3.utils.toWei(MIN_GAS_PRICE_GWEI, 'gwei'));
  const adjustedGasPrice =
    gasPrice > minGasPriceWei ? gasPrice : minGasPriceWei;
  return adjustedGasPrice.toString();
};

interface CreateCampaignArgs {
  walletAddress: string;
  price: number;
  deadline: number;
  campaignURI: string;
}

interface CrowdFundingContract {
  createCampaign: (args: CreateCampaignArgs) => Promise<any>;
  donateToCampaign: (id: number, amount: number) => Promise<any>;
  getDonators: (id: number) => Promise<any>;
  getCampaigns: () => Promise<any>;
}

const CrowdFundingInteraction = (): CrowdFundingContract => {
  let web3: Web3;
  let crowdFundingContract: any;

  if (typeof window !== 'undefined' && (window as any).ethereum) {
    web3 = new Web3((window as any).ethereum);
    try {
      (window as any).ethereum.enable();
    } catch (error) {
      console.error('User denied account access...');
    }
  } else {
    web3 = new Web3(RPC_URL);
  }

  crowdFundingContract = new web3.eth.Contract(abi, contractAddress);

  if (!crowdFundingContract) {
    throw new Error('Contract not initialized');
  }

  const createCampaign = async ({
    walletAddress,
    price,
    deadline,
    campaignURI,
  }: CreateCampaignArgs) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      const priceInWei = web3.utils.toWei(String(price), 'ether');

      return await crowdFundingContract.methods
        .createCampaign(walletAddress, priceInWei, deadline, campaignURI)
        .send({
          from: accounts[0],
          gas: DEFAULT_GAS_LIMIT,
          gasPrice: adjustedGasPrice,
        });
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  };

  const donateToCampaign = async (id: number, amount: number) => {
    const amountInWei = web3.utils.toWei(String(amount), 'ether');
    try {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      return await crowdFundingContract.methods.donateToCampaign(id).send({
        from: accounts[0],
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
        value: amountInWei,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getDonators = async (id: number) => {
    try {
      return await crowdFundingContract.methods.getDonators(id).call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const getCampaigns = async () => {
    try {
      return await crowdFundingContract.methods.getCampaigns().call();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return {
    createCampaign,
    donateToCampaign,
    getDonators,
    getCampaigns,
  };
};

export default CrowdFundingInteraction;
