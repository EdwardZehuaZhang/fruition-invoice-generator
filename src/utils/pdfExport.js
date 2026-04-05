import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

export const exportInvoiceToPDF = (invoice) => {
  const currency = invoice.currency || 'USD';

  const tableBody = [
    [
      { text: 'Description', style: 'tableHeader' },
      { text: 'Qty (Hrs)', style: 'tableHeader', alignment: 'center' },
      { text: 'Rate (' + currency + ')', style: 'tableHeader', alignment: 'right' },
      { text: 'Total (' + currency + ')', style: 'tableHeader', alignment: 'right' }
    ]
  ];

  invoice.lineItems.forEach(item => {
    const descriptionText = item.projectName
      ? item.projectName + '\n' + (item.description || '')
      : item.description || '';
    tableBody.push([
      { text: descriptionText, style: item.projectName ? 'lineItemWithProject' : 'lineItem' },
      { text: item.hours.toString(), style: 'lineItemNumber', alignment: 'center' },
      { text: item.rate.toFixed(2), style: 'lineItemNumber', alignment: 'right' },
      { text: item.total.toFixed(2), style: 'lineItemNumber', alignment: 'right' }
    ]);
  });

  const totalAmount = invoice.lineItems.reduce((sum, item) => sum + item.total, 0);

  const docDefinition = {
    content: [
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: invoice.consultantName, style: 'consultantName' },
              { text: invoice.consultantAddress || '', style: 'consultantInfo' },
              { text: invoice.consultantPhone || '', style: 'consultantInfo' },
              { text: invoice.consultantEmail || '', style: 'consultantInfo' },
              { text: '', margin: [0, 10, 0, 0] },
              { text: 'Kindly make payment to:', style: 'paymentLabel' },
              { text: 'Wise account', style: 'consultantInfo' },
              { text: 'Name: ' + (invoice.wiseName || ''), style: 'consultantInfo' },
              { text: 'Wisetag: ' + (invoice.wiseTag || ''), style: 'consultantInfo' }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'INVOICE', style: 'invoiceTitle', alignment: 'right' },
              { text: invoice.invoiceNo, style: 'invoiceNumber', alignment: 'right' },
              { text: invoice.invoiceDate, style: 'invoiceDate', alignment: 'right' }
            ]
          }
        ],
        margin: [0, 0, 0, 30]
      },
      { text: 'TO:', style: 'sectionLabel', margin: [0, 0, 0, 5] },
      { text: invoice.billingAddress, style: 'billingAddress', margin: [0, 0, 0, 20] },
      { text: 'Period: ' + invoice.billingPeriod, style: 'billingPeriod', margin: [0, 0, 0, 30] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 60, 80, 80],
          body: tableBody
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
          vLineWidth: () => 0,
          hLineColor: () => '#E5E5E5',
          paddingTop: () => 8,
          paddingBottom: () => 8
        }
      },
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 220,
            stack: [
              {
                columns: [
                  { text: 'TOTAL ' + currency + ':', style: 'totalLabel', width: '50%' },
                  {
                    text: totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    style: 'totalAmount', alignment: 'right', width: '50%'
                  }
                ],
                margin: [0, 15, 0, 0]
              }
            ]
          }
        ]
      },
      invoice.notes ? { text: invoice.notes, style: 'notes', margin: [0, 30, 0, 0] } : {}
    ],
    styles: {
      invoiceTitle: { fontSize: 32, bold: true, color: '#6C3FC4' },
      paymentLabel: { fontSize: 9, bold: true, color: '#2D2D2D' },
      invoiceNumber: { fontSize: 14, color: '#2D2D2D', margin: [0, 5, 0, 0] },
      invoiceDate: { fontSize: 12, color: '#6B6B6B' },
      consultantName: { fontSize: 14, bold: true, color: '#2D2D2D' },
      consultantInfo: { fontSize: 10, color: '#6B6B6B', lineHeight: 1.4 },
      sectionLabel: { fontSize: 11, bold: true, color: '#2D2D2D' },
      billingAddress: { fontSize: 10, color: '#6B6B6B', lineHeight: 1.4 },
      billingPeriod: { fontSize: 11, color: '#2D2D2D' },
      tableHeader: { fontSize: 10, bold: true, color: '#2D2D2D', fillColor: '#FAFAFA' },
      lineItem: { fontSize: 9, color: '#2D2D2D' },
      lineItemWithProject: { fontSize: 9, color: '#2D2D2D', bold: true },
      lineItemNumber: { fontSize: 9, color: '#2D2D2D' },
      totalLabel: { fontSize: 12, bold: true, color: '#2D2D2D' },
      totalAmount: { fontSize: 16, bold: true, color: '#6C3FC4' },
      notes: { fontSize: 9, color: '#6B6B6B', italics: true }
    },
    defaultStyle: { font: 'Roboto' }
  };

  pdfMake.createPdf(docDefinition).download('Invoice_' + invoice.invoiceNo + '.pdf');
};
