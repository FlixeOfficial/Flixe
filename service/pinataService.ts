import axios from "axios";

// function to fetch the ipfs file
export const fetchIPFSJson = async (hash: string) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${hash}`
  );
  const decodedJson = decodeURIComponent(response.data);
  return JSON.parse(decodedJson);
};

// function to pin a file to pinata
export const pinFileToPinata = async (fileToUpload: File) => {
  try {
    const data = new FormData();
    data.set("file", fileToUpload);
    const res = await fetch("/api/pinata", {
      method: "POST",
      body: data,
    });

    const resData = await res.json();
    return resData.IpfsHash;
  } catch (e) {
    alert("Trouble uploading file");
  }
};

// function to pin a JSON object to pinata
export const pinJSONToPinata = async (JSONBody: any, fileName: string) => {
  try {
    const fileToUpload = new Blob(
      [encodeURIComponent(JSON.stringify(JSONBody))],
      {
        type: "application/json",
      }
    );
    const data = new FormData();
    data.set("file", fileToUpload);
    const res = await fetch("/api/pinata", {
      method: "POST",
      body: data,
    });
    const resData = await res.json();

    if (
      !resData ||
      resData === "" ||
      (typeof resData === "object" && Object.keys(resData).length === 0)
    ) {
      throw new Error(
        "artistryURI is undefined, null, empty string or an empty object"
      );
    }

    const databack = await fetchIPFSJson(resData.IpfsHash);
    console.log(databack);

    return resData.IpfsHash;
  } catch (e) {
    alert("Trouble uploading file");
  }
};

// function to unpin a file from pinata using CID
export const unpinFileFromPinata = async (CID: string) => {
  return `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${CID}`;
};
