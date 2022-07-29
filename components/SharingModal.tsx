import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { BigNumberish, ethers } from "ethers";
import { Dispatch, useEffect, useState } from "react";
import { CommonProps, getMetadriveFileContract, getUser, User } from "../utils";
import * as sigUtil from "@metamask/eth-sig-util";
import { useDebouncedValue } from "@mantine/hooks";
import { CheckCircle } from "phosphor-react";

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
  const [debouncedAddress, cancelDebounce] = useDebouncedValue(address, 200);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!(connectedWallet && isAddressValid && user)) {
      return;
    }

    setLoading(true);
    try {
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
            publicKey: user.publicKey.toString("base64"),
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

  // Fetch user details for the entered address
  useEffect(() => {
    const fetchUser = async () => {
      setUser(null);
      if (!(isAddressValid && connectedWallet)) {
        return;
      }

      try {
        const user = await getUser(debouncedAddress);
        setUser(user);
        return;
      } catch (error) {
        console.log(error);
      }
      setUser(null);
    };

    fetchUser();
  }, [debouncedAddress, connectedWallet, isAddressValid]);

  return (
    <>
      <Modal
        centered
        opened={opened}
        onClose={() => setOpened(false)}
        overflow="inside"
        title="Share file"
      >
        <Stack>
          <Stack>
            <TextInput
              value={address}
              onChange={(event) => setAddress(event.currentTarget.value)}
              label="Address"
              description="Of the user you want to share the file with"
              error={
                isAddressValid
                  ? user
                    ? false
                    : "Address is not a Metadrive user"
                  : "Invalid address"
              }
              rightSection={user ? <CheckCircle color="green" /> : null}
            />
            <Button onClick={handleShare} loading={loading} disabled={!user}>
              {user ? "Share with " + user.username : "Share"}
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};
