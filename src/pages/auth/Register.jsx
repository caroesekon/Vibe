// client/src/pages/auth/Register.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import LegalModal from '../../components/common/LegalModal';
import { isValidEmail, isValidPassword, isValidUsername, getPasswordStrength } from '../../utils/validators';

export default function Register() {
  var navigate = useNavigate();
  var register = useAuthStore(function (s) { return s.register; });
  var loading = useAuthStore(function (s) { return s.loading; });

  var formState = useState({ email: '', phone: '', username: '', password: '', firstName: '', lastName: '', agreeTerms: false });
  var form = formState[0];
  var setForm = formState[1];

  var emailState = useState(true);
  var useEmail = emailState[0];
  var setUseEmail = emailState[1];

  var showState = useState(false);
  var showPw = showState[0];
  var setShowPw = showState[1];

  var legalState = useState(null);
  var legalType = legalState[0];
  var setLegalType = legalState[1];

  var set = function (key) { return function (e) { var f = {}; f[key] = e.target.value; setForm(Object.assign({}, form, f)); }; };
  var strength = form.password ? getPasswordStrength(form.password) : null;

  var S = {
    input: { width: '100%', padding: '12px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: '10px', color: '#F8FAFC', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    label: { display: 'block', color: '#CBD5E1', fontSize: '13px', fontWeight: 500, marginBottom: '4px' },
    btn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
    link: { color: '#60A5FA', textDecoration: 'none', fontWeight: 600 },
    legalBtn: { color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px', padding: 0, fontWeight: 500 },
  };

  var submit = async function (e) {
    e.preventDefault();
    if (!form.firstName || !form.username || !form.password) return toast.error('Missing required fields');
    if (!form.email && !form.phone) return toast.error('Email or phone required');
    if (!form.agreeTerms) return toast.error('Accept the terms');
    if (form.email && !isValidEmail(form.email)) return toast.error('Invalid email');
    if (!isValidUsername(form.username)) return toast.error('Username: 3-30 chars');
    if (!isValidPassword(form.password)) return toast.error('Password: 8+ chars, upper, lower, number');
    try {
      var d = Object.assign({}, form);
      if (useEmail) delete d.phone; else delete d.email;
      await register(d);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 4px' }}>Vibe</h1>
        <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>Create your account</p>
      </div>

      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, background: '#1E293B', padding: 4, borderRadius: 10 }}>
          <button type="button" onClick={function () { setUseEmail(true); }} style={{ flex: 1, padding: '10px 0', borderRadius: '8px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', background: useEmail ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'transparent', color: useEmail ? 'white' : '#94A3B8' }}>📧 Email</button>
          <button type="button" onClick={function () { setUseEmail(false); }} style={{ flex: 1, padding: '10px 0', borderRadius: '8px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', background: !useEmail ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'transparent', color: !useEmail ? 'white' : '#94A3B8' }}>📱 Phone</button>
        </div>

        {useEmail ? (
          <div style={{ marginBottom: 12 }}><label style={S.label}>Email</label><input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" style={S.input} /></div>
        ) : (
          <div style={{ marginBottom: 12 }}><label style={S.label}>Phone</label><input type="tel" value={form.phone} onChange={set('phone')} placeholder="+254 712 345 678" style={S.input} /></div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div><label style={S.label}>First name</label><input type="text" value={form.firstName} onChange={set('firstName')} placeholder="John" style={S.input} /></div>
          <div><label style={S.label}>Last name</label><input type="text" value={form.lastName} onChange={set('lastName')} placeholder="Doe" style={S.input} /></div>
        </div>

        <div style={{ marginBottom: 12 }}><label style={S.label}>Username</label><input type="text" value={form.username} onChange={set('username')} placeholder="johndoe" style={S.input} /></div>

        <div style={{ marginBottom: 12, position: 'relative' }}>
          <label style={S.label}>Password</label>
          <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min 8 characters" style={{ ...S.input, paddingRight: 50 }} />
          <button type="button" onClick={function () { setShowPw(!showPw); }} style={{ position: 'absolute', right: 12, bottom: 10, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>{showPw ? 'HIDE' : 'SHOW'}</button>
          {strength && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ height: 4, flex: 1, borderRadius: 2, background: strength.level === 'weak' ? '#EF4444' : strength.level === 'medium' ? '#F59E0B' : '#10B981' }} />
                <div style={{ height: 4, flex: 1, borderRadius: 2, background: strength.level === 'strong' ? '#10B981' : strength.level === 'medium' ? '#F59E0B' : '#1E293B' }} />
                <div style={{ height: 4, flex: 1, borderRadius: 2, background: strength.level === 'strong' ? '#10B981' : '#1E293B' }} />
              </div>
              <p style={{ fontSize: 11, marginTop: 4, color: strength.color }}>{strength.text} password</p>
            </div>
          )}
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.agreeTerms} onChange={function () { setForm(Object.assign({}, form, { agreeTerms: !form.agreeTerms })); }} style={{ marginTop: 2, accentColor: '#3B82F6', width: 16, height: 16 }} />
          <span style={{ color: '#94A3B8', fontSize: 12 }}>
            I agree to the{' '}
            <button type="button" onClick={function (e) { e.preventDefault(); setLegalType('terms_of_service'); }} style={S.legalBtn}>Terms of Service</button>
            {' '}and{' '}
            <button type="button" onClick={function (e) { e.preventDefault(); setLegalType('privacy_policy'); }} style={S.legalBtn}>Privacy Policy</button>
          </span>
        </label>

        <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Creating...' : 'Create Account'}</button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <p style={{ color: '#94A3B8', fontSize: 14 }}>Already have an account? <Link to="/login" style={S.link}>Log In</Link></p>
      </div>

      <LegalModal type={legalType} onClose={function () { setLegalType(null); }} />
    </div>
  );
}