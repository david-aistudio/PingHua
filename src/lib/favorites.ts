import { DonghuaCard } from './api';

const KEY = 'pinghua_favorites';

export interface FavoriteItem {
  slug: string;
  title: string;
  poster: string;
  status: string;
  url: string;
}

export const favorites = {
  get: (): FavoriteItem[] => {
    try {
      const stored = localStorage.getItem(KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  add: (item: FavoriteItem) => {
    const list = favorites.get();
    // Check duplicate
    if (!list.some(i => i.slug === item.slug)) {
      const newList = [item, ...list];
      localStorage.setItem(KEY, JSON.stringify(newList));
    }
  },

  remove: (slug: string) => {
    const list = favorites.get();
    const newList = list.filter(i => i.slug !== slug);
    localStorage.setItem(KEY, JSON.stringify(newList));
  },

  has: (slug: string): boolean => {
    const list = favorites.get();
    return list.some(i => i.slug === slug);
  }
};
