import { Box, Container, Tabs, Heading } from '@chakra-ui/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import NewInvoice from './components/NewInvoice';
import InvoiceHistory from './components/InvoiceHistory';
import { useInvoiceStorage } from './hooks/useInvoiceStorage';
import './theme-tokens.css';

const AppInner = () => {
  const { invoices, loading, saveInvoice, deleteInvoice, getNextInvoiceNumber } = useInvoiceStorage();

  return (
    <Box minH="100vh" bg="var(--color-bg)" py={8}>
      <Container maxW="1400px">
        <Box mb={8}>
          <Heading textStyle="3xl" fontWeight="700" color="var(--color-text)">
            Fruition Invoice Generator
          </Heading>
        </Box>

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
              px={6}
              py={3}
              fontWeight="500"
              _selected={{ bg: 'var(--color-primary)', color: 'white' }}
              transition="all 0.2s ease"
              borderRadius="md"
            >
              New Invoice
            </Tabs.Trigger>
            <Tabs.Trigger
              value="history"
              px={6}
              py={3}
              fontWeight="500"
              _selected={{ bg: 'var(--color-primary)', color: 'white' }}
              transition="all 0.2s ease"
              borderRadius="md"
            >
              Invoice History
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="new">
            <Box
              bg="var(--color-surface)"
              border="1px solid"
              borderColor="var(--color-border)"
              borderRadius="xl"
              p={{ base: 6, md: 8 }}
              shadow="sm"
            >
              <NewInvoice
                getNextInvoiceNumber={getNextInvoiceNumber}
                onSave={saveInvoice}
              />
            </Box>
          </Tabs.Content>

          <Tabs.Content value="history">
            <Box
              bg="var(--color-surface)"
              border="1px solid"
              borderColor="var(--color-border)"
              borderRadius="xl"
              p={{ base: 6, md: 8 }}
              shadow="sm"
            >
              <InvoiceHistory
                invoices={invoices}
                loading={loading}
                onDelete={deleteInvoice}
              />
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
