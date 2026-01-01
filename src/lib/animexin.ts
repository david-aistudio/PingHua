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
            // --- REVOLUSI: Pake WP-JSON API buat Homepage ---
            const apiUrl = `${BASE_URL}/wp-json/wp/v2/posts?per_page=12&page=${page}`;
            const res = await fetch(apiUrl, { headers: HEADERS });
            
            if (res.ok) {
                const posts = await res.json();
                const latest = posts.map((p: any) => {
                    const title = p.title.rendered;
                    const slug = p.link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                    // Ekstrak poster dari yoast atau content
                    let img = p.yoast_head_json?.og_image?.[0]?.url || "";
                    return { title, slug, poster: img, url: `/detail/${slug}` };
                });

                // Popular & Recommendation tetep ambil dari HTML (karena API gak punya filter 'popular')
                const { data: html } = await fetchSafe(BASE_URL) as any;
                const $ = cheerio.load(html);
                const result: { popular: any[], latest: any[], recommendation: any[] } = { popular: [], latest: latest, recommendation: [] };

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
                    else if (title.includes('Recommendation')) result.recommendation = extract(box);
                });

                return result;
            }
        } catch(e) {}
        
        // Fallback ke HTML jika API gagal
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
            const animeTitle = $('.entry-title').text().trim();

            const episodes_map = new Map<string, any>();

            // --- REVOLUSI: Pake WP-JSON API buat List Episode ---
            try {
                // 1. Cari Category ID pake Slug (Paling Akurat)
                const catUrl = `${BASE_URL}/wp-json/wp/v2/categories?slug=${cleanSlug.replace('anime/', '')}`;
                const catRes = await fetch(catUrl, { headers: HEADERS });
                if (catRes.ok) {
                    const cats = await catRes.json();
                    let targetCat = cats[0];

                    // Fallback: Jika slug gak match, baru cari pake Title
                    if (!targetCat) {
                        const catSearchUrl = `${BASE_URL}/wp-json/wp/v2/categories?search=${encodeURIComponent(animeTitle)}`;
                        const catSearchRes = await fetch(catSearchUrl, { headers: HEADERS });
                        if (catSearchRes.ok) {
                            const searchCats = await catSearchRes.json();
                            targetCat = searchCats.find((c: any) => 
                                animeTitle.toLowerCase() === c.name.toLowerCase() || 
                                c.name.toLowerCase().includes(animeTitle.toLowerCase())
                            );
                        }
                    }
                    
                    if (targetCat) {
                        console.log(`[JackpotV4] 🎯 Using Category API for ${animeTitle} (ID: ${targetCat.id})`);
                        // 2. Tarik Episode (Post) dari Kategori ini
                        const postApiUrl = `${BASE_URL}/wp-json/wp/v2/posts?categories=${targetCat.id}&per_page=100`;
                        const postRes = await fetch(postApiUrl, { headers: HEADERS });
                        if (postRes.ok) {
                            const posts = await postRes.json();
                            posts.forEach((p: any) => {
                                const title = p.title.rendered;
                                const epSlug = p.link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                                const numMatch = title.match(/Episode\s*(\d+)/i) || epSlug.match(/episode-(\d+)/i);
                                if (numMatch) {
                                    const epNum = parseInt(numMatch[1]);
                                    episodes_map.set(epSlug, {
                                        episode: `Episode ${epNum}`,
                                        slug: epSlug,
                                        url: `/episode/${epSlug}`,
                                        raw_num: epNum
                                    });
                                }
                            });
                        }
                    }
                }
            } catch(e) { console.log("[JackpotV4] Failed, using fallback..."); }

            // 3. Cadangan: Ambil dari List Standar HTML (.eplister) jika API kurang lengkap
            $('.eplister li a').each((i, el) => {
                const num = $(el).find('.epl-num').text().trim();
                const link = $(el).attr('href');
                if (link) {
                    const epSlug = link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                    if (!episodes_map.has(epSlug)) {
                        const epNum = parseInt(num) || parseInt(epSlug.match(/episode-(\d+)/)?.[1] || "0");
                        episodes_map.set(epSlug, { 
                            episode: `Episode ${epNum}`, 
                            slug: epSlug, 
                            url: `/episode/${epSlug}`,
                            raw_num: epNum 
                        });
                    }
                }
            });

            // 4. Auto-Heal: Scan Global Link
            $('#content a, .entry-content a, .sidebar a, .widget a').each((i, el) => {
                const link = $(el).attr('href');
                const txt = $(el).text().trim();
                if (link && link.includes(cleanSlug) && link.includes('episode')) {
                    const epSlug = link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                    if (!episodes_map.has(epSlug)) {
                        const numMatch = txt.match(/Episode\s*(\d+)/i) || link.match(/episode-(\d+)/i);
                        if (numMatch) {
                            const epNum = parseInt(numMatch[1]);
                            episodes_map.set(epSlug, {
                                episode: `Episode ${epNum}`,
                                slug: epSlug,
                                url: `/episode/${epSlug}`,
                                raw_num: epNum
                            });
                        }
                    }
                }
            });

            let uniqueList = Array.from(episodes_map.values())
                .sort((a, b) => b.raw_num - a.raw_num)
                .map(({ raw_num, ...rest }) => rest);

            // 5. Gap Filler
            if (uniqueList.length > 0) {
                const maxEp = parseInt(uniqueList[0].episode.replace(/\D/g, '')) || 0;
                const latestSlug = uniqueList[0].slug; 
                let generatedCount = 0;
                for (let i = maxEp - 1; i >= 1; i--) {
                    if (generatedCount > 50) break; 
                    const exists = uniqueList.some(e => (parseInt(e.episode.replace(/\D/g, '')) || 0) === i);
                    if (!exists && latestSlug.includes(maxEp.toString())) {
                        const newSlug = latestSlug.replace(maxEp.toString(), i.toString());
                        uniqueList.push({ episode: `Episode ${i}`, slug: newSlug, url: `/episode/${newSlug}` });
                        generatedCount++;
                    }
                }
                uniqueList.sort((a, b) => (parseInt(b.episode.replace(/\D/g, '')) || 0) - (parseInt(a.episode.replace(/\D/g, '')) || 0));
            }

            return {
                title: animeTitle,
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
            let url = `${BASE_URL}/${slug.replace(/^\/|\/$/g, '')}/`;
            let data: string | undefined;

            // 1. COBA FETCH NORMAL
            try {
                const res = await fetchSafe(url) as any;
                data = res.data;
            } catch (e) {
                console.log(`[GetEpisode] ⚠️ Link tebakan salah/mati: ${slug}. Mencoba Emergency Search...`);
            }

            // 2. EMERGENCY SEARCH
            if (!data || data.includes('404 Not Found') || data.includes('Halaman tidak ditemukan')) {
                const cleanSlug = slug.replace(/-indonesia-english-sub|-sub-indo|-subtitle-indonesia/g, '');
                const parts = cleanSlug.split('-episode-');
                
                if (parts.length >= 2) {
                    const titleRaw = parts[0].replace(/-/g, ' ');
                    const epNum = parts[1].replace(/\D/g, ''); 
                    
                    const query = `${titleRaw} Episode ${epNum}`;
                    console.log(`[GetEpisode] 🚑 Searching: "${query}"`);

                    const searchRes = await animexin.search(query);
                    if (searchRes.data && searchRes.data.length > 0) {
                        const bestMatch = searchRes.data[0];
                        if (bestMatch && bestMatch.url) {
                            console.log(`[GetEpisode] ✅ Ketemu Link Asli: ${bestMatch.url}`);
                            const realSlug = bestMatch.url.replace('/detail/', '').replace('/episode/', '');
                            url = `${BASE_URL}/${realSlug}/`;
                            const res2 = await fetchSafe(url) as any;
                            data = res2.data;
                        }
                    }
                }
            }

            if (!data) throw new Error("Episode not found after rescue.");

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
            const baseSlug = slug.replace(/-episode-.*/, '').replace(/-end$/, '');
            
            $('a').each((i, el) => {
                const txt = $(el).text().trim().toLowerCase();
                const href = $(el).attr('href');
                
                if (href && !href.includes('episode')) {
                    // Kriteria 1: Link yang teksnya mengandung "All Episodes"
                    if (txt.includes('all episodes')) {
                        seriesLink = href;
                        return false;
                    }
                    // Kriteria 2: Link yang slug-nya bener-bener sama ama baseSlug kita
                    if (href.includes(`/${baseSlug}/`)) {
                        seriesLink = href;
                        return false;
                    }
                }
            });

            // Jika masih gagal, paksa pake baseSlug tebakan (Paling Aman)
            if (!seriesLink || seriesLink.includes('season')) {
                // Jangan pake yang ada kata 'season' kalau kita gak yakin itu season yang bener
                seriesLink = `${BASE_URL}/${baseSlug}/`;
            }

            let fullList: any[] = [];
            if (seriesLink) {
                const seriesSlug = seriesLink.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                const detailData = await animexin.getDetail(seriesSlug);
                if (detailData && detailData.episodes_list.length > 0) {
                    fullList = detailData.episodes_list;
                    parentPoster = detailData.poster || "";
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