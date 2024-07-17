'use client';

import Web3 from 'web3';
import abi from '../abis/LoanVaultAbi.json';
import { toChecksumAddress } from 'web3-utils';

const contractAddress = process.env.NEXT_PUBLIC_LOANVAULT_CONTRACT_ADDRESS;
const NFTAddress = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

const MIN_GAS_PRICE_GWEI = process.env.NEXT_PUBLIC_MIN_GAS_PRICE_GWEI || '2';
const DEFAULT_GAS_LIMIT =
  process.env.NEXT_PUBLIC_DEFAULT_GAS_LIMIT || '3000000';

// Utility to adjust the gas price based on the current network conditions
const getAdjustedGasPrice = async (web3: Web3): Promise<string> => {
  const gasPrice = await web3.eth.getGasPrice();
  const minGasPriceWei = BigInt(web3.utils.toWei(MIN_GAS_PRICE_GWEI, 'gwei'));
  const adjustedGasPrice =
    gasPrice > minGasPriceWei ? gasPrice : minGasPriceWei;
  return adjustedGasPrice.toString();
};

interface LoanVaultContract {
  proposeLoan(
    nftIds: number[],
    requestedAmount: number,
    toPay: number,
    duration: number,
    tokenURI: string
  ): Promise<void>;
  getLoanDetails(loanId: number): Promise<{
    status: string;
    borrower: string;
    lender: string;
    tokenURI: string;
  }>;
  getLoanTokenURI(loanId: number): Promise<string>;
  listPendingLoanIds(): Promise<number[]>;
  getMyActiveLoanIdsAsBorrower(): Promise<number[]>;
  getMyActiveLoanIdsAsLender(): Promise<number[]>;
  retractLoan(loanId: number): Promise<void>;
  acceptLoan(loanId: number, amount: number): Promise<void>;
  payLoanInFull(loanId: number, amount: number): Promise<void>;
  liquidateLoan(loanId: number): Promise<void>;
  getLoanStatus(loanId: number): Promise<string>;
  isCollateral(nftContract: string, tokenId: number): Promise<boolean>;
}

const LoanVaultInteraction = (): LoanVaultContract => {
  let web3: Web3;
  let loanVaultContract: any;

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

  loanVaultContract = new web3.eth.Contract(abi, contractAddress);

  if (!loanVaultContract) {
    throw new Error('Contract not initialized');
  }

  return {
    // Propose a new loan with NFTs as collateral
    async proposeLoan(
      nftIds: number[],
      requestedAmount: number,
      toPay: number,
      duration: number,
      tokenURI: string
    ): Promise<void> {
      debugger
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);

      const NFTAddresses = Array(nftIds.length).fill(NFTAddress);
      await loanVaultContract.methods
        .propose(
          NFTAddresses,
          nftIds,
          requestedAmount,
          toPay,
          duration,
          tokenURI
        )
        .send({
          from: accounts[0],
          gas: '7000000',
          gasPrice: adjustedGasPrice,
        });
    },

    async getLoanDetails(loanId: number): Promise<{
      status: string;
      borrower: string;
      lender: string;
      tokenURI: string;
    }> {
      const details = await loanVaultContract.methods
        .getLoanDetails(loanId)
        .call();
      return {
        status: details.status,
        borrower: toChecksumAddress(details.borrower),
        lender: toChecksumAddress(details.lender),
        tokenURI: details.tokenURI,
      };
    },

    // Retrieve the token URI associated with a specific loan
    async getLoanTokenURI(loanId) {
      return await loanVaultContract.methods.getLoanTokenURI(loanId).call();
    },

    // List all pending loan IDs
    async listPendingLoanIds() {
      return await loanVaultContract.methods.listPendingLoanIds().call();
    },

    // Get active loan IDs where the caller is the borrower
    async getMyActiveLoanIdsAsBorrower() {
      return await loanVaultContract.methods
        .getMyActiveLoanIdsAsBorrower()
        .call();
    },

    // Get active loan IDs where the caller is the lender
    async getMyActiveLoanIdsAsLender() {
      return await loanVaultContract.methods
        .getMyActiveLoanIdsAsLender()
        .call();
    },

    // Retract a proposed loan
    async retractLoan(loanId) {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);
      await loanVaultContract.methods.retract(loanId).send({
        from: accounts[0],
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
      });
    },

    // Accept a proposed loan
    async acceptLoan(loanId, amount) {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);
      await loanVaultContract.methods.acceptLoan(loanId).send({
        from: accounts[0],
        value: web3.utils.toWei(amount.toString(), 'ether'),
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
      });
    },

    // Fully pay off an active loan
    async payLoanInFull(loanId, amount) {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);
      await loanVaultContract.methods.payInFull(loanId).send({
        from: accounts[0],
        value: web3.utils.toWei(amount.toString(), 'ether'),
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
      });
    },

    // Liquidate a loan that has defaulted
    async liquidateLoan(loanId) {
      const accounts = await web3.eth.getAccounts();
      const adjustedGasPrice = await getAdjustedGasPrice(web3);
      await loanVaultContract.methods.liquidate(loanId).send({
        from: accounts[0],
        gas: DEFAULT_GAS_LIMIT,
        gasPrice: adjustedGasPrice,
      });
    },

    // Check if an NFT is currently used as collateral
    async isCollateral(nftContract: string, tokenId: number): Promise<boolean> {
      return await loanVaultContract.methods
        .isCollateral(nftContract, tokenId)
        .call();
    },

    // Check the status of a specific loan
    async getLoanStatus(loanId: number): Promise<string> {
      const statusNumber = await loanVaultContract.methods
        .getLoanStatus(loanId)
        .call();
      console.log('Loan Status Number from Contract:', statusNumber); // Debugging line
      const statusStrings = [
        'NonExistent',
        'Pending',
        'Active',
        'PaidOff',
        'Defaulted',
      ];
      return statusStrings[statusNumber];
    },
  };
};

export default LoanVaultInteraction;
