import React, { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import MarketplaceInteraction from '@/contracts/interaction/MarketplaceInteraction';
import { useForm } from 'react-hook-form';
import { useFetchAddress } from '@/lib/walletUtil';
import { useToast } from '@/components/ui/use-toast';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from '@/components/ui/form';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loanContractAddress =
  process.env.NEXT_PUBLIC_LOANVAULT_CONTRACT_ADDRESS || '';

const formSchema = z.object({
  isApproved: z.boolean().default(false),
});

interface NFTApprovalProps {
  initiallyNFTApproved: boolean;
  setInitiallyNFTApproved: (approved: boolean) => void;
}

const NFTApproval: React.FC<NFTApprovalProps> = ({
  initiallyNFTApproved,
  setInitiallyNFTApproved,
}) => {
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const walletAddress = useFetchAddress();
  const marketplace = MarketplaceInteraction();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isApproved: !!isApproved,
    },
  });

  const fetchApprovalStatus = async () => {
    if(!walletAddress) return;
    try {
      const approved = await marketplace.checkIfApprovedForAll(
        walletAddress,
        loanContractAddress
      );
      setIsApproved(approved);
      setInitiallyNFTApproved(approved);
      setLoading(false);

      // Reset form with fetched initial value
      form.reset({
        isApproved: approved,
      });
    } catch (error) {
      console.error('Error fetching approval status:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalStatus();
  }, [walletAddress]);

  const handleSubmit = async (value: z.infer<typeof formSchema>) => {
    debugger;
    if (value.isApproved !== initiallyNFTApproved) {
      setLoading(true);
      try {
        await marketplace.setApprovalForAll(
          loanContractAddress,
          value.isApproved
        );
        await fetchApprovalStatus();
      } catch (error) {
        console.error('Failed to update approval status:', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Failed to update approval status.',
        });
        setIsApproved(initiallyNFTApproved); // Revert to the original state on error
      } finally {
        setLoading(false);
      }
    }
  };

  const bgColor = form.watch('isApproved')
    ? 'bg-green-500/30'
    : 'bg-red-500/30';

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={`border rounded-md px-4 py-1 mt-4 ${bgColor} flex items-center justify-between`}
      >
        <FormField
          control={form.control}
          name='isApproved'
          render={({ field }) => (
            <FormItem className='flex items-center'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                  className='w-6 h-6'
                />
              </FormControl>
              <FormDescription className='pl-4 text-primary items-center text-xl h-full pb-2'>
                {loading
                  ? 'Loading...'
                  : 'Authorize this contract to manage all your NFTs'}
              </FormDescription>
            </FormItem>
          )}
        />
        <Button
          type='submit'
          variant='ghost'
          disabled={!form.formState.isDirty || loading}
          className={`ml-auto ${
            !form.formState.isDirty ? 'invisible' : ''
          } hover:bg-card/10 font-bold`}
          aria-hidden={!form.formState.isDirty}
        >
          Save Changes
        </Button>
      </form>
    </Form>
  );
};

export default NFTApproval;
