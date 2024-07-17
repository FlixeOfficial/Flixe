'use client'

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { FC, ReactNode } from 'react'

import { config } from "@/utils/config";
import { type State, WagmiProvider } from "wagmi";


interface LayoutProps {
  children: ReactNode
}

const queryClient = new QueryClient()

const Providers: FC<LayoutProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Providers
