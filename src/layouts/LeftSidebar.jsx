// src/layouts/LeftSidebar.jsx

import { NavLink } from 'react-router-dom';
import { FiHome, FiCompass, FiFilm, FiUsers, FiShoppingBag, FiMessageCircle, FiBookmark, FiSettings, FiCheckCircle } from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import Avatar from '../components/common/Avatar';
import VerifiedBadge from '../components/common/VerifiedBadge';

var navItems = [
  { to: '/', icon: FiHome, label: 'Home' },
  { to: '/explore', icon: FiCompass, label: 'Explore' },
  { to: '/reels', icon: FiFilm, label: 'Reels' },
  { to: '/groups', icon: FiUsers, label: 'Groups' },
  { to: '/marketplace', icon: FiShoppingBag, label: 'Marketplace' },
  { to: '/messages', icon: FiMessageCircle, label: 'Messages' },
  { to: '/saved', icon: FiBookmark, label: 'Saved' },
  { to: '/settings', icon: FiSettings, label: 'Settings' },
  { to: '/verification', icon: FiCheckCircle, label: 'Verified' },
];

export default function LeftSidebar({ showMobile, onClose }) {
  var user = useAuthStore(function (s) { return s.user; });
  var conversations = useChatStore(function (s) { return s.conversations; });

  var totalUnread = 0;
  conversations.forEach(function (c) { totalUnread += c.unreadCount || 0; });

  return (
    <>
      {showMobile && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />}

      <aside className="left-sidebar" style={{
        width: 240, flexShrink: 0, position: 'fixed', top: 56, left: 0, bottom: 0,
        background: '#0F172A', borderRight: '1px solid #1E293B', zIndex: 45,
        transform: showMobile ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s', overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        <nav style={{ padding: '8px 12px', flex: 1 }}>
          {navItems.map(function (item) {
            var badge = item.to === '/messages' ? totalUnread : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                style={function (p) {
                  return {
                    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 10,
                    marginBottom: 2, textDecoration: 'none',
                    background: p.isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                    color: p.isActive ? '#3B82F6' : '#94A3B8',
                    fontWeight: p.isActive ? 600 : 400, fontSize: 14,
                  };
                }}
              >
                <div style={{ position: 'relative', display: 'flex', width: 24, justifyContent: 'center' }}>
                  <item.icon size={20} />
                  {badge > 0 && (
                    <span style={{ position: 'absolute', top: -6, right: -14, minWidth: 16, height: 16, background: '#EF4444', color: 'white', fontSize: 9, fontWeight: 700, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #1E293B' }}>
          <NavLink to={'/' + (user && user.username)} onClick={onClose} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar src={user && user.avatar} alt={user && user.firstName} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user && user.firstName} {user && user.lastName}
                </span>
                {user && user.isVerified && <VerifiedBadge size="xs" />}
              </div>
              <span style={{ fontSize: 11, color: '#64748B' }}>@{user && user.username}</span>
            </div>
          </NavLink>
        </div>
      </aside>

      <div className="sidebar-spacer" style={{ width: 240, flexShrink: 0, display: 'none' }} />
      <style>{`
        @media (min-width: 1024px) {
          .left-sidebar { transform: translateX(0) !important; position: fixed !important; }
          .sidebar-spacer { display: block !important; }
        }
      `}</style>
    </>
  );
}