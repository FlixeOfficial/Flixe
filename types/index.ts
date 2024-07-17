import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";

export type CustomLayout<P = {}> = NextPage<P> & {
    authorization?: boolean;
    getLayout?: (page: ReactElement) => ReactNode;
};

export type nftTypes = {
    name: string;
    icon: string;
    disabled?: boolean;
    image: string;
    video: string;
};

export type User = {
    id: string;
    name?: string;
    username: string;
    bio?: string;
    email?: string;
    walletAddress: string;
    walletVerified?: Date;
    image?: string;
    coverImage?: string;
    createdAt: Date;
    updatedAt: Date;
    followingIds: string[];
    hasNotification?: boolean;

    posts: Post[];
    comments: Comment[];
    notifications: Notification[];

    followersCount?: number;
};

export type Post = {
    id: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    likedIds: string[];
    image?: string;
    shorts: boolean;
    nftId?: string;
    user: User;

    comments: Comment[];
};

export type Comment = {
    id: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    postId: string;

    user: User;
    post: Post;
};

export type Notification = {
    id: string;
    body: string;
    userId: string;
    createdAt: Date;

    user: User;
};

export type VideoDetails = {
    size?: number;
    duration?: number;
    format?: string;
};

export type DurationOptions = "No time limit" | Date;
export type CollectibleOptions = "Unlimited collects" | number;
export type ListingOptions = "Fixed" | "Auction";

export type AuctionDetails = {
    initialPrice?: string;
    minimumBid?: string;
    timeLeft?: number;
    endTime?: Date;
};

export type FormDataProp = {
    video: File | null;
    videoUrl: string;
    videoInfo: VideoDetails | null;
    thumbnail: File | null;
    thumbnailUrl: string;
    shorts: boolean;
    quicks: boolean;
    listNFT: boolean;
    saleType: ListingOptions;
    auctionDetails: AuctionDetails | null;
    price: string;
    royalty: string;
    name: string;
    collection: string;
    description: string;
    playlist: string;
    saleDuration: DurationOptions;
    collectibleCount: CollectibleOptions;
};
