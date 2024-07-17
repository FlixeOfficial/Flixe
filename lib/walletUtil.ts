'use client';

import { useWalletStore } from '@/store/walletStore';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSession } from 'next-auth/react';

export const useFetchAddress = () => {
  const { address, isConnected } = useAccount();
  const { setAddress, address: fallbackAddress } = useWalletStore();
    const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      let accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      while (!accounts[0]) {
        accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
      }

      setAddress(accounts[0].toLowerCase());
    };

    if (isConnected) {
      address && setAddress(address);
    } else fetchData();
  }, [address, isConnected]);

  return address
    ? address.toLowerCase()
    : fallbackAddress
    ? fallbackAddress.toLowerCase()
    : session?.user?.email?.toLowerCase() ?? '';
};
