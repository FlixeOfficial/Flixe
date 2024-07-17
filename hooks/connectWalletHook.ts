'use client';

import { useCallback, useEffect, useState } from 'react';
// import { useRouter } from "next/navigation";;
import { useWalletStore } from '@/store/walletStore';
import { useToast } from '@/components/ui/use-toast';
import { useWalletConnection } from '@/hooks/connectWallet';
import { useSignOut } from './signOut';
import { useFetchAddress } from '@/lib/walletUtil';

export const useWallet = () => {
  const { toast } = useToast();
  const { handleSignOut } = useSignOut();
  const { connectWallet } = useWalletConnection();
  const { address, isConnected, isSupportedNetwork } = useWalletStore();
  const walletAddress = useFetchAddress();

  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

  // const checkMetaMaskConnection = useCallback(async () => {
  //     counter += 1; // Increment counter on each function call
  //     console.log('counter: ' + counter);
  //     if (window.ethereum) {
  //         const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  //         setIsMetaMaskConnected(accounts.length > 0);
  //     }
  // }, []);

  // useEffect(() => {
  //     checkMetaMaskConnection(); // Check connection on mount
  //     if (window.ethereum) {
  //         window.ethereum.on('accountsChanged', checkMetaMaskConnection);
  //         window.ethereum.on('chainChanged', checkMetaMaskConnection);

  //         return () => {
  //             window.ethereum.removeListener('accountsChanged', checkMetaMaskConnection);
  //             window.ethereum.removeListener('chainChanged', checkMetaMaskConnection);
  //         };
  //     }
  // }, []);

  const handleEvent = useCallback(
    async (e: MessageEvent) => {
      // counter += 1;
      // console.log('counter: ' + counter);

      // await checkMetaMaskConnection();

      // if(address === null || address === "" || isMetaMaskConnected || !isSupportedNetwork){
      //     // alert(`address: ${address}`);
      //     ( isConnected || !walletAddress ) && handleSignOut();
      // }

      if (e.data.message) {
        // console.log(e.data.message.action);

        switch (e.data.message.action) {
          case 'setNode':
            handleSignOut();
            connectWallet();
            break;
          case 'accountsChanged':
            // alert(`address: ${address}`);
            handleSignOut();
            connectWallet();
            // window.location.reload();
            break;
          case 'disconnect':
          case 'rejectWeb':
            handleSignOut();
            if (e.data.message.action === 'rejectWeb') {
              toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: '🤕 Connection request rejected',
              });
            }
            break;
          default:
            break;
        }
      }
    },
    [
      address,
      connectWallet,
      handleSignOut,
      isConnected,
      isSupportedNetwork,
      toast,
      walletAddress,
    ]
  );

  useEffect(() => {
    window.addEventListener('message', handleEvent);
    return () => {
      window.removeEventListener('message', handleEvent);
    };
  }, [handleEvent]);
};
