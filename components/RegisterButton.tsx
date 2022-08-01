import { Button, Stack, Text } from "@mantine/core";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { SignIn } from "phosphor-react";
import { useState } from "react";
import { CommonProps, getMetadriveFileContract } from "../utils";

type RegisterButtonProps = Pick<
  CommonProps,
  "connectedWallet" | "setConnectedPublicKey"
>;

export const RegisterButton = ({
  connectedWallet,
  setConnectedPublicKey,
}: RegisterButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
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
      const tx = await metadriveFileContract.register(pkBuffer);
      await tx.wait();

      setConnectedPublicKey(pkBuffer);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <Stack>
      <Text>You are required to register before you can use Metadrive</Text>
      <Button leftIcon={<SignIn />} onClick={handleRegister} loading={loading}>
        Register
      </Button>
    </Stack>
  );
};
