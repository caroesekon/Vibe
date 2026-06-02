// src/components/common/Logo.jsx

export default function Logo({ size }) {
  size = size || 40;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id="vibeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6"/>
          <stop offset="100%" stopColor="#8B5CF6"/>
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#vibeGrad)" />
      <text x="100" y="135" fontFamily="Arial, sans-serif" fontSize="130" fontWeight="900" fill="white" textAnchor="middle">V</text>
    </svg>
  );
}