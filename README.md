# PINGHUA // CORE 

> **ULTRA-HIGH VELOCITY DONGHUA RETRIEVAL & STREAMING UNIT**

![Next.js](https://img.shields.io/badge/RUNTIME-NEXT.JS_15-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/STYLE-TAILWIND_4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Redis](https://img.shields.io/badge/CACHE-UPSTASH_REDIS-FF4438?style=for-the-badge&logo=redis)
![Supabase](https://img.shields.io/badge/DATABASE-SUPABASE-3ECF8E?style=for-the-badge&logo=supabase)

---

## 📡 SYSTEM OVERVIEW

**PingHua** is a premium, high-performance streaming engine designed for the modern Donghua community. Developed with an **Industrial-Grade Extraction Logic**, the system prioritizes extreme speed, visual elegance, and search engine dominance.

By merging the **Apple Zen Aesthetic** with a multi-layered hybrid caching architecture, PingHua delivers a near-zero latency experience while maintaining 100% data accuracy through its proprietary Auto-Heal & Gap-Filler protocols.

---

## ⚡ PERFORMANCE ENGINE (THE TURBO STACK)

PingHua doesn't just scrape; it executes a **Multi-Layered Data Retrieval Protocol**:

1.  **WP-JSON API INTEGRATION (Jackpot V4):** Direct database-to-database communication with the source for 100% accuracy and speed.
2.  **HYBRID CACHE ARCHITECTURE:** 
    *   **Layer 1 (L1):** Upstash Redis (RAM) for sub-5ms data delivery.
    *   **Layer 2 (L2):** Supabase (PostgreSQL) for persistent data integrity and secondary backup.
3.  **RESCUE & HEAL PROTOCOLS:** 
    *   **Auto-Heal:** Real-time homepage scanning for instant updates.
    *   **Gap-Filler:** Automated link prediction for missing episodes.
    *   **Emergency Search:** Intelligent self-correction for broken or guessed endpoints.

---

## 🎨 DESIGN LANGUAGE (APPLE AMBER EDITION)

The interface is engineered for long-term viewing comfort and premium feel:

*   **SOFT LIGHT THEME:** A refined `#FAF9F6` Off-White background that reduces eye strain.
*   **APPLE TYPOGRAPHY:** Native SF Pro / system font stack for razor-sharp clarity.
*   **AMBER ACCENTS:** High-end `#FFB800` highlights for a vibrant yet professional anime vibe.
*   **FEATHERED TRANSITIONS:** Fluid animations and deep feathered gradients for a seamless content flow.

---

## 📈 EXTREME SEO PROTOCOLS (GACOR EDITION)

PingHua is built to dominate search results:

*   **DYNAMIC METADATA:** Automated canonicals and SEO-optimized OpenGraph tags for every series.
*   **STRUCTURED DATA (JSON-LD):** Full `VideoObject` and `TVSeries` schemas for rich search snippets.
*   **INDEXING BOOSTER:** Automated **RSS Feed (`/feed.xml`)** and dynamic **Sitemap** for instant Google indexing.
*   **IMAGE SEO:** Intelligent Alt-Text injection for high visibility in Google Images.

---

## 🛠️ INSTALLATION & DEPLOYMENT

### CORE REQUIREMENTS
*   Node.js 20+
*   Supabase Account (Database)
*   Upstash Account (Redis)

### INITIALIZATION
1.  **Clone the system:**
    ```bash
    git clone https://github.com/david-aistudio/PingHua.git
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure `.env.local`:**
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_key
    UPSTASH_REDIS_REST_URL=your_redis_url
    UPSTASH_REDIS_REST_TOKEN=your_redis_token
    ```
4.  **Execute Setup:**
    ```bash
    node scripts/setup-db.js
    ```
5.  **Ignite the engine:**
    ```bash
    npm run dev
    ```

---

## 👨‍💻 ARCHITECT
**Developed by [David](https://github.com/david-aistudio)**  
"SPEED IS THE ONLY TRUTH. DESIGN IS THE SOUL."

> PINGHUA SYSTEM // EST. 2025 // VERSION 2.5.0 STABLE