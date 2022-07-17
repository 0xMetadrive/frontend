import { Button, Group, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { encrypt } from "@metadrive/lib";
import { useState } from "react";
import { Web3Storage } from "web3.storage";

export const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleDropzoneDrop = (files: File[]) => {
    setFile(files[0]);
  };

  const handleFileUpload = async () => {
    if (file && process.env.WEB3_STORAGE_KEY) {
      // Encrypt file
      const fileBuffer = await file.arrayBuffer();
      const { buffer: encryptedFileBuffer, mnemonic } = await encrypt(
        new Uint8Array(fileBuffer)
      );
      console.log(mnemonic);

      // Upload encrypted file to IPFS
      const web3StorageClient = new Web3Storage({
        token: process.env.WEB3_STORAGE_KEY,
        endpoint: new URL("https://api.web3.storage"),
      });
      const cid = await web3StorageClient.put(
        [new File([encryptedFileBuffer], file.name)],
        {
          wrapWithDirectory: false,
        }
      );

      console.log("Your file is uploaded at: ", cid, ".dweb.link");
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
