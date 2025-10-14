import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { DonghuaCard as DonghuaCardType } from '@/lib/api';

interface DonghuaCardProps {
  donghua: DonghuaCardType;
}

export const DonghuaCard = ({ donghua }: DonghuaCardProps) => {
  // Extract slug from URL or use provided slug
  const slug = donghua.slug.replace(/\/$/, '');
  
  // Check if this is an episode or a donghua detail
  // Latest releases have episode URLs, ongoing/completed have detail URLs
  const isEpisode = donghua.url?.includes('/episode/') || donghua.current_episode;
  const targetUrl = isEpisode ? `/episode/${slug}` : `/detail/${slug}`;

  return (
    <Link to={targetUrl} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-card shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={donghua.poster}
            alt={donghua.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center space-y-2">
              <Play className="w-12 h-12 mx-auto" />
              <p className="text-sm font-medium">Watch Now</p>
            </div>
          </div>
          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${
                donghua.status === 'Ongoing'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {donghua.status}
            </span>
          </div>
          {/* Episode badge */}
          {donghua.current_episode && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 text-xs font-semibold rounded bg-black/70 text-white">
                {donghua.current_episode}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {donghua.title}
          </h3>
        </div>
      </div>
    </Link>
  );
};
