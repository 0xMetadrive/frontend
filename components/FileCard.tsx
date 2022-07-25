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

interface FileCardProps extends CommonProps {
  nftInfo: NftInfo;
}

export const FileCard = ({
  connectedUser,
  isNetworkValid,
  nftInfo: { tokenId, metadata },
}: FileCardProps) => {
  const handleFileDownload = async () => {
    if (!(window.ethereum && connectedUser && isNetworkValid && metadata)) {
      return;
    }

    const parsedFileUrl = parseFileUrl(metadata.external_url);
    const ipfsCid = parsedFileUrl?.ipfsCid;
    if (!ipfsCid) {
      return;
    }

    const metadriveFileContract = getMetadriveFileContract();
    const encryptedSymmetricKey = await metadriveFileContract.keys(
      tokenId,
      connectedUser
    );

    const ethereum = window.ethereum as MetaMaskInpageProvider;
    const mnemonic = await ethereum.request({
      method: "eth_decrypt",
      params: [encryptedSymmetricKey, connectedUser],
    });

    const symmetricKey: Buffer = await bip39.mnemonicToSeed(mnemonic as string);

    const fetchResponse = await fetch("https://ipfs.io/ipfs/" + ipfsCid);
    const buffer = new Uint8Array(await fetchResponse.arrayBuffer());
    const fileBuffer = await decrypt(buffer, symmetricKey);
    saveAs(new Blob([fileBuffer]), metadata.filename);
  };

  return (
    <Card>
      <Stack>
        <Text>{metadata.filename}</Text>
        <Button onClick={handleFileDownload}>Download file</Button>
      </Stack>
    </Card>
  );
};
