'use client';

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function UserSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user, refreshUser, logout } = useUser();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'account'>('profile');

    // Profile States
    const [username, setUsername] = useState(user?.username || '');
    const [color, setColor] = useState(user?.color || '#ffffff');
    const [profilePic, setProfilePic] = useState(user?.profilePic || '');
    const [status, setStatus] = useState('');

    // Security States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');


    if (!isOpen || !user) return null;

    const handleUpdateProfile = async () => {
        try {
            const res = await fetch('/api/user/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ color, profilePic })
            });
            if (res.ok) {
                setStatus('Profile updated!');
                refreshUser();
            }
        } catch (e) {
            setStatus('Update failed.');
        }
    };

    const handleChangePassword = async () => {
        try {
            const res = await fetch('/api/user/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('Password updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
            } else {
                setStatus(data.error);
            }
        } catch (e) {
            setStatus('Error changing password');
        }
    };



    const handleChangeUsername = async () => {
        try {
            const res = await fetch('/api/user/username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newUsername: username })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('Username updated successfully!');
                refreshUser();
            } else {
                setStatus(data.error || 'Failed to change username');
            }
        } catch (e) {
            setStatus('Error connecting to server');
        }
    };

    const handleAccountAction = async (action: string) => {
        if (!confirm(`Are you sure you want to ${action} your account?`)) return;
        try {
            const res = await fetch('/api/user/account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                logout();
                onClose();
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert('Action failed.');
        }
    };

    // ... handleAccountAction remains same ...

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.8)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{
                width: '600px', height: '550px',
                background: '#0d1117', border: '1px solid #30363d',
                borderRadius: '16px', display: 'flex', overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
                {/* Sidebar */}
                <div style={{ width: '180px', background: '#161b22', borderRight: '1px solid #30363d', padding: '20px 0' }}>
                    <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #30363d', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '0.9rem' }}>Settings</h3>
                    </div>
                    {['profile', 'security', 'account'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            style={{
                                width: '100%', padding: '12px 20px', textAlign: 'left',
                                background: activeTab === tab ? '#21262d' : 'transparent',
                                border: 'none', color: activeTab === tab ? '#53FC18' : '#888',
                                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold',
                                textTransform: 'capitalize',
                                borderLeft: activeTab === tab ? '4px solid #53FC18' : '4px solid transparent'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                    <button onClick={onClose} style={{ width: '100%', padding: '15px', color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: 'auto', textAlign: 'left', paddingLeft: '20px', fontSize: '0.8rem' }}>
                        Close
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                    {status && <div style={{ background: '#1a331a', color: '#53FC18', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.8rem', border: '1px solid #53FC1844' }}>{status}</div>}

                    {activeTab === 'profile' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '8px' }}>USERNAME</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '10px', borderRadius: '6px' }}
                                    />
                                    <button onClick={handleChangeUsername} style={{ padding: '0 15px', background: '#21262d', border: '1px solid #30363d', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Change</button>
                                </div>
                                <span style={{ fontSize: '0.65rem', color: '#555' }}>You can change your username once every 14 days.</span>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '8px' }}>PROFILE PICTURE URL</label>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#0b0e0f', border: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {profilePic ? <img src={profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                                    </div>
                                    <input
                                        type="text"
                                        value={profilePic}
                                        onChange={e => setProfilePic(e.target.value)}
                                        placeholder="https://example.com/image.png"
                                        style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '10px', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '8px' }}>NAME COLOR</label>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={e => setColor(e.target.value)}
                                        style={{ width: '50px', height: '50px', background: 'none', border: 'none', cursor: 'pointer' }}
                                    />
                                    <span style={{ color: color, fontWeight: 'bold' }}>{user.username} Preview</span>
                                </div>
                            </div>

                            <button onClick={handleUpdateProfile} style={{ marginTop: '10px', padding: '12px', background: '#53FC18', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>
                                SAVE CHANGES
                            </button>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ background: '#161b22', padding: '20px', borderRadius: '12px', border: '1px solid #30363d' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Two-Factor Authentication</h4>
                                <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1.4' }}>Two-factor authentication is currently disabled for your account.</p>
                            </div>
                            <div style={{ background: '#161b22', padding: '20px', borderRadius: '12px', border: '1px solid #30363d' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Change Password</h4>
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '6px', marginBottom: '10px' }}
                                />
                                <button onClick={handleChangePassword} style={{ padding: '10px 20px', background: '#21262d', border: '1px solid #30363d', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ background: 'rgba(255,68,68,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,68,68,0.2)' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#ff4444' }}>Disable Account</h4>
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>Temporarily hide your profile and activity. You can reactivate at any time.</p>
                                <button onClick={() => handleAccountAction('disable')} style={{ marginTop: '15px', padding: '10px 20px', background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '6px', cursor: 'pointer' }}>
                                    Disable Account
                                </button>
                            </div>
                            <div style={{ background: 'rgba(255,68,68,0.1)', padding: '20px', borderRadius: '12px', border: '1px solid #ff4444' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#ff4444' }}>Delete Account</h4>
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>Once you start the deletion process, you will have 30 days to log back in and cancel it. After 30 days, your data will be permanently removed.</p>
                                <button onClick={() => handleAccountAction('requestDeletion')} style={{ marginTop: '15px', padding: '10px 20px', background: '#ff4444', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Request Deletion
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
