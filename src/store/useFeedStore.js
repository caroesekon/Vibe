// src/store/useFeedStore.js

import { create } from 'zustand';
import API from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

var useFeedStore = create(function (set, get) {
  return {
    posts: [],
    cursor: null,
    hasMore: true,
    loading: false,

    fetchFeed: async function (reset) {
      var state = get();
      if (state.loading) return;
      if (!reset && !state.hasMore) return;

      set({ loading: true });
      try {
        var params = {};
        if (!reset && state.cursor) params.cursor = state.cursor;

        var res = await API.get(ENDPOINTS.POSTS.FEED, { params: params });
        var data = res.data.data;
        var nextCursor = res.data.nextCursor;
        var more = res.data.hasMore;

        set({
          posts: reset ? data : state.posts.concat(data),
          cursor: nextCursor,
          hasMore: more,
          loading: false,
        });
      } catch (err) {
        set({ loading: false });
      }
    },

    addPost: function (post) {
      set({ posts: [post].concat(get().posts) });
    },

    updatePost: function (postId, updates) {
      set({
        posts: get().posts.map(function (p) {
          return p._id === postId ? Object.assign({}, p, updates) : p;
        }),
      });
    },

    removePost: function (postId) {
      set({ posts: get().posts.filter(function (p) { return p._id !== postId; }) });
    },

    reset: function () {
      set({ posts: [], cursor: null, hasMore: true, loading: false });
    },
  };
});

export default useFeedStore;