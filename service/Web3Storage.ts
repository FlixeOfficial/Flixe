// Web3.Storage Client
import { create } from "@web3-storage/w3up-client";

async function initClient(): Promise<any> {
  const client = await create();

  const email = process.env.NEXT_PUBLIC_CLIENT_EMAIL;
  const space = process.env.NEXT_PUBLIC_CLIENT_SPACE;

  if (!email || !email.includes('@')) {
    throw new Error('Environment variable NEXT_PUBLIC_CLIENT_EMAIL must be in the format `${string}@${string}`');
  }

  if (!space || !space.startsWith('did:')) {
    throw new Error('Environment variable NEXT_PUBLIC_CLIENT_SPACE must be in the format `did:${string}:${string}`');
  }

  await client.login(email as `${string}@${string}`);
  await client.setCurrentSpace(space as `did:${string}:${string}`);

  return client;
}

// Function to store a file to Web3.Storage
export const storeFileToWeb3Storage = async (file: File): Promise<string> => {
  const client = await initClient();
  const cid = await client.uploadFile(file);
  return cid;
};

// Function to store a HTML file to Web3.Storage
export const storeHTMLFileToWeb3Storage = async (file: File | string): Promise<string> => {
  const client = await initClient();
  let files: File[];
  if (typeof file === "string") {
    const blob = new Blob([file], { type: "text/html" });
    files = [new File([blob], "index.html")];
  } else {
    files = [file];
  }
  const cid = await client.uploadFile(files[0]); // Fixed to match expected type
  return cid;
};

// Function to store a JSON object to Web3.Storage
export const storeJSONToWeb3Storage = async (JSONBody: any, fileName: string): Promise<string> => {
  const client = await initClient();
  const file = new File([JSON.stringify(JSONBody)], fileName, { type: "application/json" });
  const cid = await client.uploadFile(file);
  return cid;
};

// Function to fetch the IPFS file
export const fetchIPFSJson = async (cid: string): Promise<any> => {
  const response = await fetch(`https://${cid}.ipfs.w3s.link`);
  const data = await response.json();
  return data;
};
