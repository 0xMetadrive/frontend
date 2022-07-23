import { MetadriveFile__factory } from "@metadrive/typechain-types";
import { ethers } from "ethers";
import { config } from "./config";

export interface CommonProps {
  connectedUser: string | null;
  isNetworkValid: boolean;
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
