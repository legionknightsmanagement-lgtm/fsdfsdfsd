'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useUser } from '@/context/UserContext';
import GlobalChat from '@/components/GlobalChat';

export default function UserChannel({ params }: { params: { username: string } }) {
    const { username } = params;
    const { user: currentUser } = useUser();

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Home');
    const [isFollowing, setIsFollowing] = useState(false);

    const isOwner = currentUser?.username?.toLowerCase() === username.toLowerCase();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/user/profile/${username}`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) return <div style={{ background: '#0b0e0f', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>;
    if (!profile) return <div style={{ background: '#0b0e0f', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>User not found</div>;

    const tabs = ['Home', 'About', 'Schedule', 'Videos', 'Chat'];

    const ScheduleView = () => (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button style={{ background: '#9147ff', border: 'none', color: 'white', padding: '6px 15px', borderRadius: '4px', fontWeight: 'bold' }}>Today</button>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '4px' }}>{'<'}</button>
                        <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '4px' }}>{'>'}</button>
                    </div>
                    <span style={{ color: '#efeff1', fontWeight: 'bold' }}>Dec 15, 2025 – Dec 21, 2025</span>
                </div>
                {isOwner && (
                    <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '4px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🪄 Edit schedule
                    </button>
                )}
            </div>

            <div style={{ background: '#0e0e10', border: '1px solid #30363d', borderRadius: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', borderBottom: '1px solid #30363d' }}>
                    <div style={{ padding: '10px', color: '#adadb8', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>EST</div>
                    {['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM'].map(time => (
                        <div key={time} style={{ padding: '10px', color: '#adadb8', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center', borderLeft: '1px solid #30363d' }}>{time}</div>
                    ))}
                </div>
                {['Mon 12/15', 'Tue 12/16', 'Wed 12/17', 'Thu 12/18', 'Fri 12/19', 'Sat 12/20', 'Sun 12/21'].map(day => (
                    <div key={day} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', height: '60px', borderBottom: '1px solid #1f1f23' }}>
                        <div style={{ padding: '10px', color: '#adadb8', fontSize: '0.7rem', textAlign: 'center', lineHeight: '1.2' }}>{day.split(' ')[0]}<br />{day.split(' ')[1]}</div>
                        <div style={{ background: day.includes('12/17') ? 'rgba(145, 71, 255, 0.1)' : 'transparent', borderLeft: '1px solid #30363d' }}></div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0b0e0f', color: '#fff' }}>
            <Header />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                {/* Profile Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#9147ff', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {profile.profilePic ? (
                                <img src={profile.profilePic} alt="P" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ fontSize: '2rem' }}>👤</div>
                            )}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{profile.username}</h2>
                                {profile.verified && <span title="Verified" style={{ color: '#53FC18', fontSize: '1.2rem' }}>✔</span>}
                            </div>
                            <div style={{ color: '#adadb8', fontSize: '0.9rem', marginTop: '4px' }}>{profile.followers} followers</div>
                        </div>
                    </div>
                    {!isOwner && (
                        <button
                            onClick={() => setIsFollowing(!isFollowing)}
                            style={{
                                background: isFollowing ? '#1f1f23' : '#9147ff',
                                border: 'none',
                                color: '#fff',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {isFollowing ? '❤️ Following' : '💜 Follow'}
                        </button>
                    )}
                </div>

                {/* Tabs Navigation */}
                <div style={{ borderBottom: '1px solid #30363d', marginBottom: '20px', display: 'flex', gap: '20px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: '10px 5px',
                                color: activeTab === tab ? '#9147ff' : '#efeff1',
                                borderBottom: activeTab === tab ? '2px solid #9147ff' : '2px solid transparent',
                                fontWeight: activeTab === tab ? 'bold' : 'normal',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                transition: '0.2s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{ minHeight: '400px' }}>
                    {activeTab === 'Home' && (
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: '400', color: '#efeff1', marginBottom: '20px' }}>{profile.username} hasn't streamed recently.</h3>
                            <div style={{ color: '#adadb8' }}>Check back later or follow to get notified!</div>
                        </div>
                    )}

                    {activeTab === 'About' && (
                        <div style={{ background: '#18181b', padding: '30px', borderRadius: '8px', border: '1px solid #30363d' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' }}>About {profile.username}</h3>
                            <p style={{ color: '#adadb8', lineHeight: '1.6' }}>{profile.bio}</p>
                            <div style={{ marginTop: '20px', fontSize: '0.85rem', color: '#666' }}>Joined {new Date(profile.createdAt).toLocaleDateString()}</div>
                        </div>
                    )}

                    {activeTab === 'Schedule' && <ScheduleView />}

                    {activeTab === 'Videos' && (
                        <div style={{ textAlign: 'center', marginTop: '50px', color: '#adadb8' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎞️</div>
                            <div>No videos available yet.</div>
                        </div>
                    )}

                    {activeTab === 'Chat' && (
                        <div style={{ height: '600px', width: '100%', background: '#0e0e10', borderRadius: '8px', overflow: 'hidden', border: '1px solid #30363d' }}>
                            <GlobalChat embed />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
