// client/src/pages/auth/Login.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import LegalModal from '../../components/common/LegalModal';

var S = {
  input: { width: '100%', padding: '14px 16px', background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', color: '#F8FAFC', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  label: { display: 'block', color: '#CBD5E1', fontSize: '14px', fontWeight: 500, marginBottom: '8px' },
  btn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
  link: { color: '#60A5FA', textDecoration: 'none', fontWeight: 500 },
  legalBtn: { color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px', padding: 0, fontWeight: 500 },
};

export default function Login() {
  var navigate = useNavigate();
  var login = useAuthStore(function (s) { return s.login; });

  var idState = useState('');
  var identifier = idState[0];
  var setIdentifier = idState[1];

  var pwState = useState('');
  var password = pwState[0];
  var setPassword = pwState[1];

  var showState = useState(false);
  var showPassword = showState[0];
  var setShowPassword = showState[1];

  var loadState = useState(false);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var legalState = useState(null);
  var legalType = legalState[0];
  var setLegalType = legalState[1];

  var handleSubmit = async function (e) {
    e.preventDefault();
    if (!identifier || !password) return toast.error('All fields required');
    setLoading(true);
    try {
      await login(identifier, password);
      toast.success('Welcome!');
      navigate('/');
    } catch (err) {
      var msg = 'Invalid credentials';
      if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, fontWeight: 900, color: 'white' }}>V</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px' }}>Welcome back</h1>
        <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>Sign in to continue to Vibe</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={S.label}>Email, phone, or username</label>
          <input type="text" value={identifier} onChange={function (e) { setIdentifier(e.target.value); }} placeholder="Enter your email or username" style={S.input} autoFocus />
        </div>
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...S.label, marginBottom: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ ...S.link, fontSize: 13 }}>Forgot?</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={function (e) { setPassword(e.target.value); }} placeholder="Enter your password" style={{ ...S.input, paddingRight: 55 }} />
            <button type="button" onClick={function () { setShowPassword(!showPassword); }} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{showPassword ? 'HIDE' : 'SHOW'}</button>
          </div>
        </div>
        <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.6 : 1, cursor: loading ? 'wait' : 'pointer', marginTop: 20 }}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <p style={{ color: '#94A3B8', fontSize: 14 }}>No account? <Link to="/register" style={{ ...S.link, fontWeight: 600 }}>Create one</Link></p>
      </div>

      <div style={{ borderTop: '1px solid #1E293B', marginTop: 24, paddingTop: 20, textAlign: 'center' }}>
        <p style={{ color: '#64748B', fontSize: 12, lineHeight: '18px' }}>
          By continuing, you agree to our{' '}
          <button type="button" onClick={function () { setLegalType('terms_of_service'); }} style={S.legalBtn}>Terms of Service</button>
          {' '}and{' '}
          <button type="button" onClick={function () { setLegalType('privacy_policy'); }} style={S.legalBtn}>Privacy Policy</button>
        </p>
      </div>

      <LegalModal type={legalType} onClose={function () { setLegalType(null); }} />
    </div>
  );
}