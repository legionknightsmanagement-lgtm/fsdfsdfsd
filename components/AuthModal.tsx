'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface User {
    username: string;
    id: string;
    createdAt: number;
    points: number;
    color?: string;
    badge?: string;
    verified?: boolean;
}

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (user: User) => void;
}

const BANNED_WORDS = ['admin', 'mod', 'system', 'root', 'fuck', 'shit', 'nigger', 'faggot', 'retard', 'cunt', 'dick', 'pussy'];

export const checkUsernameValidation = (username: string): { valid: boolean; error?: string } => {
    const lower = username.toLowerCase();
    if (lower.length < 3) return { valid: false, error: 'Username must be at least 3 characters.' };
    if (lower.length > 16) return { valid: false, error: 'Username must be under 16 characters.' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, error: 'Only letters, numbers, and underscores allowed.' };
    for (const word of BANNED_WORDS) {
        if (lower.includes(word)) return { valid: false, error: 'Username contains restricted content.' };
    }
    return { valid: true };
};

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('signup');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [needsReactivation, setNeedsReactivation] = useState(false);
    const [confirmReactivate, setConfirmReactivate] = useState(false);


    // Debounced username check
    useEffect(() => {
        if (mode !== 'signup' || username.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        const valid = checkUsernameValidation(username);
        if (!valid.valid) {
            setUsernameAvailable(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setCheckingUsername(true);
            try {
                const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
                const data = await res.json();
                setUsernameAvailable(data.available);
            } catch (err) {
                console.error(err);
            } finally {
                setCheckingUsername(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [username, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        setError(null);

        if (mode === 'signup') {
            const validation = checkUsernameValidation(username);
            if (!validation.valid) {
                setError(validation.error || 'Invalid username');
                return;
            }
            if (usernameAvailable === false) {
                setError('Username is already taken');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }
        }

        setIsLoading(true);
        try {
            const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Authentication failed');
                return;
            }

            if (data.needsReactivation) {
                setNeedsReactivation(true);
                return;
            }



            onLogin(data);
            onClose();
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onClose}>
            <div style={{
                background: '#0e0e10', // Twitch-like dark background
                border: '1px solid #303032',
                borderRadius: '8px',
                padding: '40px',
                width: '100%',
                maxWidth: '430px',
                boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img src="/ssb_logo.png" alt="Logo" style={{ height: '60px', marginBottom: '20px' }} />
                    <div style={{ display: 'flex', borderBottom: '2px solid #303032', marginBottom: '20px' }}>
                        <button
                            onClick={() => { setMode('login'); }}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: 'none',
                                border: 'none',
                                color: mode === 'login' ? '#53FC18' : '#efeff1',
                                borderBottom: mode === 'login' ? '2px solid #53FC18' : 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => { setMode('signup'); }}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: 'none',
                                border: 'none',
                                color: mode === 'signup' ? '#53FC18' : '#efeff1',
                                borderBottom: mode === 'signup' ? '2px solid #53FC18' : 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && (
                        <div style={{
                            background: 'rgba(255, 68, 68, 0.15)',
                            color: '#ff4444',
                            padding: '12px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            border: '1px solid #ff4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Username Field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#efeff1', fontSize: '0.9rem', fontWeight: 'bold' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#18181b',
                                    border: `2px solid ${usernameAvailable === false ? '#ff4444' : (usernameAvailable === true ? '#53FC18' : '#303032')}`,
                                    color: 'white',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    transition: '0.2s'
                                }}
                                placeholder="Username"
                                disabled={isLoading}
                            />
                            {mode === 'signup' && username.length >= 3 && (
                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                    {checkingUsername ? (
                                        <div style={{ width: '16px', height: '16px', border: '2px solid #53FC18', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                        usernameAvailable === true ? '✅' : (usernameAvailable === false ? '❌' : null)
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Password Field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ color: '#efeff1', fontSize: '0.9rem', fontWeight: 'bold' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: '#18181b',
                                border: '2px solid #303032',
                                color: 'white',
                                borderRadius: '4px',
                                outline: 'none'
                            }}
                            placeholder="Password"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Confirm Password (Signup only) */}
                    {mode === 'signup' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#efeff1', fontSize: '0.9rem', fontWeight: 'bold' }}>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    background: '#18181b',
                                    border: '2px solid #303032',
                                    color: 'white',
                                    borderRadius: '4px',
                                    outline: 'none'
                                }}
                                placeholder="Confirm Password"
                                disabled={isLoading}
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading || (mode === 'signup' && usernameAvailable === false)}
                        style={{
                            background: isLoading || (mode === 'signup' && usernameAvailable === false) ? '#2a2a2e' : '#53FC18',
                            color: 'black',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            marginTop: '10px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isLoading ? 'Processing...' : (mode === 'signup' ? 'Sign Up' : 'Log In')}
                    </button>

                    {needsReactivation && (
                        <div style={{ background: 'rgba(83, 252, 24, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #53FC18', marginTop: '10px' }}>
                            <p style={{ color: '#53FC18', fontSize: '0.85rem', margin: '0 0 10px 0' }}>This account is scheduled for deletion. Would you like to reactivate it?</p>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '0.8rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={confirmReactivate}
                                    onChange={e => setConfirmReactivate(e.target.checked)}
                                />
                                Yes, reactivate my account.
                            </label>
                            {confirmReactivate && (
                                <button
                                    type="button"
                                    onClick={async (event) => {
                                        const res = await fetch('/api/user/account', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ action: 'reactivate' })
                                        });
                                        if (res.ok) {
                                            setNeedsReactivation(false);
                                            handleSubmit(event as any); // Re-submit login
                                        }
                                    }}
                                    style={{ marginTop: '10px', width: '100%', padding: '8px', background: '#53FC18', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    PROCEED TO REACTIVATE
                                </button>
                            )}
                        </div>
                    )}
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#adadb8' }}>
                    By clicking {mode === 'signup' ? 'Sign Up' : 'Log In'}, you agree to our Terms of Service.
                </div>
            </div>

            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div >
    );
}
