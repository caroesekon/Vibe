// client/src/store/useAuthStore.js

import { create } from 'zustand';
import API from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

var useAuthStore = create(function (set, get) {
  return {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,

    login: async function (identifier, password) {
      set({ loading: true });
      try {
        var res = await API.post(ENDPOINTS.AUTH.LOGIN, { identifier: identifier, password: password });
        var user = res.data.data.user;
        var accessToken = res.data.data.accessToken;
        localStorage.setItem('token', accessToken);
        set({ user: user, token: accessToken, loading: false });
        return res.data;
      } catch (err) {
        set({ loading: false });
        throw err;
      }
    },

    register: async function (data) {
      set({ loading: true });
      try {
        var payload = {};

        if (data.email && data.email.trim()) {
          payload.email = data.email.trim();
        }
        if (data.phone && data.phone.trim()) {
          payload.phone = data.phone.trim();
        }

        payload.username = data.username;
        payload.password = data.password;
        payload.firstName = data.firstName;
        payload.lastName = data.lastName || '';

        var res = await API.post(ENDPOINTS.AUTH.REGISTER, payload);
        var user = res.data.data.user;
        var accessToken = res.data.data.accessToken;
        localStorage.setItem('token', accessToken);
        set({ user: user, token: accessToken, loading: false });
        return res.data;
      } catch (err) {
        set({ loading: false });
        throw err;
      }
    },

    logout: async function () {
      try { await API.post(ENDPOINTS.AUTH.LOGOUT); } catch (err) {}
      localStorage.removeItem('token');
      set({ user: null, token: null });
    },

    fetchMe: async function () {
      try {
        var res = await API.get(ENDPOINTS.USERS.PROFILE('me'));
        set({ user: res.data.data });
      } catch (err) {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      }
    },

    setUser: function (user) { set({ user: user }); },
    isAuthenticated: function () { return !!get().token; },
  };
});

export default useAuthStore;