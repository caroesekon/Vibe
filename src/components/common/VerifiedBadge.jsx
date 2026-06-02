export default function VerifiedBadge({ size }) {
  size = size || 'sm';
  var sizes = { xs: 12, sm: 16, md: 20, lg: 24 };
  var s = sizes[size] || 16;

  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="#3B82F6" style={{ flexShrink: 0 }}>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}