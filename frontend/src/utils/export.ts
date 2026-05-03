import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ColumnDef = { header: string; key: string; width?: number; isCurrency?: boolean };

type ExportPdfOptions = {
  logoUrl?: string;
  signatureColor?: string;
  subtitle?: string;
  preparedBy?: string;
};

function safeText(value: unknown) {
  if (value === null || value === undefined) return '—';
  return String(value);
}

function formatReportTitle(filename: string) {
  return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
}

function formatGeneratedAt() {
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
}

export async function exportToExcel(
  filename: string,
  columns: ColumnDef[],
  rows: Record<string, any>[],
  options?: { currencyKeys?: string[]; signatureColor?: string }
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Report');

  const lastCol = String.fromCharCode(65 + Math.max(columns.length - 1, 0));
  sheet.mergeCells(`A1:${lastCol}2`);
  const titleCell = sheet.getCell('A1');
  titleCell.value = formatReportTitle(filename);
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  titleCell.font = { size: 16, bold: true, color: { argb: '0F172A' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } } as ExcelJS.FillPattern;

  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width || 20 }));
  sheet.getRow(3).font = { bold: true, color: { argb: '334155' } };
  sheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } } as ExcelJS.FillPattern;

  rows.forEach((row) => sheet.addRow(row));

  if (options?.currencyKeys) {
    columns.forEach((column, index) => {
      if (options.currencyKeys?.includes(column.key)) {
        sheet.getColumn(index + 1).numFmt = 'Ksh #,##0.00';
      }
    });
  }

  const footerRow = sheet.addRow([]);
  const footerCell = sheet.getCell(`A${footerRow.number}`);
  footerCell.value = 'Prepared by DairySphere';
  footerCell.font = { italic: true, bold: true, color: { argb: options?.signatureColor?.replace('#', '') || '8B7CF6' } };

  const buf = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename);
}

export async function exportToPdf(
  filename: string,
  columns: ColumnDef[],
  rows: Record<string, any>[],
  options?: ExportPdfOptions
) {
  const reportTitle = formatReportTitle(filename);
  const generatedAt = formatGeneratedAt();
  const container = document.createElement('div');
  container.style.width = '1200px';
  container.style.padding = '28px';
  container.style.background = 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)';
  container.style.color = '#111827';
  container.style.fontFamily = 'Segoe UI, Roboto, Arial, sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.gap = '18px';
  header.style.padding = '18px 22px';
  header.style.borderRadius = '20px';
  header.style.marginBottom = '18px';
  header.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #111827 100%)';
  header.style.color = '#fff';
  header.style.boxShadow = '0 16px 30px rgba(15, 23, 42, 0.18)';

  const headerLeft = document.createElement('div');
  headerLeft.style.display = 'flex';
  headerLeft.style.alignItems = 'center';
  headerLeft.style.gap = '16px';

  if (options?.logoUrl) {
    const img = document.createElement('img');
    img.src = options.logoUrl;
    img.alt = 'DairySphere logo';
    img.style.width = '170px';
    img.style.height = '52px';
    img.style.objectFit = 'contain';
    img.style.background = 'rgba(255,255,255,0.08)';
    img.style.borderRadius = '14px';
    img.style.padding = '6px 10px';
    headerLeft.appendChild(img);
  }

  const brandCopy = document.createElement('div');
  brandCopy.style.display = 'flex';
  brandCopy.style.flexDirection = 'column';
  brandCopy.style.gap = '4px';

  const title = document.createElement('div');
  title.innerText = reportTitle;
  title.style.fontSize = '22px';
  title.style.fontWeight = '800';
  title.style.letterSpacing = '-0.02em';

  const subtitle = document.createElement('div');
  subtitle.innerText = options?.subtitle || 'DairySphere premium society export';
  subtitle.style.fontSize = '12px';
  subtitle.style.color = 'rgba(255,255,255,0.78)';

  brandCopy.appendChild(title);
  brandCopy.appendChild(subtitle);
  headerLeft.appendChild(brandCopy);
  header.appendChild(headerLeft);

  const headerMeta = document.createElement('div');
  headerMeta.style.display = 'flex';
  headerMeta.style.flexDirection = 'column';
  headerMeta.style.alignItems = 'flex-end';
  headerMeta.style.gap = '8px';

  const metaChip = document.createElement('div');
  metaChip.innerText = `Generated ${generatedAt}`;
  metaChip.style.fontSize = '11px';
  metaChip.style.padding = '8px 12px';
  metaChip.style.borderRadius = '999px';
  metaChip.style.background = 'rgba(255,255,255,0.1)';
  metaChip.style.border = '1px solid rgba(255,255,255,0.16)';
  metaChip.style.color = 'rgba(255,255,255,0.9)';

  const rowsChip = document.createElement('div');
  rowsChip.innerText = `${rows.length} record${rows.length === 1 ? '' : 's'}`;
  rowsChip.style.fontSize = '11px';
  rowsChip.style.padding = '8px 12px';
  rowsChip.style.borderRadius = '999px';
  rowsChip.style.background = 'rgba(74, 222, 128, 0.14)';
  rowsChip.style.border = '1px solid rgba(74, 222, 128, 0.22)';
  rowsChip.style.color = '#dcfce7';

  headerMeta.appendChild(metaChip);
  headerMeta.appendChild(rowsChip);
  header.appendChild(headerMeta);
  container.appendChild(header);

  const summaryGrid = document.createElement('div');
  summaryGrid.style.display = 'grid';
  summaryGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  summaryGrid.style.gap = '12px';
  summaryGrid.style.marginBottom = '18px';

  [
    { label: 'Brand', value: 'DairySphere Society' },
    { label: 'Document', value: reportTitle },
    { label: 'Prepared', value: generatedAt },
  ].forEach((item, index) => {
    const card = document.createElement('div');
    card.style.padding = '14px 16px';
    card.style.borderRadius = '16px';
    card.style.background = index === 1 ? 'linear-gradient(135deg, #ffffff, #f8fafc)' : '#ffffff';
    card.style.border = '1px solid #e5e7eb';
    card.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.06)';

    const label = document.createElement('div');
    label.innerText = item.label;
    label.style.fontSize = '10px';
    label.style.textTransform = 'uppercase';
    label.style.letterSpacing = '0.14em';
    label.style.color = '#64748b';
    label.style.marginBottom = '6px';

    const value = document.createElement('div');
    value.innerText = item.value;
    value.style.fontSize = '14px';
    value.style.fontWeight = '700';
    value.style.color = '#0f172a';

    card.appendChild(label);
    card.appendChild(value);
    summaryGrid.appendChild(card);
  });

  container.appendChild(summaryGrid);

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.background = '#fff';
  table.style.borderRadius = '16px';
  table.style.overflow = 'hidden';
  table.style.border = '1px solid #e5e7eb';
  table.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.06)';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  columns.forEach((column) => {
    const th = document.createElement('th');
    th.innerText = column.header;
    th.style.borderBottom = '1px solid #e5e7eb';
    th.style.padding = '11px 12px';
    th.style.background = '#f8fafc';
    th.style.textAlign = 'left';
    th.style.fontSize = '11px';
    th.style.letterSpacing = '0.08em';
    th.style.textTransform = 'uppercase';
    th.style.color = '#475569';
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    tr.style.background = rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc';

    columns.forEach((column) => {
      const td = document.createElement('td');
      const value = row[column.key];
      td.innerText = safeText(value);
      td.style.borderBottom = '1px solid #e5e7eb';
      td.style.padding = '10px 12px';
      td.style.fontSize = '12px';
      td.style.color = '#0f172a';
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  const footer = document.createElement('div');
  footer.style.marginTop = '22px';
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'flex-end';
  footer.style.gap = '18px';

  const prepared = document.createElement('div');
  prepared.style.display = 'flex';
  prepared.style.flexDirection = 'column';
  prepared.style.gap = '6px';

  const preparedLabel = document.createElement('div');
  preparedLabel.innerText = options?.preparedBy || 'Prepared by DairySphere';
  preparedLabel.style.fontSize = '13px';
  preparedLabel.style.fontStyle = 'italic';
  preparedLabel.style.fontWeight = '600';
  preparedLabel.style.color = options?.signatureColor || '#0f172a';

  const preparedNote = document.createElement('div');
  preparedNote.innerText = 'Digital signature line and branded export';
  preparedNote.style.fontSize = '11px';
  preparedNote.style.color = '#64748b';

  prepared.appendChild(preparedLabel);
  prepared.appendChild(preparedNote);
  footer.appendChild(prepared);

  const signatureLine = document.createElement('div');
  signatureLine.style.minWidth = '280px';
  signatureLine.style.paddingTop = '14px';

  const line = document.createElement('div');
  line.style.borderTop = `2px solid ${options?.signatureColor || '#8b7cf6'}`;
  line.style.marginBottom = '8px';

  const lineLabel = document.createElement('div');
  lineLabel.innerText = 'Authorized Signature';
  lineLabel.style.fontSize = '11px';
  lineLabel.style.letterSpacing = '0.12em';
  lineLabel.style.textTransform = 'uppercase';
  lineLabel.style.color = '#64748b';

  signatureLine.appendChild(line);
  signatureLine.appendChild(lineLabel);
  footer.appendChild(signatureLine);

  container.appendChild(footer);

  document.body.appendChild(container);
  const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
  document.body.removeChild(container);
}
