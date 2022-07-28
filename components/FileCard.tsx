import { Button, Card, Stack, Text } from "@mantine/core";
import { MetaMaskInpageProvider } from "@metamask/providers";
import {
  CommonProps,
  getMetadriveFileContract,
  NftInfo,
  parseFileUrl,
} from "../utils";
import * as bip39 from "bip39";
import { decrypt } from "@metadrive/lib";
import { saveAs } from "file-saver";
import { SharingModal } from "./SharingModal";
import { useState } from "react";

interface FileCardProps extends Pick<CommonProps, "connectedWallet"> {
  nftInfo: NftInfo;
}

export const FileCard = ({
  connectedWallet,
  nftInfo: { tokenId, metadata },
}: FileCardProps) => {
  const [isSharingModalOpened, setIsSharingModalOpened] = useState(false);

  const handleFileDownload = async () => {
    if (!(window.ethereum && metadata && connectedWallet)) {
      return;
    }

    const parsedFileUrl = parseFileUrl(metadata.external_url);
    const ipfsCid = parsedFileUrl?.ipfsCid;
    if (!ipfsCid) {
      return;
    }

    const metadriveFileContract = getMetadriveFileContract();
    const encryptedSymmetricKey = await metadriveFileContract.encryptionKeys(
      tokenId,
      connectedWallet
    );

    const ethereum = window.ethereum as MetaMaskInpageProvider;
    const mnemonic = await ethereum.request({
      method: "eth_decrypt",
      params: [encryptedSymmetricKey, connectedWallet],
    });

    const symmetricKey: Buffer = await bip39.mnemonicToSeed(mnemonic as string);

    const fetchResponse = await fetch("https://ipfs.io/ipfs/" + ipfsCid);
    const buffer = new Uint8Array(await fetchResponse.arrayBuffer());
    const fileBuffer = await decrypt(buffer, symmetricKey);
    saveAs(new Blob([fileBuffer]), metadata.filename);
  };

  return (
    <>
      <SharingModal
        opened={isSharingModalOpened}
        setOpened={setIsSharingModalOpened}
        connectedWallet={connectedWallet}
        tokenId={tokenId}
      />
      <Card>
        <Stack>
          <Text>{metadata.filename}</Text>
          <Button onClick={handleFileDownload}>Download</Button>
          <Button onClick={() => setIsSharingModalOpened(true)}>Share</Button>
        </Stack>
      </Card>
    </>
  );
};
