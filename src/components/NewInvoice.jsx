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

const currencyOptions = createListCollection({
  items: [
    { label: 'USD', value: 'USD' },
    { label: 'SGD', value: 'SGD' },
    { label: 'AUD', value: 'AUD' },
    { label: 'GBP', value: 'GBP' },
    { label: 'EUR', value: 'EUR' },
  ]
});

const regionAddresses = {
  NA: 'Fruition Services Inc\n1 Beaux Arts Ln, Halesite NY 11743, United States',
  APAC: 'Fruition Services Pty Ltd\n12/64 York Street, Sydney NSW 2000, Australia',
  UK: 'Fruition Services Limited\nC/O Gpc Financial Management\n423 Linen Hall, 162-168 Regent Street\nLondon, United Kingdom, W1B 5TE'
};

const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = -12; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const label = d.toLocaleString('default', { month: 'short' }) + ' ' + year;
    options.push({ value: year + '-' + month, label });
  }
  return options.reverse();
};

const monthToBillingPeriod = (yearMonth) => {
  if (!yearMonth) return '';
  const parts = yearMonth.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  const lastDay = new Date(year, month, 0).getDate();
  const pad = (n) => String(n).padStart(2, '0');
  return pad(1) + '/' + pad(month) + '/' + year + ' to ' + pad(lastDay) + '/' + pad(month) + '/' + year;
};

const getCurrentYearMonth = () => {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
};

const monthOptions = generateMonthOptions();

const NewInvoice = ({ getNextInvoiceNumber, onSave }) => {
  const [consultant, setConsultant] = useState('Edward (Zehua) Zhang');
  const [consultantAddress, setConsultantAddress] = useState('');
  const [consultantPhone, setConsultantPhone] = useState('');
  const [consultantEmail, setConsultantEmail] = useState('');
  const [wiseName, setWiseName] = useState('');
  const [wiseTag, setWiseTag] = useState('');
  const [region, setRegion] = useState('APAC');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [billingMonth, setBillingMonth] = useState(getCurrentYearMonth());
  const [lineItems, setLineItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [currency, setCurrency] = useState(() => localStorage.getItem('fruition_currency') || 'USD');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    setInvoiceNo(getNextInvoiceNumber());
    try {
      const saved = localStorage.getItem('fruition_consultant_profile');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.consultant) setConsultant(p.consultant);
        if (p.consultantAddress) setConsultantAddress(p.consultantAddress);
        if (p.consultantPhone) setConsultantPhone(p.consultantPhone);
        if (p.consultantEmail) setConsultantEmail(p.consultantEmail);
        if (p.wiseName) setWiseName(p.wiseName);
        if (p.wiseTag) setWiseTag(p.wiseTag);
        if (p.region) setRegion(p.region);
      }
    } catch (e) {
      console.warn('Failed to load consultant profile', e);
    }
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem('fruition_consultant_profile', JSON.stringify({
      consultant, consultantAddress, consultantPhone, consultantEmail, wiseName, wiseTag, region
    }));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleCurrencyChange = (val) => {
    setCurrency(val);
    localStorage.setItem('fruition_currency', val);
  };

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
    return day + '/' + month + '/' + year;
  };

  const buildInvoice = () => ({
    invoiceNo,
    invoiceDate: formatDate(invoiceDate),
    billingPeriod: monthToBillingPeriod(billingMonth),
    consultantName: consultant,
    consultantAddress,
    consultantPhone,
    consultantEmail,
    wiseName,
    wiseTag,
    billingAddress: regionAddresses[region] || '',
    region,
    currency,
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

  const CurrencySelect = () => (
    <HStack gap={2} align="center">
      <Text fontSize="xs" color="var(--color-text-muted)">Currency:</Text>
      <Select.Root collection={currencyOptions} value={[currency]} onValueChange={(e) => handleCurrencyChange(e.value[0])} size="sm">
        <Select.Control>
          <Select.Trigger minW="80px">
            <Select.ValueText />
          </Select.Trigger>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {currencyOptions.items.map((item) => (
              <Select.Item item={item} key={item.value}>{item.label}</Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
    </HStack>
  );

  return (
    <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
      <VStack align="stretch" gap={6}>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
          <Field.Root>
            <Field.Label fontWeight="500">Consultant Name</Field.Label>
            <HStack gap={2}>
              <Input flex="1" placeholder="Enter consultant name" value={consultant} onChange={(e) => setConsultant(e.target.value)} />
              <Button size="sm" variant="outline" onClick={handleSaveProfile} flexShrink={0}
                borderColor="var(--color-border)" color={profileSaved ? 'green.500' : 'var(--color-text-muted)'}
                _hover={{ bg: 'bg.subtle' }} minW="90px" fontSize="xs">
                {profileSaved ? '✓ Saved!' : 'Set default'}
              </Button>
            </HStack>
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

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <Field.Root>
            <Field.Label fontWeight="500">Invoice No.</Field.Label>
            <Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          </Field.Root>
          <Field.Root>
            <Field.Label fontWeight="500">Invoice Date</Field.Label>
            <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </Field.Root>
        </Grid>

        <Field.Root>
          <Field.Label fontWeight="500">Billing Month</Field.Label>
          <select
            value={billingMonth}
            onChange={(e) => setBillingMonth(e.target.value)}
            style={{
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '6px',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              padding: '8px 12px',
              fontSize: '14px',
              width: '100%',
              outline: 'none'
            }}
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Text fontSize="xs" color="var(--color-text-muted)" mt={1}>
            Period: {monthToBillingPeriod(billingMonth)}
          </Text>
        </Field.Root>

        <Field.Root w="100%">
          <Field.Label fontWeight="500">Add Project</Field.Label>
          <Box w="100%">
            <ProjectSelector region={region} onSelect={addProjectLine} selectedProjects={selectedProjects} />
          </Box>
        </Field.Root>

        <HStack justify="space-between" align="center">
          <Text fontWeight="600" fontSize="sm" color="var(--color-text)">Line Items</Text>
          <CurrencySelect />
        </HStack>

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
                  <Field.Label fontSize="xs">Rate ({currency})</Field.Label>
                  <Input type="number" step="0.01" value={item.rate} onChange={(e) => updateLine(idx, 'rate', parseFloat(e.target.value) || 0)} />
                </Field.Root>
                <Field.Root>
                  <Field.Label fontSize="xs">Total</Field.Label>
                  <Input value={item.total.toFixed(2)} readOnly bg="bg.muted" />
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
