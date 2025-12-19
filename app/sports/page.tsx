'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MethStreamsIntegration from '../../components/MethStreamsIntegration';

export default function SportsPage() {
    return (
        <>
            <Header />
            <main className="container" style={{ marginTop: '2rem', minHeight: '80vh', position: 'relative' }}>
                {/* Background Decor */}
                <div style={{ position: 'fixed', top: '20%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(83, 252, 24, 0.05) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }}></div>
                <div style={{ position: 'fixed', bottom: '10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(83, 252, 24, 0.05) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }}></div>

                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div style={{ display: 'inline-block', padding: '5px 15px', background: 'rgba(83, 252, 24, 0.1)', borderRadius: '20px', color: '#53FC18', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '2px', marginBottom: '15px', border: '1px solid rgba(83, 252, 24, 0.2)' }}>
                        ULTRA-HD 4K BROADCAST • SECURE SIGNAL
                    </div>
                    <h1 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: '900',
                        fontSize: '4.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '-2px',
                        lineHeight: 0.9,
                        margin: 0,
                        color: 'white',
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        LIVE <span style={{
                            color: '#53FC18',
                            WebkitTextStroke: '1px #53FC18',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 15px rgba(83, 252, 24, 0.3))'
                        }}>SPORTS</span> NETWORK
                    </h1>
                    <p style={{ color: '#666', marginTop: '20px', fontSize: '1.2rem', maxWidth: '600px', margin: '20px auto 0', lineHeight: 1.6 }}>
                        Access the world's most premium live sports feeds. NFL, NBA, UFC, and Soccer in crystal clear 1080p 60FPS.
                    </p>
                </div>

                <MethStreamsIntegration defaultStatus="all" />

                <div style={{
                    marginTop: '4rem',
                    padding: '40px',
                    background: 'rgba(20, 23, 26, 0.8)',
                    borderRadius: '24px',
                    border: '1px solid #24272c',
                    backdropFilter: 'blur(10px)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '40px'
                }}>
                    <div>
                        <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1.4rem' }}>Digital Satellite Matrix</h3>
                        <p style={{ color: '#888', lineHeight: '1.7', fontSize: '0.95rem' }}>
                            Our proprietary scraping engine connects to multiple global sports providers simultaneously,
                            redundantly verified to ensure 99.9% uptime for major events.
                        </p>
                    </div>
                    <div>
                        <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1.4rem' }}>End-to-End Encryption</h3>
                        <p style={{ color: '#888', lineHeight: '1.7', fontSize: '0.95rem' }}>
                            Every stream is routed through our secure SSB tunnel, stripping malicious tracking and
                            invasive advertisements while maintaining zero-latency performance.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
