export default function Loader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #1E293B', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}