import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Modal,
  Space,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { BigNumberish, ethers } from "ethers";
import { Dispatch, useEffect, useState } from "react";
import {
  CommonProps,
  getMetadriveFileContract,
  getPublicKey,
  trimAddress,
} from "../utils";
import * as sigUtil from "@metamask/eth-sig-util";
import { useDebouncedValue } from "@mantine/hooks";
import { CheckCircle, Share, XCircle } from "phosphor-react";

interface SharedWithProps extends Pick<CommonProps, "connectedWallet"> {
  tokenId: BigNumberish;
  address: string;
}

const SharedWith = ({ connectedWallet, tokenId, address }: SharedWithProps) => {
  const [loading, setLoading] = useState(false);

  const handleUnshare = async (address: string) => {
    if (!connectedWallet) {
      return;
    }
    setLoading(true);

    try {
      const metadriveFileContract = getMetadriveFileContract();
      const tx = await metadriveFileContract.unshare(tokenId, address);
      await tx.wait();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <Group key={address} position="apart">
      <Text>{trimAddress(address, 10)}</Text>
      {loading ? (
        <Loader size={20} />
      ) : (
        <Tooltip label="Stop sharing">
          <ActionIcon
            variant="transparent"
            onClick={() => handleUnshare(address)}
          >
            <XCircle size={20} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
};

interface SharingModalProps extends Pick<CommonProps, "connectedWallet"> {
  opened: boolean;
  setOpened: Dispatch<boolean>;
  tokenId: BigNumberish;
  sharedWith: string[];
}

export const SharingModal = ({
  connectedWallet,
  opened,
  setOpened,
  tokenId,
  sharedWith,
}: SharingModalProps) => {
  const [address, setAddress] = useState<string>("");
  const [debouncedAddress] = useDebouncedValue(address, 200);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [publicKey, setPublicKey] = useState<Buffer | null>(null);
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!(connectedWallet && isAddressValid && publicKey)) {
      return;
    }

    setLoading(true);
    try {
      const metadriveFileContract = getMetadriveFileContract();
      const ownerFileKey = await metadriveFileContract.fileKeys(
        tokenId,
        connectedWallet
      );

      const ethereum = window.ethereum as MetaMaskInpageProvider;
      const mnemonic = await ethereum.request({
        method: "eth_decrypt",
        params: [ownerFileKey, connectedWallet],
      });

      // Encrypt symmetric key with user's public key
      const userFileKey = Buffer.from(
        JSON.stringify(
          sigUtil.encrypt({
            publicKey: publicKey.toString("base64"),
            data: mnemonic,
            version: "x25519-xsalsa20-poly1305",
          })
        )
      ).toString("hex");

      const tx = await metadriveFileContract.share(
        tokenId,
        address,
        userFileKey
      );
      await tx.wait();

      setAddress("");
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

  // Fetch public key of the entered address
  useEffect(() => {
    const fetchPublicKey = async () => {
      setPublicKey(null);
      if (!(isAddressValid && connectedWallet && debouncedAddress)) {
        return;
      }
      try {
        const publicKey = await getPublicKey(debouncedAddress);
        setPublicKey(publicKey);
      } catch (error) {
        console.log(error);
        setPublicKey(null);
      }
    };

    fetchPublicKey();
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
          <TextInput
            value={address}
            onChange={(event) => setAddress(event.currentTarget.value)}
            label="Address"
            description="Of the user you want to share the file with"
            error={
              isAddressValid
                ? publicKey
                  ? false
                  : "Address is not registered with Metadrive"
                : "Invalid address"
            }
            rightSection={publicKey ? <CheckCircle color="green" /> : null}
          />
          <Button
            leftIcon={<Share />}
            onClick={handleShare}
            loading={loading}
            disabled={!publicKey}
          >
            Share
          </Button>
          {sharedWith.length ? (
            <>
              <Space />
              <Text>Shared with</Text>
              <Stack>
                {sharedWith.map((address) => (
                  <SharedWith
                    key={address}
                    tokenId={tokenId}
                    connectedWallet={connectedWallet}
                    address={address}
                  />
                ))}
              </Stack>
            </>
          ) : null}
        </Stack>
      </Modal>
    </>
  );
};
