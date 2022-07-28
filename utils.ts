import { MetadriveFile__factory } from "@metadrive/typechain-types";
import { ethers } from "ethers";
import { Dispatch } from "react";
import { config } from "./config";

export const hexStringToBuffer = (hexString: string) =>
  Buffer.from(hexString.slice(2), "hex");

export const getUser = async (address: string): Promise<User | null> => {
  const metadriveFileContract = getMetadriveFileContract();
  const user = await metadriveFileContract.users(address);
  // User does not exist
  if (user[1] === ethers.constants.HashZero) {
    return null;
  } else {
    return {
      username: user[0],
      publicKey: hexStringToBuffer(user[1]),
    };
  }
};

export interface User {
  username: string;
  publicKey: Buffer;
}

export interface CommonProps {
  connectedWallet: string | null;
  setConnectedWallet: Dispatch<string | null>;
  connectedUser: User | null;
  setConnectedUser: Dispatch<User | null>;
  isNetworkValid: boolean;
  setIsNetworkValid: Dispatch<boolean>;
}

export interface NftInfo {
  tokenId: number;
  metadata: NftMetadata;
}

export interface NftMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  filename: string;
}

export const getMetadriveFileContract = () => {
  const provider = new ethers.providers.Web3Provider(
    window.ethereum as ethers.providers.ExternalProvider,
    "any"
  );
  const signer = provider.getSigner();
  const metadriveFileContract = MetadriveFile__factory.connect(
    config.metadriveFileContractAddress,
    signer
  );
  return metadriveFileContract;
};

export const trimAddress = (address: string) => {
  return address.slice(0, 5) + "..." + address.slice(-3);
};

interface ParsedFileUrl {
  ipfsCid?: string;
}

export const parseFileUrl = (url: string): ParsedFileUrl | null => {
  if (url.startsWith("ipfs://")) {
    return {
      ipfsCid: url.slice(7),
    };
  } else {
    return null;
  }
};
