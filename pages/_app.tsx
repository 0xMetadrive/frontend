import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { useEffect, useState, Dispatch } from "react";
import { ethers } from "ethers";
import { config } from "../config";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { getUser, User } from "../utils";

const App = (props: AppProps) => {
  const { Component, pageProps } = props;
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [connectedUser, setConnectedUser] = useState<User | null>(null);
  const [isNetworkValid, setIsNetworkValid] = useState(false);

  // On every page load, check if wallet is connected or not
  useEffect(() => {
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
      // Get wallet
      try {
        const user = await signer.getAddress();
        setConnectedWallet(user);
      } catch (error) {
        setConnectedWallet(null);
      }
      // Get chain
      const chainId = await signer.getChainId();
      setIsNetworkValid(chainId === config.chainId);
    };

    verifyConnection();
  }, []);

  // Get user details on wallet and network change
  useEffect(() => {
    const fetchUser = async () => {
      if (!window.ethereum || !connectedWallet || !isNetworkValid) {
        setConnectedUser(null);
        return;
      }
      const user = await getUser(connectedWallet);
      setConnectedUser(user);
    };

    fetchUser();
  }, [connectedWallet, isNetworkValid]);

  // Event listener for account and chain change on Metamask
  useEffect(() => {
    if (!window.ethereum) {
      return;
    }
    const ethereum = window.ethereum as MetaMaskInpageProvider;

    const handleAccountsChanged = (accounts: string[]) => {
      setConnectedWallet(accounts.length ? accounts[0] : null);
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
          colorScheme: "light",
        }}
      >
        <ModalsProvider>
          <Component
            {...pageProps}
            connectedWallet={connectedWallet}
            setConnectedWallet={setConnectedWallet}
            connectedUser={connectedUser}
            setConnectedUser={setConnectedUser}
            isNetworkValid={isNetworkValid}
            setIsNetworkValid={setIsNetworkValid}
          />
        </ModalsProvider>
      </MantineProvider>
    </>
  );
};

export default App;
