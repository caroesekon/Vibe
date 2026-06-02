import { Link } from 'react-router-dom';

export default function Avatar({ src, alt, username, size, className }) {
  size = size || 'md';
  var sizes = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };
  var s = sizes[size] || 40;
  var initials = alt ? alt.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase().slice(0, 2) : '?';

  var img = src ? (
    <img src={src} alt={alt || ''} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
  ) : (
    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: s * 0.35 }}>{initials}</div>
  );

  if (username) {
    return (
      <Link to={'/' + username} style={{ display: 'block', width: s, height: s, flexShrink: 0, ...(className ? {} : {}) }}>
        {img}
      </Link>
    );
  }

  return <div style={{ width: s, height: s, flexShrink: 0 }}>{img}</div>;
}