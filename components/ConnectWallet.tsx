import { Button } from "@mantine/core";
import { ethers } from "ethers";
import { config } from "../config";
import { CommonProps, trimAddress } from "../utils";
import { Dispatch } from "react";

interface ConnectWalletProps extends CommonProps {
  setConnectedUser: Dispatch<string | null>;
  setIsNetworkValid: Dispatch<boolean>;
}

const ConnectWallet = ({
  connectedUser,
  setConnectedUser,
  isNetworkValid,
  setIsNetworkValid,
}: ConnectWalletProps) => {
  // Connect Metamask wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      return;
    }
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as ethers.providers.ExternalProvider,
      "any"
    );
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    // Get user
    try {
      const user = await signer.getAddress();
      setConnectedUser(user);
    } catch (error) {
      setConnectedUser(null);
    }
    // Get chain
    const chainId = await signer.getChainId();
    setIsNetworkValid(chainId === config.chainId);
  };

  // Change chain on Metamask to the one we want
  const changeChain = async () => {
    if (!window.ethereum) {
      console.log("Metamask is not installed.");
      return;
    }
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as ethers.providers.ExternalProvider,
      "any"
    );
    await provider.send("wallet_addEthereumChain", [config.metamaskChainInfo]);
  };

  return connectedUser ? (
    isNetworkValid ? (
      <Button>Connected to {trimAddress(connectedUser)}</Button>
    ) : (
      <Button onClick={changeChain}>Connect to Polygon!</Button>
    )
  ) : (
    <Button
      onClick={async () => {
        await changeChain();
        await connectWallet();
      }}
    >
      Connect Wallet
    </Button>
  );
};

export default ConnectWallet;
