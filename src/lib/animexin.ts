import * as cheerio from 'cheerio';
import { supabaseAdmin } from './supabase-server';

const BASE_URL = "https://animexin.dev";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://animexin.dev/'
};

async function fetchSafe(url: string, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(15000) });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            return { data: html };
        } catch (e: any) {
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

export const animexin = {
    getHomeData: async (page: number = 1) => {
        try {
            const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}/`;
            const { data } = await fetchSafe(url) as any;
            const $ = cheerio.load(data);
            const result: { popular: any[], latest: any[], recommendation: any[] } = { popular: [], latest: [], recommendation: [] };

            const extract = (container: any) => {
                const items: any[] = [];
                $(container).find('article, .post-item, .listupd li').each((i: number, el: any) => {
                    const title = $(el).find('.tt, h4, .title').text().trim();
                    const link = $(el).find('a').attr('href');
                    let img = $(el).find('img').attr('src');
                    if (img?.includes('data:image')) img = $(el).find('img').attr('data-src') || img;
                    if (title && link) {
                        const slug = link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                        items.push({ title, slug, poster: img, url: `/detail/${slug}` });
                    }
                });
                return items;
            };

            $('.bixbox').each((i, box) => {
                const title = $(box).find('h2, h3').text().trim();
                if (title.includes('Popular Today')) result.popular = extract(box);
                else if (title.includes('Latest Release')) result.latest = extract(box);
                else if (title.includes('Recommendation')) result.recommendation = extract(box);
            });
            return result;
        } catch(e) { return { popular: [], latest: [], recommendation: [] }; }
    },

    search: async (query: string) => {
        try {
            const url = query ? `${BASE_URL}/?s=${encodeURIComponent(query)}` : BASE_URL;
            const { data } = await fetchSafe(url) as any;
            const $ = cheerio.load(data);
            const results: any[] = [];
            $('.listupd article').each((i, el) => {
                const title = $(el).find('.tt').text().trim();
                const link = $(el).find('a').attr('href');
                let img = $(el).find('img').attr('src');
                if (img?.includes('data:image')) img = $(el).find('img').attr('data-src') || img;
                if (title && link) {
                    const slug = link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                    results.push({ title, slug, poster: img, status: 'Ongoing', type: 'Donghua', url: `/detail/${slug}` });
                }
            });
            return { data: results, status: 'success' };
        } catch (e) { return { data: [], status: 'error' }; }
    },

    getDetail: async (slug: string) => {
        try {
            const cleanSlug = slug.replace(/^\/|\/$/g, '');
            const urls = [`${BASE_URL}/${cleanSlug}/`, `${BASE_URL}/anime/${cleanSlug}/` ];

            let htmlData;
            for (const u of urls) {
                try {
                    const res = await fetchSafe(u, 1) as any;
                    if (res && res.data.includes('entry-title')) { htmlData = res.data; break; }
                } catch(e) {}
            }

            if (!htmlData) return null;
            const $ = cheerio.load(htmlData);

            const episodes_list: any[] = [];
            $('.eplister li a').each((i, el) => {
                const num = $(el).find('.epl-num').text().trim();
                const link = $(el).attr('href');
                if (link) {
                    const epSlug = link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                    episodes_list.push({ episode: `Episode ${num}`, slug: epSlug, url: `/episode/${epSlug}` });
                }
            });

            $('.last-eps li, .cur-eps a').each((i, el) => {
                const link = $(el).attr('href') || $(el).find('a').attr('href');
                const txt = $(el).text().trim();
                if (link && link.includes('episode')) {
                    const epSlug = link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                    if (!episodes_list.find(e => e.slug === epSlug)) {
                        const numMatch = txt.match(/Episode\s*(\d+)/i);
                        const num = numMatch ? numMatch[1] : (episodes_list.length + 1).toString();
                        episodes_list.unshift({ episode: `Episode ${num}`, slug: epSlug, url: `/episode/${epSlug}` });
                    }
                }
            });

            const uniqueList = Array.from(new Map(episodes_list.map(item => [item.slug, item])).values())
                .sort((a, b) => (parseInt(b.episode.replace(/\D/g, '')) || 0) - (parseInt(a.episode.replace(/\D/g, '')) || 0));

            return {
                title: $('.entry-title').text().trim(),
                poster: $('.thumb img').attr('src'),
                synopsis: $('.entry-content p').text().trim(),
                status: $('.spe span:contains("Status:")').text().replace('Status:', '').trim() || 'Ongoing',
                episodes_count: uniqueList.length.toString(),
                episodes_list: uniqueList
            };
        } catch (e) { return null; }
    },

    getEpisode: async (slug: string) => {
        try {
            const url = `${BASE_URL}/${slug.replace(/^\/|\/$/g, '')}/`;
            const { data } = await fetchSafe(url) as any;
            const $ = cheerio.load(data);

            const title = $('.entry-title').text().trim();
            const animeTitle = title.split(' Episode')[0].trim();
            let parentPoster = '';

            const servers: any[] = [];
            $('select.mirror option').each((i, el) => {
                const val = $(el).attr('value');
                if (val && val.length > 10) {
                    try {
                        const decoded = Buffer.from(val, 'base64').toString('utf-8');
                        const match = decoded.match(/src="([^"]+)"/);
                        if (match) servers.push({ name: $(el).text().trim(), url: match[1] });
                    } catch(e) {}
                }
            });

            if (servers.length === 0) {
                $('iframe').each((i, el) => {
                    const src = $(el).attr('src');
                    if (src && !src.includes('discord')) servers.push({ name: `Server ${i+1}`, url: src });
                });
            }

            // --- BRUTAL PARENT DETECTOR ---
            let seriesLink = '';
            $('a').each((i, el) => {
                const txt = $(el).text().trim();
                const href = $(el).attr('href');
                if (href && (txt.includes(animeTitle) || txt.toLowerCase().includes('all episodes')) && !href.includes('episode')) {
                    seriesLink = href;
                    return false;
                }
            });

            if (!seriesLink) {
                const base = slug.replace(/-episode-\d+.*/, '');
                seriesLink = `${BASE_URL}/${base}/`;
            }

            let fullList: any[] = [];
            if (seriesLink) {
                const seriesSlug = seriesLink.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                // Paksa fetch detail lewat logic internal
                const detailData = await animexin.getDetail(seriesSlug);
                if (detailData && detailData.episodes_list.length > 0) {
                    fullList = detailData.episodes_list;
                    parentPoster = detailData.poster || ""; // FIX: Fallback string kosong
                    // Auto-Heal Cache Detail
                    supabaseAdmin.from('api_cache').upsert({
                        path: `detail/${seriesSlug.replace('anime/', '')}`,
                        data: detailData,
                        timestamp: Date.now()
                    }).then(() => {});
                }
            }

            return {
                episode: title,
                streaming: { servers },
                episodes_list: fullList,
                donghua_details: { 
                    title: animeTitle, 
                    slug: slug.replace(/-episode-\d+.*/, ''),
                    poster: parentPoster 
                },
                navigation: {
                    previous_episode: $('.fl-l a').attr('href') ? { slug: $('.fl-l a').attr('href')!.replace(BASE_URL, '').replace(/^\/|\/$/g, '') } : null,
                    next_episode: $('.fl-r a').attr('href') ? { slug: $('.fl-r a').attr('href')!.replace(BASE_URL, '').replace(/^\/|\/$/g, '') } : null
                }
            };
        } catch (e) { return null; }
    },

    getGenres: async () => {
        try {
            const { data } = await fetchSafe(`${BASE_URL}/genres/`) as any;
            const $ = cheerio.load(data);
            const genres: any[] = [];
            $('.taxindex a').each((i, el) => {
                const name = $(el).text().trim().split('(')[0].trim();
                const href = $(el).attr('href');
                if (href && !href.includes('year') && !href.includes('status')) {
                    const slug = href.replace(BASE_URL, '').replace('genres/', '').replace(/^\/|\/$/g, '');
                    genres.push({ title: name, slug });
                }
            });
            return { data: genres };
        } catch (e) { 
            return { data: [ {title:"Action",slug:"action"}, {title:"Adventure",slug:"adventure"}, {title:"Cultivation",slug:"cultivation"} ] };
        }
    },

    getByGenre: async (slug: string, page: number = 1) => {
        try {
            const url = page === 1 ? `${BASE_URL}/genres/${slug}/` : `${BASE_URL}/genres/${slug}/page/${page}/`;
            const { data } = await fetchSafe(url) as any;
            const $ = cheerio.load(data);
            const results: any[] = [];
            $('.listupd article').each((i, el) => {
                const title = $(el).find('.tt').text().trim();
                const link = $(el).find('a').attr('href');
                let img = $(el).find('img').attr('src');
                if (img?.includes('data:image')) img = $(el).find('img').attr('data-src') || img;
                if (title && link) {
                    const sSlug = link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                    results.push({ title, slug: sSlug, poster: img, url: `/detail/${sSlug}` });
                }
            });
            return { data: results, status: 'success' };
        } catch (e) { return { data: [], status: 'error' }; }
    }
};
