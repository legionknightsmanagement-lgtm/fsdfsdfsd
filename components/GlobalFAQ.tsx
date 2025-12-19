'use client';

import React, { useState } from 'react';
import FAQModal from './FAQModal';

export default function GlobalFAQ() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <FAQModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

            {/* Floating FAQ Link for absolute visibility */}
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 9999,
                    background: 'rgba(83, 252, 24, 0.1)',
                    border: '1px solid #53FC18',
                    color: '#53FC18',
                    padding: '8px 15px',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    backdropFilter: 'blur(5px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = '#53FC18';
                    e.currentTarget.style.color = 'black';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(83, 252, 24, 0.1)';
                    e.currentTarget.style.color = '#53FC18';
                }}
            >
                ⚠️ Disclosure & FAQ
            </button>
        </>
    );
}
