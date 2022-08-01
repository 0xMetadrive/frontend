import { MetadriveFile__factory } from "@metadrive/typechain-types";
import { ethers } from "ethers";
import { Dispatch } from "react";
import { config } from "./config";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";

export const hexStringToBuffer = (hexString: string) =>
  Buffer.from(hexString.slice(2), "hex");

export const getPublicKey = async (address: string): Promise<Buffer | null> => {
  const metadriveFileContract = getMetadriveFileContract();
  const publicKey = await metadriveFileContract.publicKeys(address);
  if (publicKey === ethers.constants.HashZero) {
    return null;
  } else {
    return hexStringToBuffer(publicKey);
  }
};

export interface CommonProps {
  connectedWallet: string | null;
  setConnectedWallet: Dispatch<string | null>;
  connectedPublicKey: Buffer;
  setConnectedPublicKey: Dispatch<Buffer | null>;
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

export const getApolloClient = () => {
  return new ApolloClient({
    uri: config.metadriveFileSubgraphAddress,
    cache: new InMemoryCache(),
  });
};

export const trimAddress = (address: string, chars: number) => {
  return address.slice(0, chars + 2) + "..." + address.slice(-chars);
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

interface GetFilesData {
  files: {
    id: number;
    tokenId: number;
    uri: string;
    fileShares: {
      user: {
        address: string;
      };
    }[];
  }[];
}

interface GetFilesVars {
  owner: string;
}

export interface FileInfo {
  tokenId: number;
  filename: string;
  url: string;
  sharedWith: string[];
}

export const getFiles = async (owner: string) => {
  const getFilesQuery = gql`
    query GetFiles($owner: String!) {
      files(where: { owner: $owner }) {
        id
        tokenId
        uri
        fileShares {
          user {
            address
          }
        }
      }
    }
  `;
  const apolloClient = getApolloClient();
  const result = await apolloClient.query<GetFilesData, GetFilesVars>({
    query: getFilesQuery,
    variables: {
      owner: owner.toLowerCase(),
    },
  });
  const fileInfos: FileInfo[] = await Promise.all(
    result.data.files.map(async (file) => {
      const metadata = await fetch(file.uri);
      const metadataJson = await metadata.json();
      const fileInfo: FileInfo = {
        tokenId: file.tokenId,
        filename: metadataJson.filename,
        url: metadataJson.external_url,
        sharedWith: file.fileShares
          .map((fileShare) => ethers.utils.getAddress(fileShare.user.address))
          .filter((address) => address != owner),
      };
      return fileInfo;
    })
  );
  return fileInfos;
};
