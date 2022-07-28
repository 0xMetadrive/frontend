import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { BigNumberish, ethers } from "ethers";
import { Dispatch, useEffect, useState } from "react";
import { CommonProps, getMetadriveFileContract, getUser } from "../utils";
import * as sigUtil from "@metamask/eth-sig-util";

interface SharingModalProps extends Pick<CommonProps, "connectedWallet"> {
  opened: boolean;
  setOpened: Dispatch<boolean>;
  tokenId: BigNumberish;
}

export const SharingModal = ({
  connectedWallet,
  opened,
  setOpened,
  tokenId,
}: SharingModalProps) => {
  const [address, setAddress] = useState<string>("");
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!(connectedWallet && isAddressValid)) {
      return;
    }

    setLoading(true);
    try {
      const userToShareWith = await getUser(address);
      if (!userToShareWith) {
        console.log("User does not exist");
        return;
      }

      const metadriveFileContract = getMetadriveFileContract();
      const ownerEncryptionKey = await metadriveFileContract.encryptionKeys(
        tokenId,
        connectedWallet
      );

      const ethereum = window.ethereum as MetaMaskInpageProvider;
      const mnemonic = await ethereum.request({
        method: "eth_decrypt",
        params: [ownerEncryptionKey, connectedWallet],
      });

      // Encrypt symmetric key with user's public key
      const userEncryptionKey = Buffer.from(
        JSON.stringify(
          sigUtil.encrypt({
            publicKey: userToShareWith.publicKey.toString("base64"),
            data: mnemonic,
            version: "x25519-xsalsa20-poly1305",
          })
        )
      ).toString("hex");

      const tx = await metadriveFileContract.shareFile(
        tokenId,
        address,
        userEncryptionKey
      );
      await tx.wait();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  // Check if the entered address is valid
  useEffect(() => {
    try {
      setAddress(ethers.utils.getAddress(address));
      setIsAddressValid(true);
    } catch (error) {
      setIsAddressValid(false);
    }
  }, [address]);

  return (
    <Modal
      centered
      opened={opened}
      onClose={() => setOpened(false)}
      overflow="inside"
      title="Share file"
    >
      <Stack>
        <Group>
          <TextInput
            value={address}
            onChange={(event) => setAddress(event.currentTarget.value)}
            placeholder="Address"
            label="Address"
            error={isAddressValid ? false : "Invalid user address"}
          />
          <Button onClick={handleShare} loading={loading}>
            Share
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
