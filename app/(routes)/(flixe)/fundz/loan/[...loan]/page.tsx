'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import CountBox from '@/components/CountBox';
import { Preview } from '@/components/preview';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import CollateralTable from './collateral-table';
import { useFetchAddress } from '@/lib/walletUtil';
import LoanVaultInteraction from '@/contracts/interaction/LoanVault';
import { useToast } from '@/components/ui/use-toast';
import { redirect } from 'next/navigation';

interface NFTData {
  label: string;
  value: string;
}

interface Loan {
  id: string;
  owner: string;
  price: string;
  endDate: Date;
  description: string;
  title: string;
  status: string;
  lender: string;
  borrower: string;
  interestPercentage: string;
  nftIds: NFTData[];
  shortDescription: string;
  deadline: number;
  imageUrl: string;
  amountCollected: string;
  remainingDays: number;
}

const LoanVault = LoanVaultInteraction();

const FundLoanButton: React.FC<{
  loan: Loan;
  loanId: string;
  loanStatus: string;
}> = ({ loan, loanId, loanStatus }) => {
  const [isLoading, setIsLoading] = useState(false);

  const walletAddress = useFetchAddress();
  const { toast } = useToast();

  const handleDonate = async () => {
    setIsLoading(true);

    try {
      const hash = await LoanVault.acceptLoan(
        Number(loanId),
        Number(loan.price)
      );
      console.log(hash);
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    setIsLoading(false);
  };

  const handleRepay = async () => {
    setIsLoading(true);

    try {
      const hash = await LoanVault.payLoanInFull(
        Number(loanId),
        Number(
          parseFloat(loan.price) +
            parseFloat(loan.price) * (parseInt(loan.interestPercentage) / 100)
        )
      );

      toast({
        title: 'Loan Repaid',
        description: 'The loan has been repaid successfully.',
      });

      return redirect('/fundz?tab=proposals');
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    setIsLoading(false);
  };

  const handleRevoke = async () => {
    setIsLoading(true);

    try {
      const hash = await LoanVault.retractLoan(Number(loanId));

      toast({
        title: 'Loan Revoked',
        description: 'The loan has been revoked successfully.',
      });

      return redirect('/fundz?tab=proposals');
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    setIsLoading(false);
  };

  if (walletAddress === loan.borrower && loanStatus === 'Pending') {
    return (
      <div className='flex flex-col gap-4 justify-between rounded-lg border p-4 bg-card'>
        <h4 className='font-epilogue font-semibold text-[18px] text-primary uppercase'>
          Revoke the Loan
        </h4>

        <div className='flex gap-4 border border-red-500/20 bg-red-50/50 p-4 leading-6 text-red-900 dark:border-red-500/30 dark:bg-red-500/5 dark:text-red-200 rounded-[10px]'>
          <AlertTriangle className='mt-[0.30rem] h-4 w-4 flex-none fill-red-500 stroke-primary dark:fill-red-200/20 dark:stroke-red-200' />
          <p className='font-epilogue text-[16px]'>
            This action will revoke the loan and return the collaterals.
          </p>
        </div>

        <div className='flex flex-row items-center justify-end'>
          <Button
            className='text-primary font-bold py-2 px-4 rounded-[10px] hover:bg-[#a96c6c]/10 bg-muted/50 w-1/3'
            onClick={handleRevoke}
          >
            Revoke the Loan
          </Button>
        </div>
      </div>
    );
  } else if (walletAddress === loan.borrower && loanStatus === 'Active') {
    return (
      <div className='flex flex-col gap-4 justify-between rounded-lg border p-4 bg-card'>
        <h4 className='font-epilogue font-semibold text-[18px] text-primary uppercase'>
          Repay the Loan
        </h4>

        <div className='flex gap-4 border border-emerald-500/20 bg-emerald-50/50 p-4 leading-6 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-200 rounded-[10px]'>
          <svg
            viewBox='0 0 16 16'
            aria-hidden='true'
            className='mt-1 h-4 w-4 flex-none fill-emerald-500 stroke-primary dark:fill-emerald-200/20 dark:stroke-emerald-200'
          >
            <circle cx='8' cy='8' r='8' stroke-width='0'></circle>
            <path
              fill='none'
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='1.5'
              d='M6.75 7.75h1.5v3.5'
            ></path>
            <circle cx='8' cy='4' r='.5' fill='none'></circle>
          </svg>
          <p className='font-epilogue text-[16px]'>
            Repay the loan with the interest of {loan.interestPercentage}%.
          </p>
        </div>

        <div className='flex flex-row items-center justify-end'>
          <Button
            className='text-primary font-bold py-2 px-4 rounded-[10px] hover:bg-[#6ca987]/20 bg-muted/50 w-1/3'
            onClick={handleRepay}
          >
            Repay{' '}
            {Number(
              parseFloat(loan.price) +
                parseFloat(loan.price) *
                  (parseInt(loan.interestPercentage) / 100)
            )}
          </Button>
        </div>
      </div>
    );
  } else if (walletAddress === loan.lender && loanStatus === 'Pending') {
    return (
      <div className='flex flex-col gap-4 justify-between rounded-lg border p-4 bg-card'>
        <h4 className='font-epilogue font-semibold text-[18px] text-primary uppercase'>
          Funded the Loan
        </h4>

        <div className='flex gap-4 border border-emerald-500/20 bg-emerald-50/50 p-4 leading-6 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-200 rounded-[10px]'>
          <svg
            viewBox='0 0 16 16'
            aria-hidden='true'
            className='mt-1 h-4 w-4 flex-none fill-emerald-500 stroke-primary dark:fill-emerald-200/20 dark:stroke-emerald-200'
          >
            <circle cx='8' cy='8' r='8' stroke-width='0'></circle>
            <path
              fill='none'
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='1.5'
              d='M6.75 7.75h1.5v3.5'
            ></path>
            <circle cx='8' cy='4' r='.5' fill='none'></circle>
          </svg>
          <p className='font-epilogue text-[16px]'>
            You have funded this loan. You will be payed{' '}
            {parseFloat(loan.price) +
              parseFloat(loan.price) *
                (parseInt(loan.interestPercentage) / 100)}{' '}
            in {loan.remainingDays}. Thank you!
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className='flex flex-col gap-4 justify-between rounded-lg border p-4 bg-card'>
        <h4 className='font-epilogue font-semibold text-[18px] text-primary uppercase'>
          Fuel the Loan
        </h4>

        <div className='flex gap-4 border border-emerald-500/20 bg-emerald-50/50 p-4 leading-6 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-200 rounded-[10px]'>
          <svg
            viewBox='0 0 16 16'
            aria-hidden='true'
            className='mt-1 h-4 w-4 flex-none fill-emerald-500 stroke-primary dark:fill-emerald-200/20 dark:stroke-emerald-200'
          >
            <circle cx='8' cy='8' r='8' stroke-width='0'></circle>
            <path
              fill='none'
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='1.5'
              d='M6.75 7.75h1.5v3.5'
            ></path>
            <circle cx='8' cy='4' r='.5' fill='none'></circle>
          </svg>
          <p className='font-epilogue text-[16px]'>
            Your belief can breathe life into this Art.
          </p>
        </div>

        <div className='flex flex-row items-center justify-end'>
          <Button
            className='text-primary font-bold py-2 px-4 rounded-[10px] hover:bg-[#6ca987]/20 bg-muted/50 w-1/3'
            onClick={handleDonate}
          >
            Fund the Vision
          </Button>
        </div>
      </div>
    );
  }
};

const LoanDetails = ({ params }: { params: { loan: string[] } }) => {
  const [loans, setLoans] = useState<Loan | undefined>(undefined);
  const loanId = params.loan[0];
  const [loanStatus, setLoanStatus] = useState('');
  const walletAddress = useFetchAddress();

  useEffect(() => {
    const fetchLoanStatus = async () => {
      const status = await LoanVault.getLoanStatus(Number(loanId));
      setLoanStatus(status);
    };

    fetchLoanStatus();
  }, [loanId]);

  useEffect(() => {
    // Try to get the loan data from localStorage first
    const storedLoanData = localStorage.getItem(`loanData-${loanId}`);
    let loanData: Loan | null = storedLoanData
      ? (JSON.parse(storedLoanData) as Loan)
      : null;

    const logDataRetrievalMethod = (method: string) =>
      console.log(`Loan data retrieved by ${method}:`, loanData);

    // If no data in localStorage, fetch new data
    // if (!loanData) {
    //   const fetchLoans = async () => {
    //     setIsLoading(true);
    //     try {
    //       const data = await crowdFunding.getLoans();
    //       // Now you need to find the specific loan by ID
    //       loanData = data.find((loan: Loan) => loan.id === loanId);
    //       if (loanData) {
    //         // Update localStorage with the new data
    //         localStorage.setItem(
    //           `loanData-${loanId}`,
    //           JSON.stringify(loanData)
    //         );
    //         setLoans(loanData);
    //         logDataRetrievalMethod("fetchLoans");
    //       } else {
    //         console.error("Loan not found");
    //       }
    //     } catch (error) {
    //       console.error("Couldn't fetch loans:", error);
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   };

    //   fetchLoans();
    // } else
    if (loanData) {
      setLoans(loanData);
      logDataRetrievalMethod('localStorage');
    }
  }, []);

  return loans ? (
    <div className='flex flex-col pt-2 gap-[30px]'>
      {/* {isLoading && <Loader />} */}

      <div className='flex items-center justify-between bg-card border rounded-md px-4 py-2'>
        <div className='flex items-center flex-row justify-center align-middle'>
          <Link
            href='/fundz?tab=proposals'
            className='text-sm hover:opacity-75 transition -ml-4 -my-2 mr-4 rounded-l-md bg-background/30 hover:bg-background/70'
          >
            <ArrowLeft className='h-4 w-4 mx-4 my-4' />
          </Link>
          <Separator orientation='vertical' />
          <div className='font-medium flex flex-col gap-4'>
            <h1 className='text-3xl font-bold tracking-wider'>
              Fund{' '}
              <span className='font-bold text-[#8b7ad0]'>{loans.title}</span>
            </h1>
          </div>
        </div>
      </div>

      <div className='w-full flex md:flex-row flex-col gap-[30px]'>
        <div className='flex-1 flex-col'>
          <div className='group relative'>
            <Image
              src={loans ? loans.imageUrl : ''}
              alt='loan'
              className='w-full max-h-[410px] object-cover rounded-xl'
              width={150}
              height={50}
              layout='responsive'
            />
            <div className='absolute inset-0 bg-gradient-to-t rounded-b-xl from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <div className='flex flex-col justify-end h-full p-5 space-y-3'>
                <p className='text-muted dark:text-muted-foreground mb-2 text-xl'>
                  {loans?.shortDescription || 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex lg:flex-row flex-col gap-5 justify-between'>
        <div className='flex-[2] flex flex-col gap-5'>
          {/* <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-primary uppercase">
              Creator
            </h4>

            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img
                  src={thirdweb}
                  alt="user"
                  className="w-[60%] h-[60%] object-contain"
                />
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-primary break-all">
                  {state.owner}
                </h4>
                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">
                  10 Loans
                </p>
              </div>
            </div>
          </div> */}

          <div className='flex flex-col justify-between rounded-lg border p-4 bg-card'>
            <h4 className='font-epilogue font-semibold text-[18px] text-primary uppercase'>
              Description
            </h4>

            <div className='mt-[20px]'>
              <Preview value={loans?.description} />
            </div>
          </div>
        </div>
        <div className='flex-[1] flex flex-col gap-5'>
          <div className='rounded-lg border p-4 bg-card'>
            <div className='flex flex-row justify-between items-center'>
              <CountBox title='Days to Repay' value={loans.remainingDays} />
              <Separator orientation='vertical' />
              {walletAddress === loans.borrower && loanStatus === 'Active' ? (
                <CountBox
                  title='Repay Amount'
                  value={Number(
                    parseFloat(loans.price) +
                      parseFloat(loans.price) *
                        (parseInt(loans.interestPercentage) / 100)
                  )}
                />
              ) : (
                <CountBox title='Loan Amount' value={Number(loans.price)} />
              )}
              <Separator orientation='vertical' />
              <CountBox
                title={loans?.nftIds.length > 1 ? 'Collaterals' : 'Collateral'}
                value={loans?.nftIds.length}
              />
            </div>
          </div>


          <div className='flex flex-col justify-between rounded-lg border p-4 bg-card'>
            <h4 className='font-epilogue font-semibold text-[18px] text-primary uppercase'>
              {loans?.nftIds.length > 1 ? 'Collaterals' : 'Collateral'}
            </h4>
            <CollateralTable NFTData={loans.nftIds} />
          </div>

          <FundLoanButton
            loan={loans}
            loanId={loanId}
            loanStatus={loanStatus}
          />
        </div>
      </div>
    </div>
  ) : (
    <Link
      href='/fundz?tab=proposals'
      className='flex items-center text-sm hover:opacity-75 transition mb-6'
    >
      <ArrowLeft className='h-4 w-4 mr-2' />
      Back to fundz list view
    </Link>
  );
};

export default LoanDetails;
