// src/pages/messages/Messages.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiSettings, FiX, FiVolumeX } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import useChatStore from '../../store/useChatStore';
import Avatar from '../../components/common/Avatar';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { timeAgo } from '../../utils/formatters';
import toast from 'react-hot-toast';

function getOtherParticipant(conv, userId) {
  if (!conv.participants || conv.participants.length === 0) return null;
  return conv.participants.find(function (p) {
    return (p._id || p) !== userId;
  }) || conv.participants[0];
}

export default function Messages() {
  var navigate = useNavigate();
  var user = useAuthStore(function (s) { return s.user; });
  var conversations = useChatStore(function (s) { return s.conversations; });
  var fetchConversations = useChatStore(function (s) { return s.fetchConversations; });
  var markRead = useChatStore(function (s) { return s.markRead; });

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var searchState = useState('');
  var search = searchState[0];
  var setSearch = searchState[1];

  var showNewChatState = useState(false);
  var showNewChat = showNewChatState[0];
  var setShowNewChat = showNewChatState[1];

  var showSettingsState = useState(false);
  var showSettings = showSettingsState[0];
  var setShowSettings = showSettingsState[1];

  var settingsOnlineState = useState(true);
  var settingsOnline = settingsOnlineState[0];
  var setSettingsOnline = settingsOnlineState[1];

  var settingsMsgsState = useState(true);
  var settingsMsgs = settingsMsgsState[0];
  var setSettingsMsgs = settingsMsgsState[1];

  var newChatSearchState = useState('');
  var newChatSearch = newChatSearchState[0];
  var setNewChatSearch = newChatSearchState[1];

  var searchResultsState = useState([]);
  var searchResults = searchResultsState[0];
  var setSearchResults = searchResultsState[1];

  useEffect(function () {
    fetchConversations().then(function () { setLoading(false); });
    if (user && user.privacySettings) {
      setSettingsOnline(user.privacySettings.onlineStatusVisible !== false);
      setSettingsMsgs(user.privacySettings.messagePermission === 'everyone');
    }
  }, []);

  var seenSystem = {};
  var filtered = conversations.filter(function (c) {
    if (c.isSystem || c.type === 'broadcast' || c.type === 'ai') {
      var key = (c.type || '') + '_' + (c.systemType || '');
      if (seenSystem[key]) return false;
      seenSystem[key] = true;
    }
    if (!search) return true;
    var other = getOtherParticipant(c, user._id);
    var name = c.name || (other ? other.firstName + ' ' + other.lastName : '');
    return name.toLowerCase().indexOf(search.toLowerCase()) !== -1;
  });

  var handleNewChatSearch = async function () {
    if (!newChatSearch.trim()) return;
    try {
      var res = await API.get(ENDPOINTS.SEARCH.ALL, { params: { q: newChatSearch, type: 'users' } });
      setSearchResults(res.data.data.users.data || []);
    } catch (err) {}
  };

  var startChat = async function (participantId) {
    try {
      var res = await API.post(ENDPOINTS.MESSAGES.CREATE_CONVERSATION, { participantId: participantId });
      navigate('/messages/' + res.data.data._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot start chat');
    }
  };

  var saveSettings = async function () {
    try {
      await API.put('/messages/settings', { showOnline: settingsOnline, acceptMessages: settingsMsgs });
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  if (loading) return <Loader className="py-20" />;

  return (
    <div style={{ paddingBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>Messages</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={function () { setShowNewChat(true); }} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: '#1E293B', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="New Chat"><FiPlus size={20} /></button>
          <button onClick={function () { setShowSettings(true); }} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: '#1E293B', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Settings"><FiSettings size={20} /></button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} size={18} />
        <input type="text" value={search} onChange={function (e) { setSearch(e.target.value); }} placeholder="Search messages..." style={{ width: '100%', padding: '12px 14px 12px 44px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: 14, color: '#F8FAFC', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="💬" title="No conversations" description="Start a new chat" />
      ) : (
        <div>
          {filtered.map(function (conv) {
            var isSystem = conv.isSystem || conv.type === 'broadcast' || conv.type === 'ai';
            var other = getOtherParticipant(conv, user._id);
            var name = conv.name || (other ? other.firstName + ' ' + other.lastName : 'Unknown');
            var avatar = other ? other.avatar : '';
            var isOnline = !isSystem && other && other.isOnline;
            var isVerified = isSystem || (other && other.isVerified);
            var unread = conv.unreadCount || 0;
            var isMuted = conv.muted && conv.muted.some(function (m) { return m === user._id; });

            return (
              <Link
                key={conv._id}
                to={'/messages/' + conv._id}
                onClick={function () { if (unread > 0) markRead(conv._id); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, textDecoration: 'none', marginBottom: 4, background: unread > 0 ? 'rgba(59,130,246,0.05)' : 'transparent' }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {isSystem ? (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: conv.systemType === 'hdm_ai' ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 700 }}>
                      {conv.systemType === 'hdm_ai' ? '🤖' : 'V'}
                    </div>
                  ) : (
                    <Avatar src={avatar} alt={name} size="lg" />
                  )}
                  {isOnline && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: '#10B981', border: '2px solid #020617' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                      <span style={{ fontWeight: unread > 0 ? 700 : 500, fontSize: 14, color: unread > 0 ? '#F8FAFC' : '#CBD5E1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                      {isVerified && <VerifiedBadge size="xs" />}
                      {isSystem && <span style={{ fontSize: 9, background: '#1E293B', color: '#94A3B8', padding: '1px 5px', borderRadius: 4 }}>OFFICIAL</span>}
                    </div>
                    <span style={{ fontSize: 11, color: '#64748B', flexShrink: 0, marginLeft: 8 }}>{conv.lastMessage && timeAgo(conv.lastMessage.sentAt)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                      {isMuted && <FiVolumeX size={12} style={{ marginRight: 4, display: 'inline' }} />}
                      {conv.lastMessage ? (conv.lastMessage.type === 'text' ? conv.lastMessage.content : '📎 Attachment') : 'Start chatting'}
                    </span>
                    {unread > 0 && (
                      <span style={{ minWidth: 20, height: 20, borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', flexShrink: 0, marginLeft: 8 }}>
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={function () { setShowNewChat(false); }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
          <div style={{ position: 'relative', background: '#0F172A', borderRadius: 20, width: '100%', maxWidth: 440, maxHeight: '80vh', border: '1px solid #1E293B', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>New Message</h3>
              <button onClick={function () { setShowNewChat(false); }} style={{ background: '#1E293B', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18, width: 32, height: 32, borderRadius: 8 }}><FiX size={18} /></button>
            </div>
            <div style={{ padding: 16, overflowY: 'auto' }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} size={16} />
                <input type="text" value={newChatSearch} onChange={function (e) { setNewChatSearch(e.target.value); }} onKeyDown={function (e) { if (e.key === 'Enter') handleNewChatSearch(); }} placeholder="Search users..." style={{ width: '100%', padding: '10px 12px 10px 38px', background: '#1E293B', border: '1px solid #334155', borderRadius: 12, color: '#F8FAFC', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button onClick={handleNewChatSearch} style={{ width: '100%', padding: 10, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 12 }}>Search</button>
              {searchResults.map(function (u) {
                return (
                  <div key={u._id} onClick={function () { startChat(u._id); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #1E293B', cursor: 'pointer' }}>
                    <Avatar src={u.avatar} alt={u.firstName} size="sm" />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ fontWeight: 600, fontSize: 14, color: '#F8FAFC' }}>{u.firstName} {u.lastName}</span>{u.isVerified && <VerifiedBadge size="xs" />}</div>
                      <span style={{ fontSize: 12, color: '#64748B' }}>@{u.username}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={function () { setShowSettings(false); }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
          <div style={{ position: 'relative', background: '#0F172A', borderRadius: 20, width: '100%', maxWidth: 400, border: '1px solid #1E293B' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>Chat Settings</h3>
              <button onClick={function () { setShowSettings(false); }} style={{ background: '#1E293B', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18, width: 32, height: 32, borderRadius: 8 }}><FiX size={18} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1E293B' }}>
                <div><div style={{ fontSize: 14, color: '#CBD5E1', fontWeight: 500 }}>Show Online Status</div><div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Let others see when you're online</div></div>
                <button onClick={function () { setSettingsOnline(!settingsOnline); }} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: settingsOnline ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : '#334155', position: 'relative' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: settingsOnline ? 25 : 3, transition: 'left 0.2s' }} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1E293B' }}>
                <div><div style={{ fontSize: 14, color: '#CBD5E1', fontWeight: 500 }}>Accept Message Requests</div><div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Allow non-friends to message you</div></div>
                <button onClick={function () { setSettingsMsgs(!settingsMsgs); }} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: settingsMsgs ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : '#334155', position: 'relative' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: settingsMsgs ? 25 : 3, transition: 'left 0.2s' }} />
                </button>
              </div>
              <button onClick={saveSettings} style={{ width: '100%', marginTop: 20, padding: 12, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}