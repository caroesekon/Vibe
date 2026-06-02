import { useState, useEffect } from 'react';

var API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

var TITLES = {
  terms_of_service: 'Terms of Service',
  privacy_policy: 'Privacy Policy',
  cookie_policy: 'Cookie Policy',
  community_guidelines: 'Community Guidelines',
  acceptable_use_policy: 'Acceptable Use Policy',
  data_processing_agreement: 'Data Processing Agreement',
  refund_policy: 'Refund Policy',
  intellectual_property_policy: 'Intellectual Property Policy',
  disclaimer: 'Disclaimer',
  contact_information: 'Contact Information',
};

export default function LegalModal({ type, onClose }) {
  var contentState = useState('');
  var content = contentState[0];
  var setContent = contentState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var errorState = useState('');
  var error = errorState[0];
  var setError = errorState[1];

  useEffect(function () {
    if (!type) return;
    setLoading(true);
    setError('');
    setContent('');

    fetch(API_BASE.replace('/api/v1', '/api/v1/public/legal/') + type)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.status === 'success' && data.data && data.data.value) {
          setContent(data.data.value);
        } else {
          setError('Document not found.');
        }
        setLoading(false);
      })
      .catch(function () {
        setError('Failed to load. Please try again.');
        setLoading(false);
      });
  }, [type]);

  if (!type) return null;

  var title = TITLES[type] || 'Legal Document';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 640, maxHeight: '85vh', background: '#0F172A', borderRadius: 20, border: '1px solid #1E293B', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#F1F5F9' }}>{title}</h2>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: '#1E293B', color: '#94A3B8', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #1E293B', borderTopColor: '#3B82F6', animation: 'spin 0.7s linear infinite' }} />
              <span style={{ color: '#64748B', fontSize: 14 }}>Loading document...</span>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#F87171', fontSize: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
              {error}
              <br />
              <button onClick={function () { setLoading(true); setError(''); }} style={{ marginTop: 16, padding: '8px 20px', background: '#1E293B', color: '#CBD5E1', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Retry</button>
            </div>
          ) : (
            <div style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'system-ui, -apple-system, sans-serif', wordBreak: 'break-word' }}>{content}</div>
          )}
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid #1E293B', flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: '100%', padding: 12, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Close</button>
        </div>
      </div>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}