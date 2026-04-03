import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Grid, Button, Input, Textarea, Select, Field, IconButton, Text, createListCollection } from '@chakra-ui/react';
import { Plus, Trash2 } from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import ProjectSelector from './ProjectSelector';
import { exportInvoiceToPDF } from '../utils/pdfExport';

const regionOptions = createListCollection({
  items: [
    { label: 'NA', value: 'NA' },
    { label: 'APAC', value: 'APAC' },
    { label: 'UK', value: 'UK' }
  ]
});

const regionAddresses = {
  NA: 'Fruition Services Inc\n1 Beaux Arts Ln, Halesite NY 11743, United States',
  APAC: 'Fruition Services Pty Ltd\n12/64 York Street, Sydney NSW 2000, Australia',
  UK: 'Fruition Services Limited\nC/O Gpc Financial Management\n423 Linen Hall, 162-168 Regent Street\nLondon, United Kingdom, W1B 5TE'
};

const NewInvoice = ({ getNextInvoiceNumber, onSave }) => {
  const [consultant, setConsultant] = useState('');
  const [consultantAddress, setConsultantAddress] = useState('');
  const [consultantPhone, setConsultantPhone] = useState('');
  const [consultantEmail, setConsultantEmail] = useState('');
  const [wiseName, setWiseName] = useState('');
  const [wiseTag, setWiseTag] = useState('');
  const [region, setRegion] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [billingFrom, setBillingFrom] = useState('');
  const [billingTo, setBillingTo] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);

  useEffect(() => {
    setInvoiceNo(getNextInvoiceNumber());
  }, []);

  const addProjectLine = (project) => {
    setSelectedProjects([...selectedProjects, project]);
    setLineItems([...lineItems, {
      projectId: project.id,
      projectName: project.name,
      description: '',
      hours: 0,
      rate: 0,
      total: 0
    }]);
  };

  const addManualLine = () => {
    setLineItems([...lineItems, {
      projectId: null,
      projectName: '',
      description: '',
      hours: 0,
      rate: 0,
      total: 0
    }]);
  };

  const removeLine = (index) => {
    const item = lineItems[index];
    if (item.projectId) {
      setSelectedProjects(selectedProjects.filter(p => p.id !== item.projectId));
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLine = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    if (field === 'hours' || field === 'rate') {
      updated[index].total = updated[index].hours * updated[index].rate;
    }
    setLineItems(updated);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const buildInvoice = () => ({
    invoiceNo,
    invoiceDate: formatDate(invoiceDate),
    billingPeriod: `${formatDate(billingFrom)} to ${formatDate(billingTo)}`,
    consultantName: consultant,
    consultantAddress,
    consultantPhone,
    consultantEmail,
    wiseName,
    wiseTag,
    billingAddress: regionAddresses[region] || '',
    region,
    lineItems,
    notes
  });

  const handleSave = () => {
    if (!consultant || !region || lineItems.length === 0) {
      alert('Please fill in consultant, region, and at least one line item');
      return;
    }
    try {
      onSave(buildInvoice());
      alert('Invoice saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save invoice');
    }
  };

  const handleExportPDF = () => {
    if (!consultant || !region || lineItems.length === 0) {
      alert('Please fill in all required fields');
      return;
    }
    exportInvoiceToPDF(buildInvoice());
  };

  const invoice = buildInvoice();

  return (
    <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
      <VStack align="stretch" gap={6}>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
          <Field.Root>
            <Field.Label fontWeight="500">Consultant Name</Field.Label>
            <Input placeholder="Enter consultant name" value={consultant} onChange={(e) => setConsultant(e.target.value)} />
          </Field.Root>
          <Field.Root>
            <Field.Label fontWeight="500">Region</Field.Label>
            <Select.Root collection={regionOptions} value={[region]} onValueChange={(e) => setRegion(e.value[0])}>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select..." />
                </Select.Trigger>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {regionOptions.items.map((item) => (
                    <Select.Item item={item} key={item.value}>{item.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </Field.Root>
        </Grid>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <Field.Root>
            <Field.Label fontWeight="500">Consultant Address</Field.Label>
            <Textarea placeholder="Enter full address" value={consultantAddress} onChange={(e) => setConsultantAddress(e.target.value)} rows={3} />
          </Field.Root>
          <VStack align="stretch" gap={4}>
            <Field.Root>
              <Field.Label fontWeight="500">Phone</Field.Label>
              <Input placeholder="+1 234 567 8900" value={consultantPhone} onChange={(e) => setConsultantPhone(e.target.value)} />
            </Field.Root>
            <Field.Root>
              <Field.Label fontWeight="500">Email</Field.Label>
              <Input type="email" placeholder="consultant@example.com" value={consultantEmail} onChange={(e) => setConsultantEmail(e.target.value)} />
            </Field.Root>
          </VStack>
        </Grid>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <Field.Root>
            <Field.Label fontWeight="500">Wise Account Name</Field.Label>
            <Input placeholder="Account holder name" value={wiseName} onChange={(e) => setWiseName(e.target.value)} />
          </Field.Root>
          <Field.Root>
            <Field.Label fontWeight="500">Wisetag</Field.Label>
            <Input placeholder="@wisetag" value={wiseTag} onChange={(e) => setWiseTag(e.target.value)} />
          </Field.Root>
        </Grid>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <Field.Root>
            <Field.Label fontWeight="500">Invoice No.</Field.Label>
            <Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          </Field.Root>
          <Field.Root>
            <Field.Label fontWeight="500">Invoice Date</Field.Label>
            <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </Field.Root>
        </Grid>

        <Grid templateColumns="1fr 1fr" gap={4}>
          <Field.Root>
            <Field.Label fontWeight="500">From:</Field.Label>
            <Input type="date" value={billingFrom} onChange={(e) => setBillingFrom(e.target.value)} />
          </Field.Root>
          <Field.Root>
            <Field.Label fontWeight="500">To:</Field.Label>
            <Input type="date" value={billingTo} onChange={(e) => setBillingTo(e.target.value)} />
          </Field.Root>
        </Grid>

        <Field.Root w="100%">
          <Field.Label fontWeight="500">Add Project</Field.Label>
          <Box w="100%">
            <ProjectSelector region={region} onSelect={addProjectLine} selectedProjects={selectedProjects} />
          </Box>
        </Field.Root>

        <VStack align="stretch" gap={4}>
          {lineItems.map((item, idx) => (
            <Box key={idx} p={4} bg="bg.subtle" borderRadius="lg" border="1px solid" borderColor="border.muted">
              <HStack justify="space-between" mb={3}>
                <Input
                  placeholder="Project/Item Name"
                  value={item.projectName}
                  onChange={(e) => updateLine(idx, 'projectName', e.target.value)}
                  fontWeight="500"
                  readOnly={!!item.projectId}
                />
                <IconButton size="sm" onClick={() => removeLine(idx)} colorPalette="red"><Trash2 size={16} /></IconButton>
              </HStack>
              <Textarea
                placeholder="Description of work performed..."
                value={item.description}
                onChange={(e) => updateLine(idx, 'description', e.target.value)}
                mb={3}
              />
              <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                <Field.Root>
                  <Field.Label fontSize="xs">Hours</Field.Label>
                  <Input type="number" value={item.hours} onChange={(e) => updateLine(idx, 'hours', parseFloat(e.target.value) || 0)} />
                </Field.Root>
                <Field.Root>
                  <Field.Label fontSize="xs">Rate (USD)</Field.Label>
                  <Input type="number" step="0.01" value={item.rate} onChange={(e) => updateLine(idx, 'rate', parseFloat(e.target.value) || 0)} />
                </Field.Root>
                <Field.Root>
                  <Field.Label fontSize="xs">Total</Field.Label>
                  <Input value={`$${item.total.toFixed(2)}`} readOnly bg="bg.muted" />
                </Field.Root>
              </Grid>
            </Box>
          ))}
        </VStack>

        <Button variant="outline" onClick={addManualLine}><Plus size={16} /> Add Manual Line</Button>

        <Field.Root>
          <Field.Label fontWeight="500">Notes (optional)</Field.Label>
          <Textarea placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field.Root>

        <HStack gap={3} wrap="wrap">
          <Button onClick={handleSave} bg="var(--color-primary)" color="white" _hover={{ bg: 'var(--color-primary-hover)' }}>Save Invoice</Button>
          <Button variant="outline" onClick={handleExportPDF}>Export to PDF</Button>
        </HStack>
      </VStack>

      <Box display={{ base: 'none', lg: 'block' }}>
        <InvoicePreview invoice={invoice} />
      </Box>
    </Grid>
  );
};

export default NewInvoice;
