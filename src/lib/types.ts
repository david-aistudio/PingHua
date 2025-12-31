export interface DonghuaCard {
  title: string;
  slug: string;
  poster: string;
  status: string;
  url: string;
  type?: string;
  current_episode?: string;
  sub?: string;
  episodes?: string;
  alternative?: string;
  rating?: string | null;
  studio?: string;
  description?: string;
  genres?: Genre[];
}

export interface Genre {
  name: string;
  slug: string;
  url: string;
}

export interface Episode {
  episode: string;
  slug: string;
  url: string;
}

export interface DonghuaDetail {
  status: string;
  title: string;
  alter_title?: string;
  poster: string;
  rating?: string;
  studio?: string;
  network?: string;
  released?: string;
  duration?: string;
  type?: string;
  episodes_count: string;
  season?: string;
  country?: string;
  released_on?: string;
  updated_on?: string;
  genres?: Genre[];
  synopsis: string;
  episodes_list: Episode[];
}

export interface StreamingServer {
  name: string;
  url: string;
}

export interface EpisodeDetail {
  status: string;
  episode: string;
  streaming: {
    main_url: StreamingServer;
    servers: StreamingServer[];
  };
  donghua_details?: {
    title: string;
    slug: string;
    url: string;
    poster: string;
    type: string;
    released: string;
    uploader: string;
  };
  navigation?: {
    all_episodes?: {
      slug: string;
      url: string;
    };
    previous_episode?: {
      episode: string;
      slug: string;
      url: string;
    } | null;
    next_episode?: {
      episode: string;
      slug: string;
      url: string;
    } | null;
  };
  episodes_list?: Episode[];
  prev_episode?: {
    title: string;
    slug: string;
    url: string;
  };
  next_episode?: {
    title: string;
    slug: string;
    url: string;
  };
}
