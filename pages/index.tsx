import { AppShell, Group, Header, Navbar, Text } from "@mantine/core";
import type { NextPage } from "next";
import { Dispatch } from "react";
import ConnectWallet from "../components/ConnectWallet";
import { UploadFile } from "../components/UploadFile";

interface HomeProps {
  connectedUser: string | null;
  setConnectedUser: Dispatch<string | null>;
  isNetworkValid: boolean;
  setIsNetworkValid: Dispatch<boolean>;
}

const Home: NextPage<HomeProps> = ({
  connectedUser,
  setConnectedUser,
  isNetworkValid,
  setIsNetworkValid,
}) => {
  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar width={{ base: 300 }} height={500} p="xs">
          {/* Navbar content */}
        </Navbar>
      }
      header={
        <Header height={60} p="xs">
          <Group position="apart">
            <Text size="lg" weight="bold">
              Metadrive
            </Text>
            <ConnectWallet
              connectedUser={connectedUser}
              setConnectedUser={setConnectedUser}
              isNetworkValid={isNetworkValid}
              setIsNetworkValid={setIsNetworkValid}
            />
          </Group>
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      <UploadFile
        connectedUser={connectedUser}
        isNetworkValid={isNetworkValid}
      />
    </AppShell>
  );
};

export default Home;
