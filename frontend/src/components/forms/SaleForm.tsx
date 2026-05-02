import { useState, useEffect } from 'react';
import type { Farmer, Agent } from '../../types';
import { farmersAPI, agentsAPI, salesAPI } from '../../api';
import Modal from '../common/Modal';
import FormField, { inputStyle, selectStyle } from '../common/FormField';
import { formatCurrency } from '../../utils/formatCurrency';

interface SaleFormProps {
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

export default function SaleForm({ isOpen, onClose, onSaved }: SaleFormProps) {
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [form, setForm] = useState({
        saleDate: '', agentId: '', farmerId: '', saleAmount: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            Promise.all([farmersAPI.getAll(), agentsAPI.getAll()])
                .then(([f, a]) => {
                    setFarmers(f as Farmer[]);
                    setAgents(a as Agent[]);
                });
            setForm({ saleDate: '', agentId: '', farmerId: '', saleAmount: '' });
            setError('');
        }
    }, [isOpen]);

    const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
    const commission = form.saleAmount ? parseFloat(form.saleAmount) * 0.05 : 0;

    const handleSubmit = async () => {
        if (!form.saleDate || !form.agentId || !form.farmerId || !form.saleAmount) {
            setError('Please fill in all fields');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await salesAPI.create({
                saleDate: form.saleDate,
                agentId: form.agentId,
                farmerId: form.farmerId,
                saleAmount: parseFloat(form.saleAmount),
            });
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Sale" width="520px">
            {error && <div style={S.err}>{error}</div>}

            <div style={S.grid}>
                <FormField label="Sale Date *">
                    <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }}
                        value={form.saleDate} onChange={(e) => set('saleDate', e.target.value)}
                        onFocus={focus} onBlur={blur} />
                </FormField>

                <FormField label="Agent *">
                    <select style={selectStyle} value={form.agentId}
                        onChange={(e) => set('agentId', e.target.value)}
                        onFocus={focus} onBlur={blur}>
                        <option value="">Select agent</option>
                        {agents.map(a => (
                            <option key={a.AgentId} value={a.AgentId}>
                                {a.AgentName} ({a.AgentId})
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>

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

                <FormField label="Sale Amount (Ksh) *">
                    <input type="number" style={inputStyle} placeholder="e.g. 25000"
                        value={form.saleAmount} onChange={(e) => set('saleAmount', e.target.value)}
                        onFocus={focus} onBlur={blur} />
                </FormField>
            </div>

            <div style={S.commBox}>
                <span style={{ color: '#8b949e', fontSize: 13 }}>Commission (5%)</span>
                <span style={{ color: '#eab308', fontSize: 18, fontWeight: 800 }}>
                    {commission ? formatCurrency(commission) : 'Ksh. 0.00'}
                </span>
            </div>

            <div style={S.actions}>
                <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit}
                    disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving...' : 'Record Sale'}
                </button>
            </div>
        </Modal>
    );
}

const S: Record<string, React.CSSProperties> = {
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    err: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444', marginBottom: 18 },
    commBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(234, 179, 8, 0.06)', border: '1px solid rgba(234, 179, 8, 0.12)', borderRadius: 12, marginBottom: 8 },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' },
    cancelBtn: { padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#8b949e', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' },
};