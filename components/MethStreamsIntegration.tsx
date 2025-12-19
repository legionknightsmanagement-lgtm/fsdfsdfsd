'use client';

import React, { useState, useEffect } from 'react';
import GlobalChat from './GlobalChat';

interface Game {
    title: string;
    link: string;
    league: string;
    id: string;
    isDirect?: boolean;
    status?: string;
    startsAt?: number;
    poster?: string;
}

interface StreamLink {
    label: string;
    value: string;
}

export default function MethStreamsIntegration({ defaultStatus = 'all' }: { defaultStatus?: 'all' | 'live' | 'upcoming' }) {
    const [games, setGames] = useState<Game[]>([]);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [streamLinks, setStreamLinks] = useState<StreamLink[]>([]);
    const [currentLink, setCurrentLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingPlayer, setLoadingPlayer] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming'>(defaultStatus);
    const [leagueFilter, setLeagueFilter] = useState<string>('ALL');
    const [showChat, setShowChat] = useState(true);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/methstreams/live');
            const data = await res.json();
            if (data.games) {
                setGames(data.games);
            } else if (data.error) {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const handleGameSelect = async (game: Game) => {
        setSelectedGame(game);
        setLoadingPlayer(true);
        setStreamLinks([]);
        setCurrentLink(null);

        if (game.isDirect) {
            setStreamLinks([{ label: 'Direct Link', value: game.link }]);
            setCurrentLink(game.link);
            setLoadingPlayer(false);
            return;
        }

        try {
            const res = await fetch(`/api/methstreams/player?url=${encodeURIComponent(game.link)}`);
            const data = await res.json();
            if (data.streams && data.streams.length > 0) {
                setStreamLinks(data.streams);
                setCurrentLink(data.streams[0].value);
            } else {
                setError('No streams available for this game');
            }
        } catch (err) {
            setError('Failed to load player');
        } finally {
            setLoadingPlayer(false);
        }
    };

    const leagues = ['ALL', ...Array.from(new Set(games.map(g => g.league)))];

    const filteredGames = games.filter(g => {
        const matchesLeague = leagueFilter === 'ALL' || g.league === leagueFilter;
        const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
        return matchesLeague && matchesStatus;
    });

    const formatStartTime = (timestamp?: number) => {
        if (!timestamp) return '';
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #0b0e11 0%, #161a1f 100%)',
            borderRadius: '20px',
            border: '1px solid #24272c',
            overflow: 'hidden',
            margin: '2rem 0',
            boxShadow: '0 15px 50px rgba(0,0,0,0.6)',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Top Toolbar */}
            <div style={{
                background: 'rgba(25, 29, 35, 0.8)',
                padding: '20px 25px',
                borderBottom: '1px solid #24272c',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#53FC18', display: 'flex', alignItems: 'center', gap: '15px', letterSpacing: '1px' }}>
                        <div style={{ position: 'relative' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
                                <line x1="2" y1="20" x2="2.01" y2="20" />
                            </svg>
                            <span style={{ position: 'absolute', top: -5, right: -5, width: '10px', height: '10px', background: '#ff4444', borderRadius: '50%', border: '2px solid #0b0e11', animation: 'pulse 1.5s infinite' }}></span>
                        </div>
                        LIVE SPORTS NETWORK
                    </h2>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setShowChat(!showChat)}
                            style={{
                                background: showChat ? 'rgba(83, 252, 24, 0.1)' : '#1c2127',
                                border: `1px solid ${showChat ? '#53FC18' : '#333'}`,
                                color: showChat ? '#53FC18' : '#888',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.8A8.5 8.5 0 0 1 21 11.5z"></path></svg>
                            {showChat ? 'Hide Chat' : 'Show Chat'}
                        </button>
                        <button
                            onClick={fetchGames}
                            style={{ background: '#53FC18', border: 'none', color: 'black', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: '900', fontSize: '0.85rem', textTransform: 'uppercase', transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(83, 252, 24, 0.3)' }}
                        >
                            Refresh Signal
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', background: '#1c2127', padding: '4px', borderRadius: '10px', border: '1px solid #24272c' }}>
                        {(['all', 'live', 'upcoming'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: statusFilter === status ? '#24272c' : 'transparent',
                                    color: statusFilter === status ? '#53FC18' : '#888',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {status === 'live' && <span style={{ width: '6px', height: '6px', background: '#ff4444', borderRadius: '50%' }}></span>}
                                {status}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', maxWidth: '100%', overflowX: 'auto', paddingBottom: '5px' }}>
                        {leagues.slice(0, 10).map((league) => (
                            <button
                                key={league}
                                onClick={() => setLeagueFilter(league)}
                                style={{
                                    padding: '8px 15px',
                                    borderRadius: '30px',
                                    border: `1px solid ${leagueFilter === league ? '#53FC18' : '#24272c'}`,
                                    background: leagueFilter === league ? 'rgba(83, 252, 24, 0.1)' : 'transparent',
                                    color: leagueFilter === league ? '#53FC18' : '#aaa',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {league}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', height: '700px' }}>
                {/* Left Sidebar: Game List */}
                <div style={{
                    flex: '0 0 350px',
                    borderRight: '1px solid #24272c',
                    overflowY: 'auto',
                    background: 'rgba(11, 14, 17, 0.5)',
                }}>
                    {loading ? (
                        <div style={{ padding: '60px 40px', textAlign: 'center', color: '#53FC18' }}>
                            <div className="satellite-loader"></div>
                            <div style={{ marginTop: '25px', fontWeight: 900, letterSpacing: '2px', fontSize: '0.9rem' }}>ESTABLISHING DOWNLINK...</div>
                        </div>
                    ) : filteredGames.length === 0 ? (
                        <div style={{ padding: '80px 40px', textAlign: 'center', color: '#666' }}>
                            <div style={{ fontSize: '0.9rem' }}>No matching broadcasts found for current filters.</div>
                        </div>
                    ) : (
                        filteredGames.map((game) => (
                            <div
                                key={`${game.id}-${game.league}`}
                                onClick={() => handleGameSelect(game)}
                                style={{
                                    padding: '22px 25px',
                                    borderBottom: '1px solid #1a1e23',
                                    cursor: 'pointer',
                                    background: selectedGame?.id === game.id ? 'rgba(83, 252, 24, 0.05)' : 'transparent',
                                    borderLeft: selectedGame?.id === game.id ? '5px solid #53FC18' : '5px solid transparent',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#53FC18', background: 'rgba(83, 252, 24, 0.1)', padding: '3px 8px', borderRadius: '5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{game.league}</span>
                                    {game.status === 'live' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ width: '6px', height: '6px', background: '#ff4444', borderRadius: '50%', animation: 'flash 1s infinite' }}></span>
                                            <span style={{ fontSize: '0.7rem', color: '#ff4444', fontWeight: 'bold' }}>LIVE</span>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 'bold' }}>{formatStartTime(game.startsAt)}</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: '1rem', color: 'white', fontWeight: '700', lineHeight: '1.4' }}>{game.title}</div>
                            </div>
                        ))
                    )}
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'black', position: 'relative' }}>
                    {selectedGame && (currentLink || loadingPlayer) ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                                {loadingPlayer ? (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b0e11' }}>
                                        <div className="radar"></div>
                                        <div style={{ color: '#53FC18', fontSize: '1.2rem', fontWeight: '900', marginTop: '30px', letterSpacing: '3px' }}>SYNCING STREAM...</div>
                                        <div style={{ color: '#555', marginTop: '10px', fontSize: '0.8rem', textTransform: 'uppercase' }}>Secure encrypted tunnel established</div>
                                    </div>
                                ) : (
                                    <iframe
                                        src={currentLink || ''}
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                        allowFullScreen
                                        allow="autoplay; encrypted-media"
                                    />
                                )}
                            </div>

                            {/* Player Footer */}
                            {!loadingPlayer && (
                                <div style={{ background: '#1c2127', padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #24272c' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ color: '#666', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px' }}>SOURCE</div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {streamLinks.map((link, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentLink(link.value)}
                                                    style={{
                                                        background: currentLink === link.value ? '#53FC18' : '#24272c',
                                                        color: currentLink === link.value ? 'black' : 'white',
                                                        border: `1px solid ${currentLink === link.value ? '#53FC18' : '#333'}`,
                                                        padding: '6px 16px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {link.label || `HD FEED ${idx + 1}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: 'white', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '0.5px' }}>{selectedGame.title}</div>
                                        <div style={{ color: '#53FC18', fontSize: '0.75rem', fontWeight: 'bold' }}>ULTRA-LOW LATENCY ENABLED</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b0e11', padding: '40px' }}>
                            <div style={{ position: 'relative', marginBottom: '40px' }}>
                                <div style={{ opacity: 0.15 }}>
                                    <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="#53FC18" strokeWidth="0.3">
                                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                                        <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
                                        <circle cx="12" cy="12" r="2" />
                                    </svg>
                                </div>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '200%' }}>
                                    <h3 style={{ color: 'white', fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '5px' }}>STANDBY</h3>
                                    <p style={{ color: '#53FC18', fontWeight: 'bold', fontSize: '0.8rem', marginTop: '10px' }}>SELECT FREQUENCY TO INITIALIZE</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Chat */}
                {showChat && (
                    <div style={{
                        flex: '0 0 320px',
                        background: '#0b0e11',
                        borderLeft: '1px solid #24272c',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ padding: '15px 20px', background: '#1c2127', borderBottom: '1px solid #24272c', fontSize: '0.8rem', fontWeight: 900, color: '#aaa', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', background: '#53FC18', borderRadius: '50%' }}></div>
                            GLOBAL NETWORK CHAT
                        </div>
                        <div style={{ flex: 1 }}>
                            <GlobalChat embed={true} roomId="sports-main" />
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                }
                @keyframes flash {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                .satellite-loader {
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(83, 252, 24, 0.1);
                    border-left-color: #53FC18;
                    border-radius: 50%;
                    margin: 0 auto;
                    animation: spin 1s linear infinite;
                    position: relative;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .radar {
                    width: 120px;
                    height: 120px;
                    border: 2px solid rgba(83, 252, 24, 0.3);
                    border-radius: 50%;
                    position: relative;
                    animation: radar-ping 2s infinite;
                }
                @keyframes radar-ping {
                    0% { transform: scale(0.8); opacity: 1; }
                    100% { transform: scale(1.2); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
