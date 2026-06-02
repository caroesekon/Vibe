export default function Input({ label, error, value, onChange, type, placeholder, style }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', color: '#CBD5E1', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{label}</label>}
      <input
        type={type || 'text'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ''}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: '#1E293B',
          border: error ? '1px solid #EF4444' : '1px solid #334155',
          borderRadius: 10,
          color: '#F8FAFC',
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          ...(style || {}),
        }}
      />
      {error && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  );
}