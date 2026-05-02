import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Layers, TrendingUp, TrendingDown, BarChart3, Edit3 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import '../styles/MilkQuality.css';

const API = 'http://localhost:3001/api';

interface Grade { QualityId: string; Grade: string; PricePerLitre: number; }

const gradeColors: Record<string, string> = { AA: '#f59e0b', A: '#10b981', B: '#3b82f6' };
const gradeLabels: Record<string, string> = { AA: 'Premium Grade', A: 'Standard Grade', B: 'Basic Grade' };

const MilkQuality = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editGrade, setEditGrade] = useState<Grade | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const animated = useRef(false);

  const load = async () => {
    try {
      const res = await fetch(`${API}/milk-quality`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.recordset ?? [];
      list.sort((a: Grade, b: Grade) => { const o: Record<string, number> = { AA: 0, A: 1, B: 2 }; return (o[a.Grade] ?? 9) - (o[b.Grade] ?? 9); });
      setGrades(list);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (loading || animated.current) return;
    animated.current = true;
    setTimeout(() => {
      gsap.fromTo('.mq-stats .stat-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo('.grade-card', { y: 50, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, stagger: 0.15, duration: 0.6, ease: 'power3.out', delay: 0.3 });
    }, 50);
  }, [loading]);

  const handleSave = async () => {
    if (!editGrade) return;
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API}/milk-quality/${editGrade.QualityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: editGrade.Grade, pricePerLitre: Number(editPrice) })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
      load(); setShowModal(false); setEditGrade(null);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const fmt = (p: number) => `Ksh. ${Number(p).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const highest = grades.length ? Math.max(...grades.map(g => Number(g.PricePerLitre))) : 0;
  const lowest = grades.length ? Math.min(...grades.map(g => Number(g.PricePerLitre))) : 0;
  const avgRate = grades.length ? grades.reduce((s, g) => s + Number(g.PricePerLitre), 0) / grades.length : 0;

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading grades...</p></div>;

  return (
    <div className="mq-page">
      <div className="mq-page-header"><h1 className="page-title">Milk Quality Grades</h1><p className="page-date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p></div>

      <div className="mq-stats">
        <StatCard icon={Layers} title="GRADES" value={grades.length} subtitle="quality tiers" color="#8b5cf6" />
        <StatCard icon={TrendingUp} title="HIGHEST RATE" value={grades.length ? fmt(highest) : '—'} subtitle="per litre" color="#f59e0b" />
        <StatCard icon={TrendingDown} title="LOWEST RATE" value={grades.length ? fmt(lowest) : '—'} subtitle="per litre" color="#3b82f6" />
        <StatCard icon={BarChart3} title="AVG RATE" value={grades.length ? fmt(avgRate) : '—'} subtitle="per litre" color="#10b981" />
      </div>

      <div className="mq-grades-grid">
        {grades.map(grade => (
          <div key={grade.QualityId} className="grade-card" style={{ borderTopColor: gradeColors[grade.Grade] || '#8b5cf6' }}>
            <div className="grade-badge" style={{ background: gradeColors[grade.Grade] || '#8b5cf6' }}>{grade.Grade}</div>
            <div className="grade-info"><span className="grade-label">{gradeLabels[grade.Grade] || grade.Grade}</span><span className="grade-id">{grade.QualityId}</span></div>
            <div className="grade-price-section"><span className="grade-price-label">PRICE PER LITRE</span><span className="grade-price-value" style={{ color: gradeColors[grade.Grade] }}>{fmt(grade.PricePerLitre)}</span></div>
            <button className="grade-edit-btn" onClick={() => { setEditGrade(grade); setEditPrice(String(grade.PricePerLitre)); setError(''); setShowModal(true); }} style={{ borderColor: `${gradeColors[grade.Grade]}40`, color: gradeColors[grade.Grade] }}>
              <Edit3 size={14} /> Edit Price
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditGrade(null); }} title={`Update ${editGrade?.Grade} Grade Price`}>
        <div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-group"><label className="form-label">PRICE PER LITRE (Ksh.) *</label><input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="form-input" step="0.01" min="0.01" required /></div>
          <div className="form-actions"><button type="button" onClick={() => { setShowModal(false); setEditGrade(null); }} className="btn-cancel">Cancel</button><button onClick={handleSave} disabled={saving} className="btn-submit">{saving ? 'Saving...' : 'Update Price'}</button></div>
        </div>
      </Modal>
    </div>
  );
};

export default MilkQuality;