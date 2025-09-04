export enum ItemType {
  Movie = 'Movie',
  Series = 'Series',
  Anime = 'Anime',
  Kdrama = 'Kdrama',
}

export interface AdPlacement {
  id: string;
  name: string;
  type: 'Banner' | 'Skyscraper' | 'Video' | 'Pop-under' | 'Direct Link';
  code: string; // Can be HTML/JS code or a URL
}

export interface DownloadLink {
  label: string;
  url: string;
}

export interface DownloadGroup {
  title: string;
  icon: 'quality' | 'server';
  links: DownloadLink[];
}

export interface Server {
  name: string;
  url: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  runtime: number; // in minutes
  servers: Server[];
  downloadLinks: DownloadLink[];
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface ContentItem {
  id:string;
  slug: string;
  title: string;
  posterPath: string;
  backdropPath: string;
  overview: string;
  releaseYear: number;
  rating: number;
  genres: string[];
  type: ItemType;
  quality?: string;
  status?: 'New' | 'Updated';
  adminStatus?: 'Published' | 'Draft' | 'Pending';
  runtime?: number; // for movies
  country?: string;
  language?: string[];
  director?: string;
  cast?: string[];
  tmdbId?: number;
  imdbId?: string;
  screenshots?: string[];
  servers?: Server[]; // for movies
  seasons?: Season[]; // for series
  downloadGroups?: DownloadGroup[]; // for movies
  downloadLinks?: DownloadLink[]; // for movies
  seoTitle?: string;
  seoDescription?: string;
}