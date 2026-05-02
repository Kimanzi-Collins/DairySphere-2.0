import { useState, useEffect } from 'react';
import type { Farmer } from '../../types';
import { farmersAPI, loansAPI } from '../../api';
import Modal from '../common/Modal';
import FormField, { inputStyle, selectStyle } from '../common/FormField';
import { formatCurrency } from '../../utils/formatCurrency';

interface LoanFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#8b7cf6';
    e.target.style.boxShadow = '0 0 0 3px rgba(139,124,246,0.15)';
};
const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
    e.target.style.boxShadow = 'none';
};

export default function LoanForm({ isOpen, onClose, onSaved }: LoanFormProps) {
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [form, setForm] = useState({
        farmerId: '', loanAmount: '', repaymentPeriod: '', dateBorrowed: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            farmersAPI.getAll().then(f => setFarmers(f as Farmer[]));
            setForm({ farmerId: '', loanAmount: '', repaymentPeriod: '', dateBorrowed: '' });
            setError('');
        }
    }, [isOpen]);

    const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    const interest = form.loanAmount && form.repaymentPeriod
        ? parseFloat(form.loanAmount) * 0.10 * (parseInt(form.repaymentPeriod) / 12)
        : 0;
    const total = form.loanAmount ? parseFloat(form.loanAmount) + interest : 0;
    const monthly = total && form.repaymentPeriod ? total / parseInt(form.repaymentPeriod) : 0;

    const handleSubmit = async () => {
        if (!form.farmerId || !form.loanAmount || !form.repaymentPeriod || !form.dateBorrowed) {
            setError('Please fill in all fields');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await loansAPI.create({
                farmerId: form.farmerId,
                loanAmount: parseFloat(form.loanAmount),
                repaymentPeriod: parseInt(form.repaymentPeriod),
                dateBorrowed: form.dateBorrowed,
            });
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Loan" width="560px">
            {error && <div style={S.err}>{error}</div>}

            <div style={S.grid}>
                <FormField label="Farmer *">
                    <select style={selectStyle} value={form.farmerId}
                        onChange={(e) => set('farmerId', e.target.value)}
                        onFocus={focus} onBlur={blur}>
                        <option value="">Select farmer</option>
                        {farmers.map(f => (
                            <option key={f.FarmerId} value={f.FarmerId}>
                                {f.FarmerName} ({f.FarmerId})
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Date Borrowed *">
                    <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }}
                        value={form.dateBorrowed} onChange={(e) => set('dateBorrowed', e.target.value)}
                        onFocus={focus} onBlur={blur} />
                </FormField>
            </div>

            <div style={S.grid}>
                <FormField label="Loan Amount (Ksh) *">
                    <input type="number" style={inputStyle} placeholder="e.g. 50000"
                        value={form.loanAmount} onChange={(e) => set('loanAmount', e.target.value)}
                        onFocus={focus} onBlur={blur} />
                </FormField>

                <FormField label="Repayment Period (Months) *">
                    <input type="number" style={inputStyle} placeholder="e.g. 12"
                        value={form.repaymentPeriod} onChange={(e) => set('repaymentPeriod', e.target.value)}
                        onFocus={focus} onBlur={blur} />
                </FormField>
            </div>

            {/* Loan Summary */}
            <div style={S.summaryBox}>
                <div style={S.summaryRow}>
                    <span>Principal</span>
                    <span style={{ color: '#e6edf3' }}>{form.loanAmount ? formatCurrency(parseFloat(form.loanAmount)) : '—'}</span>
                </div>
                <div style={S.summaryRow}>
                    <span>Interest (10% p.a.)</span>
                    <span style={{ color: '#eab308' }}>{interest ? formatCurrency(interest) : '—'}</span>
                </div>
                <div style={{ ...S.summaryRow, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                    <span style={{ fontWeight: 700, color: '#e6edf3' }}>Total Repayable</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 16 }}>
                        {total ? formatCurrency(total) : '—'}
                    </span>
                </div>
                <div style={S.summaryRow}>
                    <span>Monthly Installment</span>
                    <span style={{ color: 'var(--secondary)' }}>{monthly ? formatCurrency(monthly) : '—'}</span>
                </div>
            </div>

            <div style={S.actions}>
                <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit}
                    disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Processing...' : 'Create Loan'}
                </button>
            </div>
        </Modal>
    );
}

const S: Record<string, React.CSSProperties> = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    err: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 18 },
    summaryBox: { background: 'rgba(139, 124, 246, 0.05)', border: '1px solid rgba(139, 124, 246, 0.1)', borderRadius: 12, padding: '16px 20px', marginBottom: 8 },
    summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#8b949e' },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' },
    cancelBtn: { padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#8b949e', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' },
};