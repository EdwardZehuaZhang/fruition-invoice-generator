import { useState } from 'react';
import { Box, VStack, HStack, Table, Button, Dialog, Portal, Text, Badge, IconButton, Spinner } from '@chakra-ui/react';
import { Eye, Download, Trash2, X } from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import { exportInvoiceToPDF } from '../utils/pdfExport';

const InvoiceHistory = ({ invoices, loading, onDelete }) => {
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setViewOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this invoice? This cannot be undone.')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete invoice');
      }
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={12}>
        <Spinner size="lg" color="var(--color-primary)" />
        <Text mt={4} color="fg.muted">Loading invoices...</Text>
      </Box>
    );
  }

  if (invoices.length === 0) {
    return (
      <Box textAlign="center" py={12}>
        <Text fontSize="lg" fontWeight="500" color="fg.muted">No invoices saved yet</Text>
        <Text fontSize="sm" color="fg.muted" mt={2}>Create your first invoice in the New Invoice tab</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Invoice No.</Table.ColumnHeader>
            <Table.ColumnHeader>Date</Table.ColumnHeader>
            <Table.ColumnHeader>Consultant</Table.ColumnHeader>
            <Table.ColumnHeader>Region</Table.ColumnHeader>
            <Table.ColumnHeader>Billing Period</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Total (USD)</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {invoices.map(invoice => {
            const total = invoice.lineItems.reduce((sum, item) => sum + item.total, 0);
            return (
              <Table.Row key={invoice.id} _hover={{ bg: 'bg.subtle' }} transition="all 0.2s ease">
                <Table.Cell fontWeight="500">{invoice.invoiceNo}</Table.Cell>
                <Table.Cell>{invoice.invoiceDate}</Table.Cell>
                <Table.Cell>{invoice.consultantName}</Table.Cell>
                <Table.Cell><Badge colorPalette="blue">{invoice.region}</Badge></Table.Cell>
                <Table.Cell>{invoice.billingPeriod}</Table.Cell>
                <Table.Cell textAlign="right" fontWeight="500">${total.toFixed(2)}</Table.Cell>
                <Table.Cell>
                  <HStack justify="center" gap={1}>
                    <IconButton size="sm" variant="ghost" onClick={() => handleView(invoice)}><Eye size={16} /></IconButton>
                    <IconButton size="sm" variant="ghost" onClick={() => exportInvoiceToPDF(invoice)}><Download size={16} /></IconButton>
                    <IconButton size="sm" variant="ghost" colorPalette="red" onClick={() => handleDelete(invoice.id)}><Trash2 size={16} /></IconButton>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>

      <Dialog.Root open={viewOpen} onOpenChange={(e) => setViewOpen(e.open)} size="xl">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="900px">
              <Dialog.Header>
                <Dialog.Title>Invoice {selectedInvoice?.invoiceNo}</Dialog.Title>
                <Dialog.CloseTrigger asChild><IconButton size="sm" variant="ghost"><X size={20} /></IconButton></Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                {selectedInvoice && <InvoicePreview invoice={selectedInvoice} />}
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
                <Button bg="var(--color-primary)" color="white" onClick={() => exportInvoiceToPDF(selectedInvoice)}>
                  <Download size={16} /> Export PDF
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  );
};

export default InvoiceHistory;
