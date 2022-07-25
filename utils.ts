import { MetadriveFile__factory } from "@metadrive/typechain-types";
import { ethers } from "ethers";
import { config } from "./config";

export interface CommonProps {
  connectedUser: string | null;
  isNetworkValid: boolean;
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
