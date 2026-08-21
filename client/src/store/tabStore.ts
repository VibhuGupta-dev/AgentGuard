import { create } from 'zustand';

interface Tab {
  id: string;
  title: string;
  path: string;
}

interface TabState {
  tabs: Tab[];
  activeTabId: string;
  addTab: (tab: Tab) => void;
  closeTab: (id: string) => string | null; // Returns the path to navigate to
  setActiveTabId: (id: string) => void;
}

const defaultTabs = [{ id: 'dashboard', title: 'Dashboard', path: '/dashboard' }];

export const useTabStore = create<TabState>((set, get) => ({
  tabs: defaultTabs,
  activeTabId: 'dashboard',
  
  addTab: (newTab) => {
    const { tabs } = get();
    const exists = tabs.some((t) => t.id === newTab.id);
    
    if (exists) {
      // If path is updated (e.g., navigating to execute step within the same thread run)
      const updatedTabs = tabs.map((t) => (t.id === newTab.id ? { ...t, path: newTab.path } : t));
      set({ tabs: updatedTabs, activeTabId: newTab.id });
    } else {
      set({ tabs: [...tabs, newTab], activeTabId: newTab.id });
    }
  },

  closeTab: (id) => {
    // Cannot close dashboard tab
    if (id === 'dashboard') return null;

    const { tabs, activeTabId } = get();
    const index = tabs.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const newTabs = tabs.filter((t) => t.id !== id);
    let nextActivePath = null;
    let newActiveId = activeTabId;

    if (activeTabId === id) {
      const nextTab = newTabs[index - 1] || newTabs[0];
      newActiveId = nextTab.id;
      nextActivePath = nextTab.path;
    }

    set({ tabs: newTabs, activeTabId: newActiveId });
    return nextActivePath;
  },

  setActiveTabId: (id) => {
    set({ activeTabId: id });
  }
}));
