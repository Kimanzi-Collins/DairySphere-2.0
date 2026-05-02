import { useState, useEffect } from 'react';
import type { Farmer, MilkQuality, Factory } from '../../types';
import { farmersAPI, milkQualityAPI, factoriesAPI, deliveriesAPI } from '../../api';
import Modal from '../common/Modal';
import FormField, { inputStyle, selectStyle } from '../common/FormField';

interface DeliveryFormProps {
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

export default function DeliveryForm({ isOpen, onClose, onSaved }: DeliveryFormProps) {
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [grades, setGrades] = useState<MilkQuality[]>([]);
    const [factories, setFactories] = useState<Factory[]>([]);
    const [form, setForm] = useState({
        farmerId: '', milkQuantity: '', qualityId: '',
        ratePerLitre: '', factoryId: '', deliveryDate: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                farmersAPI.getAll(),
                milkQualityAPI.getAll(),
                factoriesAPI.getAll(),
            ]).then(([f, g, fa]) => {
                setFarmers(f as Farmer[]);
                setGrades(g as MilkQuality[]);
                setFactories(fa as Factory[]);
            });
            setForm({ farmerId: '', milkQuantity: '', qualityId: '', ratePerLitre: '', factoryId: '', deliveryDate: '' });
            setError('');
        }
    }, [isOpen]);

    // Auto-fill rate when grade selected
    const handleGradeChange = (qualityId: string) => {
        const grade = grades.find(g => g.QualityId === qualityId);
        setForm(prev => ({
            ...prev,
            qualityId,
            ratePerLitre: grade ? String(grade.PricePerLitre) : '',
        }));
    };

    const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async () => {
        if (!form.farmerId || !form.milkQuantity || !form.qualityId || !form.ratePerLitre || !form.factoryId || !form.deliveryDate) {
            setError('Please fill in all fields');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await deliveriesAPI.create({
                farmerId: form.farmerId,
                milkQuantity: parseFloat(form.milkQuantity),
                qualityId: form.qualityId,
                ratePerLitre: parseFloat(form.ratePerLitre),
                factoryId: form.factoryId,
                deliveryDate: form.deliveryDate,
            });
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    const amount = form.milkQuantity && form.ratePerLitre
        ? (parseFloat(form.milkQuantity) * parseFloat(form.ratePerLitre)).toFixed(2)
        : '0.00';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Milk Delivery" width="580px">
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

                <FormField label="Delivery Date *">
                    <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }}
                        value={form.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)}
                        onFocus={focus} onBlur={blur} />
                </FormField>
            </div>

            <div style={S.grid}>
                <FormField label="Milk Quantity (Litres) *">
                    <input type="number" style={inputStyle} placeholder="e.g. 50"
                        value={form.milkQuantity} onChange={(e) => set('milkQuantity', e.target.value)}
                        onFocus={focus} onBlur={blur} />
                </FormField>

                <FormField label="Quality Grade *">
                    <select style={selectStyle} value={form.qualityId}
                        onChange={(e) => handleGradeChange(e.target.value)}
                        onFocus={focus} onBlur={blur}>
                        <option value="">Select grade</option>
                        {grades.map(g => (
                            <option key={g.QualityId} value={g.QualityId}>
                                Grade {g.Grade} — Ksh. {g.PricePerLitre}/L
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>

            <div style={S.grid}>
                <FormField label="Rate Per Litre (Auto-filled)">
                    <input type="number" style={{ ...inputStyle, opacity: 0.7 }}
                        value={form.ratePerLitre} readOnly placeholder="Select grade first" />
                </FormField>

                <FormField label="Factory *">
                    <select style={selectStyle} value={form.factoryId}
                        onChange={(e) => set('factoryId', e.target.value)}
                        onFocus={focus} onBlur={blur}>
                        <option value="">Select factory</option>
                        {factories.map(f => (
                            <option key={f.FactoryId} value={f.FactoryId}>
                                {f.FactoryName}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>

            {/* Amount Preview */}
            <div style={S.amountBox}>
                <span style={{ color: '#8b949e', fontSize: 13 }}>Total Amount</span>
                <span style={{ color: 'var(--secondary)', fontSize: 22, fontWeight: 800 }}>
                    Ksh. {parseFloat(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </span>
            </div>

            <div style={S.actions}>
                <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit}
                    disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving...' : 'Record Delivery'}
                </button>
            </div>
        </Modal>
    );
}

const S: Record<string, React.CSSProperties> = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    err: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 18 },
    amountBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(74, 222, 128, 0.06)', border: '1px solid rgba(74, 222, 128, 0.12)', borderRadius: 12, marginBottom: 8 },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' },
    cancelBtn: { padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#8b949e', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' },
};