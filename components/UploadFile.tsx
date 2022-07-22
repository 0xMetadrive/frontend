import { Button, Group, Text, LoadingOverlay } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { encrypt } from "@metadrive/lib";
import { useState } from "react";
import { Web3Storage } from "web3.storage";
import { config } from "../config";
import { MetaMaskInpageProvider } from "@metamask/providers";
import * as sigUtil from "@metamask/eth-sig-util";
import { CommonProps, getMetadriveFileContract } from "../utils";

const web3StorageClient = new Web3Storage({
  token: config.web3StorageToken,
  endpoint: new URL("https://api.web3.storage"),
});

export const UploadFile = ({ connectedUser, isNetworkValid }: CommonProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  const handleDropzoneDrop = (files: File[]) => {
    setFile(files[0]);
  };

  const handleFileUpload = async () => {
    // Check if there's a file and valid wallet config
    if (!(window.ethereum && file && connectedUser && isNetworkValid)) {
      return;
    }
    setLoading(true);

    try {
      // Encrypt file
      setLoadingStatus("Encrypting file");
      const fileBuffer = await file.arrayBuffer();
      const { buffer: encryptedFileBuffer, mnemonic } = await encrypt(
        new Uint8Array(fileBuffer)
      );

      // Upload encrypted file to IPFS
      setLoadingStatus("Uploading encrypted file to IPFS");
      const cid = await web3StorageClient.put(
        [new File([encryptedFileBuffer], file.name)],
        {
          wrapWithDirectory: false,
        }
      );

      // Encrypt symmetric key with user's public key
      setLoadingStatus("Encrypting key to store securely on-chain");
      const ethereum = window.ethereum as MetaMaskInpageProvider;
      const encryptionPublicKey = await ethereum.request({
        method: "eth_getEncryptionPublicKey",
        params: [connectedUser],
      });
      const encryptedSymmetricKey = Buffer.from(
        JSON.stringify(
          sigUtil.encrypt({
            publicKey: encryptionPublicKey as string,
            data: mnemonic,
            version: "x25519-xsalsa20-poly1305",
          })
        )
      ).toString("hex");

      // Mint MetadriveFile NFT for the uploaded file
      setLoadingStatus(
        "Minting MetadriveFile NFT and storing file info on-chain"
      );
      const metadriveFileContract = getMetadriveFileContract();
      const tx = await metadriveFileContract.safeMint(
        "ipfs://" + cid,
        encryptedSymmetricKey
      );
      await tx.wait();

      setLoadingStatus(null);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }

    setLoadingStatus(null);
    setLoading(false);
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
      <Button loading={loading} onClick={handleFileUpload}>
        {loading && loadingStatus ? loadingStatus : "Upload"}
      </Button>
    </Group>
  );
};
