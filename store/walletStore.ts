import { create } from "zustand";

interface WalletStore {
    isSupportedNetwork: boolean;
    isConnected: boolean;
    address: string | null;
    modal: boolean;
    modalResolver: (value: boolean) => void;
    setIsConnected: (isConnected: boolean) => void;
    setIsSupportedNetwork: (isSupported: boolean) => void;
    setModal: (value: boolean) => void;
    setModalResolver: (resolver: (value: boolean) => void) => void;
    setAddress: (address: string) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
    isSupportedNetwork: false,
    isConnected: false,
    address: '',
    modal: false,
    modalResolver: () => {},
    setIsConnected: (isConnected) => set({ isConnected: isConnected }),
    setIsSupportedNetwork: (isSupported) =>
        set({ isSupportedNetwork: isSupported }),
    setModal: (value) => set({ modal: value }),
    setModalResolver: (resolver) => set({ modalResolver: resolver }),
    setAddress: (address) => set({ address }),
}));
