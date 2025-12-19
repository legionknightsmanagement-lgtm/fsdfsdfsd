'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from './AuthModal';
import UserCard from './UserCard';
import { useUser } from '../context/UserContext';
import UserSettingsModal from './UserSettingsModal';

interface ChatMessage {
    id: string;
    user: string;
    text: string;
    timestamp: number;
    color: string;
    badge?: string;
    isSystem?: boolean;
    isHype?: boolean;
}

interface HypeState {
    amount: number;
    active: boolean;
    endsAt: number;
}

interface GlobalChatProps {
    roomId?: string;
    embed?: boolean;
}

const BADGES = [
    { id: 'founder', name: 'SSB Founder', url: '/ssb_logo.png' },
    { id: 'vip', name: 'VIP', url: 'https://cdn-icons-png.flaticon.com/512/6941/6941697.png' },
    { id: 'verified', name: 'Verified', url: 'https://cdn-icons-png.flaticon.com/512/7595/7595571.png', restricted: true },
];

export default function GlobalChat({ roomId = 'global', embed = false }: GlobalChatProps) {
    const { user: currentUser, logout, refreshUser } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showAuth, setShowAuth] = useState(false);

    // Feature States
    const [showSettings, setShowSettings] = useState(false);
    const [showHypeMenu, setShowHypeMenu] = useState(false);
    const [viewingUser, setViewingUser] = useState<string | null>(null);
    const [hypeState, setHypeState] = useState<HypeState>({ amount: 0, active: false, endsAt: 0 });
    const [slowMode, setSlowMode] = useState(false);

    const isAdmin = currentUser?.isAdmin;

    const bottomRef = useRef<HTMLDivElement>(null);

    // Fetch Messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/chat?roomId=${roomId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (e) {
                console.error("Failed to fetch messages", e);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 2000); // Polling for now, will upgrade to Stream/Websocket in v2
        return () => clearInterval(interval);
    }, [roomId]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, showSettings, showHypeMenu]);

    const sendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || !currentUser) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            user: currentUser.username,
            text: inputValue.trim(),
            timestamp: Date.now(),
            color: currentUser.color || '#ffffff',
            badge: currentUser.badge || BADGES[0].url
        };

        // UI Optimistic Update
        const updated = [...messages, newMessage].slice(-50);
        setMessages(updated);

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, message: newMessage })
        }).catch(err => console.error("Error sending message:", err));

        setInputValue('');
    };

    return (
        <>
            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onLogin={refreshUser} />
            <UserSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

            {!isOpen && !embed && (
                <div onClick={() => setIsOpen(true)} style={{ position: 'fixed', bottom: '20px', right: '20px', width: '60px', height: '60px', background: '#14171a', border: '2px solid #53FC18', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 900, boxShadow: '0 5px 20px rgba(0,0,0,0.5)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="#53FC18" /></svg>
                </div>
            )}

            {!embed && (
                <div style={{ position: 'fixed', bottom: '90px', right: '20px', width: '350px', height: '500px', background: '#0b0e0f', border: '1px solid #333', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', zIndex: 900, display: 'flex', flexDirection: 'column', transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {viewingUser && <UserCard username={viewingUser} currentMessages={messages} onClose={() => setViewingUser(null)} />}
                        {hypeState.active && (
                            <div style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', padding: '8px', textAlign: 'center', color: 'black', fontWeight: 'bold', fontSize: '0.8rem', animation: 'pulse 1s infinite' }}>
                                🔥 HYPED BOUT KICKS ACTIVE! ({hypeState.amount}) 🔥
                            </div>
                        )}
                        <div style={{ padding: '15px', background: '#14171a', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hypeState.active ? '#FFD700' : '#53FC18', boxShadow: `0 0 10px ${hypeState.active ? '#FFD700' : '#53FC18'}` }}></div>
                                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>GLOBAL CHAT</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                        </div>
                        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div ref={scrollRef} style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {messages.map((msg) => (
                                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                            {msg.badge && !msg.isSystem && <img src={msg.badge} alt="B" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />}
                                            {!msg.isSystem && <span onClick={() => setViewingUser(msg.user)} style={{ color: msg.color, fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>{msg.user}</span>}
                                            <span style={{ color: '#444', fontSize: '0.65rem' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div style={{ color: msg.isSystem ? (msg.isHype ? 'black' : '#53FC18') : '#ddd', fontSize: '0.9rem', lineHeight: '1.4', background: msg.isSystem ? (msg.isHype ? '#FFD700' : 'rgba(83, 252, 24, 0.1)') : 'transparent', padding: msg.isSystem ? '5px 8px' : '0', borderRadius: '4px', borderLeft: msg.isSystem ? (msg.isHype ? '2px solid #FFA500' : '2px solid #53FC18') : 'none', fontWeight: msg.isHype ? 'bold' : 'normal' }}>{msg.text}</div>
                                    </div>
                                ))}
                                <div ref={bottomRef} />
                            </div>
                        </div>
                        {currentUser ? (
                            <form onSubmit={sendMessage} style={{ padding: '10px', background: '#14171a', borderTop: '1px solid #333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={`Chat as ${currentUser.username}...`} style={{ flex: 1, background: '#0b0e0f', border: '1px solid #333', borderRadius: '4px', padding: '8px', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
                                <a href="/settings" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Settings"><span style={{ color: '#53FC18' }}>⚙️</span></a>
                                <button type="submit" style={{ background: '#53FC18', color: 'black', borderRadius: '4px', padding: '8px 12px', fontWeight: 'bold' }}>➤</button>
                            </form>
                        ) : (
                            <div style={{ padding: '10px', background: '#14171a', borderTop: '1px solid #333', textAlign: 'center' }}>
                                <button onClick={() => setShowAuth(true)} style={{ width: '100%', padding: '10px', background: '#53FC18', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>🔒 Sign In</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {embed && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0b0e0f' }}>
                    {viewingUser && <UserCard username={viewingUser} currentMessages={messages} onClose={() => setViewingUser(null)} />}
                    {hypeState.active && (
                        <div style={{ background: 'linear-gradient(90deg, #FFD700, #FFA500)', padding: '8px', textAlign: 'center', color: 'black', fontWeight: 'bold', fontSize: '0.8rem', animation: 'pulse 1s infinite' }}>
                            🔥 HYPED BOUT KICKS ACTIVE! ({hypeState.amount}) 🔥
                        </div>
                    )}
                    <div style={{ padding: '15px', background: '#14171a', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hypeState.active ? '#FFD700' : '#53FC18', boxShadow: `0 0 10px ${hypeState.active ? '#FFD700' : '#53FC18'}` }}></div>
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>{roomId === 'global' ? 'GLOBAL' : 'ROOM'}</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div ref={scrollRef} style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {messages.map((msg) => (
                                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                        {msg.badge && !msg.isSystem && <img src={msg.badge} alt="B" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />}
                                        {!msg.isSystem && <span onClick={() => setViewingUser(msg.user)} style={{ color: msg.color, fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>{msg.user}</span>}
                                        <span style={{ color: '#444', fontSize: '0.65rem' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div style={{ color: msg.isSystem ? (msg.isHype ? 'black' : '#53FC18') : '#ddd', fontSize: '0.9rem', lineHeight: '1.4', background: msg.isSystem ? (msg.isHype ? '#FFD700' : 'rgba(83, 252, 24, 0.1)') : 'transparent', padding: msg.isSystem ? '5px 8px' : '0', borderRadius: '4px', borderLeft: msg.isSystem ? (msg.isHype ? '2px solid #FFA500' : '2px solid #53FC18') : 'none', fontWeight: msg.isHype ? 'bold' : 'normal' }}>{msg.text}</div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                    </div>
                    {currentUser ? (
                        <form onSubmit={sendMessage} style={{ padding: '10px', background: '#14171a', borderTop: '1px solid #333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={`Chat as ${currentUser.username}...`} style={{ flex: 1, background: '#0b0e0f', border: '1px solid #333', borderRadius: '4px', padding: '8px', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
                            <a href="/settings" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Settings"><span style={{ color: '#53FC18' }}>⚙️</span></a>
                            <button type="submit" style={{ background: '#53FC18', color: 'black', borderRadius: '4px', padding: '8px 12px', fontWeight: 'bold' }}>➤</button>
                        </form>
                    ) : (
                        <div style={{ padding: '10px', background: '#14171a', borderTop: '1px solid #333', textAlign: 'center' }}>
                            <button onClick={() => setShowAuth(true)} style={{ width: '100%', padding: '10px', background: '#53FC18', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>🔒 Sign In</button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
