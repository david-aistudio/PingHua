// @ts-ignore
import scraper from './animexin-scraper.js';
import { supabaseAdmin } from './supabase-server';
import { DonghuaDetail, EpisodeDetail } from './types';

export * from './types';

const BASE_URL = "https://animexin.dev";

export const animexin = {
    // 1. HOME
    getHomeData: async (page: number = 1) => {
        return await scraper.scrapeHome(page);
    },

    // 2. SEARCH (Tetep pake logic di scraper)
    search: async (query: string) => {
        const res = await scraper.scrapeHome(1); // Sementara pake home logic buat search
        // (Nanti bisa ditambahin scrapeSearch khusus di jantung scraper kalau kurang)
        return { data: res?.latest || [], status: 'success' };
    },

    // 3. DETAIL
    getDetail: async (slug: string) => {
        return await scraper.scrapeDetail(slug);
    },

    // 4. EPISODE
    getEpisode: async (slug: string) => {
        const epData = await scraper.scrapeEpisode(slug);
        if (!epData) return null;

        // Ambil full list dari parent via cache atau fetch ulang
        const seriesSlug = epData.parent_url.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
        const detailData = await scraper.scrapeDetail(seriesSlug);
        
        // Healing logic: Update DB
        if (detailData) {
            supabaseAdmin.from('api_cache').upsert({
                path: `detail/${seriesSlug}`,
                data: detailData,
                timestamp: Date.now()
            }).then(() => {});
        }

        return {
            episode: epData.episode,
            streaming: epData.streaming,
            episodes_list: detailData?.episodes_list || [],
            donghua_details: { 
                title: epData.anime_title, 
                slug: seriesSlug,
                poster: detailData?.poster
            },
            navigation: epData.navigation
        };
    },

    getGenres: async () => ({ 
        data: [
            { title: "Action", slug: "action" }, { title: "Adventure", slug: "adventure" },
            { title: "Comedy", slug: "comedy" }, { title: "Cultivation", slug: "cultivation" }
        ]
    }),

    getByGenre: async (slug: string, page: number = 1) => ({ data: [] })
};