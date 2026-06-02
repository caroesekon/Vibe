import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: '#020617'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#0F172A',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #1E293B'
      }}>
        <Outlet />
      </div>
    </div>
  );
}