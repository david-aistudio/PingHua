import { api } from '@/lib/api';
import EpisodePlayer from '@/components/EpisodePlayer';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await api.getEpisode(slug);
  const cleanSlug = slug.replace(/^\/|\/$/g, '');
  
  const title = data?.donghua_details?.title || 'Episode';
  const episode = data?.episode || '';
  const poster = data?.donghua_details?.poster || '';
  
  return {
    title: `Nonton ${title} ${episode} Sub Indo - PingHua`,
    description: `Nonton ${title} ${episode} Subtitle Indonesia gratis, server cepat, HD. Streaming ${title} terbaru di PingHua.`,
    alternates: {
        canonical: `https://pinghua.qzz.io/episode/${cleanSlug}`,
    },
    keywords: [
      `nonton ${title} ${episode}`,
      `${title} ${episode} sub indo`,
      `streaming ${title} ${episode}`,
      `${title} sub indo`,
      "donghua sub indo",
      "gratis tanpa iklan"
    ],
    openGraph: {
      images: [
        {
            url: poster,
            width: 1280,
            height: 720,
            alt: `Streaming ${title} ${episode}`,
        }
      ],
      title: `Nonton ${title} ${episode} Sub Indo`,
      url: `https://pinghua.qzz.io/episode/${cleanSlug}`,
      type: 'video.episode',
    },
  };
}

export default async function EpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const episode = await api.getEpisode(slug);

  if (!episode || !episode.streaming) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <h1 className="text-xl font-bold">Episode tidak ditemukan :(</h1>
      </div>
    );
  }

  const cleanSlug = slug.replace(/^\/|\/$/g, '');

  // SCHEMA: Video Object & Breadcrumbs (SINKRON & VALID)
  // Gunakan tanggal tetap atau ambil dari timestamp cache jika ingin lebih akurat
  const stableDate = "2025-01-01T00:00:00Z"; 

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": `Nonton ${episode.donghua_details?.title} ${episode.episode} Sub Indo`,
      "description": `Streaming ${episode.donghua_details?.title} ${episode.episode} Subtitle Indonesia kualitas HD gratis.`,
      "thumbnailUrl": [episode.donghua_details?.poster],
      "uploadDate": stableDate,
      "contentUrl": `https://pinghua.qzz.io/episode/${cleanSlug}`,
      "embedUrl": `https://pinghua.qzz.io/episode/${cleanSlug}`, 
      "potentialAction": {
        "@type": "SeekToAction",
        "target": `https://pinghua.qzz.io/episode/${cleanSlug}?t={seek_to_second_number}`,
        "startOffset-input": "required name=seek_to_second_number"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://pinghua.qzz.io"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": episode.donghua_details?.title,
          "item": `https://pinghua.qzz.io/detail/${episode.donghua_details?.slug}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": episode.episode,
          "item": `https://pinghua.qzz.io/episode/${cleanSlug}`
        }
      ]
    }
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EpisodePlayer episode={episode} slug={slug} />
    </>
  );
}
