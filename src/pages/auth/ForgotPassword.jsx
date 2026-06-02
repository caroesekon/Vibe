// src/pages/auth/ForgotPassword.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';

var S = {
  input: { width: '100%', padding: '14px 16px', background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', color: '#F8FAFC', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  label: { display: 'block', color: '#CBD5E1', fontSize: '14px', fontWeight: 500, marginBottom: '8px' },
  btn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
};

export default function ForgotPassword() {
  var idState = useState('');
  var identifier = idState[0];
  var setIdentifier = idState[1];

  var sentState = useState(false);
  var sent = sentState[0];
  var setSent = sentState[1];

  var loadState = useState(false);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var submit = async function (e) {
    e.preventDefault();
    if (!identifier) return toast.error('Enter email or phone');
    setLoading(true);
    try { await API.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { identifier: identifier }); setSent(true); toast.success('Reset link sent'); }
    catch (err) { toast.error('Failed'); }
    setLoading(false);
  };

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 30 }}>📧</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>Check Your Inbox</h2>
      <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24 }}>Reset instructions sent.</p>
      <Link to="/login" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>Back to Login</Link>
    </div>
  );

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26 }}>🔐</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>Forgot Password?</h2>
        <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>Enter your email or phone</p>
      </div>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 18 }}><label style={S.label}>Email or Phone</label><input type="text" value={identifier} onChange={function (e) { setIdentifier(e.target.value); }} placeholder="you@example.com" style={S.input} autoFocus /></div>
        <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 20 }}><Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>← Back to Login</Link></div>
    </div>
  );
}