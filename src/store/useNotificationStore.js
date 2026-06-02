// src/store/useNotificationStore.js

import { create } from 'zustand';
import API from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

var useNotificationStore = create(function (set, get) {
  return {
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async function () {
      set({ loading: true });
      try {
        var res = await API.get(ENDPOINTS.NOTIFICATIONS.LIST);
        var data = res.data.data || res.data.notifications || [];
        set({ notifications: data, loading: false });
      } catch (err) {
        set({ loading: false });
      }
    },

    fetchUnreadCount: async function () {
      try {
        var res = await API.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
        set({ unreadCount: res.data.data.count || 0 });
      } catch (err) {}
    },

    addNotification: function (notification) {
      set({
        notifications: [notification].concat(get().notifications),
        unreadCount: get().unreadCount + 1,
      });
    },

    markRead: async function (id) {
      var state = get();
      try { await API.put(ENDPOINTS.NOTIFICATIONS.READ(id)); } catch (err) {}
      var found = state.notifications.find(function (n) { return n._id === id; });
      if (found && !found.isRead) {
        set({ unreadCount: Math.max(state.unreadCount - 1, 0) });
      }
      set({
        notifications: state.notifications.map(function (n) {
          return n._id === id ? Object.assign({}, n, { isRead: true }) : n;
        }),
      });
    },

    markAllRead: async function () {
      try { await API.put(ENDPOINTS.NOTIFICATIONS.READ_ALL); } catch (err) {}
      set({
        notifications: get().notifications.map(function (n) { return Object.assign({}, n, { isRead: true }); }),
        unreadCount: 0,
      });
    },

    reset: function () {
      set({ notifications: [], unreadCount: 0, loading: false });
    },
  };
});

export default useNotificationStore;