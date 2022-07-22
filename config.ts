interface Config {
  chainId: number;
  web3StorageToken: string;
  metamaskChainInfo: {
    chainId: string;
    rpcUrls: string[];
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    blockExplorerUrls: string[];
  };
}

interface AllConfigs {
  dev: Config;
  prod?: Config;
  test?: Config;
}

const allConfigs: AllConfigs = {
  dev: {
    chainId: 80001,
    web3StorageToken: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN_DEV,
    metamaskChainInfo: {
      chainId: "0x13881",
      rpcUrls: ["https://rpc-mumbai.matic.today"],
      chainName: "Polygon Mumbai",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      blockExplorerUrls: ["https://mumbai.polygonscan.com"],
    },
  },
  prod: {
    chainId: 137,
    web3StorageToken: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN_PROD,
    metamaskChainInfo: {
      chainId: "0x89",
      rpcUrls: ["https://polygon-rpc.com"],
      chainName: "Polygon",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      blockExplorerUrls: ["https://polygonscan.com/"],
    },
  },
};

type NodeEnvs = "development";

export const config = allConfigs[process.env.NODE_ENV as NodeEnvs];
