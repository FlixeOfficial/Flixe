'use client';

import { toast } from '@/components/ui/use-toast';
import { useWalletStore } from '@/store/walletStore';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export const useWalletConnection = () => {
  const [error, setError] = useState(false);
  const { setModal, setModalResolver, isConnected, address } = useWalletStore();
  const setIsConnected = useWalletStore((state) => state.setIsConnected);
  const setIsSupportedNetwork = useWalletStore(
    (state) => state.setIsSupportedNetwork
  );

  const pathname = usePathname();

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        setIsConnected(false);
      });
    }
  }, []);

  const userSignIn = async (walletAddress: string, name: string) => {
    try {
      const response = await fetch('/api/auth/generateNonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, name }),
      });
      if (response.status !== 200) {
        throw new Error('Sign-in failed');
      }
      const responseData = await response.json();
      const signedNonce = await window.ethereum.request({
        method: 'personal_sign',
        params: [responseData.nonce, walletAddress],
      });

      console.log(`pathname: ${pathname}`);
      await signIn('crypto', {
        walletAddress,
        signedNonce,
        callbackUrl: pathname,
      });
    } catch (error) {
      setError(true);
      toast({
        variant: 'destructive',
        title: '😟 Sry! Error Signing In',
        description: 'Login failed',
      });
      throw error;
    }
  };

  const loginOrCreateUser = async (walletAddress: string) => {
    try {
      debugger
      const response = await axios.post('/api/check-user', { walletAddress });
      if (response.status === 200) {
        if (!response.data.userExists) {
          if (window.ethereum) {
            const isRegistered = await new Promise<boolean>((resolve) => {
              setModalResolver(resolve);
              setModal(true);
            });
            if (isRegistered) {
              await userSignIn(walletAddress, response.data.name);
              toast({
                title: '🥳 Welcome to Flixe',
                description: 'Your account has been created',
              });
            }
          }
        } else {
          await userSignIn(walletAddress, response.data.name);
          toast({
            title: '🥳 Welcome back',
            description: 'Login successful',
          });
        }
      }
    } catch (error) {
      setError(true);
      toast({
        variant: 'destructive',
        title: '😟 Sry! Some error has occurred',
        description: 'Login failed',
      });
    }
  };

  const connectWallet = async () => {
    const networkId = await window.ethereum.request({
      method: 'eth_chainId',
    });

    if (!isConnected) {
      if (window.ethereum) {
        try {
          if (
            parseInt(networkId, 16).toString() ===
            process.env.NEXT_PUBLIC_NETWORK_ID
          ) {
            setIsSupportedNetwork(true);
          } else {
            setIsSupportedNetwork(false);
            toast({
              variant: 'destructive',
              title: 'Oops! Wrong network.',
              description: `😟 Please switch to ${process.env.NEXT_PUBLIC_NETWORK_NAME}`,
            });
            return;
          }

          const walletAddress = address;
          if (walletAddress && walletAddress.trim() !== ''){
            await loginOrCreateUser(walletAddress);
          } else {
            toast({
              variant: 'destructive',
              title: 'Uh oh! Please Log-in to Your MetaMask Wallet.',
            });
          }
          setIsConnected(true);
        } catch {
          setError(true);
          toast({
            variant: 'destructive',
            title: 'Oops! auto login failed.',
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Please install a wallet extension.',
        });
      }
    }
  };

  return { connectWallet, error };
};
