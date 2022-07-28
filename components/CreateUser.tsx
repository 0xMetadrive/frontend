import { Button, Group, TextInput } from "@mantine/core";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { useState } from "react";
import { CommonProps, getMetadriveFileContract } from "../utils";

type CreateUserProps = Pick<
  CommonProps,
  "connectedWallet" | "setConnectedUser"
>;

export const CreateUser = ({
  connectedWallet,
  setConnectedUser,
}: CreateUserProps) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async () => {
    if (!(window.ethereum && connectedWallet)) {
      return;
    }

    try {
      setLoading(true);

      const ethereum = window.ethereum as MetaMaskInpageProvider;
      const pkBase64 = await ethereum.request({
        method: "eth_getEncryptionPublicKey",
        params: [connectedWallet],
      });
      const pkBuffer = Buffer.from(pkBase64 as string, "base64");

      const metadriveFileContract = getMetadriveFileContract();
      const tx = await metadriveFileContract.createUser(username, pkBuffer);
      await tx.wait();

      setConnectedUser({ username, publicKey: pkBuffer });
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <Group>
      <TextInput
        value={username}
        onChange={(event) => setUsername(event.currentTarget.value)}
        placeholder="Username"
        label="Username"
      />
      <Button onClick={handleCreateUser} loading={loading}>
        Create account
      </Button>
    </Group>
  );
};
