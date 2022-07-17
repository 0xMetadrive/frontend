import { AppShell, Header, Navbar, Text } from "@mantine/core";
import type { NextPage } from "next";
import { UploadFile } from "../components/UploadFile";

const Home: NextPage = () => {
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
          {/* Header content */}
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
      <UploadFile />
    </AppShell>
  );
};

export default Home;
