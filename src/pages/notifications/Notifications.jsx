// src/pages/notifications/Notifications.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { timeAgo } from '../../utils/formatters';
import toast from 'react-hot-toast';

var TYPE_ICONS = {
  like: '❤️', reaction: '👍', comment: '💬', reply: '↩️', follow: '👤',
  friend_request: '🤝', friend_accept: '✅', mention: '@', share: '🔄',
  story_reaction: '⭐', story_view: '👁️', message: '📩', group_invite: '👥',
  group_join_approved: '✅', live_stream: '🔴', subscription: '💎', system_broadcast: '📢',
};

export default function Notifications() {
  var t = useTranslation().t;

  var notifState = useState([]);
  var notifications = notifState[0];
  var setNotifications = notifState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  useEffect(function () { fetchNotifications(); }, []);

  var fetchNotifications = async function () {
    setLoading(true);
    try {
      var res = await API.get(ENDPOINTS.NOTIFICATIONS.LIST);
      setNotifications(res.data.data || res.data.notifications || []);
    } catch (err) {}
    setLoading(false);
  };

  var handleMarkAll = async function () {
    try {
      await API.put(ENDPOINTS.NOTIFICATIONS.READ_ALL);
      setNotifications(notifications.map(function (n) { return Object.assign({}, n, { isRead: true }); }));
      toast.success('All marked as read');
    } catch (err) {}
  };

  if (loading) return <Loader className="py-20" />;

  return (
    <div style={{ paddingBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>{t('notifications.title')}</h2>
        <button onClick={handleMarkAll} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
          <FiCheck size={16} /> {t('notifications.markAllRead')}
        </button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title={t('notifications.noNotifications')} />
      ) : (
        <div>
          {notifications.map(function (n) {
            return (
              <div key={n._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #1E293B', opacity: n.isRead ? 0.6 : 1 }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{TYPE_ICONS[n.type] || '🔔'}</div>
                {n.sender && <Avatar src={n.sender.avatar} alt={n.sender.firstName} size="sm" />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{n.sender ? n.sender.firstName : 'Vibe'}</span>{' '}
                    {n.body || n.title}
                  </p>
                  <span style={{ fontSize: 11, color: '#64748B' }}>{timeAgo(n.createdAt)}</span>
                </div>
                {n.data && n.data.targetId && (
                  <Link to={'/post/' + n.data.targetId} style={{ color: '#3B82F6', fontSize: 12, textDecoration: 'none', flexShrink: 0 }}>View</Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}