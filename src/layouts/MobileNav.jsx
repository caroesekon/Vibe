// src/layouts/MobileNav.jsx

import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiCompass, FiFilm, FiBell, FiMessageCircle } from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';
import useChatStore from '../store/useChatStore';
import Avatar from '../components/common/Avatar';

export default function MobileNav() {
  var location = useLocation();
  var user = useAuthStore(function (s) { return s.user; });
  var unreadNotif = useNotificationStore(function (s) { return s.unreadCount; });
  var conversations = useChatStore(function (s) { return s.conversations; });

  var totalUnreadMessages = 0;
  conversations.forEach(function (c) { totalUnreadMessages += c.unreadCount || 0; });

  var isChatDetail = location.pathname.startsWith('/messages/') && location.pathname.split('/').length > 2;
  var isStoryViewer = location.pathname.startsWith('/stories/');
  if (isChatDetail || isStoryViewer) return null;

  var tabs = [
    { to: '/', icon: FiHome, label: 'Home' },
    { to: '/explore', icon: FiCompass, label: 'Explore' },
    { to: '/reels', icon: FiFilm, label: 'Reels' },
    { to: '/notifications', icon: FiBell, label: 'Alerts', badge: unreadNotif },
    { to: '/messages', icon: FiMessageCircle, label: 'Chat', badge: totalUnreadMessages },
  ];

  return (
    <>
      <nav className="mobile-nav">
        {tabs.map(function (tab) {
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="mobile-nav-item"
              style={function (p) {
                return { color: p.isActive ? '#3B82F6' : '#64748B' };
              }}
            >
              <div className="mobile-nav-icon">
                <tab.icon size={22} />
                {tab.badge > 0 && (
                  <span className="mobile-nav-badge">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="mobile-nav-label">{tab.label}</span>
            </NavLink>
          );
        })}

        <NavLink
          to={'/' + (user && user.username)}
          className="mobile-nav-item"
        >
          <Avatar src={user && user.avatar} alt={user && user.firstName} size="xs" />
          <span className="mobile-nav-label">You</span>
        </NavLink>
      </nav>

      <style>{`
        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: #0F172A;
          border-top: 1px solid #1E293B;
          z-index: 50;
        }
        .mobile-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          text-decoration: none;
          padding-bottom: 4px;
        }
        .mobile-nav-icon {
          position: relative;
          display: flex;
        }
        .mobile-nav-badge {
          position: absolute;
          top: -6px;
          right: -12px;
          min-width: 16px;
          height: 16px;
          background: #EF4444;
          color: white;
          font-size: 9px;
          font-weight: 700;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
        .mobile-nav-label {
          font-size: 10px;
        }
        @media (max-width: 1023px) {
          .mobile-nav {
            display: flex !important;
          }
        }
        @media (min-width: 1024px) {
          .mobile-nav {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}