'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import NightSky from '@/components/nightSky';
import MarketplaceInteraction, {
  FlixPassDuration,
} from '@/contracts/interaction/MarketplaceInteraction';
import { useToast } from '@/components/ui/use-toast';
import { useFetchAddress } from '@/lib/walletUtil';
import { fromWei } from 'web3-utils';

type PricingSwitchProps = {
  onSwitch: (value: string) => void;
};

type PricingCardProps = {
  isYearly?: boolean;
  title: string;
  id: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  price?: number;
  description: string;
  features: string[];
  actionLabel: string;
  popular?: boolean;
  exclusive?: boolean;
  handlePurchasePass: (id: string) => void;
  canRent: boolean;
};

function calculatePercentage(monthlyPrice: number, yearlyPrice: number) {
  let yearlyCostFromMonthly = monthlyPrice * 12;
  let difference = yearlyCostFromMonthly - yearlyPrice;
  let percentage = (difference / yearlyCostFromMonthly) * 100;
  return percentage.toFixed(2) + '%';
}

const PricingHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <section className='text-center mb-9'>
    <h2 className='text-5xl font-bold'>{title}</h2>
    <p className='text-md pt-1'>{subtitle}</p>
    <br />
  </section>
);

const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <Tabs defaultValue='0' className='w-40 mx-auto' onValueChange={onSwitch}>
    <TabsList className='backdrop-blur-md border font-bold text-muted-foreground hover:text-primary bg-transparent'>
      <TabsTrigger
        value='0'
        className='py-1 px-2 rounded-[10px] data-[state=active]:bg-foreground/20'
      >
        Monthly
      </TabsTrigger>
      <TabsTrigger
        value='1'
        className='py-1 px-2 rounded-[10px] data-[state=active]:bg-foreground/20'
      >
        Yearly
      </TabsTrigger>
    </TabsList>
  </Tabs>
);

const PricingCard = ({
  isYearly,
  title,
  id,
  monthlyPrice,
  yearlyPrice,
  price,
  description,
  features,
  actionLabel,
  popular,
  exclusive,
  handlePurchasePass,
  canRent,
}: PricingCardProps) => {
  return (
    <Card
      className={cn(
        `w-72 flex flex-col justify-between py-1 ${popular ? 'border-[#8678f9]/70' : 'border'
        } mx-auto sm:mx-0 bg-card/60 backdrop-blur-sm ${title === 'Premium' ? '-mt-2 mb-4' : 'mt-2'
        }`,
        {
          'animate-background-shine bg-white dark:bg-[linear-gradient(110deg,#000103,35%,#1e2631,40%,#000103)] bg-[length:200%_100%] transition-colors':
            exclusive,
        }
      )}
    >
      <div>
        <CardHeader className='pb-8 pt-4'>
          {isYearly && yearlyPrice && monthlyPrice ? (
            <div className='flex justify-between'>
              <CardTitle className='text-zinc-700 dark:text-zinc-300 text-lg'>
                {title}
              </CardTitle>
              <div
                className={cn(
                  'px-2.5 rounded-xl h-fit text-sm py-1 bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white',
                  {
                    'bg-gradient-to-r from-purple-300/80 to-violet-400/60 dark:text-black ':
                      popular,
                  }
                )}
              >
                Save
                <span className='font-bol px-1'>
                  {calculatePercentage(monthlyPrice, yearlyPrice)}
                </span>
              </div>
            </div>
          ) : (
            <CardTitle className='text-zinc-700 dark:text-zinc-300 text-lg'>
              {title}
            </CardTitle>
          )}
          <div className='flex gap-0.5'>
            <h3 className='text-4xl font-bold'>
              {yearlyPrice && isYearly ? (
                <span>
                  {yearlyPrice}
                </span>
              ) : monthlyPrice ? (
                <span>
                  {monthlyPrice}
                </span>
              ) : (
                <span>
                  {price}
                </span>
              )}
            </h3>
            <span className='flex flex-col justify-end text-sm mb-1'>
              <span className='font-medium text-sm pl-1'>TFUEL</span>
              {
                `${yearlyPrice && isYearly ? ' / year' : monthlyPrice ? ' / month' : !canRent ? ' / day' : ' - Active Pass'}`
              }
            </span>
          </div>
          <CardDescription className='pt-1.5 h-12'>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-2 mt-6'>
          {features.map((feature: string) => (
            <CheckItem key={feature} text={feature} />
          ))}
        </CardContent>
      </div>
      <CardFooter className='mt-12'>
        <Button
          onClick={() => handlePurchasePass(id)}
          disabled={id === 'rent' && !canRent}
          className='relative inline-flex w-full items-center justify-center rounded-md bg-black text-white dark:bg-white px-6 font-medium dark:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50'
        >
          <div className='absolute -inset-0.5 -z-10 rounded-lg bg-gradient-to-b from-[#c7d2fe] to-[#8678f9] opacity-50 blur-sm' />
          {id === 'rent' && !canRent ? 'No active Pass' : actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};

const CheckItem = ({ text }: { text: string }) => (
  <div className='flex gap-2'>
    <CheckCircle2 size={18} className='my-auto text-green-400' />
    <p className='pt-0.5 text-zinc-700 dark:text-zinc-300 text-sm'>{text}</p>
  </div>
);

export default function Page() {
  const marketplace = MarketplaceInteraction();

  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>('None');
  const [rental, setRental] = useState<boolean>(false);
  const [rentalPrice, setRentalPrice] = useState<number>(0);
  const userAddress = useFetchAddress();

  const getCurrentPassType = async () => {
    if (!userAddress) return;
    const plan = await marketplace.getCurrentPassType(userAddress);
    if (plan !== 'None') {
      const rental = await marketplace.checkRentAddOnStatus(userAddress);
      if (!rental.isActive) {
        const price = await marketplace.calculateRentAddOnCost(userAddress);
        setRentalPrice(parseFloat(fromWei(price, 'ether')));
      } else {
        setRental(true);
      }
    }
    setCurrentPlan(plan);
  };

  useEffect(() => {
    getCurrentPassType();
  }, [userAddress]);

  const [isYearly, setIsYearly] = useState(false);
  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1);

  const plans = [
    {
      title: 'Standard',
      id: 'standard',
      monthlyPrice: 70,
      yearlyPrice: 700,
      description:
        'Jumpstart your experience with full access to premium content.',
      features: ['Unlimited Premium Content'],
      actionLabel: 'Subscribe Now',
    },
    {
      title: 'Premium',
      id: 'premium',
      monthlyPrice: 140,
      yearlyPrice: 1400,
      description: 'Enjoy an ad-free experience with unlimited premium access.',
      features: ['Unlimited Premium Content', 'No Ads'],
      actionLabel: 'Subscribe Now',
      popular: true,
    },
    {
      title: 'AddOn - Rent',
      id: 'rent',
      price: 25,
      description: 'AddOn to access all the exclusive rental content.',
      features: ['Rental Content Access'],
      actionLabel: 'Add to Plan',
      exclusive: true,
    },
  ];

  const handlePurchasePass = async (id: string) => {
    setIsLoading(true);

    try {
      if (id === 'rent') {
        const data = await marketplace.purchaseRentAddOn();
        toast({
          title: 'Add-On Purchase successfully',
          description: 'You have successfully bought the Rent Add-On.',
        });
        return;
      }

      const planType = isYearly
        ? FlixPassDuration.Annual
        : FlixPassDuration.Monthly;

      const data =
        id === 'standard'
          ? await marketplace.purchaseStandardPass(planType)
          : await marketplace.purchasePremiumPass(planType);

      console.log('data: ', data);

      // console.log(
      //   `Purchasing ${planType} pass for ${
      //     isAnnual ? "Annual" : "Monthly"
      //   } price of ${price} ETH`
      // );

      // After successful purchase
      toast({
        title: 'Pass Purchase successfully',
        description: `You have successfully bought the ${planType} pass`,
      });
      getCurrentPassType();
    } catch (error) {
      console.error('Error purchasing plan:', error);
      // alert(`Failed to purchase ${planType} pass: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full flex flex-col items-center'>
      <NightSky />
      {currentPlan !== 'None' ? (
        <div className='z-10 flex flex-col justify-center items-center min-h-[80vh]'>
          <span className='-mb-10'>
            <PricingHeader title='FLIX PASS' subtitle={''} />
          </span>
          <h3 className='text-xl'>
            You are currently subscribed to the Flix Pass{' '}
            <b className='text-[#8b7ad0]'>{currentPlan}</b> Plan.
          </h3>
          {rental ? (
            <h3 className='text-xl pt-3'>
              You have an active{' '}
              <b className='text-[#8b7ad0]'>Rental - AddOn</b>
            </h3>
          ) : (
            <span className='mt-10'>
              <PricingCard
                key={plans[2].title}
                {...{ ...plans[2], price: rentalPrice }}
                isYearly={isYearly}
                handlePurchasePass={handlePurchasePass}
                canRent={true}
              />
            </span>
          )}
        </div>
      ) : (
        <div className='z-10 flex flex-col justify-center items-center min-h-[80vh]'>
          <PricingHeader
            title='FLIX PASS Pricing'
            subtitle="Choose the plan that's right for you"
          />
          <PricingSwitch onSwitch={togglePricingPeriod} />
          <section className='flex flex-col sm:flex-row sm:flex-wrap justify-center gap-8 mt-8'>
            {plans.map((plan) => {
              return (
                <PricingCard
                  key={plan.title}
                  {...plan}
                  isYearly={isYearly}
                  handlePurchasePass={handlePurchasePass}
                  canRent={false}
                />
              );
            })}
          </section>
        </div>
      )}
    </div>
  );
}
