import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToPdf } from '../../utils/export';

type ColumnDef = { header: string; key: string; width?: number; isCurrency?: boolean };
type ProfileExportInfo = {
  imageUrl?: string;
  title: string;
  subtitle?: string;
  details?: { label: string; value: unknown }[];
};

interface Props {
  filename: string;
  columns: ColumnDef[];
  rows: Record<string, any>[];
  signatureColor?: string;
  logoUrl?: string;
  profile?: ProfileExportInfo;
  className?: string;
}

export default function ExportButtons({ filename, columns, rows, signatureColor = '#2C7A7B', logoUrl = '/dairysphere-logo.svg', profile, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.fromTo(
      wrapRef.current.querySelectorAll('button'),
      { y: 10, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, stagger: 0.08, ease: 'power3.out' }
    );
  }, []);

  const handleExcel = async () => {
    await exportToExcel(filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`, columns, rows, { currencyKeys: columns.filter(c=>c.isCurrency).map(c=>c.key), signatureColor, profile });
  };

  const handlePdf = async () => {
    await exportToPdf(filename.endsWith('.pdf') ? filename : `${filename}.pdf`, columns, rows, { logoUrl, signatureColor, profile });
  };

  const animateHover = (target: HTMLButtonElement, active: boolean) => {
    gsap.to(target, {
      y: active ? -2 : 0,
      scale: active ? 1.03 : 1,
      duration: 0.18,
      ease: 'power2.out',
    });
  };

  const buttonBase: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 38,
    padding: '9px 13px',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 12,
    fontFamily: 'inherit',
    boxShadow: '0 10px 22px rgba(0,0,0,0.18)',
    transformOrigin: 'center',
    whiteSpace: 'nowrap',
  };

  return (
    <div ref={wrapRef} className={className} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button
        onClick={handleExcel}
        onMouseEnter={(e) => animateHover(e.currentTarget, true)}
        onMouseLeave={(e) => animateHover(e.currentTarget, false)}
        onMouseDown={(e) => gsap.to(e.currentTarget, { scale: 0.98, duration: 0.08 })}
        onMouseUp={(e) => gsap.to(e.currentTarget, { scale: 1.03, duration: 0.12 })}
        style={{ ...buttonBase, background: signatureColor }}
      >
        <FileSpreadsheet size={16} />
        Export Excel
      </button>
      <button
        onClick={handlePdf}
        onMouseEnter={(e) => animateHover(e.currentTarget, true)}
        onMouseLeave={(e) => animateHover(e.currentTarget, false)}
        onMouseDown={(e) => gsap.to(e.currentTarget, { scale: 0.98, duration: 0.08 })}
        onMouseUp={(e) => gsap.to(e.currentTarget, { scale: 1.03, duration: 0.12 })}
        style={{ ...buttonBase, background: '#111827' }}
      >
        <FileText size={16} />
        Export PDF
      </button>
    </div>
  );
}
