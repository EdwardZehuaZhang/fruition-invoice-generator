import { useState, useEffect, useRef } from 'react';
import { Box, VStack, HStack, Grid, Button, Input, Textarea, Field, IconButton, Text, createListCollection, Select } from '@chakra-ui/react';
import { Plus, Trash2, Upload } from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import { exportInvoiceToPDF } from '../utils/pdfExport';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

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

const extractPdfLines = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allLines = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Group items by y-position to reconstruct lines
    const itemsByY = {};
    for (const item of content.items) {
      if (!item.str || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!itemsByY[y]) itemsByY[y] = [];
      itemsByY[y].push({ x: item.transform[4], str: item.str });
    }

    // Sort y descending (top to bottom), x ascending within line
    const sortedYs = Object.keys(itemsByY).map(Number).sort((a, b) => b - a);
    for (const y of sortedYs) {
      const items = itemsByY[y].sort((a, b) => a.x - b.x);
      const lineStr = items.map(it => it.str).join('  ');
      allLines.push(lineStr);
    }
  }

  return allLines;
};

const parseClockifyLines = (lines) => {
  const projects = [];
  let currentProject = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Match project line: "ProjectName  28:30  25.50%"
    // Has time (HH:MM) AND percentage
    const projectMatch = line.match(/^(.+?)\s{2,}(\d+:\d+)\s+[\d.]+\s*%/);
    if (projectMatch) {
      const name = projectMatch[1].trim();
      // Skip header rows
      if (name === 'Project' || name === 'Duration') continue;
      const timeParts = projectMatch[2].split(':').map(Number);
      const hours = timeParts[0] + timeParts[1] / 60;
      currentProject = { name, hours: Math.round(hours * 100) / 100, subTasks: [] };
      projects.push(currentProject);
      continue;
    }

    // Match sub-task: indented line with time at end (no percentage)
    if (currentProject) {
      // Sub-tasks often appear as "  Task Name  HH:MM"
      const subMatch = line.match(/^(.+?)\s{2,}(\d+:\d+)\s*$/);
      if (subMatch) {
        const subName = subMatch[1].trim();
        if (subName && subName !== currentProject.name && subName !== 'Total') {
          currentProject.subTasks.push(subName);
        }
      }
    }
  }

  return projects.map(p => ({
    projectId: null,
    projectName: p.name,
    description: p.subTasks.join(', '),
    hours: p.hours,
    rate: 40,
    total: Math.round(p.hours * 40 * 100) / 100
  }));
};

const extractBillingMonth = (lines, filename) => {
  // Try to find date range in PDF text
  const fullText = lines.join(' ');
  const dateRangeMatch = fullText.match(/(\d{2})\/(\d{2})\/(\d{4})\s*[-–]\s*\d{2}\/\d{2}\/\d{4}/);
  if (dateRangeMatch) {
    const month = dateRangeMatch[2];
    const year = dateRangeMatch[3];
    return year + '-' + month;
  }

  // Try filename pattern: "2026-03" or "March 2026" etc
  if (filename) {
    const fnMatch = filename.match(/(\d{4})[-_](\d{2})/);
    if (fnMatch) return fnMatch[1] + '-' + fnMatch[2];
  }

  return getCurrentYearMonth();
};

const ClockifyImport = ({ getNextInvoiceNumber, onSave }) => {
  const fileInputRef = useRef(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parsed, setParsed] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Form state
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
  const [currency, setCurrency] = useState(() => localStorage.getItem('fruition_currency') || 'SGD');

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
    } catch (e) { /* ignore */ }
  }, []);

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.pdf')) {
      setParseError('Please upload a PDF file.');
      return;
    }
    setParsing(true);
    setParseError('');
    try {
      const lines = await extractPdfLines(file);
      const items = parseClockifyLines(lines);
      const month = extractBillingMonth(lines, file.name);

      if (items.length === 0) {
        setParseError('No billable projects found in PDF. Make sure this is a Clockify Summary report.');
      } else {
        setLineItems(items);
        setBillingMonth(month);
        setParsed(true);
      }
    } catch (err) {
      console.error('PDF parse error:', err);
      setParseError('Failed to parse PDF: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const updateLine = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    if (field === 'hours' || field === 'rate') {
      updated[index].total = Math.round(updated[index].hours * updated[index].rate * 100) / 100;
    }
    setLineItems(updated);
  };

  const removeLine = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const addManualLine = () => {
    setLineItems([...lineItems, { projectId: null, projectName: '', description: '', hours: 0, rate: 40, total: 0 }]);
  };

  const buildInvoice = () => ({
    invoiceNo,
    invoiceDate: (() => {
      if (!invoiceDate) return '';
      const [y, m, d] = invoiceDate.split('-');
      return d + '/' + m + '/' + y;
    })(),
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
  const totalHours = lineItems.reduce((s, i) => s + (parseFloat(i.hours) || 0), 0);
  const totalAmount = lineItems.reduce((s, i) => s + (i.total || 0), 0);

  return (
    <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
      <VStack align="stretch" gap={6}>
        <VStack align="stretch" gap={1}>
          <Text fontWeight="700" fontSize="lg" color="var(--color-text)">Import from Clockify PDF</Text>
          <Text fontSize="sm" color="var(--color-text-muted)">Upload a Clockify Summary report PDF to auto-fill line items</Text>
        </VStack>

        {/* Upload area */}
        <Box
          border="2px dashed"
          borderColor={dragOver ? 'var(--color-primary)' : 'var(--color-border)'}
          borderRadius="xl"
          p={8}
          textAlign="center"
          bg={dragOver ? 'rgba(108,63,196,0.05)' : 'bg.subtle'}
          cursor="pointer"
          transition="all 0.2s"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <VStack gap={3}>
            <Box color={dragOver ? 'var(--color-primary)' : 'var(--color-text-muted)'}>
              <Upload size={32} />
            </Box>
            <Text fontWeight="500" color="var(--color-text)">
              {parsing ? 'Parsing PDF...' : 'Drop Clockify PDF here or click to upload'}
            </Text>
            <Text fontSize="xs" color="var(--color-text-muted)">Clockify Summary report (.pdf)</Text>
            {parsed && (
              <Text fontSize="xs" color="green.500" fontWeight="600">
                ✓ Parsed {lineItems.length} billable project(s)
              </Text>
            )}
          </VStack>
        </Box>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />

        {parseError && (
          <Box p={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg">
            <Text fontSize="sm" color="red.600">{parseError}</Text>
          </Box>
        )}

        {/* Consultant */}
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
          <Field.Root>
            <Field.Label fontWeight="500">Consultant Name</Field.Label>
            <Input value={consultant} onChange={(e) => setConsultant(e.target.value)} />
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

        {/* Invoice meta */}
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

        {/* Billing month */}
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

        {/* Line items */}
        <HStack justify="space-between" align="center">
          <Text fontWeight="600" fontSize="sm" color="var(--color-text)">
            Line Items {lineItems.length > 0 && '(' + lineItems.length + ')'}
          </Text>
          <HStack gap={2}>
            <Text fontSize="xs" color="var(--color-text-muted)">Currency:</Text>
            <select
              value={currency}
              onChange={(e) => { setCurrency(e.target.value); localStorage.setItem('fruition_currency', e.target.value); }}
              style={{
                border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: '6px',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                padding: '4px 8px',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              {['USD','SGD','AUD','GBP','EUR'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </HStack>
        </HStack>

        <VStack align="stretch" gap={4}>
          {lineItems.map((item, idx) => (
            <Box key={idx} p={4} bg="bg.subtle" borderRadius="lg" border="1px solid" borderColor="border.muted">
              <HStack justify="space-between" mb={3}>
                <Input
                  placeholder="Project Name"
                  value={item.projectName}
                  onChange={(e) => updateLine(idx, 'projectName', e.target.value)}
                  fontWeight="500"
                />
                <IconButton size="sm" onClick={() => removeLine(idx)} colorPalette="red"><Trash2 size={16} /></IconButton>
              </HStack>
              <Textarea
                placeholder="Sub-task descriptions..."
                value={item.description}
                onChange={(e) => updateLine(idx, 'description', e.target.value)}
                mb={3}
                rows={2}
              />
              <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                <Field.Root>
                  <Field.Label fontSize="xs">Hours</Field.Label>
                  <Input type="number" step="0.01" value={item.hours} onChange={(e) => updateLine(idx, 'hours', parseFloat(e.target.value) || 0)} />
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

        {lineItems.length > 0 && (
          <Box p={4} bg="bg.subtle" borderRadius="lg" border="1px solid" borderColor="var(--color-border)">
            <HStack justify="space-between">
              <Text fontSize="sm" color="var(--color-text-muted)">Total Hours: <strong>{totalHours.toFixed(2)}</strong></Text>
              <Text fontSize="sm" fontWeight="700" color="var(--color-primary)">
                TOTAL {currency}: {totalAmount.toFixed(2)}
              </Text>
            </HStack>
          </Box>
        )}

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

export default ClockifyImport;
