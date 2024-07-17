"use client";

import * as React from "react";
// import WalletIcon from "./ui/wallet-icon";
import { useWalletConnection } from "@/hooks/connectWallet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/store/walletStore";
import { useFetchAddress } from "@/lib/walletUtil";
import { useCallback, useState } from "react";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import { useSession } from "next-auth/react";
import { useSignOut } from "@/hooks/signOut";
import { useWallet } from "@/hooks/connectWalletHook";
import minifyText from "@/lib/minify";
import {
  Copy,
  CreditCard,
  Fingerprint,
  Loader2,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Underline } from "@/app/(routes)/(flixe)/(home)/_components/underline";
import Image from "next/image";

export function WalletConnection({ text = "" }: { text?: string }) {
  useWallet();

  const { status } = useSession();
  const { connectWallet, error } = useWalletConnection();
  const { modal, setModal, modalResolver, address: walletAddress } = useWalletStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [name, setName] = useState("");

  useFetchAddress();

  const handleScreenInClick = async () => {
    setIsLoggingIn(true);
    await connectWallet();
    setIsLoggingIn(false);
  };

  const onSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      await axios.post("/api/register", {
        walletAddress,
        username: walletAddress,
        name,
      });
      setIsLoading(false);
      toast({
        title: "🥳! Profile Created.",
        description: "Your personalized profile is ready!",
      });
      modalResolver(true);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null) {
        const typedError = error as Record<string, any>;
        if (typedError.response?.data?.message) {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: typedError.response.data.message,
          });
        }
      }
      modalResolver(false);
      throw error;
    } finally {
      setIsLoading(false);
      setModal(false);
    }
  }, [walletAddress, name, toast, modalResolver, setModal]);
  const { handleSignOut } = useSignOut();

  const handleScreenOutClick = () => {
    handleSignOut();
    localStorage.setItem("isLoggingIn", "false");
  };

  React.useEffect(() => {
    if (!walletAddress) {
      handleScreenOutClick();
    }
  }, [walletAddress]);

  return !text ? (
    <>
      {status !== 'authenticated' ? (
        <>
          <Button
            className='group h-9 right-[4%] rounded-sm backdrop-blur-md border border-border/40 font-bold text-[#7c80dc] hover:text-primary hover:bg-[rgba(22,18,28,0.4)] bg-[rgba(34,28,43,0.2)] hover:dark:border-[#a793f6]/50 hover:text-[#a793f6]'
            onClick={handleScreenInClick}
            disabled={isLoggingIn}
          >
            {/* <WalletIcon className="mr-2 h-5 w-5" /> */}
            <Fingerprint className='w-5 h-5 mr-2' />
            {isLoggingIn ? (
              <Loader2 className='w-6 h-6 text-primary animate-spin' />
            ) : (
              'Pop In'
            )}
            <span className='sr-only'>Wallet Connection</span>
          </Button>

          {walletAddress && (
            <Dialog
              open={modal}
              onOpenChange={() => {
                setIsLoggingIn(false);
                setModal(false);
              }}
            >
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle className='text-center text-3xl font-bold'>
                    Welcome to Flixe
                  </DialogTitle>
                  <DialogDescription className='text-center'>
                    Your journey into the heart of entertainment begins here.
                  </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='name' className='text-left'>
                      Name
                    </Label>
                    <Input
                      id='name'
                      placeholder='Name'
                      className='col-span-3'
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='username' className='text-left'>
                      Username
                      <br />
                      <span className='text-xs text-primary-80 text-left'>
                        walletaddress
                      </span>
                    </Label>
                    <Input
                      id='username'
                      value={`${walletAddress}`}
                      className='col-span-3'
                      disabled
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogFooter>
                    <Button
                      type='submit'
                      onClick={onSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Hop In 🎉'}
                    </Button>
                  </DialogFooter>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className='group h-9 right-[4%] rounded-sm backdrop-blur-md border font-bold text-muted-foreground hover:bg-card bg-transparent hover:dark:text-primary hover:text-primary'>
              <Image
                src='https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/9af4c12f-a0d9-48ab-a9d3-240148699eaf/dcxtljb-82324735-1f2c-4eb3-875d-c0031ccc054a.png/v1/fill/w_1192,h_670,q_70,strp/_youtuber_or_something__pewdiepie_style_background_by_rapbattleeditor0510_dcxtljb-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzIwIiwicGF0aCI6IlwvZlwvOWFmNGMxMmYtYTBkOS00OGFiLWE5ZDMtMjQwMTQ4Njk5ZWFmXC9kY3h0bGpiLTgyMzI0NzM1LTFmMmMtNGViMy04NzVkLWMwMDMxY2NjMDU0YS5wbmciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.qMisSWXgjp_IyVhQmHjTxDA_72zvcHfgNpTHdRs-yIY'
                alt='Thumbnail'
                className='rounded-full object-cover mr-2 group-hover:shadow-md group-hover:shadow-red-500/20 transition duration-300'
                width={28}
                height={28}
                layout='fixed'
              />
              {walletAddress ? minifyText(walletAddress) : 'Not Connected'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56'>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(walletAddress || '');
                toast({
                  title: '📄 Wallet Address Copied',
                });
              }}
            >
              <Copy className='mr-2 h-4 w-4' />{' '}
              {/* You might need to import or define this Copy icon */}
              <span>Copy Address</span>
            </DropdownMenuItem>
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled
              // onClick={() => {
              //   openWallet({
              //     topMenuType: "close",
              //   });
              // }}
              >
                <CreditCard className='mr-2 h-4 w-4' />
                <span>Wallet</span>
                {/* <DropdownMenuShortcut>⌘B</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleScreenOutClick}>
              <LogOut className='mr-2 h-4 w-4' />
              Pop Out
              {/* <DropdownMenuShortcut>⇧Q</DropdownMenuShortcut> */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  ) : (
    <Button
      variant='ghost'
      onClick={handleScreenInClick}
      disabled={isLoggingIn}
      className='hover:bg-transparent'
    >
      {/* <span className="metamask-gradient text-3xl font-bold px-1"> */}
      <span>
        {isLoggingIn ? (
          <Loader2 className='w-6 h-6 text-primary animate-spin' />
        ) : (
          <span className='w-full text-2xl font-bold tracking-widest text-[#b1d8ff] -mx-3'>
            {text}
            <Underline />
          </span>
        )}
      </span>
    </Button>
  );
}
