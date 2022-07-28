import { AppShell, Group, Header, Stack, Text } from "@mantine/core";
import type { NextPage } from "next";
import ConnectWallet from "../components/ConnectWallet";
import { CreateUser } from "../components/CreateUser";
import { ListFiles } from "../components/ListFiles";
import { UploadFile } from "../components/UploadFile";
import { CommonProps } from "../utils";

const Home: NextPage<CommonProps> = ({
  connectedWallet,
  setConnectedWallet,
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
            <Group>
              <Text>{connectedUser ? "Logged in" : ""}</Text>
              <ConnectWallet
                connectedWallet={connectedWallet}
                setConnectedWallet={setConnectedWallet}
                isNetworkValid={isNetworkValid}
                setIsNetworkValid={setIsNetworkValid}
              />
            </Group>
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
      {connectedUser ? (
        <>
          <Group>
            <UploadFile connectedUser={connectedUser} />
          </Group>
          <ListFiles connectedWallet={connectedWallet} />
        </>
      ) : (
        <CreateUser
          connectedWallet={connectedWallet}
          setConnectedUser={setConnectedUser}
        />
      )}
    </AppShell>
  );
};

export default Home;
