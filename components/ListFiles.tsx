import { SimpleGrid } from "@mantine/core";
import { useEffect, useState } from "react";
import { CommonProps, getMetadriveFileContract, NftInfo } from "../utils";
import { FileCard } from "./FileCard";

export const ListFiles = ({ connectedUser, isNetworkValid }: CommonProps) => {
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState<NftInfo[]>([]);

  // Fetch file NFTs and store them in state
  useEffect(() => {
    const fetchFiles = async () => {
      if (!window.ethereum || !connectedUser || !isNetworkValid) {
        setNfts([]);
        return;
      }
      setLoading(true);

      try {
        const metadriveFileContract = getMetadriveFileContract();
        const balance = await metadriveFileContract.balanceOf(connectedUser);
        const nftInfos = await Promise.all(
          Array(balance.toNumber())
            .fill(null)
            .map(async (value, index) => {
              const tokenId = await metadriveFileContract.tokenOfOwnerByIndex(
                connectedUser,
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
  }, [connectedUser, isNetworkValid]);

  return (
    <SimpleGrid cols={4}>
      {nfts.map((nftInfo: NftInfo) => (
        <FileCard
          key={nftInfo.tokenId}
          nftInfo={nftInfo}
          connectedUser={connectedUser}
          isNetworkValid={isNetworkValid}
        />
      ))}
    </SimpleGrid>
  );
};
