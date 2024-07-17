import { create } from "zustand";
import {
    AuctionDetails,
    CollectibleOptions,
    DurationOptions,
    FormDataProp,
    ListingOptions,
    VideoDetails,
} from "@/types";

interface FormStore {
    formData: FormDataProp;
    setFormData: {
        setVideo: (video: File | null) => void;
        setVideoUrl: (url: string) => void;
        setVideoInfo: (info: VideoDetails | null) => void;
        setThumbnail: (thumbnail: File | null) => void;
        setThumbnailUrl: (url: string) => void;
        setShorts: (shorts: boolean) => void;
        setQuicks: (quicks: boolean) => void;
        setListNFT: (listNFT: boolean) => void;
        setSaleType: (type: ListingOptions) => void;
        setAuctionDetails: (details: AuctionDetails | null) => void;
        setPrice: (price: string) => void;
        setRoyalty: (royalty: string) => void;
        setName: (name: string) => void;
        setCollection: (collection: string) => void;
        setDescription: (description: string) => void;
        setPlaylist: (playlist: string) => void;
        setSaleDuration: (duration: DurationOptions) => void;
        setCollectibleCount: (count: CollectibleOptions) => void;
    };
    resetFormData: () => void;
}

export const formDefaultData: { formData: FormDataProp } = {
    formData: {
        video: null,
        videoUrl: "",
        videoInfo: null,
        thumbnail: null,
        thumbnailUrl: "",
        shorts: false,
        quicks: false,
        listNFT: false,
        saleType: "Fixed" as ListingOptions,
        auctionDetails: null,
        price: "",
        royalty: "",
        name: "",
        collection: "",
        description: "",
        playlist: "",
        saleDuration: "No time limit" as DurationOptions,
        collectibleCount: "Unlimited collects" as CollectibleOptions,
    },
};

export const useFormStore = create<FormStore>((set) => ({
    formData: formDefaultData.formData,
    setFormData: {
        setVideo: (video: File | null) =>
            set((state) => ({ formData: { ...state.formData, video } })),
        setVideoUrl: (url: string) =>
            set((state) => ({
                formData: { ...state.formData, videoUrl: url },
            })),
        setVideoInfo: (info: VideoDetails | null) =>
            set((state) => ({
                formData: { ...state.formData, videoInfo: info },
            })),
        setThumbnail: (thumbnail: File | null) =>
            set((state) => ({ formData: { ...state.formData, thumbnail } })),
        setThumbnailUrl: (url: string) =>
            set((state) => ({
                formData: { ...state.formData, thumbnailUrl: url },
            })),
        setShorts: (shorts: boolean) =>
            set((state) => ({ formData: { ...state.formData, shorts } })),
        setQuicks: (quicks: boolean) =>
            set((state) => ({ formData: { ...state.formData, quicks } })),
        setListNFT: (listNFT: boolean) =>
            set((state) => ({ formData: { ...state.formData, listNFT } })),
        setSaleType: (type: ListingOptions) =>
            set((state) => ({
                formData: { ...state.formData, saleType: type },
            })),
        setAuctionDetails: (details: AuctionDetails | null) =>
            set((state) => ({
                formData: { ...state.formData, auctionDetails: details },
            })),
        setPrice: (price: string) =>
            set((state) => ({ formData: { ...state.formData, price } })),
        setRoyalty: (royalty: string) =>
            set((state) => ({ formData: { ...state.formData, royalty } })),
        setName: (name: string) =>
            set((state) => ({ formData: { ...state.formData, name } })),
        setCollection: (collection: string) =>
            set((state) => ({ formData: { ...state.formData, collection } })),
        setDescription: (description: string) =>
            set((state) => ({ formData: { ...state.formData, description } })),
        setPlaylist: (playlist: string) =>
            set((state) => ({ formData: { ...state.formData, playlist } })),
        setSaleDuration: (duration: DurationOptions) =>
            set((state) => ({
                formData: { ...state.formData, saleDuration: duration },
            })),
        setCollectibleCount: (count: CollectibleOptions) =>
            set((state) => ({
                formData: { ...state.formData, collectibleCount: count },
            })),
    },
    resetFormData: () => set(() => ({ formData: formDefaultData.formData })),
}));

