// src/components/common/Navbar.jsx — full replacement

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiMessageCircle, FiFilm, FiUsers, FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import useAuthStore from '../../store/useAuthStore';
import useNotificationStore from '../../store/useNotificationStore';
import useChatStore from '../../store/useChatStore';
import useThemeStore from '../../store/useThemeStore';
import Avatar from './Avatar';
import { formatNumber } from '../../utils/formatters';

var NAV_ICON = { padding: 8, color: '#FFFFFF', display: 'flex', borderRadius: 10, textDecoration: 'none', alignItems: 'center', gap: 3 };
var BADGE = { position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, background: '#EF4444', color: '#FFFFFF', fontSize: 9, fontWeight: 700, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' };

export default function Navbar({ onMenuToggle }) {
  var navigate = useNavigate();
  var user = useAuthStore(function (s) { return s.user; });
  var unreadNotif = useNotificationStore(function (s) { return s.unreadCount; });
  var fetchUnread = useNotificationStore(function (s) { return s.fetchUnreadCount; });
  var conversations = useChatStore(function (s) { return s.conversations; });
  var fetchConversations = useChatStore(function (s) { return s.fetchConversations; });
  var theme = useThemeStore(function (s) { return s.theme; });
  var toggleTheme = useThemeStore(function (s) { return s.toggleTheme; });

  var searchState = useState('');
  var search = searchState[0];
  var setSearch = searchState[1];

  useEffect(function () {
    fetchUnread();
    fetchConversations();
    var interval = setInterval(function () { fetchUnread(); fetchConversations(); }, 10000);
    window.addEventListener('focus', function () { fetchUnread(); fetchConversations(); });
    return function () { clearInterval(interval); };
  }, []);

  var totalUnreadMessages = 0;
  conversations.forEach(function (c) { totalUnreadMessages += c.unreadCount || 0; });

  var handleSearch = function (e) {
    e.preventDefault();
    if (search.trim()) navigate('/explore?q=' + encodeURIComponent(search.trim()));
  };

  var profileUrl = '/' + (user && user.username ? user.username : '');

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>

{/* LEFT: Menu + Logo */}
<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
  <button onClick={onMenuToggle} className="mobile-menu-btn" style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 4, display: 'none' }}>
    <FiMenu size={20} />
  </button>
  <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', flexShrink: 0 }}>
    <img src="/logo.svg" alt="Vibe" style={{ width: 28, height: 28 }} />
    <span style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', letterSpacing: -0.5 }}>Vibe</span>
  </Link>
</div>

        {/* CENTER - Search */}
        <form onSubmit={handleSearch} className="nav-search" style={{ flex: 1, maxWidth: 300, margin: '0 12px' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }} size={15} />
            <input
              type="text" value={search} onChange={function (e) { setSearch(e.target.value); }}
              placeholder="Search Vibe..."
              style={{ width: '100%', padding: '7px 10px 7px 32px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 18, color: '#FFFFFF', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </form>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>

          <Link to="/explore" className="nav-icon-mobile" style={{ ...NAV_ICON, display: 'none' }}><FiSearch size={19} /></Link>
          <Link to="/reels" className="nav-icon" style={NAV_ICON} title="Reels"><FiFilm size={19} /></Link>

          <Link to="/notifications" style={{ ...NAV_ICON, position: 'relative' }} title="Notifications">
            <FiBell size={19} />
            {unreadNotif > 0 && <span style={BADGE}>{unreadNotif > 99 ? '99+' : unreadNotif}</span>}
          </Link>

          <Link to="/messages" style={{ ...NAV_ICON, position: 'relative' }} title="Messages">
            <FiMessageCircle size={19} />
            {totalUnreadMessages > 0 && <span style={BADGE}>{totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}</span>}
          </Link>

          <Link to={profileUrl} className="nav-icon" style={NAV_ICON} title="Profile">
            <FiUsers size={19} />
            {user && user.followersCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#FFFFFF' }}>{formatNumber(user.followersCount)}</span>}
          </Link>

          <button onClick={toggleTheme} style={{ ...NAV_ICON, background: 'none', border: 'none', cursor: 'pointer' }} title="Toggle theme">
            {theme === 'dark' ? <FiSun size={19} /> : <FiMoon size={19} />}
          </button>

          <Link to={profileUrl} style={{ display: 'flex', marginLeft: 4 }}>
            <Avatar src={user && user.avatar} alt={user && user.firstName} size="xs" />
          </Link>
        </div>
      </div>

      <style>{`
        .mobile-menu-btn { display: none; }
        .nav-search { display: block; }
        .nav-icon { display: flex; }
        .nav-icon-mobile { display: none; }
        @media (max-width: 640px) {
          .mobile-menu-btn { display: block !important; }
          .nav-search { display: none !important; }
          .nav-icon { display: none !important; }
          .nav-icon-mobile { display: flex !important; }
        }
        @media (min-width: 641px) and (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}