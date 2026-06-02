// src/store/useThemeStore.js

import { create } from 'zustand';

var useThemeStore = create(function (set, get) {
  return {
    theme: localStorage.getItem('vibe-theme') || 'dark',
    sidebarCollapsed: false,

    setTheme: function (theme) {
      localStorage.setItem('vibe-theme', theme);
      set({ theme: theme });
      applyTheme(theme);
    },

    toggleSidebar: function () {
      set({ sidebarCollapsed: !get().sidebarCollapsed });
    },

    toggleTheme: function () {
      var next = get().theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('vibe-theme', next);
      set({ theme: next });
      applyTheme(next);
    },
  };
});

function applyTheme(theme) {
  var root = document.documentElement;

  if (theme === 'light') {
    root.style.setProperty('--bg-primary', '#FFFFFF');
    root.style.setProperty('--bg-secondary', '#F8FAFC');
    root.style.setProperty('--bg-tertiary', '#F1F5F9');
    root.style.setProperty('--bg-card', '#FFFFFF');
    root.style.setProperty('--bg-input', '#F1F5F9');
    root.style.setProperty('--bg-hover', '#E2E8F0');
    root.style.setProperty('--border-color', '#E2E8F0');
    root.style.setProperty('--text-primary', '#0F172A');
    root.style.setProperty('--text-secondary', '#334155');
    root.style.setProperty('--text-muted', '#64748B');
    root.style.setProperty('--gradient-from', '#3B82F6');
    root.style.setProperty('--gradient-to', '#8B5CF6');
  } else {
    root.style.setProperty('--bg-primary', '#020617');
    root.style.setProperty('--bg-secondary', '#0F172A');
    root.style.setProperty('--bg-tertiary', '#1E293B');
    root.style.setProperty('--bg-card', '#0F172A');
    root.style.setProperty('--bg-input', '#1E293B');
    root.style.setProperty('--bg-hover', '#1E293B');
    root.style.setProperty('--border-color', '#1E293B');
    root.style.setProperty('--text-primary', '#F8FAFC');
    root.style.setProperty('--text-secondary', '#CBD5E1');
    root.style.setProperty('--text-muted', '#94A3B8');
    root.style.setProperty('--gradient-from', '#3B82F6');
    root.style.setProperty('--gradient-to', '#8B5CF6');
  }
}

applyTheme(localStorage.getItem('vibe-theme') || 'dark');

export default useThemeStore;