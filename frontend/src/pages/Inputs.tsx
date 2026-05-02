import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Package, DollarSign, TrendingUp, TrendingDown, Search, Plus, Edit3, Trash2 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import InputForm from '../components/forms/InputForm';
import '../styles/Inputs.css';

const API = 'http://localhost:3001/api';

interface Input { InputId: string; InputName: string; InputPrice: number; }

const Inputs = () => {
  const [inputs, setInputs] = useState<Input[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editInput, setEditInput] = useState<Input | null>(null);
  const animated = useRef(false);

  const load = async () => {
    try { const res = await fetch(`${API}/inputs`); const data = await res.json(); setInputs(Array.isArray(data) ? data : data.recordset ?? []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (loading || animated.current) return;
    animated.current = true;
    setTimeout(() => {
      gsap.fromTo('.inputs-stats .stat-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo('.input-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power3.out', delay: 0.3 });
    }, 50);
  }, [loading]);

  const filtered = inputs.filter(i => i.InputName?.toLowerCase().includes(search.toLowerCase()) || i.InputId?.toLowerCase().includes(search.toLowerCase()));
  const fmt = (p: number) => `Ksh. ${Number(p).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const avg = inputs.length ? inputs.reduce((s, i) => s + Number(i.InputPrice), 0) / inputs.length : 0;
  const max = inputs.length ? Math.max(...inputs.map(i => Number(i.InputPrice))) : 0;
  const min = inputs.length ? Math.min(...inputs.map(i => Number(i.InputPrice))) : 0;

  const getColor = (id: string) => { const c = ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']; return c[id.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0) % c.length]; };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete input "${name}"?`)) return;
    try { await fetch(`${API}/inputs/${id}`, { method: 'DELETE' }); load(); } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading inputs...</p></div>;

  return (
    <div className="inputs-page">
      <div className="inputs-page-header"><h1 className="page-title">Inputs Management</h1><p className="page-date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p></div>

      <div className="inputs-stats">
        <StatCard icon={Package} title="TOTAL INPUTS" value={inputs.length} subtitle="registered items" color="#10b981" />
        <StatCard icon={DollarSign} title="AVG PRICE" value={inputs.length ? fmt(avg) : '—'} subtitle="per unit" color="#8b5cf6" />
        <StatCard icon={TrendingUp} title="HIGHEST" value={inputs.length ? fmt(max) : '—'} subtitle="most expensive" color="#f59e0b" />
        <StatCard icon={TrendingDown} title="LOWEST" value={inputs.length ? fmt(min) : '—'} subtitle="least expensive" color="#3b82f6" />
      </div>

      <div className="inputs-search-section">
        <div className="search-bar"><Search size={18} className="search-icon" /><input type="text" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
        <button onClick={() => { setEditInput(null); setFormOpen(true); }} className="add-btn green"><Plus size={18} /> Add Input</button>
      </div>

      {filtered.length === 0 && <div className="empty-state"><Package size={48} /><h3>{search ? 'No inputs match' : 'No inputs registered yet'}</h3><p>{search ? 'Try a different term' : 'Click "Add Input" to get started'}</p></div>}

      <div className="inputs-cards-grid">
        {filtered.map(input => (
          <div key={input.InputId} className="input-card">
            <div className="input-card-header">
              <div className="input-card-identity">
                <div className="input-icon-box" style={{ background: getColor(input.InputId) }}><Package size={20} color="#fff" /></div>
                <div><h4 className="input-name">{input.InputName}</h4><span className="input-id">{input.InputId}</span></div>
              </div>
              <div className="input-card-actions">
                <button type="button" className="action-btn edit" onClick={() => { setEditInput(input); setFormOpen(true); }}><Edit3 size={15} /></button>
                <button type="button" className="action-btn delete" onClick={() => handleDelete(input.InputId, input.InputName)}><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="input-price-display"><span className="input-price-label">UNIT PRICE</span><span className="input-price-value">{fmt(input.InputPrice)}</span></div>
          </div>
        ))}
      </div>

      <Modal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditInput(null); }} title={editInput ? 'Edit Input' : 'Add New Input'}>
        <InputForm mode={editInput ? 'edit' : 'add'} initialData={editInput} onSuccess={() => { load(); setFormOpen(false); setEditInput(null); }} onClose={() => { setFormOpen(false); setEditInput(null); }} />
      </Modal>
    </div>
  );
};

export default Inputs;