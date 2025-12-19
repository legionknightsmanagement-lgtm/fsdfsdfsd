import React, { useState } from 'react';
import FAQModal from './FAQModal';

export default function Footer() {
    const [showFAQ, setShowFAQ] = useState(false);

    return (
        <div id="ndzn-footer">
            <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
            <div className="ndzn-footer__img-container">
                {/* Footer background */}
                <img className="ndzn-footer__img" src="https://i.imgur.com/YIyxwhp.png" alt="Footer Background" />
            </div>
            <div className="container">
                <div className="footer-left">
                    <div className="footer-left__logo">
                        {/* Small Kick Logo */}
                        <img src="/kick-new-logo.png" alt="Footer logo" style={{ height: '50px', width: 'auto' }} />
                    </div>
                    <div className="footer-left__text">
                        <span>2026 SSB Statistics - All Rights Reserved</span>
                        <span>We are not affiliated with Kick.com</span>
                    </div>
                </div>
                <div className="footer-right" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                        className="btn--scroll"
                        onClick={() => setShowFAQ(true)}
                        style={{
                            background: 'rgba(83, 252, 24, 0.1)',
                            border: '1px solid #53FC18',
                            opacity: 1,
                            boxShadow: '0 0 15px rgba(83, 252, 24, 0.2)',
                            transition: 'all 0.3s'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#53FC18" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        <span style={{ color: '#53FC18', fontWeight: 900 }}>FAQ / DISCLOSURE</span>
                    </button>
                    <button
                        className="btn--scroll"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        style={{ opacity: 0.8, background: 'rgba(255,255,255,0.1)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.375 9.53125L10 3.90625L15.625 9.53125M10 4.6875V16.0938" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        <span>BACK TO TOP</span>
                    </button>
                </div>
            </div>
            <div className="footer-tm">
                <a id="tm" href="https://kick.com/" target="_blank" rel="noreferrer"><span>design by</span> reese</a>
            </div>
        </div>
    );
}
