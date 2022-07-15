import { AppShell, Header, Navbar } from "@mantine/core";
import { UploadFile } from "./components/UploadFile";

function App() {
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
    >
      <UploadFile />
    </AppShell>
  );
}

export default App;
