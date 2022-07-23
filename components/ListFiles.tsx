import { useEffect, useState } from "react";
import { CommonProps, getMetadriveFileContract } from "../utils";

export const ListFiles = ({ connectedUser, isNetworkValid }: CommonProps) => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  // Fetch file NFTs and store them in state
  useEffect(() => {
    const fetchFiles = async () => {
      if (!window.ethereum || !connectedUser || !isNetworkValid) {
        setFiles([]);
        return;
      }
      setLoading(true);

      try {
        const metadriveFileContract = getMetadriveFileContract();
        const balance = await metadriveFileContract.balanceOf(connectedUser);
        const tokenIds = await Promise.all(
          Array(balance.toNumber())
            .fill(null)
            .map(
              async (value, index) =>
                await metadriveFileContract.tokenOfOwnerByIndex(
                  connectedUser,
                  index
                )
            )
        );
        const metadataUrls = await Promise.all(
          tokenIds.map(
            async (value) => await metadriveFileContract.tokenURI(value)
          )
        );
        console.log(metadataUrls);
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
    };

    fetchFiles();
  }, [connectedUser, isNetworkValid]);

  return <div>hello {connectedUser}</div>;
};
