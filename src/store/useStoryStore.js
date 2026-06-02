// src/store/useStoryStore.js

import { create } from 'zustand';
import API from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

var useStoryStore = create(function (set, get) {
  return {
    stories: [],
    activeStory: null,
    loading: false,

    fetchStories: async function () {
      set({ loading: true });
      try {
        var res = await API.get(ENDPOINTS.STORIES.FEED);
        set({ stories: res.data.data, loading: false });
      } catch (err) {
        set({ loading: false });
      }
    },

    setActiveStory: function (story) { set({ activeStory: story }); },

    viewStory: async function (storyId) {
      try { await API.post(ENDPOINTS.STORIES.VIEW(storyId)); } catch (err) {}
    },

    reactToStory: async function (storyId, emoji) {
      try { await API.post(ENDPOINTS.STORIES.REACT(storyId), { emoji: emoji }); } catch (err) {}
    },

    reset: function () { set({ stories: [], activeStory: null, loading: false }); },
  };
});

export default useStoryStore;