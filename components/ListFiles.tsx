import { SimpleGrid } from "@mantine/core";
import { useEffect, useState } from "react";
import { CommonProps, getMetadriveFileContract, NftInfo } from "../utils";
import { FileCard } from "./FileCard";

type ListFilesProps = Pick<CommonProps, "connectedWallet">;

export const ListFiles = ({ connectedWallet }: ListFilesProps) => {
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState<NftInfo[]>([]);

  // Fetch file NFTs and store them in state
  useEffect(() => {
    const fetchFiles = async () => {
      if (!connectedWallet) {
        setNfts([]);
        return;
      }
      setLoading(true);

      try {
        const metadriveFileContract = getMetadriveFileContract();
        const balance = await metadriveFileContract.balanceOf(connectedWallet);
        const nftInfos = await Promise.all(
          Array(balance.toNumber())
            .fill(null)
            .map(async (value, index) => {
              const tokenId = await metadriveFileContract.tokenOfOwnerByIndex(
                connectedWallet,
                index
              );
              const metadataUrl = await metadriveFileContract.tokenURI(tokenId);
              const metadata = await fetch(metadataUrl);
              const nftInfo: NftInfo = {
                tokenId: tokenId.toNumber(),
                metadata: await metadata.json(),
              };
              return nftInfo;
            })
        );
        setNfts(nftInfos);
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
    };

    fetchFiles();
  }, [connectedWallet]);

  return (
    <SimpleGrid cols={4}>
      {nfts.map((nftInfo: NftInfo) => (
        <FileCard
          key={nftInfo.tokenId}
          nftInfo={nftInfo}
          connectedWallet={connectedWallet}
        />
      ))}
    </SimpleGrid>
  );
};
