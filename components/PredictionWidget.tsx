'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

interface Streamer {
    name: string;
    slug: string;
    viewers: number;
    image: string;
    thumbnail: string;
    status: 'online' | 'offline';
    title?: string;
}

interface PredictionEvent {
    id: string;
    p1: Streamer;
    p2: Streamer;
    expiry: number;
}

interface PredictionWidgetProps {
    streamers: Streamer[];
}

export default function PredictionWidget({ streamers }: PredictionWidgetProps) {
    const { user, awardPoints } = useUser();
    const [prediction, setPrediction] = useState<PredictionEvent | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [userVote, setUserVote] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);
    const [payoutMessage, setPayoutMessage] = useState<string | null>(null);

    const DURATION_MS = 20 * 60 * 1000;

    // Use a shared state for the active prediction via RTDB
    useEffect(() => {
        const fetchGlobalPrediction = async () => {
            try {
                const res = await fetch('/api/prediction');
                const data = await res.json();
                if (data && data.id) {
                    setPrediction(data);

                    // Check local dismissed state (it's okay to keep dismissal local)
                    if (!localStorage.getItem(`ssb_prediction_dismissed_${data.id}`)) {
                        setVisible(true);
                    }

                    // Check if voted
                    const vote = localStorage.getItem(`ssb_prediction_vote_${data.id}`);
                    if (vote) setUserVote(vote);
                }
            } catch (e) {
                console.error("Global prediction fetch error", e);
            }
        };

        if (streamers.length > 0) {
            fetchGlobalPrediction();
        }
    }, [streamers]);

    // Timer & Payout check
    useEffect(() => {
        if (!prediction) return;

        const interval = setInterval(async () => {
            const now = Date.now();
            const diff = prediction.expiry - now;

            if (diff <= 0) {
                setTimeLeft('Ended');
            } else {
                const m = Math.floor(diff / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${m}m ${s}s`);
            }

            // Payout Logic
            if (userVote && user) {
                const betStatus = localStorage.getItem(`ssb_prediction_status_${prediction.id}`);

                if (betStatus === 'pending') {
                    const targetSlug = userVote;
                    const opponentSlug = userVote === prediction.p1.slug ? prediction.p2.slug : prediction.p1.slug;

                    const target = streamers.find(s => s.slug === targetSlug);
                    const opponent = streamers.find(s => s.slug === opponentSlug);

                    if (target && target.status === 'offline') {
                        // WIN!
                        const success = await awardPoints(100);
                        if (success) {
                            localStorage.setItem(`ssb_prediction_status_${prediction.id}`, 'paid');
                            setPayoutMessage(`🏆 WINNER! ${target.name} went offline! (+100 Coins)`);
                            setVisible(true);
                            setTimeout(() => setPayoutMessage(null), 5000);
                        }
                    } else if (opponent && opponent.status === 'offline') {
                        // LOSS
                        localStorage.setItem(`ssb_prediction_status_${prediction.id}`, 'lost');
                    }
                }
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [prediction, streamers, userVote, user, awardPoints]);

    const handleVote = async (slug: string) => {
        if (!prediction || !user) return;
        if (localStorage.getItem(`ssb_prediction_vote_${prediction.id}`)) return;

        localStorage.setItem(`ssb_prediction_vote_${prediction.id}`, slug);
        localStorage.setItem(`ssb_prediction_status_${prediction.id}`, 'pending');
        setUserVote(slug);

        await awardPoints(1); // Small participation reward
    };

    const handleDismiss = () => {
        if (!prediction) return;
        setVisible(false);
        localStorage.setItem(`ssb_prediction_dismissed_${prediction.id}`, 'true');
    };

    if (!visible || !prediction) return null;

    return (
        <>
            {payoutMessage && (
                <div style={{
                    position: 'fixed', top: '100px', left: '50%', transform: 'translateX(-50%)',
                    background: '#53FC18', color: 'black', padding: '15px 30px', borderRadius: '50px',
                    fontWeight: 'bold', zIndex: 10000, boxShadow: '0 5px 20px rgba(83,252,24,0.4)',
                    animation: 'pulse 1s infinite'
                }}>
                    {payoutMessage}
                </div>
            )}

            <div style={{
                position: 'fixed', bottom: '20px', left: '20px', width: '320px',
                background: '#0e0e10', border: '1px solid #303032', borderTop: '4px solid #53FC18',
                borderRadius: '8px', padding: '15px', zIndex: 800, color: 'white'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>🔮 PREDICTION</div>
                    <div style={{ fontSize: '0.75rem', color: '#adadb8' }}>{timeLeft}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', background: '#18181b', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ textAlign: 'center', width: '40%' }}>
                        <img src={prediction.p1.image} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', overflow: 'hidden' }}>{prediction.p1.name}</div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#53FC18' }}>VS</div>
                    <div style={{ textAlign: 'center', width: '40%' }}>
                        <img src={prediction.p2.image} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', overflow: 'hidden' }}>{prediction.p2.name}</div>
                    </div>
                </div>

                {!userVote ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleVote(prediction.p1.slug)} style={{ flex: 1, padding: '8px', background: '#53FC18', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>
                            {prediction.p1.name}
                        </button>
                        <button onClick={() => handleVote(prediction.p2.slug)} style={{ flex: 1, padding: '8px', background: '#53FC18', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>
                            {prediction.p2.name}
                        </button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(83, 252, 24, 0.1)', borderRadius: '4px', border: '1px solid #53FC18', color: '#53FC18', fontSize: '0.8rem' }}>
                        Voted for {userVote === prediction.p1.slug ? prediction.p1.name : prediction.p2.name}
                    </div>
                )}

                <button onClick={handleDismiss} style={{ position: 'absolute', top: '-10px', right: '-10px', width: '24px', height: '24px', background: '#303032', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '12px' }}>×</button>
            </div>

            <style jsx>{`
                @keyframes pulse { 0% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.05); } 100% { transform: translateX(-50%) scale(1); } }
            `}</style>
        </>
    );
}
