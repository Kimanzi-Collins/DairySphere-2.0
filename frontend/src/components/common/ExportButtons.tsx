import { exportToExcel, exportToPdf } from '../../utils/export';

type ColumnDef = { header: string; key: string; width?: number; isCurrency?: boolean };

interface Props {
  filename: string;
  columns: ColumnDef[];
  rows: Record<string, any>[];
  signatureColor?: string;
  logoUrl?: string;
}

export default function ExportButtons({ filename, columns, rows, signatureColor = '#2C7A7B', logoUrl = '/dairysphere-logo.svg' }: Props) {
  const handleExcel = async () => {
    await exportToExcel(filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`, columns, rows, { currencyKeys: columns.filter(c=>c.isCurrency).map(c=>c.key), signatureColor });
  };

  const handlePdf = async () => {
    await exportToPdf(filename.endsWith('.pdf') ? filename : `${filename}.pdf`, columns, rows, { logoUrl, signatureColor });
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={handleExcel} style={{ padding: '8px 12px', background: signatureColor, color: 'white', border: 'none', borderRadius: 6 }}>Export Excel</button>
      <button onClick={handlePdf} style={{ padding: '8px 12px', background: '#111827', color: 'white', border: 'none', borderRadius: 6 }}>Export PDF</button>
    </div>
  );
}
