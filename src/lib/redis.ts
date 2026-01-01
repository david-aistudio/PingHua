const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const res = await fetch(`${REDIS_URL}/get/${key}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
        next: { revalidate: 0 } // Jangan cache fetch-nya itu sendiri
      });
      const data = await res.json();
      return data.result ? JSON.parse(data.result) : null;
    } catch (e) {
      return null;
    }
  },

  set: async (key: string, value: any, ex: number = 1200): Promise<void> => {
    try {
      // ex = expiry dalam detik (default 20 menit)
      await fetch(`${REDIS_URL}/set/${key}?ex=${ex}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
        body: JSON.stringify(value)
      });
    } catch (e) {}
  },

  del: async (key: string): Promise<void> => {
    try {
      await fetch(`${REDIS_URL}/del/${key}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
      });
    } catch (e) {}
  }
};
