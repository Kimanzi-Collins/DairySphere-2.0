import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Building2, MapPin, FileText, Activity, Phone, Search, Plus, Edit3, Trash2, Pencil } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import FactoryForm from '../components/forms/FactoryForm';
import { fileToDataUrl, getEntityProfilePic, setEntityProfilePic } from '../utils/entityProfilePics';
import '../styles/Factories.css';

const API = 'http://localhost:3001/api';

interface Factory { FactoryId: string; FactoryName: string; Location: string; Contact: string; }

interface Delivery {
  DeliveryId: string;
  MilkQuantity: number;
  Amount: number;
}

const Factories = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editFactory, setEditFactory] = useState<Factory | null>(null);
  const [uploadFactory, setUploadFactory] = useState<Factory | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animated = useRef(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await fetch(`${API}/factories`);
      const data = await res.json();
      setFactories(Array.isArray(data) ? data : data.recordset ?? []);

      const deliveriesRes = await fetch(`${API}/deliveries`);
      if (deliveriesRes.ok) {
        const deliveriesData = await deliveriesRes.json();
        setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : deliveriesData.recordset ?? []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (loading || animated.current) return;
    animated.current = true;
    setTimeout(() => {
      gsap.fromTo('.factories-stats .stat-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo('.factories-location-header', { x: -30, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.2 });
      gsap.fromTo('.factory-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power3.out', delay: 0.3 });
    }, 50);
  }, [loading]);

  const filtered = factories.filter(f =>
    f.FactoryName?.toLowerCase().includes(search.toLowerCase()) ||
    f.FactoryId?.toLowerCase().includes(search.toLowerCase()) ||
    f.Location?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, f) => { const loc = f.Location || 'Unknown'; if (!acc[loc]) acc[loc] = []; acc[loc].push(f); return acc; }, {} as Record<string, Factory[]>);
  const locations = Object.keys(grouped).sort();
  const uniqueLocs = [...new Set(factories.map(f => f.Location))].length;
  const totalDeliveries = deliveries.length;
  const totalLitres = deliveries.reduce((sum, delivery) => sum + Number(delivery.MilkQuantity || 0), 0);
  const totalAmount = deliveries.reduce((sum, delivery) => sum + Number(delivery.Amount || 0), 0);

  const formatCurrency = (value: number) =>
    `Ksh. ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getInitials = (n: string) => n?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
  const getColor = (id: string) => { const c = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']; return c[id.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0) % c.length]; };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete factory "${name}"?`)) return;
    try { await fetch(`${API}/factories/${id}`, { method: 'DELETE' }); load(); } catch (err: any) { alert(err.message); }
  };

  const handleEditPic = (factory: Factory) => {
    setUploadFactory(factory);
    fileInputRef.current?.click();
  };

  const handleFactoryPicSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadFactory) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setEntityProfilePic('factories', uploadFactory.FactoryId, dataUrl);
      setAvatarVersion((v) => v + 1);
    } catch (err) {
      console.error('Factory picture update failed', err);
    } finally {
      event.target.value = '';
      setUploadFactory(null);
    }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading factories...</p></div>;

  return (
    <div className="factories-page">
      <div className="factories-page-header">
        <h1 className="page-title">Factories Management</h1>
        <p className="page-date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="factories-stats">
        <StatCard icon={Building2} title="TOTAL FACTORIES" value={factories.length} subtitle={`${uniqueLocs} location${uniqueLocs !== 1 ? 's' : ''}`} color="#3b82f6" />
        <StatCard icon={MapPin} title="LOCATIONS" value={uniqueLocs} subtitle="factory locations" color="#8b5cf6" />
        <StatCard icon={FileText} title="DELIVERIES" value={totalDeliveries} subtitle={`${totalLitres.toLocaleString('en-KE', { maximumFractionDigits: 2 })} L`} color="#10b981" />
        <StatCard icon={Activity} title="TOTAL AMOUNT" value={formatCurrency(totalAmount)} subtitle="across all factories" color="#f59e0b" />
      </div>

      <div className="factories-search-section">
        <div className="search-bar"><Search size={18} className="search-icon" /><input type="text" placeholder="Search by name, ID, or location..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
        <button onClick={() => { setEditFactory(null); setFormOpen(true); }} className="add-btn blue"><Plus size={18} /> Add Factory</button>
      </div>

      {filtered.length === 0 && <div className="empty-state"><Building2 size={48} /><h3>{search ? 'No factories match' : 'No factories registered yet'}</h3><p>{search ? 'Try a different term' : 'Click "Add Factory" to get started'}</p></div>}

      {locations.map(loc => (
        <div key={loc} className="factories-location-group">
          <div className="factories-location-header"><span className="location-dot blue" /><MapPin size={16} className="location-pin-icon" /><h3 className="location-name">{loc}</h3><span className="location-count">{grouped[loc].length} factor{grouped[loc].length !== 1 ? 'ies' : 'y'}</span></div>
          <div className="factories-cards-grid">
            {grouped[loc].map(f => (
              <div key={f.FactoryId} className="factory-card">
                <div className="factory-card-header">
                  <div className="factory-card-identity">
                    {getEntityProfilePic('factories', f.FactoryId) ? (
                      <img
                        key={`${f.FactoryId}-${avatarVersion}`}
                        src={getEntityProfilePic('factories', f.FactoryId) || ''}
                        alt={f.FactoryName}
                        className="factory-avatar"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="factory-avatar" style={{ background: getColor(f.FactoryId) }}>{getInitials(f.FactoryName)}</div>
                    )}
                    <div><h4 className="factory-name">{f.FactoryName}</h4><span className="factory-id">{f.FactoryId}</span></div>
                  </div>
                  <div className="factory-card-actions">
                    <button className="action-btn edit" onClick={() => handleEditPic(f)} title="Edit profile picture"><Pencil size={15} /></button>
                    <button className="action-btn edit" title="Edit factory" onClick={() => { setEditFactory(f); setFormOpen(true); }}><Edit3 size={15} /></button>
                    <button className="action-btn delete" title="Delete factory" onClick={() => handleDelete(f.FactoryId, f.FactoryName)}><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="factory-card-details">
                  <div className="detail-row"><Phone size={14} /><span>{f.Contact}</span></div>
                  <div className="detail-row"><MapPin size={14} /><span>{f.Location}</span></div>
                </div>
                <button className="view-profile-btn blue" onClick={() => navigate(`/factories/${f.FactoryId}`)}>View Profile →</button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden-upload-input"
        onChange={handleFactoryPicSelected}
      />

      <Modal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditFactory(null); }} title={editFactory ? 'Edit Factory' : 'Add New Factory'}>
        <FactoryForm mode={editFactory ? 'edit' : 'add'} initialData={editFactory} onSuccess={() => { load(); setFormOpen(false); setEditFactory(null); }} onClose={() => { setFormOpen(false); setEditFactory(null); }} />
      </Modal>
    </div>
  );
};

export default Factories;