'use client';

import React, { useState, useEffect } from 'react';

interface ChatMessage {
    id: string;
    user: string;
    text: string;
    timestamp: number;
    color: string;
    badge?: string;
}

interface UserCardProps {
    username: string;
    currentMessages: ChatMessage[];
    onClose: () => void;
}

export default function UserCard({ username, currentMessages, onClose }: UserCardProps) {
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        try {
            const db = JSON.parse(localStorage.getItem('ssb_users_db') || '{}');
            const user = db[username.toLowerCase()];
            if (user) {
                setUserData(user);
            } else {
                // Fallback for mock users or errors
                setUserData({ username, createdAt: Date.now(), color: '#fff' });
            }
        } catch (e) {
            console.error(e);
        }
    }, [username]);

    if (!userData) return null;

    const userMessages = currentMessages.filter(m => m.user === username).slice(-10).reverse(); // Last 10 messages

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s'
        }} onClick={onClose}>
            <div style={{
                background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
                border: `1px solid ${userData.color || '#53FC18'}`,
                borderRadius: '16px',
                padding: '0',
                width: '90%',
                maxWidth: '320px',
                boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 20px ${userData.color || '#53FC18'}20`,
                position: 'relative',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

                {/* Header Background Gradient */}
                <div style={{
                    height: '80px',
                    background: `linear-gradient(to bottom, ${(userData.color || '#53FC18')}33, transparent)`,
                    position: 'absolute', top: 0, left: 0, right: 0
                }} />

                {/* Close Button */}
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>×</button>

                {/* Content */}
                <div style={{ padding: '30px 20px', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '24px',
                            background: '#0b0e0f', margin: '0 auto 15px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `2px solid ${userData.color || '#53FC18'}`,
                            boxShadow: `0 0 15px ${(userData.color || '#53FC18')}44`,
                            overflow: 'hidden'
                        }}>
                            {userData.profilePic ? (
                                <img src={userData.profilePic} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : userData.badge ? (
                                <img src={userData.badge} alt="B" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontSize: '2.5rem' }}>👤</span>
                            )}
                        </div>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                            {userData.username || username}
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '5px', alignItems: 'center' }}>
                            {userData.role === 'admin' && <span style={{ background: '#FFD700', color: '#000', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>ADMIN</span>}
                            {userData.verified && <span title="Verified Account" style={{ color: '#00BFFF' }}>☑️</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            <span>Joined {new Date(userData.createdAt).toLocaleDateString()}</span>
                            <span>ID: {userData.id?.slice(-6).toUpperCase() || 'TEMP'}</span>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#53FC18', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Chatter</h4>
                        <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {userMessages.length > 0 ? userMessages.map(msg => (
                                <div key={msg.id} style={{ fontSize: '0.85rem', color: '#ddd', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', borderLeft: `2px solid ${userData.color || '#53FC18'}88` }}>
                                    <div style={{ fontSize: '0.65rem', color: '#555', marginBottom: '3px' }}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    {msg.text}
                                </div>
                            )) : (
                                <div style={{ color: '#555', fontStyle: 'italic', fontSize: '0.8rem', textAlign: 'center', padding: '10px' }}>Shadow silent... no recent transmissions detected.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
