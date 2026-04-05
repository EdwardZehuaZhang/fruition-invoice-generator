import { Box, Container, Tabs, Heading, HStack, Button, Text, Spinner } from '@chakra-ui/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import NewInvoice from './components/NewInvoice';
import InvoiceHistory from './components/InvoiceHistory';
import ClockifyImport from './components/ClockifyImport';
import LoginPage from './components/LoginPage';
import { useInvoiceStorage } from './hooks/useInvoiceStorage';
import { useAuth } from './hooks/useAuth';
import './theme-tokens.css';

const AppInner = () => {
  const { authState, login, logout } = useAuth();
  const { invoices, loading, saveInvoice, deleteInvoice, getNextInvoiceNumber } = useInvoiceStorage();

  if (authState === null) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="var(--color-bg)">
        <Spinner size="lg" color="var(--color-primary)" />
      </Box>
    );
  }

  if (!authState.authenticated) {
    return <LoginPage onLogin={login} error={authState.error} />;
  }

  return (
    <Box minH="100vh" bg="var(--color-bg)" py={8}>
      <Container maxW="1400px">
        <HStack justify="space-between" mb={8}>
          <Heading textStyle="3xl" fontWeight="700" color="var(--color-text)">
            Fruition Invoice Generator
          </Heading>
          <HStack gap={3}>
            <Text fontSize="sm" color="var(--color-text-muted)">{authState.email}</Text>
            <Button
              size="sm"
              variant="outline"
              onClick={logout}
              borderColor="var(--color-border)"
              color="var(--color-text-muted)"
              _hover={{ bg: 'bg.subtle' }}
            >
              Sign out
            </Button>
          </HStack>
        </HStack>

        <Tabs.Root defaultValue="new" variant="enclosed">
          <Tabs.List
            bg="var(--color-surface)"
            borderRadius="lg"
            p={1}
            border="1px solid"
            borderColor="var(--color-border)"
            mb={6}
          >
            <Tabs.Trigger
              value="new"
              px={6} py={3}
              fontWeight="500"
              _selected={{ bg: 'var(--color-primary)', color: 'white' }}
              transition="all 0.2s ease"
              borderRadius="md"
            >
              New Invoice
            </Tabs.Trigger>
            <Tabs.Trigger
              value="clockify"
              px={6} py={3}
              fontWeight="500"
              _selected={{ bg: 'var(--color-primary)', color: 'white' }}
              transition="all 0.2s ease"
              borderRadius="md"
            >
              From Clockify Report
            </Tabs.Trigger>
            <Tabs.Trigger
              value="history"
              px={6} py={3}
              fontWeight="500"
              _selected={{ bg: 'var(--color-primary)', color: 'white' }}
              transition="all 0.2s ease"
              borderRadius="md"
            >
              Invoice History
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="new">
            <Box bg="var(--color-surface)" border="1px solid" borderColor="var(--color-border)" borderRadius="xl" p={{ base: 6, md: 8 }} shadow="sm">
              <NewInvoice getNextInvoiceNumber={getNextInvoiceNumber} onSave={saveInvoice} />
            </Box>
          </Tabs.Content>

          <Tabs.Content value="clockify">
            <Box bg="var(--color-surface)" border="1px solid" borderColor="var(--color-border)" borderRadius="xl" p={{ base: 6, md: 8 }} shadow="sm">
              <ClockifyImport getNextInvoiceNumber={getNextInvoiceNumber} onSave={saveInvoice} />
            </Box>
          </Tabs.Content>

          <Tabs.Content value="history">
            <Box bg="var(--color-surface)" border="1px solid" borderColor="var(--color-border)" borderRadius="xl" p={{ base: 6, md: 8 }} shadow="sm">
              <InvoiceHistory invoices={invoices} loading={loading} onDelete={deleteInvoice} />
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Container>
    </Box>
  );
};

const App = () => (
  <ChakraProvider value={defaultSystem}>
    <AppInner />
  </ChakraProvider>
);

export default App;
