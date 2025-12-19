'use client';

import React from 'react';

interface FAQModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={onClose}>
            <div style={{
                background: '#0b0e0f',
                border: '1px solid #24272c',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                padding: '40px'
            }} onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    ×
                </button>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '5px 15px',
                        background: 'rgba(83, 252, 24, 0.1)',
                        borderRadius: '20px',
                        color: '#53FC18',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        letterSpacing: '2px',
                        marginBottom: '15px'
                    }}>
                        TRANSPARENCY & LEGAL DISCLOSURE
                    </div>
                    <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        SSB NETWORK <span style={{ color: '#53FC18' }}>FAQ</span>
                    </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* Affiliation */}
                    <section>
                        <h3 style={{ color: '#53FC18', fontSize: '1.1rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            1. ARE YOU PART OF KICK OR STAKE?
                        </h3>
                        <p style={{ color: '#aaa', lineHeight: '1.6', margin: 0 }}>
                            <strong style={{ color: 'white' }}>No.</strong> SSB Network is a completely independent community-driven project. We are <strong style={{ color: '#ff4444' }}>not affiliated, partnered, associated, authorized, or endorsed</strong> by Kick.com, Stake.com, Stake.US, or any of their parent companies or subsidiaries. We operate as a third-party community interface.
                        </p>
                    </section>

                    {/* Sports Partnerships */}
                    <section>
                        <h3 style={{ color: '#53FC18', fontSize: '1.1rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            2. ARE YOU PARTNERED WITH THE NBA, NFL, OR UFC?
                        </h3>
                        <p style={{ color: '#aaa', lineHeight: '1.6', margin: 0 }}>
                            SSB Network has <strong style={{ color: 'white' }}>zero official partnerships</strong> with any major sports leagues, including but not limited to the NBA, NFL, MLB, UFC, or soccer federations. We do not hold, own, or license any broadcasting rights for professional sports.
                        </p>
                    </section>

                    {/* Non-Profit */}
                    <section>
                        <h3 style={{ color: '#53FC18', fontSize: '1.1rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            3. IS THIS A FOR-PROFIT PLATFORM?
                        </h3>
                        <p style={{ color: '#aaa', lineHeight: '1.6', margin: 0 }}>
                            Absolutely not. SSB Network is a <strong style={{ color: 'white' }}>100% non-profit project</strong>. The platform is created for educational and community community-building purposes. We do not charge subscriptions, we do not sell data, and we do not run advertisements.
                        </p>
                    </section>

                    {/* Streaming Responsibility */}
                    <section>
                        <h3 style={{ color: '#53FC18', fontSize: '1.1rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            4. ARE YOU STREAMING THE SPORTS ON THIS SITE?
                        </h3>
                        <p style={{ color: '#aaa', lineHeight: '1.6', margin: 0 }}>
                            SSB Network <strong style={{ color: 'white' }}>does not broadcast or host any live sports content</strong> directly. Our platform serves as a modern community hub that provides an interface for content that is publicly accessible across the web. We are not the source of any live signals shown on the platform.
                        </p>
                    </section>

                    {/* Brand Affiliation */}
                    <section>
                        <h3 style={{ color: '#53FC18', fontSize: '1.1rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            5. WHAT ABOUT THE BRANDS ON THE SITE?
                        </h3>
                        <p style={{ color: '#aaa', lineHeight: '1.6', margin: 0 }}>
                            Any trade names, trademarks, or brand names mentioned on this site are the property of their respective owners. Their mention does not imply any official partnership or endorsement of SSB Network by those brands, nor does it imply our endorsement of them.
                        </p>
                    </section>

                </div>

                <div style={{ marginTop: '40px', paddingTop: '25px', borderTop: '1px solid #24272c', textAlign: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#53FC18',
                            color: 'black',
                            border: 'none',
                            padding: '12px 35px',
                            borderRadius: '10px',
                            fontWeight: '900',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s',
                            boxShadow: '0 10px 20px rgba(83, 252, 24, 0.2)'
                        }}
                    >
                        I UNDERSTAND
                    </button>
                </div>

            </div>

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}
