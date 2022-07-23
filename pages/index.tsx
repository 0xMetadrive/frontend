import { AppShell, Group, Header, Text } from "@mantine/core";
import type { NextPage } from "next";
import { Dispatch } from "react";
import ConnectWallet from "../components/ConnectWallet";
import { ListFiles } from "../components/ListFiles";
import { UploadFile } from "../components/UploadFile";
import { CommonProps } from "../utils";

interface HomeProps extends CommonProps {
  setConnectedUser: Dispatch<string | null>;
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
      <Group>
        <UploadFile
          connectedUser={connectedUser}
          isNetworkValid={isNetworkValid}
        />
      </Group>
      <ListFiles
        connectedUser={connectedUser}
        isNetworkValid={isNetworkValid}
      />
    </AppShell>
  );
};

export default Home;
