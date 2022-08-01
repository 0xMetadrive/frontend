import { Button, Card, Stack, Text } from "@mantine/core";
import { MetaMaskInpageProvider } from "@metamask/providers";
import {
  CommonProps,
  getMetadriveFileContract,
  parseFileUrl,
  FileInfo,
} from "../../../utils";
import * as bip39 from "bip39";
import { decrypt } from "@metadrive/lib";
import { saveAs } from "file-saver";
import { SharingModal } from "./SharingModal";
import { useState } from "react";
import { Download, Share } from "phosphor-react";

interface FileCardProps extends Pick<CommonProps, "connectedWallet"> {
  fileInfo: FileInfo;
}

export const FileCard = ({
  connectedWallet,
  fileInfo: { tokenId, url, filename, sharedWith },
}: FileCardProps) => {
  const [isSharingModalOpened, setIsSharingModalOpened] = useState(false);

  const handleFileDownload = async () => {
    if (!(window.ethereum && url && connectedWallet)) {
      return;
    }

    const parsedFileUrl = parseFileUrl(url);
    const ipfsCid = parsedFileUrl?.ipfsCid;
    if (!ipfsCid) {
      return;
    }

    const metadriveFileContract = getMetadriveFileContract();
    const fileKey = await metadriveFileContract.fileKeys(
      tokenId,
      connectedWallet
    );

    const ethereum = window.ethereum as MetaMaskInpageProvider;
    const mnemonic = await ethereum.request({
      method: "eth_decrypt",
      params: [fileKey, connectedWallet],
    });

    const symmetricKey: Buffer = await bip39.mnemonicToSeed(mnemonic as string);

    const fetchResponse = await fetch("https://ipfs.io/ipfs/" + ipfsCid);
    const buffer = new Uint8Array(await fetchResponse.arrayBuffer());
    const fileBuffer = await decrypt(buffer, symmetricKey);
    saveAs(new Blob([fileBuffer]), filename);
  };

  return (
    <>
      <SharingModal
        opened={isSharingModalOpened}
        setOpened={setIsSharingModalOpened}
        connectedWallet={connectedWallet}
        tokenId={tokenId}
        sharedWith={sharedWith}
      />
      <Card>
        <Stack>
          <Text align="center">{filename}</Text>
          <Button leftIcon={<Download />} onClick={handleFileDownload}>
            Download
          </Button>
          <Button
            leftIcon={<Share />}
            onClick={() => setIsSharingModalOpened(true)}
          >
            Share
          </Button>
        </Stack>
      </Card>
    </>
  );
};
