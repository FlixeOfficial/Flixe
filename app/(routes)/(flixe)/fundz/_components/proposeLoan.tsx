'use client';

import * as z from 'zod';
import React, { useEffect, useState } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Editor } from '@/components/editor';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { uploadFiles } from '@/lib/uploadthing';
import { addDays } from 'date-fns';
import { fetchIPFSJson, pinJSONToPinata } from '@/service/pinataService';
import MarketplaceInteraction from '@/contracts/interaction/MarketplaceInteraction';
import MultipleSelector from '@/components/ui/multiple-selector';
import useSWR from 'swr';
import LoanVaultInteraction from '@/contracts/interaction/LoanVault';
import NFTApproval from './nftApproval';

const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = addDays(new Date(), 1);

const nftSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Title is required',
  }),
  image: z
    .custom<File>(
      (file) => {
        return file instanceof File;
      },
      {
        message: 'Image is required',
      }
    )
    .refine(
      (file) => {
        const isValidSize = file.size <= 10 * 1024 * 1024;
        return isValidSize;
      },
      {
        message: `The image must be a maximum of 10MB.`,
      }
    ),
  nftIds: z
    .array(nftSchema)
    .min(1, 'At least one NFT must be selected for collateral'),
  description: z.string().min(1),
  shortDescription: z.string().min(1),
  price: z
    .string()
    .refine(
      (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0.000001,
      {
        message: 'Price should be more than 0.000001',
        path: ['price'],
      }
    ),
  endDate: z.date().refine((date) => date > today, {
    message: 'End date must be a date after today.',
  }),
  interestPercentage: z.string().refine(
    (value) => {
      return /^(3[0-9]|[4-9][0-9]|100|[3-9])$/.test(value);
    },
    {
      message: 'Interest Percentage must be between 3 and 100',
    }
  ),
});

// Define a fetcher function that will be used by SWR
const fetchNFTsOwnedByUser = async () => {
  console.log('Fetching NFTs owned by user...');
  const marketplace = MarketplaceInteraction();

  let accounts = await window.ethereum.request({
    method: 'eth_accounts',
  });

  while (!accounts[0]) {
    accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
  }

  const walletAddress = accounts[0].toLowerCase();
  console.log(`Wallet Address: ${walletAddress}`);

  if (!walletAddress) return [];

  try {
    const data = await marketplace.fetchNFTsOwnedByUser(walletAddress);

    const artData = await Promise.all(
      data.map(async (artistry: any) => {
        const artURI = await marketplace.tokenURI(artistry.tokenId.toString());
        const artData = await fetchIPFSJson(artURI);
        // return {
        //   ...artistry,
        //   ...artData,
        //   price: artistry.price
        //     ? fromWei(artistry.price.toString(), 'ether')
        //     : artistry.price,
        //   tokenId: artistry.tokenId
        //     ? artistry.tokenId.toString()
        //     : artistry.tokenId,
        // };
        console.log('artdata1', artData);
        return {
          label: artData.title,
          value: artistry.tokenId.toString(),
        };
      })
    );
    console.log('artdata2', artData);
    return artData;
  } catch (error) {
    console.error('Error fetching NFTs owned by user:', error);
  }
};

const CreateLoanProposal = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: artistrys,
    error,
    mutate,
  } = useSWR('myOwnedIsArtNFTs', fetchNFTsOwnedByUser, {
    revalidateOnFocus: false, // Optionally disable revalidation on focus
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      image: undefined,
      nftIds: [],
      description: '',
      shortDescription: '',
      price: '',
      interestPercentage: '3',
      endDate: tomorrow,
    },
  });

  const [initiallyNFTApproved, setInitiallyNFTApproved] = useState(false);

  const { isSubmitting, isValid, errors } = form.formState;

  const calculateDaysLeft = (endDate: Date | undefined) => {
    if (!endDate) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    // Clone the endDate to avoid mutating the original date
    const end = new Date(endDate.getTime());
    end.setHours(0, 0, 0, 0); // Normalize end date to start of day

    const timeDiff = end.getTime() - today.getTime();
    if (timeDiff < 0) return 0; // No negative days

    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysLeft;
  };

  const LoanVault = LoanVaultInteraction();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('values', values);

    const {
      title,
      image,
      nftIds,
      description,
      shortDescription,
      price,
      interestPercentage,
      endDate,
    } = values;

    const deadline = new Date(endDate).getTime();

    // Ensure the file exists and is a File instance
    if (image && image instanceof File) {
      try {
        const [res] = await uploadFiles({
          files: [image],
          endpoint: 'imageUploader',
        });

        const args = {
          ...{
            price,
            endDate,
            description,
            shortDescription,
            title,
            nftIds,
            interestPercentage,
            deadline,
          },
          imageUrl: res.url,
        };

        const web3StorageResponse = await pinJSONToPinata(args, 'loan.json');

        const tokenURI = `${web3StorageResponse}`;

        const hash = await LoanVault.proposeLoan(
          nftIds.map((nft) => parseInt(nft.value)),
          parseFloat(price),
          parseFloat(price) +
          parseFloat(price) * (parseInt(interestPercentage) / 100),
          deadline,
          tokenURI
        );

        console.log(
          nftIds.map((nft) => parseInt(nft.value)),
          parseFloat(price),
          parseFloat(price) +
          parseFloat(price) * (parseInt(interestPercentage) / 100),
          deadline,
          tokenURI
        );

        console.log(hash);
        form.reset();
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.error('No file or invalid file provided');
    }
  };

  return (
    <div>
      {/* {isLoading && <Loader />} */}

      <div className='flex items-center justify-between bg-card border rounded-md px-4 py-2 -mt-2'>
        <div className='flex-1 flex flex-row justify-between'>
          <h1 className='text-3xl font-bold tracking-wider'>
            Create New{' '}
            <span className='font-bold text-[#6ca987]'>Loan Proposal</span>
          </h1>
          <div className='flex items-center gap-x-2'>
            <Button
              disabled={!isValid || isSubmitting || !initiallyNFTApproved}
              type='submit'
              form='hook-form'
            >
              Create
            </Button>
          </div>
        </div>
      </div>

      <NFTApproval
        initiallyNFTApproved={initiallyNFTApproved}
        setInitiallyNFTApproved={setInitiallyNFTApproved}
      />

      <Form {...form}>
        <form
          id='hook-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className={`w-full mt-5 flex flex-col gap-10 ${!initiallyNFTApproved ? 'opacity-50 pointer-events-none' : ''
            }`}
        >
          <div className='flex gap-10'>
            <div className='border rounded-md p-4 font-medium flex flex-col gap-8 w-2/3'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal Title</FormLabel>
                    <FormControl>
                      <Input placeholder='Proposal title' {...field} />
                    </FormControl>
                    <FormMessage>
                      {errors.title && <span>{errors.title.message}</span>}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <Input
                        type='file'
                        accept='image/*'
                        multiple={false}
                        // Spread all properties except 'value'
                        {...{ ...field, value: undefined }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='nftIds'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select all NFTs for Collateral</FormLabel>
                    <FormControl>
                      {/* <Combobox options={artistrys || nftValue} {...field} /> */}
                      {artistrys ? (
                        <MultipleSelector
                          value={field.value}
                          onChange={field.onChange}
                          defaultOptions={artistrys}
                          placeholder='Select the NFTs for collateral'
                          emptyIndicator={'no NFts found'}
                        />
                      ) : (
                        <div>loading...</div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='shortDescription'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-medium'>
                      Short Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='h-[50px]'
                        placeholder='Give a one line of the flix'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe your proposal</FormLabel>
                    <FormControl>
                      <Editor {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex gap-4'>
                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem className='flex flex-row gap-3 items-center justify-between rounded-lg border p-4 bg-card w-1/2'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>Loan needed</FormLabel>
                        <FormDescription className='whitespace-nowrap'>
                          Required Loan Amount
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Input
                          type='text'
                          pattern='^(?:[1-9]\d*|0)?(?:\.\d+)?$'
                          placeholder='1000'
                          value={
                            field.value == null ? '0' : field.value.toString()
                          }
                          className='max-w-[40%] font-bold text-[#6ca987] text-lg'
                          onChange={(e) => {
                            const validDecimalOrDot =
                              /^(?:[1-9]\d*|0)?(?:\.\d*)?$/;
                            if (
                              e.target.value === '' ||
                              validDecimalOrDot.test(e.target.value)
                            ) {
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className='flex flex-row gap-3 items-center justify-between rounded-lg border p-4 bg-card w-1/2 '>
                  <FormField
                    control={form.control}
                    name='endDate'
                    render={({ field }) => (
                      <FormItem className='flex justify-between w-full'>
                        <div className='space-y-0.5'>
                          <FormLabel htmlFor='date' className='text-base'>
                            End time
                          </FormLabel>
                          <FormDescription className='whitespace-nowrap'>
                            Loan Proposal Duration
                          </FormDescription>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-[240px] pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className='flex gap-4'>
                <FormField
                  control={form.control}
                  name='interestPercentage'
                  render={({ field }) => (
                    <FormItem className='flex flex-row gap-3 items-center justify-between rounded-lg border p-4 bg-card w-1/2'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Interest Percentage
                        </FormLabel>
                        <FormDescription className='whitespace-nowrap'>
                          Return Loan Amount
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Input
                          type='text'
                          pattern='^(?:[1-9]\d*|0)?(?:\.\d+)?$'
                          placeholder='3'
                          value={
                            field.value == null ? '3' : field.value.toString()
                          }
                          className='max-w-[40%] font-bold text-[#6ca987] text-lg'
                          onChange={(e) => {
                            const validRangeRegex = /^(100|[1-9][0-9]?)?$/;
                            if (
                              e.target.value === '' ||
                              validRangeRegex.test(e.target.value)
                            ) {
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className='flex flex-row gap-3 items-center justify-between rounded-lg border p-4 bg-card w-1/2 '></div>
              </div>
            </div>
            <div className='border rounded-md p-4 font-medium flex flex-col gap-8 w-1/3 relative'>
              <div className='absolute top-[50%] -left-3 z-10 rounded-t-md tracking-widest transform translate-y-full -translate-x-1/4 text-primary px-3 rotate-90 backdrop-blur-md bg-opacity-20 bg-blue-100 border-blue-100'>
                Preview
              </div>

              {/* Image Preview */}
              <div className='group hover:shadow-sm w-full rounded-3xl bg-card cursor-pointer hover:bg-card'>
                <div className='relative'>
                  {form.watch('image') ? (
                    <Image
                      src={URL.createObjectURL(form.watch('image'))}
                      alt={`Selected thumbnail`}
                      className={`w-full object-cover rounded-t-3xl max-h-[300px]`}
                      width={150}
                      height={50}
                      layout='responsive'
                    />
                  ) : (
                    <div className='w-full object-cover rounded-t-3xl flex justify-center items-center bg-gray-200 dark:bg-card h-[300px]'>
                      <span className='text-3xl font-semibold tracking-widest text-primary/10'>
                        select a cover image
                      </span>
                    </div>
                  )}
                  <div className='absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <div className='flex flex-col justify-end h-full p-5 space-y-3'>
                      <p className='text-muted dark:text-muted-foreground mb-2 text-xl'>
                        {form.watch('shortDescription')
                          ? form.watch('shortDescription')
                          : 'Give a Short Description'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col p-4 space-y-4 mx-3'>
                  <div>
                    <h3 className='text-2xl font-bold text-primary leading-6 truncate'>
                      {form.watch('title')
                        ? form.watch('title')
                        : 'Give a title'}
                    </h3>
                  </div>

                  <div className='flex justify-between items-center flex-wrap space-y-2'>
                    <div className='flex flex-col items-center'>
                      <h4 className='text-xl font-semibold text-[#6ca987] leading-5'>
                        <span className='text-md text-foreground truncate'>
                          <span className='text-gray-400 font-medium'>
                            Need&nbsp;
                          </span>
                          <span className='text-[#6ca987]'>
                            {form.watch('price') ? form.watch('price') : '0'}
                          </span>
                          &nbsp;TFUEL
                        </span>
                      </h4>
                    </div>
                    <div className='flex flex-col items-center'>
                      <h4 className='text-xl font-semibold text-foreground leading-5'>
                        {calculateDaysLeft(form.watch('endDate'))}
                        <span className='text-md text-gray-400 truncate'>
                          {' '}
                          {calculateDaysLeft(form.watch('endDate')) > 1
                            ? 'Days Left'
                            : 'Day Left'}
                        </span>
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {Object.entries(errors).map(([key, error]) => (
          <p key={key} className='text-red-500 text-sm mt-2'>
            {key.charAt(0).toUpperCase() + key.slice(1)}: {error?.message}
          </p>
        ))}
      </Form>
    </div>
  );
};

export default CreateLoanProposal;
