import { Button } from "@mantine/core";
import { ethers } from "ethers";
import { config } from "../config";
import { CommonProps, trimAddress } from "../utils";

type ConnectWalletProps = Omit<
  CommonProps,
  "connectedUser" | "setConnectedUser"
>;

const ConnectWallet = ({
  connectedWallet,
  setConnectedWallet,
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
    // Get wallet
    try {
      const wallet = await signer.getAddress();
      setConnectedWallet(wallet);
    } catch (error) {
      setConnectedWallet(null);
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

  return connectedWallet ? (
    isNetworkValid ? (
      <Button>Connected to {trimAddress(connectedWallet)}</Button>
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
