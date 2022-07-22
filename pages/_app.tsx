import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { useEffect, useState, Dispatch } from "react";
import { ethers } from "ethers";
import { config } from "../config";
import { MetaMaskInpageProvider } from "@metamask/providers";

export interface CommonProps {
  connectedUser: string | null;
  setConnectedUser: Dispatch<string | null>;
  isNetworkValid: boolean;
  setIsNetworkValid: Dispatch<boolean>;
}

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const [connectedUser, setConnectedUser] = useState<string | null>(null);
  const [isNetworkValid, setIsNetworkValid] = useState(false);

  useEffect(() => {
    // On every page load, check if wallet is connected or not
    const verifyConnection = async () => {
      if (!window.ethereum) {
        console.log("Metamask is not installed.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(
        window.ethereum as ethers.providers.ExternalProvider,
        "any"
      );
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

    verifyConnection();
  }, []);

  // Event listener for account and chain change on Metamask
  useEffect(() => {
    if (!window.ethereum) {
      console.log("Metamask is not installed.");
      return;
    }
    const ethereum = window.ethereum as MetaMaskInpageProvider;

    const handleAccountsChanged = (accounts: string[]) => {
      setConnectedUser(accounts.length ? accounts[0] : null);
    };
    const handleChainChanged = () => {
      window.location.reload();
    };
    ethereum.on("accountsChanged", handleAccountsChanged as any);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      // Clean up and remove event listeners
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  });

  return (
    <>
      <Head>
        <title>Metadrive</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
        }}
      >
        <Component
          {...pageProps}
          connectedUser={connectedUser}
          setConnectedUser={setConnectedUser}
          isNetworkValid={isNetworkValid}
          setIsNetworkValid={setIsNetworkValid}
        />
      </MantineProvider>
    </>
  );
}
