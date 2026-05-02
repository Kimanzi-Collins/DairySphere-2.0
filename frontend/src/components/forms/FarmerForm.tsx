import { useState, useEffect } from 'react';
import type { Farmer } from '../../types';
import { farmersAPI } from '../../api';
import Modal from '../common/Modal';
import FormField, { inputStyle, selectStyle } from '../common/FormField';

interface FarmerFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editFarmer?: Farmer | null;
}

export default function FarmerForm({ isOpen, onClose, onSaved, editFarmer }: FarmerFormProps) {
    const API_BASE = 'http://localhost:3001';
    const [form, setForm] = useState({
        farmerName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        location: '',
        contact: '',
    });
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editFarmer) {
            setForm({
                farmerName: editFarmer.FarmerName,
                dateOfBirth: editFarmer.DateOfBirth,
                gender: editFarmer.Gender,
                email: editFarmer.Email || '',
                location: editFarmer.Location,
                contact: editFarmer.Contact,
            });
            setPreviewUrl(editFarmer.ProfilePicUrl ? `${API_BASE}${editFarmer.ProfilePicUrl}` : '');
        } else {
            setForm({ farmerName: '', dateOfBirth: '', gender: '', email: '', location: '', contact: '' });
            setPreviewUrl('');
        }
        setProfilePicFile(null);
        setError('');
    }, [editFarmer, isOpen]);

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.farmerName || !form.dateOfBirth || !form.gender || !form.location || !form.contact) {
            setError('Please fill in all required fields');
            return;
        }

        setSaving(true);
        setError('');

        try {
            let farmerId = editFarmer?.FarmerId;

            if (editFarmer) {
                await farmersAPI.update(editFarmer.FarmerId, form);
            } else {
                const created = await farmersAPI.create(form) as { FarmerId?: string };
                farmerId = created?.FarmerId;
            }

            if (profilePicFile && farmerId) {
                await farmersAPI.uploadProfilePic(farmerId, profilePicFile);
            }

            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        setError('');
        setProfilePicFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editFarmer ? `Edit ${editFarmer.FarmerName}` : 'Add New Farmer'}
            width="560px"
        >
            {error && (
                <div style={S.errorBox}>{error}</div>
            )}

            <div style={S.grid}>
                <FormField label="Full Name *">
                    <input
                        style={inputStyle}
                        placeholder="e.g. John Kamau"
                        value={form.farmerName}
                        onChange={(e) => handleChange('farmerName', e.target.value)}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(139,124,246,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </FormField>

                <FormField label="Date of Birth *">
                    <input
                        type="date"
                        style={{ ...inputStyle, colorScheme: 'dark' }}
                        value={form.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(139,124,246,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </FormField>
            </div>

            <div style={S.grid}>
                <FormField label="Gender *">
                    <select
                        style={selectStyle}
                        value={form.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(139,124,246,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </FormField>

                <FormField label="Email">
                    <input
                        type="email"
                        style={inputStyle}
                        placeholder="email@example.com"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(139,124,246,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </FormField>
            </div>

            <div style={S.grid}>
                <FormField label="Location *">
                    <input
                        style={inputStyle}
                        placeholder="e.g. Nairobi"
                        value={form.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(139,124,246,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </FormField>

                <FormField label="Contact *">
                    <input
                        style={inputStyle}
                        placeholder="e.g. 0712345678"
                        value={form.contact}
                        onChange={(e) => handleChange('contact', e.target.value)}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(139,124,246,0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </FormField>
            </div>

            <div style={{ marginTop: 12 }}>
                <FormField label="Profile Picture">
                    <div style={S.picWrap}>
                        <div style={S.picPreviewWrap}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Profile preview" style={S.picPreview} />
                            ) : (
                                <div style={S.picPlaceholder}>No Image</div>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={S.fileInput}
                            />
                            <p style={S.fileHint}>Recommended: square image, max 5MB.</p>
                        </div>
                    </div>
                </FormField>
            </div>

            {/* Buttons */}
            <div style={S.actions}>
                <button style={S.cancelBtn} onClick={onClose}>Cancel</button>
                <button
                    className="btn-primary"
                    style={{ opacity: saving ? 0.7 : 1 }}
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : editFarmer ? 'Update Farmer' : 'Add Farmer'}
                </button>
            </div>
        </Modal>
    );
}

const S: Record<string, React.CSSProperties> = {
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    errorBox: {
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '13px',
        color: '#ef4444',
        marginBottom: '18px',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '8px',
        paddingTop: '18px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
    },
    cancelBtn: {
        padding: '10px 24px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#8b949e',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        transition: 'all 0.2s ease',
    },
    picWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '8px 0',
    },
    picPreviewWrap: {
        width: 74,
        height: 74,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    picPreview: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    picPlaceholder: {
        fontSize: 11,
        color: 'var(--text-faint)',
        fontWeight: 600,
    },
    fileInput: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        color: 'var(--text-normal)',
        fontSize: 12,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
    },
    fileHint: {
        marginTop: 8,
        fontSize: 11,
        color: 'var(--text-faint)',
    },
};