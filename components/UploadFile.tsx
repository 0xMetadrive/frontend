import { Button, Group, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { encrypt } from "@metadrive/lib";
import { useState } from "react";
import { Web3Storage } from "web3.storage";
import { config } from "../config";

const web3StorageClient = new Web3Storage({
  token: config.web3StorageToken,
  endpoint: new URL("https://api.web3.storage"),
});

export const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleDropzoneDrop = (files: File[]) => {
    setFile(files[0]);
  };

  const handleFileUpload = async () => {
    if (file) {
      // Encrypt file
      const fileBuffer = await file.arrayBuffer();
      const { buffer: encryptedFileBuffer, mnemonic } = await encrypt(
        new Uint8Array(fileBuffer)
      );
      console.log(mnemonic);

      // Upload encrypted file to IPFS
      const ipfsHash = await web3StorageClient.put(
        [new File([encryptedFileBuffer], file.name)],
        {
          wrapWithDirectory: false,
        }
      );
      console.log(ipfsHash);
    }
  };

  return (
    <Group direction="column" grow={true}>
      <Dropzone onDrop={handleDropzoneDrop} multiple={false}>
        {() => (
          <Group position="center" direction="column">
            {file ? <Text weight="semibold">Selected: {file.name}</Text> : null}
            <Text weight="semibold">
              Drag image here or click to select file
            </Text>
          </Group>
        )}
      </Dropzone>
      <Button onClick={handleFileUpload}>Submit</Button>
    </Group>
  );
};
