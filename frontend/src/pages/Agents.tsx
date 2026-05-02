import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Users, MapPin, DollarSign, Briefcase, Phone, Search, UserPlus, Edit3, Trash2, Pencil } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import AgentForm from '../components/forms/AgentForm';
import { fileToDataUrl, getEntityProfilePic, setEntityProfilePic } from '../utils/entityProfilePics';
import '../styles/Agents.css';

const API = 'http://localhost:3001/api';

interface Agent {
  AgentId: string;
  AgentName: string;
  Contact: string;
  Location: string;
}

interface Sale {
  SaleId: string;
  AgentId: string;
  SaleAmount: number;
  Commission: number;
}

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [uploadAgent, setUploadAgent] = useState<Agent | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [sales, setSales] = useState<Sale[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animated = useRef(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await fetch(`${API}/agents`);
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : data.recordset ?? []);

      const salesRes = await fetch(`${API}/sales`);
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSales(Array.isArray(salesData) ? salesData : salesData.recordset ?? []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ──────── GSAP (matches FarmersList pattern) ────────
  useEffect(() => {
    if (loading || animated.current) return;
    animated.current = true;

    setTimeout(() => {
      gsap.fromTo('.agents-stats .stat-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out' }
      );
      gsap.fromTo('.agents-location-header',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out', delay: 0.2 }
      );
      gsap.fromTo('.agent-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power3.out', delay: 0.3 }
      );
    }, 50);
  }, [loading]);

  // ──────── FILTER / GROUP ────────
  const filtered = agents.filter(a =>
    a.AgentName?.toLowerCase().includes(search.toLowerCase()) ||
    a.AgentId?.toLowerCase().includes(search.toLowerCase()) ||
    a.Location?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, a) => {
    const loc = a.Location || 'Unknown';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(a);
    return acc;
  }, {} as Record<string, Agent[]>);

  const locations = Object.keys(grouped).sort();
  const uniqueLocations = [...new Set(agents.map(a => a.Location))].length;
  const totalCommission = sales.reduce((sum, sale) => sum + Number(sale.Commission || 0), 0);
  const totalSalesAmount = sales.reduce((sum, sale) => sum + Number(sale.SaleAmount || 0), 0);
  const totalSalesCount = sales.length;

  const formatCurrency = (value: number) =>
    `Ksh. ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getInitials = (n: string) => n?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
  const getColor = (id: string) => {
    const c = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
    return c[id.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0) % c.length];
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete agent "${name}"?`)) return;
    try {
      await fetch(`${API}/agents/${id}`, { method: 'DELETE' });
      load();
    } catch (err: any) { alert(err.message); }
  };

  const handleEditPic = (agent: Agent) => {
    setUploadAgent(agent);
    fileInputRef.current?.click();
  };

  const handleAgentPicSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadAgent) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setEntityProfilePic('agents', uploadAgent.AgentId, dataUrl);
      setAvatarVersion((v) => v + 1);
    } catch (err) {
      console.error('Agent picture update failed', err);
    } finally {
      event.target.value = '';
      setUploadAgent(null);
    }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading agents...</p></div>;

  return (
    <div className="agents-page">
      <div className="agents-page-header">
        <h1 className="page-title">Agents Management</h1>
        <p className="page-date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="agents-stats">
        <StatCard icon={Users} title="TOTAL AGENTS" value={agents.length} subtitle={`${uniqueLocations} location${uniqueLocations !== 1 ? 's' : ''}`} color="#8b5cf6" />
        <StatCard icon={MapPin} title="LOCATIONS" value={uniqueLocations} subtitle="coverage areas" color="#3b82f6" />
        <StatCard icon={DollarSign} title="TOTAL COMMISSION" value={formatCurrency(totalCommission)} subtitle={`${totalSalesCount} sales`} color="#10b981" />
        <StatCard icon={Briefcase} title="TOTAL SALES" value={formatCurrency(totalSalesAmount)} subtitle="across all agents" color="#f59e0b" />
      </div>

      <div className="agents-search-section">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search by name, ID, or location..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
        </div>
        <button onClick={() => { setEditAgent(null); setFormOpen(true); }} className="add-btn purple">
          <UserPlus size={18} /> Add Agent
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Users size={48} />
          <h3>{search ? 'No agents match your search' : 'No agents registered yet'}</h3>
          <p>{search ? 'Try a different search term' : 'Click "Add Agent" to get started'}</p>
        </div>
      )}

      {locations.map(loc => (
        <div key={loc} className="agents-location-group">
          <div className="agents-location-header">
            <span className="location-dot" />
            <MapPin size={16} className="location-pin-icon" />
            <h3 className="location-name">{loc}</h3>
            <span className="location-count">{grouped[loc].length} agent{grouped[loc].length !== 1 ? 's' : ''}</span>
          </div>
          <div className="agents-cards-grid">
            {grouped[loc].map(agent => (
              <div key={agent.AgentId} className="agent-card">
                <div className="agent-card-header">
                  <div className="agent-card-identity">
                    {getEntityProfilePic('agents', agent.AgentId) ? (
                      <img
                        key={`${agent.AgentId}-${avatarVersion}`}
                        src={getEntityProfilePic('agents', agent.AgentId) || ''}
                        alt={agent.AgentName}
                        className="agent-avatar"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="agent-avatar" style={{ background: getColor(agent.AgentId) }}>{getInitials(agent.AgentName)}</div>
                    )}
                    <div><h4 className="agent-name">{agent.AgentName}</h4><span className="agent-id">{agent.AgentId}</span></div>
                  </div>
                  <div className="agent-card-actions">
                    <button type="button" title="Edit profile picture" className="action-btn edit" onClick={() => handleEditPic(agent)}><Pencil size={15} /></button>
                    <button type="button" title="Edit agent" className="action-btn edit" onClick={() => { setEditAgent(agent); setFormOpen(true); }}><Edit3 size={15} /></button>
                    <button type="button" title="Delete agent" className="action-btn delete" onClick={() => handleDelete(agent.AgentId, agent.AgentName)}><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="agent-card-details">
                  <div className="detail-row"><Phone size={14} /><span>{agent.Contact}</span></div>
                  <div className="detail-row"><MapPin size={14} /><span>{agent.Location}</span></div>
                </div>
                <button className="view-profile-btn purple" onClick={() => navigate(`/agents/${agent.AgentId}`)}>View Profile →</button>
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
        onChange={handleAgentPicSelected}
      />

      <Modal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditAgent(null); }} title={editAgent ? 'Edit Agent' : 'Add New Agent'}>
        <AgentForm mode={editAgent ? 'edit' : 'add'} initialData={editAgent} onSuccess={() => { load(); setFormOpen(false); setEditAgent(null); }} onClose={() => { setFormOpen(false); setEditAgent(null); }} />
      </Modal>
    </div>
  );
};

export default Agents;