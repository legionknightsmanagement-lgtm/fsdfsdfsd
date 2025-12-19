'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

interface UserStats {
    totalTimeMs: number;
    watchHistory: Record<string, number>;
    lastActive: number;
}

interface UserProfile {
    uid: string;
    id?: string;
    username: string;
    verified?: boolean;
    banned?: { until: number; reason: string; } | null;
    role?: 'admin' | 'user';
    color?: string;
    badge?: string;
    points?: number;
}

interface AiLog {
    id: number;
    time: string;
    status: string;
    message: string;
    type: 'info' | 'warning' | 'error';
    timestamp: number;
}

export default function AdvancedAdminDashboard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user: currentUser } = useUser();
    const [stats, setStats] = useState<Record<string, UserStats>>({});
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [logs, setLogs] = useState<AiLog[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'chat' | 'system'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [banReason, setBanReason] = useState('Violation of Community Guidelines');
    const [banHours, setBanHours] = useState('24');
    const [chatLogs, setChatLogs] = useState<any[]>([]);
    const [chatRoom, setChatRoom] = useState('global');

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                // Fetch Users
                const usersRes = await fetch('/api/admin/users');
                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setUsers(usersData);
                }

                // Fetch Stats
                const statsRes = await fetch('/api/admin/stats');
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // Fetch Logs
                const logsRes = await fetch('/api/admin/logs');
                if (logsRes.ok) {
                    const logsData = await logsRes.json();
                    setLogs(logsData);
                }

                if (activeTab === 'chat') {
                    const chatRes = await fetch(`/api/admin/chat-logs?roomId=${chatRoom}&limit=100`);
                    if (chatRes.ok) {
                        const chatData = await chatRes.json();
                        setChatLogs(chatData);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch admin data", e);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [isOpen]);

    const performAction = async (action: string, targetUid: string, data?: any) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, targetUid, data })
            });
            if (res.ok) {
                // Log the action
                await fetch('/api/admin/logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: `Admin ${currentUser?.username} performed action [${action}] on user [${targetUid}]`,
                        type: action === 'ban' ? 'warning' : 'info'
                    })
                });

                // Refresh local state or re-fetch
                const usersRes = await fetch('/api/admin/users');
                const usersData = await usersRes.json();
                setUsers(usersData);
                if (selectedUser?.uid === targetUid || selectedUser?.id === targetUid) {
                    const updated = usersData.find((u: any) => u.uid === targetUid || u.id === targetUid);
                    setSelectedUser(updated);
                }
            } else {
                const err = await res.json();
                alert(err.error || "Action failed");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleBan = (uid: string) => {
        const userToBan = users.find(u => u.uid === uid);
        if (userToBan?.role === 'admin') {
            alert("Cannot ban another admin.");
            return;
        }
        const hours = banHours === 'perm' ? 876000 : parseInt(banHours); // approx 100 years
        performAction('ban', uid, {
            until: Date.now() + (hours * 3600000),
            reason: banReason
        });
    };

    const handleUnban = (uid: string) => {
        performAction('unban', uid);
    };

    const toggleVerify = (uid: string) => {
        const u = users.find(user => user.uid === uid);
        if (!u) return;
        const newVerified = !u.verified;
        performAction('verify', uid, {
            verified: newVerified,
            badge: newVerified ? 'https://cdn-icons-png.flaticon.com/512/7595/7595571.png' : null
        });
    };

    const toggleAdmin = (uid: string) => {
        const u = users.find(user => user.uid === uid);
        if (!u) return;
        const newRole = u.role === 'admin' ? 'user' : 'admin';
        performAction('toggleAdmin', uid, { role: newRole });
    };

    if (!isOpen) return null;

    const totalWatchTime = Object.values(stats).reduce((acc, curr) => acc + (curr.totalTimeMs || 0), 0);
    const activeResult = Object.values(stats).filter(u => Date.now() - u.lastActive < 300000);

    const fmtTime = (ms: number) => {
        if (!ms) return '0m';
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.uid || u.id)?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const targetId = selectedUser?.uid || selectedUser?.id;
    const selectedUserStats = targetId ? stats[targetId] || stats[selectedUser?.username?.toLowerCase() || ''] : null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: '#090a0b', zIndex: 20000,
            color: '#a0a0a0', fontFamily: 'monospace',
            display: 'flex', flexDirection: 'column'
        }}>
            {/* Top Bar */}
            <div style={{
                height: '60px', borderBottom: '1px solid #333',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 25px', background: '#050505'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 style={{ color: '#53FC18', margin: 0, letterSpacing: '2px' }}>SSB_ADMIN_CONSOLE_V3</h2>
                    <span style={{
                        background: '#1a331a', color: '#53FC18', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        animation: 'pulse 2s infinite'
                    }}>
                        ● CLOUD LINK ESTABLISHED
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem' }}>SYNC_INTERVAL: 5s</div>
                    <button onClick={onClose} style={{ background: '#333', border: 'none', color: 'white', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>EXIT TERMINAL</button>
                </div>
            </div>

            {/* Sidebar & Content Layout */}
            <div style={{ flex: 1, display: 'flex' }}>

                {/* Sidebar Navigation */}
                <div style={{ width: '250px', borderRight: '1px solid #333', background: '#0b0c0d', display: 'flex', flexDirection: 'column' }}>
                    {['overview', 'users', 'chat', 'system'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab as any); setSelectedUser(null); }}
                            style={{
                                padding: '20px', textAlign: 'left', background: activeTab === tab ? '#161b22' : 'transparent',
                                border: 'none', borderBottom: '1px solid #1a1a1a', color: activeTab === tab ? '#53FC18' : '#888',
                                cursor: 'pointer', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px',
                                borderLeft: activeTab === tab ? '4px solid #53FC18' : '4px solid transparent'
                            }}
                        >
                            &gt; {tab}
                        </button>
                    ))}
                </div>

                {/* Main View */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>

                    {activeTab === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            <Card title="TOTAL SITE TIME" value={fmtTime(totalWatchTime)} color="#53FC18" />
                            <Card title="ACTIVE USERS" value={activeResult.length.toString()} color="#00BFFF" />
                            <Card title="RECORDS_IN_CLOUD" value={users.length.toString()} color="#FFD700" />
                            <Card title="SYSTEM STATUS" value="STABLE" color="#53FC18" />

                            {/* AI Feed */}
                            <div style={{ gridColumn: '1 / -1', background: '#000', border: '1px solid #333', padding: '15px', fontFamily: 'monospace' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#888', fontSize: '0.9rem' }}>// LIVE_SYSTEM_LOGS_STREAM</h3>
                                <div style={{ height: '200px', overflowY: 'auto' }}>
                                    {logs.length > 0 ? logs.map(log => (
                                        <div key={log.timestamp} style={{ marginBottom: '4px', fontSize: '0.8rem', color: log.type === 'warning' ? '#FFA500' : (log.type === 'error' ? '#FF4444' : '#444') }}>
                                            <span style={{ color: '#666' }}>[{log.time}]</span> :: {log.message}
                                        </div>
                                    )) : <div style={{ color: '#333' }}>No logs yet...</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
                            {/* User List */}
                            <div style={{ flex: 1, overflowY: 'auto', borderRight: '1px solid #222', paddingRight: '10px' }}>
                                <input
                                    style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: 'white', marginBottom: '15px', outline: 'none' }}
                                    placeholder="Search by username or UID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {filteredUsers.map(u => (
                                    <div key={u.uid}
                                        onClick={() => setSelectedUser(u)}
                                        style={{
                                            padding: '12px', borderBottom: '1px solid #222', cursor: 'pointer',
                                            display: 'flex', justifyContent: 'space-between',
                                            background: selectedUser?.uid === u.uid ? '#161b22' : 'transparent',
                                            color: u.role === 'admin' ? '#FFD700' : 'white',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>{u.username}</span>
                                            {u.verified && <span title="Verified">☑️</span>}
                                            {u.banned && <span style={{ color: 'red', fontSize: '0.7rem' }}>[BANNED]</span>}
                                        </div>
                                        <span style={{ color: '#666', fontSize: '0.8rem' }}>{stats[u.uid] ? fmtTime(stats[u.uid].totalTimeMs) : '0m'}</span>
                                    </div>
                                ))}
                            </div>

                            {/* User Detail Panel */}
                            {selectedUser && (
                                <div style={{ flex: 1, background: '#111', border: '1px solid #333', padding: '20px', overflowY: 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #53FC18', paddingBottom: '10px' }}>
                                        <div>
                                            <h2 style={{ color: '#53FC18', margin: 0 }}>{selectedUser.username}</h2>
                                            <span style={{ fontSize: '0.7rem', color: '#666' }}>UID: {selectedUser.uid}</span>
                                        </div>
                                        {selectedUser.banned && (
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ background: '#FF4444', color: 'black', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>BANNED</span>
                                                <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '4px' }}>Until: {new Date(selectedUser.banned.until).toLocaleString()}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '20px 0' }}>
                                        <button onClick={() => toggleVerify(selectedUser.uid || selectedUser.id!)} style={{ padding: '10px', background: '#1f6feb', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                                            {selectedUser.verified ? 'REVOKE VERIFY' : 'GRANT VERIFY'}
                                        </button>
                                        {selectedUser.banned ? (
                                            <button onClick={() => handleUnban(selectedUser.uid || selectedUser.id!)} style={{ padding: '10px', background: '#2ea043', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>UNBAN USER</button>
                                        ) : (
                                            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '10px', background: '#222', padding: '15px', borderRadius: '4px' }}>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input
                                                        value={banReason}
                                                        onChange={e => setBanReason(e.target.value)}
                                                        placeholder="Ban Reason..."
                                                        style={{ flex: 2, background: '#000', border: '1px solid #444', color: 'white', padding: '8px' }}
                                                    />
                                                    <select
                                                        value={banHours}
                                                        onChange={e => setBanHours(e.target.value)}
                                                        style={{ flex: 1, background: '#000', border: '1px solid #444', color: 'white', padding: '8px' }}
                                                    >
                                                        <option value="1">1 Hour</option>
                                                        <option value="24">24 Hours</option>
                                                        <option value="168">7 Days</option>
                                                        <option value="720">30 Days</option>
                                                        <option value="perm">PERMANENT</option>
                                                    </select>
                                                </div>
                                                <button onClick={() => handleBan(selectedUser.uid || selectedUser.id!)} style={{ padding: '10px', background: '#FF4444', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>EXECUTE BAN</button>
                                            </div>
                                        )}
                                        {currentUser?.isAdmin && currentUser?.username.toLowerCase() === 'reese' && (
                                            <button onClick={() => toggleAdmin(selectedUser.uid || selectedUser.id!)} style={{ gridColumn: '1 / -1', padding: '10px', background: selectedUser.role === 'admin' ? '#333' : '#FFD700', border: '1px solid #FFD700', color: selectedUser.role === 'admin' ? 'white' : 'black', cursor: 'pointer', fontWeight: 'bold' }}>
                                                {selectedUser.role === 'admin' ? 'REVOKE ADMIN' : 'MAKE ADMIN'}
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ margin: '20px 0', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span>Role:</span>
                                            <strong style={{ color: selectedUser.role === 'admin' ? '#FFD700' : 'white' }}>{selectedUser.role?.toUpperCase() || 'USER'}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span>Balance:</span>
                                            <span style={{ color: '#53FC18' }}>{selectedUser.points?.toLocaleString() || 0} SSB</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span>Total Watchtime:</span>
                                            <span style={{ color: 'white' }}>{selectedUserStats ? fmtTime(selectedUserStats.totalTimeMs) : '0m'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Last Active:</span>
                                            <span style={{ color: 'white' }}>{selectedUserStats ? new Date(selectedUserStats.lastActive).toLocaleString() : 'N/A'}</span>
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '0.8rem', color: '#666', borderTop: '1px solid #222', paddingTop: '15px' }}>Watch History</h3>
                                    {selectedUserStats?.watchHistory && Object.entries(selectedUserStats.watchHistory).map(([streamer, time]) => (
                                        <div key={streamer} style={{ marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                                <span>{streamer}</span>
                                                <span>{fmtTime(time as number)}</span>
                                            </div>
                                            <div style={{ height: '3px', background: '#222', marginTop: '4px' }}>
                                                <div style={{ height: '100%', width: `${Math.min(100, ((time as number) / (selectedUserStats.totalTimeMs || 1)) * 100)}%`, background: '#00BFFF' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                    {!selectedUserStats?.watchHistory && <div style={{ color: '#333', fontSize: '0.8rem' }}>No history found.</div>}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#111', padding: '15px', border: '1px solid #333' }}>
                                <span style={{ color: '#888' }}>FILTER_ROOM:</span>
                                <select
                                    value={chatRoom}
                                    onChange={e => setChatRoom(e.target.value)}
                                    style={{ background: '#000', color: '#53FC18', border: '1px solid #333', padding: '5px' }}
                                >
                                    <option value="global">GLOBAL</option>
                                    <option value="versus">VERSUS</option>
                                </select>
                                <span style={{ color: '#888', marginLeft: '20px' }}>LOG_LEVEL: ALL_MESSAGES</span>
                            </div>
                            <div style={{ flex: 1, background: '#050505', border: '1px solid #333', padding: '20px', overflowY: 'auto', fontFamily: 'monospace' }}>
                                {chatLogs.map((msg, i) => (
                                    <div key={i} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #111', display: 'flex', gap: '10px' }}>
                                        <span style={{ color: '#444' }}>[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
                                        <span style={{ color: msg.color || '#fff', fontWeight: 'bold' }}>{msg.user}:</span>
                                        <span style={{ color: '#ddd' }}>{msg.text}</span>
                                    </div>
                                ))}
                                {chatLogs.length === 0 && <div style={{ color: '#333' }}>No chat history found.</div>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <h1 style={{ color: '#53FC18' }}>SYSTEM INTEGRITY: 100%</h1>
                            <p>Real-time sync active across Firestore and Realtime Database.</p>
                            <div style={{ background: '#000', padding: '20px', display: 'inline-block', border: '1px solid #333', marginTop: '20px' }}>
                                <p style={{ color: '#00BFFF' }}>NODE_STATUS: ONLINE</p>
                                <p style={{ color: '#FFD700' }}>DB_LATENCY: 12ms</p>
                                <p style={{ color: '#53FC18' }}>ADMIN_MODE: AUTHORIZED</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            <style jsx>{`
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            `}</style>
        </div>
    );
}

const Card = ({ title, value, color }: any) => (
    <div style={{ background: '#111', border: `1px solid #333`, padding: '20px', borderTop: `3px solid ${color}` }}>
        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontSize: '2rem', color: 'white' }}>{value}</div>
    </div>
);
