// src/pages/settings/Settings.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import LegalModal from '../../components/common/LegalModal';

export default function Settings() {
  var navigate = useNavigate();
  var user = useAuthStore(function (s) { return s.user; });
  var setUser = useAuthStore(function (s) { return s.setUser; });
  var logout = useAuthStore(function (s) { return s.logout; });

  var activeState = useState('privacy');
  var activeTab = activeState[0];
  var setActiveTab = activeState[1];

  var legalTypeState = useState(null);
  var legalType = legalTypeState[0];
  var setLegalType = legalTypeState[1];

  var loadState = useState(false);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var saveLoadState = useState(false);
  var saveLoading = saveLoadState[0];
  var setSaveLoading = saveLoadState[1];

  var privacyState = useState({
    profileVisibility: 'public',
    defaultPostAudience: 'public',
    friendRequestPermission: 'everyone',
    messagePermission: 'everyone',
    onlineStatusVisible: true,
    lastSeenVisible: true,
  });
  var privacy = privacyState[0];
  var setPrivacy = privacyState[1];

  var notifState = useState({
    likes: true, comments: true, follows: true, messages: true,
    friendRequests: true, mentions: true, shares: true,
    storyReactions: true, storyViews: true, groupInvites: true,
    liveStreams: true, pushEnabled: true, emailDigest: false,
  });
  var notifs = notifState[0];
  var setNotifs = notifState[1];

  useEffect(function () { fetchSettings(); }, []);

  var fetchSettings = async function () {
    setLoading(true);
    try {
      var res = await API.get(ENDPOINTS.SETTINGS.GET);
      var data = res.data.data;
      if (data.privacy) setPrivacy(Object.assign({}, privacy, data.privacy));
      if (data.notifications) setNotifs(Object.assign({}, notifs, data.notifications));
    } catch (err) {}
    setLoading(false);
  };

  var handleLogout = async function () { await logout(); navigate('/login'); };

  var savePrivacy = async function () {
    setSaveLoading(true);
    try {
      await API.put(ENDPOINTS.SETTINGS.PRIVACY, privacy);
      if (user) setUser(Object.assign({}, user, { privacySettings: privacy }));
      toast.success('Privacy settings saved');
    } catch (err) { toast.error('Failed to save'); }
    setSaveLoading(false);
  };

  var saveNotifications = async function () {
    setSaveLoading(true);
    try {
      await API.put('/settings/notifications', notifs);
      if (user) setUser(Object.assign({}, user, { notificationPreferences: notifs }));
      toast.success('Notification preferences saved');
    } catch (err) { toast.error('Failed to save'); }
    setSaveLoading(false);
  };

  var requestBackup = async function () {
    try {
      await API.post('/backup/request');
      toast.success('Backup requested!');
    } catch (err) { toast.error('Backup failed'); }
  };

  var togglePrivacy = function (key) {
    var p = Object.assign({}, privacy);
    p[key] = !p[key];
    setPrivacy(p);
  };

  var toggleNotif = function (key) {
    var n = Object.assign({}, notifs);
    n[key] = !n[key];
    setNotifs(n);
  };

  var tabs = [
    { key: 'privacy', label: 'Privacy', icon: '🔒' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'appearance', label: 'Appearance', icon: '🎨' },
    { key: 'language', label: 'Language', icon: '🌐' },
    { key: 'backup', label: 'Backup', icon: '💾' },
    { key: 'legal', label: 'Legal', icon: '📜' },
    { key: 'delete', label: 'Delete', icon: '⚠️' },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading settings...</div>;

  return (
    <div style={{ paddingBottom: 64 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', marginBottom: 16 }}>Settings</h2>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', flexWrap: 'wrap' }}>
        {tabs.map(function (t) {
          return (
            <button key={t.key} onClick={function () { setActiveTab(t.key); }} style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeTab === t.key ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : '#1E293B',
              color: activeTab === t.key ? 'white' : '#94A3B8',
            }}>{t.icon} {t.label}</button>
          );
        })}
      </div>

      <div style={{ background: '#0F172A', borderRadius: 16, padding: 20, border: '1px solid #1E293B' }}>
        {activeTab === 'privacy' && (
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#F8FAFC', marginBottom: 16 }}>Privacy Settings</h3>
            {[
              { key: 'profileVisibility', label: 'Profile Visibility', type: 'select', options: ['public', 'friends', 'private'], labels: ['Everyone', 'Friends', 'Only Me'] },
              { key: 'defaultPostAudience', label: 'Default Post Audience', type: 'select', options: ['public', 'friends', 'only_me'], labels: ['Public', 'Friends', 'Only Me'] },
              { key: 'friendRequestPermission', label: 'Friend Requests', type: 'select', options: ['everyone', 'friends_of_friends', 'none'], labels: ['Everyone', 'Friends of Friends', 'Nobody'] },
              { key: 'messagePermission', label: 'Message Permission', type: 'select', options: ['everyone', 'friends', 'none'], labels: ['Everyone', 'Friends', 'Nobody'] },
              { key: 'onlineStatusVisible', label: 'Show Online Status', type: 'toggle' },
              { key: 'lastSeenVisible', label: 'Show Last Seen', type: 'toggle' },
            ].map(function (s) {
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1E293B' }}>
                  <span style={{ fontSize: 14, color: '#CBD5E1', fontWeight: 500 }}>{s.label}</span>
                  {s.type === 'toggle' ? (
                    <button onClick={function () { togglePrivacy(s.key); }} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: privacy[s.key] ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : '#334155', position: 'relative' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: privacy[s.key] ? 25 : 3, transition: 'left 0.2s' }} />
                    </button>
                  ) : (
                    <select value={privacy[s.key]} onChange={function (e) { var p = Object.assign({}, privacy); p[s.key] = e.target.value; setPrivacy(p); }} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '6px 10px', color: '#F8FAFC', fontSize: 13, cursor: 'pointer' }}>
                      {s.options.map(function (o, i) { return <option key={o} value={o}>{s.labels[i]}</option>; })}
                    </select>
                  )}
                </div>
              );
            })}
            <Button onClick={savePrivacy} loading={saveLoading} style={{ marginTop: 16 }}>Save Privacy Settings</Button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#F8FAFC', marginBottom: 16 }}>Notification Preferences</h3>
            {[
              { key: 'likes', label: 'Likes' }, { key: 'comments', label: 'Comments' },
              { key: 'follows', label: 'Follows' }, { key: 'messages', label: 'Messages' },
              { key: 'friendRequests', label: 'Friend Requests' }, { key: 'mentions', label: 'Mentions' },
              { key: 'shares', label: 'Shares' }, { key: 'storyReactions', label: 'Story Reactions' },
              { key: 'pushEnabled', label: 'Push Notifications' },
            ].map(function (n) {
              return (
                <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1E293B' }}>
                  <span style={{ fontSize: 14, color: '#CBD5E1', fontWeight: 500 }}>{n.label}</span>
                  <button onClick={function () { toggleNotif(n.key); }} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: notifs[n.key] ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : '#334155', position: 'relative' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: notifs[n.key] ? 25 : 3, transition: 'left 0.2s' }} />
                  </button>
                </div>
              );
            })}
            <Button onClick={saveNotifications} loading={saveLoading} style={{ marginTop: 16 }}>Save Notification Preferences</Button>
          </div>
        )}

        {activeTab === 'appearance' && <div><h3 style={{ fontSize: 17, fontWeight: 600, color: '#F8FAFC', marginBottom: 16 }}>Appearance</h3><p style={{ color: '#94A3B8', fontSize: 14 }}>Dark theme is enabled by default.</p></div>}
        {activeTab === 'language' && <div><h3 style={{ fontSize: 17, fontWeight: 600, color: '#F8FAFC', marginBottom: 16 }}>Language</h3><select style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', color: '#F8FAFC', fontSize: 14, cursor: 'pointer', width: '100%' }}><option value="en">English</option><option value="ar">Arabic</option><option value="fr">French</option><option value="es">Spanish</option></select></div>}
        {activeTab === 'backup' && <div><h3 style={{ fontSize: 17, fontWeight: 600, color: '#F8FAFC', marginBottom: 8 }}>Backup Your Data</h3><p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 16 }}>Request a download of all your data.</p><Button onClick={requestBackup}>Request Data Backup</Button></div>}
        {activeTab === 'legal' && (
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#F8FAFC', marginBottom: 16 }}>Legal Documents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['terms_of_service','privacy_policy','cookie_policy','community_guidelines','acceptable_use_policy','refund_policy','disclaimer','contact_information'].map(function (k) {
                var labels = { terms_of_service: 'Terms of Service', privacy_policy: 'Privacy Policy', cookie_policy: 'Cookie Policy', community_guidelines: 'Community Guidelines', acceptable_use_policy: 'Acceptable Use Policy', refund_policy: 'Refund Policy', disclaimer: 'Disclaimer', contact_information: 'Contact Information' };
                return <button key={k} onClick={function () { setLegalType(k); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#CBD5E1', cursor: 'pointer', fontSize: 14 }}>📄 {labels[k]}</button>;
              })}
            </div>
          </div>
        )}
        {activeTab === 'delete' && <div><h3 style={{ fontSize: 17, fontWeight: 600, color: '#EF4444', marginBottom: 8 }}>Delete Account</h3><p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 16 }}>This action cannot be undone.</p><Button variant="danger" onClick={function () { toast.error('Account deletion requires confirmation'); }}>Delete My Account</Button></div>}
      </div>

      <div style={{ marginTop: 24 }}>
        <button onClick={handleLogout} style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid #334155', background: '#1E293B', color: '#EF4444', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>Logout</button>
      </div>

      <LegalModal type={legalType} onClose={function () { setLegalType(null); }} />
    </div>
  );
}