// src/store/useChatStore.js

import { create } from 'zustand';
import API from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

var useChatStore = create(function (set, get) {
  return {
    conversations: [],
    activeConversation: null,
    messages: [],
    loading: false,

    fetchConversations: async function () {
      try {
        var res = await API.get(ENDPOINTS.MESSAGES.CONVERSATIONS);
        set({ conversations: res.data.data || [] });
      } catch (err) {}
    },

    setActiveConversation: function (conversationId) {
      set({ activeConversation: conversationId, messages: [] });
    },

    fetchMessages: async function (conversationId) {
      set({ loading: true });
      try {
        var res = await API.get(ENDPOINTS.MESSAGES.GET_MESSAGES(conversationId));
        set({ messages: res.data.data || [], loading: false });
      } catch (err) {
        set({ loading: false });
      }
    },

    addMessage: function (message) {
      var state = get();
      var convId = typeof message.conversation === 'object' ? message.conversation._id : message.conversation;
      var activeId = typeof state.activeConversation === 'object' ? state.activeConversation._id : state.activeConversation;
      var isActiveConv = convId === activeId;

      if (isActiveConv) {
        set({ messages: state.messages.concat([message]) });
      }

      set({
        conversations: state.conversations.map(function (c) {
          if (c._id === convId) {
            return Object.assign({}, c, {
              lastMessage: {
                content: message.content || message.type,
                type: message.type,
                sender: message.sender,
                sentAt: new Date(),
              },
              unreadCount: isActiveConv ? 0 : (c.unreadCount || 0) + 1,
            });
          }
          return c;
        }),
      });
    },

    markRead: async function (conversationId) {
      try { await API.put(ENDPOINTS.MESSAGES.READ(conversationId)); } catch (err) {}
      set({
        conversations: get().conversations.map(function (c) {
          return c._id === conversationId ? Object.assign({}, c, { unreadCount: 0 }) : c;
        }),
      });
    },

    getTotalUnread: function () {
      var total = 0;
      var activeId = typeof get().activeConversation === 'object' ? get().activeConversation._id : get().activeConversation;
      get().conversations.forEach(function (c) {
        if (c._id !== activeId) {
          total += c.unreadCount || 0;
        }
      });
      return total;
    },

    reset: function () {
      set({ conversations: [], activeConversation: null, messages: [], loading: false });
    },
  };
});

export default useChatStore;