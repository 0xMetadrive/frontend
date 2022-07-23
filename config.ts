interface Config {
  chainId: number;
  web3StorageToken: string;
  metadriveFileContractAddress: string;
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
  development: Config;
  production?: Config;
  test?: Config;
}

const allConfigs: AllConfigs = {
  development: {
    chainId: 80001,
    web3StorageToken: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN,
    metadriveFileContractAddress: "0x8A109Dd6f7CC72A82A591948a0EF8EC42f5c88A8",
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
};

type NodeEnvs = "development";

export const config = allConfigs[process.env.NODE_ENV as NodeEnvs];
