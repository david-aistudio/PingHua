export interface HistoryItem {
  slug: string;
  title: string;
  episode: string;
  episodeSlug: string;
  poster?: string;
  timestamp: number;
}

const HISTORY_KEY = 'donghua_history';

export const history = {
  get: (): HistoryItem[] => {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  add: (item: Omit<HistoryItem, 'timestamp'>) => {
    try {
      const current = history.get();
      // Remove existing entry for same donghua if exists
      const filtered = current.filter(i => i.slug !== item.slug);
      
      const newItem: HistoryItem = {
        ...item,
        timestamp: Date.now(),
      };
      
      // Add new item to beginning
      const updated = [newItem, ...filtered].slice(0, 20); // Keep last 20
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  },

  clear: () => {
    localStorage.removeItem(HISTORY_KEY);
  }
};
