'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function SettingsPage() {
    const { user, refreshUser, logout, isLoading } = useUser();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'account'>('profile');
    const [status, setStatus] = useState('');

    // Profile States
    const [username, setUsername] = useState('');
    const [color, setColor] = useState('#ffffff');
    const [profilePic, setProfilePic] = useState('');

    // Security States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');


    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
        if (user) {
            setUsername(user.username || '');
            setColor(user.color || '#ffffff');
            setProfilePic(user.profilePic || '');
        }
    }, [user, isLoading, router]);

    if (isLoading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading...</div>;
    if (!user) return null;

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
                router.push('/');
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert('Action failed.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0b0e0f', color: '#fff' }}>
            <Header />

            <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '30px', color: '#53FC18' }}>Settings</h1>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '250px 1fr',
                    gap: '40px',
                    background: '#0e0e10',
                    border: '1px solid #30363d',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    {/* Sidebar */}
                    <div style={{ background: '#18181b', padding: '20px 0', borderRight: '1px solid #30363d' }}>
                        {['profile', 'security', 'account'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                style={{
                                    width: '100%', padding: '15px 25px', textAlign: 'left',
                                    background: activeTab === tab ? 'rgba(83, 252, 24, 0.1)' : 'transparent',
                                    border: 'none', color: activeTab === tab ? '#53FC18' : '#adadb8',
                                    cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold',
                                    textTransform: 'capitalize',
                                    borderLeft: activeTab === tab ? '4px solid #53FC18' : '4px solid transparent',
                                    transition: '0.2s'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '40px' }}>
                        {status && (
                            <div style={{
                                background: 'rgba(83, 252, 24, 0.1)',
                                color: '#53FC18',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                marginBottom: '30px',
                                fontSize: '0.9rem',
                                border: '1px solid rgba(83, 252, 24, 0.3)'
                            }}>
                                {status}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#adadb8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Username</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            style={{ flex: 1, background: '#18181b', border: '1px solid #30363d', color: '#fff', padding: '12px', borderRadius: '6px', outline: 'none' }}
                                        />
                                        <button onClick={handleChangeUsername} style={{ padding: '0 20px', background: '#53FC18', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Change</button>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '8px' }}>You can change your username once every 14 days.</p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#adadb8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Profile Picture URL</label>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#0b0e0f', border: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {profilePic ? <img src={profilePic} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2rem' }}>👤</span>}
                                        </div>
                                        <input
                                            type="text"
                                            value={profilePic}
                                            onChange={e => setProfilePic(e.target.value)}
                                            placeholder="https://example.com/image.png"
                                            style={{ flex: 1, background: '#18181b', border: '1px solid #30363d', color: '#fff', padding: '12px', borderRadius: '6px', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#adadb8', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Name Color</label>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={e => setColor(e.target.value)}
                                            style={{ width: '60px', height: '60px', background: 'none', border: 'none', cursor: 'pointer' }}
                                        />
                                        <span style={{ color: color, fontWeight: 'bold', fontSize: '1.2rem' }}>{user.username}</span>
                                    </div>
                                </div>

                                <button onClick={handleUpdateProfile} style={{ marginTop: '20px', padding: '15px', background: '#53FC18', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', width: '200px' }}>
                                    SAVE CHANGES
                                </button>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div style={{ background: '#18181b', padding: '30px', borderRadius: '12px', border: '1px solid #30363d' }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '1.1rem' }}>Two-Factor Authentication</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#adadb8', lineHeight: '1.6' }}>Two-factor authentication is currently disabled for your account.</p>
                                </div>

                                <div style={{ background: '#18181b', padding: '30px', borderRadius: '12px', border: '1px solid #30363d' }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '1.1rem' }}>Change Password</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            style={{ width: '100%', padding: '12px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '6px', outline: 'none' }}
                                        />
                                        <button onClick={handleChangePassword} style={{ padding: '12px 25px', background: '#21262d', border: '1px solid #30363d', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-start' }}>
                                            Update Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div style={{ background: 'rgba(255, 68, 68, 0.05)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
                                    <h3 style={{ margin: '0 0 15px 0', color: '#ff4444', fontSize: '1.1rem' }}>Danger Zone</h3>
                                    <p style={{ color: '#adadb8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                        Disabling your account will hide your profile and activity. You can reactivate it anytime by contacting support.
                                        Deleting your account is permanent after 30 days.
                                    </p>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button
                                            onClick={() => handleAccountAction('disable')}
                                            style={{ padding: '12px 20px', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Disable Account
                                        </button>
                                        <button
                                            onClick={() => handleAccountAction('requestDeletion')}
                                            style={{ padding: '12px 20px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
