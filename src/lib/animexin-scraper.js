const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = "https://animexin.dev";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://animexin.dev/'
};

async function fetchPage(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
            return res.data;
        } catch (e) {
            if (i === retries - 1) return null;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

const scraper = {
    scrapeHome: async (page = 1) => {
        try {
            const url = page === 1 ? BASE_URL : `${BASE_URL}/page/${page}/`;
            const html = await fetchPage(url);
            if (!html) return null;
            const $ = cheerio.load(html);
            const result = { popular: [], latest: [], recommendation: [] };

            const extractItems = (container) => {
                const items = [];
                $(container).find('article, .post-item, .listupd li').each((i, el) => {
                    const title = $(el).find('.tt, h4, .title').text().trim();
                    const link = $(el).find('a').attr('href');
                    let img = $(el).find('img').attr('src');
                    if (img?.includes('data:image')) img = $(el).find('img').attr('data-src') || img;
                    
                    if (title && link) {
                        // SMART SLUG CLEANING: Selalu arahkan ke Series, bukan Episode
                        let slug = link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                        slug = slug.replace(/-episode-\d+.*/, '').replace(/-indonesia.*/, '');
                        
                        items.push({ title, slug, poster: img, url: `/detail/${slug}` });
                    }
                });
                return items;
            };

            $('.bixbox').each((i, box) => {
                const title = $(box).find('h2, h3').text().trim();
                if (title.includes('Popular Today')) result.popular = extractItems(box);
                else if (title.includes('Latest Release')) result.latest = extractItems(box);
                else if (title.includes('Recommendation')) result.recommendation = extractItems(box);
            });
            return result;
        } catch (e) { return null; }
    },

    scrapeDetail: async (slug) => {
        try {
            // PEMBERSIHAN SLUG LAGI (Double Layer)
            const cleanSlug = slug.replace(/^\/|\/$/g, '')
                                .replace(/-episode-\d+.*/, '')
                                .replace(/-indonesia.*/, '');
            
            const url = `${BASE_URL}/${cleanSlug}/`;
            // console.log(`Scraping Detail: ${url}`);
            
            const html = await fetchPage(url);
            if (!html) return null;
            const $ = cheerio.load(html);

            const title = $('.entry-title').text().trim();
            if (!title) return null;

            const episodes_list = [];
            $('.eplister li a').each((i, el) => {
                const num = $(el).find('.epl-num').text().trim();
                const link = $(el).attr('href');
                if (link) {
                    const epSlug = link.replace(BASE_URL, '').replace(/^\/|\/$/g, '');
                    episodes_list.push({ episode: `Episode ${num}`, slug: epSlug, url: `/episode/${epSlug}` });
                }
            });

            return {
                title,
                poster: $('.thumb img').attr('src'),
                synopsis: $('.entry-content p').text().trim(),
                status: $('.spe span:contains("Status:")').text().replace('Status:', '').trim() || 'Ongoing',
                episodes_count: episodes_list.length.toString(),
                episodes_list
            };
        } catch (e) { return null; }
    },

    scrapeEpisode: async (slug) => {
        try {
            const url = `${BASE_URL}/${slug.replace(/^\/|\/$/g, '')}/`;
            const html = await fetchPage(url);
            if (!html) return null;
            const $ = cheerio.load(html);

            const servers = [];
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

            const title = $('.entry-title').text().trim();
            const animeTitle = title.split(' Episode')[0].trim();
            let parentUrl = $('.breadcrumb a').last().attr('href') || $('.all-episodes a').attr('href');
            
            if (!parentUrl) parentUrl = `${BASE_URL}/${slug.replace(/-episode-\d+.*/, '')}/`;

            return {
                episode: title,
                streaming: { servers },
                anime_title: animeTitle,
                parent_url: parentUrl,
                navigation: {
                    previous_episode: $('.fl-l a').attr('href') ? $('.fl-l a').attr('href').replace(BASE_URL, '').replace(/^\/|\/$/g, '') : null,
                    next_episode: $('.fl-r a').attr('href') ? $('.fl-r a').attr('href').replace(BASE_URL, '').replace(/^\/|\/$/g, '') : null
                }
            };
        } catch (e) { return null; }
    }
};

module.exports = scraper;