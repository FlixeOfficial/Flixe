export const isProduction = process.env.NODE_ENV === "production";
export const isDevelopment = process.env.NODE_ENV === "development";

export const siteURL = process.env.NEXT_PUBLIC_URL as string;
export const ipfsURL = process.env.NEXT_PUBLIC_GATEWAY_URL as string;
