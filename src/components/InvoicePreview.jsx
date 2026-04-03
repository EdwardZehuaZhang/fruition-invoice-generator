import { Box, VStack, HStack, Text, Separator, Grid } from '@chakra-ui/react';

const InvoicePreview = ({ invoice }) => {
  const totalAmount = invoice.lineItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <Box
      id="invoice-preview"
      bg="var(--color-surface)"
      border="1px solid"
      borderColor="var(--color-border)"
      borderRadius="xl"
      p={{ base: 6, md: 8 }}
      shadow="md"
      fontFamily="var(--font-family)"
    >
      <VStack align="stretch" gap={6}>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6} alignItems="start">
          <VStack align="start" gap={1}>
            <Text fontSize="lg" fontWeight="600" color="var(--color-text)">{invoice.consultantName}</Text>
            <Text fontSize="sm" color="var(--color-text-muted)" whiteSpace="pre-line">{invoice.consultantAddress}</Text>
            <Text fontSize="sm" color="var(--color-text-muted)">{invoice.consultantPhone}</Text>
            <Text fontSize="sm" color="var(--color-text-muted)">{invoice.consultantEmail}</Text>
            <Box mt={4} pt={3} borderTop="1px solid" borderColor="var(--color-border)" w="full">
              <Text fontSize="xs" fontWeight="600" color="var(--color-text)" mb={2}>Kindly make payment to:</Text>
              <VStack align="start" gap={0.5}>
                <Text fontSize="xs" color="var(--color-text-muted)">Wise account</Text>
                <Text fontSize="xs" color="var(--color-text-muted)">Name: {invoice.wiseName}</Text>
                <Text fontSize="xs" color="var(--color-text-muted)">Wisetag: {invoice.wiseTag}</Text>
              </VStack>
            </Box>
          </VStack>
          <VStack align={{ base: 'start', md: 'end' }} gap={1}>
            <Text fontSize="4xl" fontWeight="700" color="var(--color-primary)">INVOICE</Text>
            <Text fontSize="md" fontWeight="500" color="var(--color-text)">{invoice.invoiceNo}</Text>
            <Text fontSize="sm" color="var(--color-text-muted)">{invoice.invoiceDate}</Text>
          </VStack>
        </Grid>

        <Separator />

        <VStack align="start" gap={2}>
          <Text fontSize="sm" fontWeight="600" color="var(--color-text)">TO:</Text>
          <Text fontSize="sm" color="var(--color-text-muted)" whiteSpace="pre-line">{invoice.billingAddress}</Text>
        </VStack>

        <Text fontSize="sm" fontWeight="500" color="var(--color-text)">
          Period: {invoice.billingPeriod}
        </Text>

        <Separator />

        <VStack align="stretch" gap={3}>
          <Grid templateColumns="2fr 80px 100px 100px" gap={3} pb={2} borderBottom="2px solid" borderColor="var(--color-border)">
            <Text fontSize="xs" fontWeight="600" color="var(--color-text)">Description</Text>
            <Text fontSize="xs" fontWeight="600" color="var(--color-text)" textAlign="center">Qty (Hrs)</Text>
            <Text fontSize="xs" fontWeight="600" color="var(--color-text)" textAlign="right">Rate (USD)</Text>
            <Text fontSize="xs" fontWeight="600" color="var(--color-text)" textAlign="right">Total (USD)</Text>
          </Grid>
          {invoice.lineItems.map((item, idx) => (
            <Grid key={idx} templateColumns="2fr 80px 100px 100px" gap={3} py={2} borderBottom="1px solid" borderColor="var(--color-border)">
              <Box>
                <Text fontSize="sm" fontWeight="500" color="var(--color-text)" mb={1}>{item.projectName}</Text>
                <Text fontSize="xs" color="var(--color-text-muted)" whiteSpace="pre-line">{item.description}</Text>
              </Box>
              <Text fontSize="sm" color="var(--color-text)" textAlign="center">{item.hours}</Text>
              <Text fontSize="sm" color="var(--color-text)" textAlign="right">${item.rate.toFixed(2)}</Text>
              <Text fontSize="sm" color="var(--color-text)" textAlign="right">${item.total.toFixed(2)}</Text>
            </Grid>
          ))}
        </VStack>

        <Separator />

        <HStack justify="end" gap={4}>
          <Text fontSize="lg" fontWeight="600" color="var(--color-text)">TOTAL USD:</Text>
          <Text fontSize="2xl" fontWeight="700" color="var(--color-primary)">
            ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </HStack>

        {invoice.notes && (
          <>
            <Separator />
            <Text fontSize="xs" color="var(--color-text-muted)" fontStyle="italic" whiteSpace="pre-line">{invoice.notes}</Text>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default InvoicePreview;
