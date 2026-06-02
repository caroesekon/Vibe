export default function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 16px' }}>
      {icon && <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>}
      <h3 style={{ fontSize: 17, fontWeight: 600, color: '#94A3B8', marginBottom: 4 }}>{title}</h3>
      {description && <p style={{ fontSize: 13, color: '#64748B', maxWidth: 300, margin: '0 auto 16px' }}>{description}</p>}
      {action}
    </div>
  );
}