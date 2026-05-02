import { useState, useEffect } from 'react';
import type { Farmer, Input } from '../../types';
import { farmersAPI, inputsAPI, inputPurchasesAPI } from '../../api';
import Modal from '../common/Modal';
import FormField, { inputStyle, selectStyle } from '../common/FormField';
import { formatCurrency } from '../../utils/formatCurrency';

interface PurchaseFormProps {
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

export default function PurchaseForm({ isOpen, onClose, onSaved }: PurchaseFormProps) {
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [inputs, setInputs] = useState<Input[]>([]);
    const [form, setForm] = useState({
        farmerId: '', inputId: '', inputName: '',
        inputPrice: '', quantity: '', dateOfPurchase: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            Promise.all([farmersAPI.getAll(), inputsAPI.getAll()])
                .then(([f, i]) => {
                    setFarmers(f as Farmer[]);
                    setInputs(i as Input[]);
                });
            setForm({ farmerId: '', inputId: '', inputName: '', inputPrice: '', quantity: '', dateOfPurchase: '' });
            setError('');
        }
    }, [isOpen]);

    const handleInputChange = (inputId: string) => {
        const input = inputs.find(i => i.InputId === inputId);
        setForm(prev => ({
            ...prev,
            inputId,
            inputName: input?.InputName || '',
            inputPrice: input ? String(input.InputPrice) : '',
        }));
    };

    const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
    const total = form.inputPrice && form.quantity
        ? parseFloat(form.inputPrice) * parseInt(form.quantity) : 0;

    const handleSubmit = async () => {
        if (!form.farmerId || !form.inputId || !form.quantity || !form.dateOfPurchase) {
            setError('Please fill in all fields');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await inputPurchasesAPI.create({
                farmerId: form.farmerId,
                inputId: form.inputId,
                inputName: form.inputName,
                inputPrice: parseFloat(form.inputPrice),
                quantity: parseInt(form.quantity),
                dateOfPurchase: form.dateOfPurchase,
            });
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Input Purchase" width="560px">
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

                <FormField label="Purchase Date *">
                    <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }}
                        value={form.dateOfPurchase} onChange={(e) => set('dateOfPurchase', e.target.value)}
                        onFocus={focus} onBlur={blur} />
                </FormField>
            </div>

            <div style={S.grid}>
                <FormField label="Input Item *">
                    <select style={selectStyle} value={form.inputId}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onFocus={focus} onBlur={blur}>
                        <option value="">Select input</option>
                        {inputs.map(i => (
                            <option key={i.InputId} value={i.InputId}>
                                {i.InputName} — Ksh. {i.InputPrice}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Unit Price (Auto-filled)">
                    <input style={{ ...inputStyle, opacity: 0.7 }} readOnly
                        value={form.inputPrice ? `Ksh. ${form.inputPrice}` : ''}
                        placeholder="Select input first" />
                </FormField>
            </div>

            <FormField label="Quantity *">
                <input type="number" style={inputStyle} placeholder="e.g. 3"
                    value={form.quantity} onChange={(e) => set('quantity', e.target.value)}
                    onFocus={focus} onBlur={blur} />
            </FormField>

            <div style={S.amountBox}>
                <span style={{ color: '#8b949e', fontSize: 13 }}>Total Amount</span>
                <span style={{ color: 'var(--accent)', fontSize: 22, fontWeight: 800 }}>
                    {total ? formatCurrency(total) : 'Ksh. 0.00'}
                </span>
            </div>

            <div style={S.actions}>
                <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit}
                    disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving...' : 'Record Purchase'}
                </button>
            </div>
        </Modal>
    );
}

const S: Record<string, React.CSSProperties> = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    err: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 18 },
    amountBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(45, 212, 191, 0.06)', border: '1px solid rgba(45, 212, 191, 0.12)', borderRadius: 12, marginBottom: 8 },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' },
    cancelBtn: { padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#8b949e', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' },
};