import { useState } from 'react';
import LegalModal from './LegalModal';

export default function FooterLinks() {
  var legalTypeState = useState(null);
  var legalType = legalTypeState[0];
  var setLegalType = legalTypeState[1];

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', padding: '12px 0' }}>
        <button onClick={function () { setLegalType('terms_of_service'); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 12 }}>Terms</button>
        <button onClick={function () { setLegalType('privacy_policy'); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 12 }}>Privacy</button>
        <button onClick={function () { setLegalType('cookie_policy'); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 12 }}>Cookies</button>
        <button onClick={function () { setLegalType('community_guidelines'); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 12 }}>Guidelines</button>
        <button onClick={function () { setLegalType('acceptable_use_policy'); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 12 }}>Use Policy</button>
        <button onClick={function () { setLegalType('refund_policy'); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 12 }}>Refunds</button>
        <button onClick={function () { setLegalType('disclaimer'); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 12 }}>Disclaimer</button>
        <button onClick={function () { setLegalType('contact_information'); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 12 }}>Contact</button>
      </div>
      <LegalModal type={legalType} onClose={function () { setLegalType(null); }} />
    </>
  );
}