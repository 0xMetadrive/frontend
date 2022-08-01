import { SimpleGrid } from "@mantine/core";
import { useEffect, useState } from "react";
import { CommonProps, getFiles, FileInfo } from "../utils";
import { FileCard } from "./FileCard";

type ListFilesProps = Pick<CommonProps, "connectedWallet">;

export const ListFiles = ({ connectedWallet }: ListFilesProps) => {
  const [fileInfos, setFileInfos] = useState<FileInfo[] | null>(null);

  // Fetch file NFTs and store them in state
  useEffect(() => {
    const fetchFiles = async () => {
      if (!connectedWallet) {
        setFileInfos(null);
        return;
      }
      setFileInfos(null);

      try {
        const fileInfos = await getFiles(connectedWallet);
        setFileInfos(fileInfos);
      } catch (error) {
        console.log(error);
      }
    };

    fetchFiles();
  }, [connectedWallet]);

  return (
    <SimpleGrid cols={6}>
      {fileInfos?.map((fileInfo: FileInfo) => (
        <FileCard
          key={fileInfo.tokenId}
          fileInfo={fileInfo}
          connectedWallet={connectedWallet}
        />
      ))}
    </SimpleGrid>
  );
};
