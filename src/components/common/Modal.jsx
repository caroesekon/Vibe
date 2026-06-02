import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size }) {
  size = size || 'md';
  var widths = { sm: 380, md: 480, lg: 600, xl: 760 };
  var w = widths[size] || 480;

  useEffect(function () {
    if (isOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return function () { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
      <div style={{ position: 'relative', background: '#0F172A', borderRadius: 20, width: '100%', maxWidth: w, maxHeight: '85vh', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
        {title && (
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#F8FAFC' }}>{title}</h2>
            <button onClick={onClose} style={{ background: '#1E293B', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 16, width: 30, height: 30, borderRadius: 8 }}>✕</button>
          </div>
        )}
        <div style={{ padding: 22, overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}