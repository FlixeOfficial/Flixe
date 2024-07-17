import { createConfig, http } from 'wagmi';
import { fraxtalTestnet } from 'wagmi/chains';

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}

export const config = createConfig({
  chains: [fraxtalTestnet],
  connectors: [
    // injected(),
    // metaMask({
    //   dappMetadata: {
    //     name: "Fraxtal Starter Kit",
    //     url: "http://localhost:3000",
    //   },
    // }),
  ],
  transports: {
    [fraxtalTestnet.id]: http(),
  },
  ssr: true,
});
