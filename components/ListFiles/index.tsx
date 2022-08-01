import { SimpleGrid } from "@mantine/core";
import { CommonProps, FileInfo } from "../../utils";
import { FileCard } from "./FileCard";

interface ListFilesProps extends Pick<CommonProps, "connectedWallet"> {
  fileInfos: FileInfo[];
}

export const ListFiles = ({ connectedWallet, fileInfos }: ListFilesProps) => {
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
