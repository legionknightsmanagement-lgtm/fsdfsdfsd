import React, { useState } from 'react';
import AuthModal from './AuthModal';
import { useUser } from '../context/UserContext';

export default function Header() {
    const { user, logout, refreshUser } = useUser();
    const [showAuth, setShowAuth] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        localStorage.removeItem('ssb_current_user'); // Legacy cleanup
    };

    return (
        <div id="ndzn-header" className="container">
            <img src="https://i.imgur.com/pGowI7G.png" className="ndzn-bg" alt="header bg" style={{ display: 'none' }} />

            <a href="https://kick.com" className="header-splash__left" target="_blank" rel="noreferrer">
                <div className="btn--discord" style={{ backgroundColor: '#53FC18', color: 'black' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3H21V21H3V3Z" fill="black" />
                        <path d="M10 6V18H13V13.5L16.5 18H20.5L15.5 12L20.5 6H16.5L13 10.5V6H10Z" fill="#53FC18" />
                    </svg>
                    <span>KICK</span>
                </div>
            </a>


            <div className="header-splash">
                {/* SSB Coins Balance Display */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                    background: '#1a1d2e',
                    padding: '6px 15px',
                    borderRadius: '8px',
                    border: '1px solid #2a2d3e',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    cursor: 'pointer'
                }}>
                    <img src="/ssb_logo.png" alt="SSB" style={{ height: '50px', width: 'auto' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                        <span style={{
                            fontFamily: 'Ubuntu, sans-serif',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#ffffff',
                            letterSpacing: '0.5px'
                        }}>
                            {(user?.points || 0).toLocaleString()}
                        </span>
                        <span style={{
                            fontFamily: 'Ubuntu, sans-serif',
                            fontSize: '10px',
                            color: '#888',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            SSB Coins
                        </span>
                    </div>
                </div>

                <a href="/">
                    {/* Kick Logo / Home */}
                    <div className="flex h-12 w-full items-center justify-center">
                        <img src="/ssb_logo.png" alt="SSB Logo" style={{ height: '130px', width: 'auto', marginTop: '20px' }} />
                    </div>
                </a>
            </div>

            <div className="header-splash__right" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <a href="/stats">
                    <div className="btn--cart" style={{ background: '#53FC18', color: 'black', fontWeight: '900', boxShadow: '0 0 20px rgba(83, 252, 24, 0.4)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 11H15M12 8V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="2" fill="currentColor" />
                        </svg>
                        <span>Stats</span>
                    </div>
                </a>

                {user ? (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* Profile Picture / Dropdown Trigger */}
                        <div
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                border: '2px solid #53FC18',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#18181b',
                                overflow: 'hidden'
                            }}>
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt="P" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: 'white', fontSize: '1rem' }}>👤</span>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {showProfileMenu && (
                            <>
                                <div
                                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
                                    onClick={() => setShowProfileMenu(false)}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '50px',
                                    right: 0,
                                    width: '180px',
                                    background: '#18181b',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    zIndex: 999,
                                    padding: '10px 0',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <div style={{ padding: '5px 15px 12px', borderBottom: '1px solid #333', marginBottom: '8px' }}>
                                        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>{user.username}</div>
                                        <div style={{ color: '#53FC18', fontWeight: 'bold', fontSize: '0.75rem', marginTop: '2px' }}>Points: {user.points}</div>
                                    </div>

                                    <a href={`/user/${user.username}`} style={{ padding: '10px 15px', color: '#efeff1', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowProfileMenu(false)}>
                                        👤 Channel
                                    </a>
                                    <a href="/settings" style={{ padding: '10px 15px', color: '#efeff1', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowProfileMenu(false)}>
                                        ⚙️ Settings
                                    </a>

                                    <div style={{ borderTop: '1px solid #333', marginTop: '8px', paddingTop: '8px' }}>
                                        <button
                                            onClick={() => { logout(); setShowProfileMenu(false); }}
                                            style={{
                                                width: '100%', padding: '10px 15px', background: 'none', border: 'none',
                                                color: '#ff4444', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold'
                                            }}
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAuth(true)}
                        className="btn--cart"
                        style={{
                            background: '#1a1d2e',
                            color: 'white',
                            fontWeight: 'bold',
                            border: '1px solid #53FC18',
                            cursor: 'pointer',
                            padding: '0 15px',
                            height: '40px'
                        }}
                    >
                        Login
                    </button>
                )}
            </div>

            <AuthModal
                isOpen={showAuth}
                onClose={() => setShowAuth(false)}
                onLogin={(u) => {
                    refreshUser();
                    setShowAuth(false);
                }}
            />
        </div>
    );
}
