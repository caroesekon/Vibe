export default function Button({ children, variant, size, loading, disabled, onClick, type, className, style }) {
  variant = variant || 'primary';
  size = size || 'md';
  type = type || 'button';

  var base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontWeight: 500,
    borderRadius: 12,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'all 0.2s',
  };

  if (size === 'sm') { base.padding = '6px 14px'; base.fontSize = 13; }
  else if (size === 'lg') { base.padding = '14px 28px'; base.fontSize = 16; }
  else { base.padding = '10px 20px'; base.fontSize = 14; }

  if (variant === 'primary') { base.background = 'linear-gradient(135deg, #3B82F6, #8B5CF6)'; base.color = 'white'; }
  else if (variant === 'secondary') { base.background = '#1E293B'; base.color = 'white'; base.border = '1px solid #334155'; }
  else if (variant === 'ghost') { base.background = 'transparent'; base.color = '#94A3B8'; }
  else if (variant === 'danger') { base.background = '#DC2626'; base.color = 'white'; }
  else if (variant === 'outline') { base.background = 'transparent'; base.color = 'white'; base.border = '1px solid #334155'; }

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} style={{ ...base, ...(style || {}) }} className={className || ''}>
      {loading ? '...' : null}
      {children}
    </button>
  );
}