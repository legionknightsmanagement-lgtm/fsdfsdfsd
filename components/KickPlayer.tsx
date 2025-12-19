'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface KickPlayerProps {
    slug: string;
    playbackUrl?: string | null;
    autoplay?: boolean;
    muted?: boolean;
}

export default function KickPlayer({ slug, playbackUrl: initialPlaybackUrl, autoplay = true, muted: initialMuted = true }: KickPlayerProps) {
    const [playbackUrl, setPlaybackUrl] = useState<string | null>(initialPlaybackUrl || null);
    const [isMuted, setIsMuted] = useState(initialMuted);
    const [volume, setVolume] = useState(0.8);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!playbackUrl && slug) {
            const fetchPlaybackUrl = async () => {
                try {
                    const res = await fetch(`https://kick.com/api/v2/channels/${slug}`);
                    const data = await res.json();
                    const url = data.playback_url || data.livestream?.playback_url || null;
                    setPlaybackUrl(url);
                } catch (e) {
                    console.error("Failed to fetch playback URL for", slug, e);
                    setError(true);
                }
            };
            fetchPlaybackUrl();
        }
    }, [slug, playbackUrl]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: 'black' }}>
            {playbackUrl && !error ? (
                <ReactPlayer
                    url={playbackUrl}
                    playing={autoplay}
                    muted={isMuted}
                    volume={volume}
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    config={{
                        file: {
                            forceHLS: true,
                        }
                    }}
                    onError={() => setError(true)}
                />
            ) : (
                <iframe
                    src={`https://player.kick.com/${slug}?muted=${isMuted}&autoplay=${autoplay}`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${slug} Live Stream`}
                />
            )}

            {/* Premium Controls */}
            <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
            }}
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
            >
                {/* Volume Slider */}
                <div style={{
                    height: showVolumeSlider ? '100px' : '0',
                    width: '36px',
                    background: 'rgba(0,0,0,0.85)',
                    borderRadius: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: showVolumeSlider ? '12px 0' : '0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: showVolumeSlider ? 1 : 0,
                    overflow: 'hidden',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(83, 252, 24, 0.3)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                }}>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newVol = parseFloat(e.target.value);
                            setVolume(newVol);
                            if (newVol > 0 && isMuted) setIsMuted(false);
                            if (newVol === 0) setIsMuted(true);
                        }}
                        style={{
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            width: '80px',
                            height: '3px',
                            background: `linear-gradient(to right, #53FC18 ${volume * 100}%, #333 ${volume * 100}%)`,
                            transform: 'rotate(-90deg)',
                            borderRadius: '2px',
                            cursor: 'pointer'
                        }}
                    />
                </div>

                {/* Mute Button */}
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    style={{
                        background: isMuted ? 'rgba(255, 68, 68, 0.2)' : 'rgba(83, 252, 24, 0.1)',
                        color: isMuted ? '#ff4444' : '#53FC18',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: `1px solid ${isMuted ? '#ff4444' : '#53FC18'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    {isMuted || volume === 0 ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2V15H6L11 19V5Z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2V15H6L11 19V5Z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                    )}
                </button>
            </div>

            <style jsx>{`
                input[type=range]::-webkit-slider-thumb {
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    background: #53FC18;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(83, 252, 24, 0.5);
                }
            `}</style>
        </div>
    );
}
