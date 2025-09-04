import { ContentItem, ItemType, Episode, AdPlacement } from './types';

// Helper to generate a large number of episodes for demonstration
const generateNarutoEpisodes = (count: number): Episode[] => {
  const episodes: Episode[] = [];
  for (let i = 1; i <= count; i++) {
    episodes.push({
      id: `naruto-s1e${i}`,
      episodeNumber: i,
      title: `Episode ${i}`,
      runtime: 23,
      servers: [
        { name: 'SR 1', url: 'https://www.youtube.com/embed/S2pXBg_sK-Q' },
        { name: 'SR 2', url: 'https://www.youtube.com/embed/MIT92HomeyY' },
        { name: 'SR 3', url: 'https://www.youtube.com/embed/MEg-hY_86a4' },
      ],
      downloadLinks: [
        { label: 'DLoad 1', url: '#' },
        { label: 'DLoad 2', url: '#' },
        { label: 'DLoad 3', url: '#' },
      ],
    });
  }
  return episodes;
};

export const MOCK_ADS: AdPlacement[] = [
    { id: 'ad1', name: 'Homepage Header Banner', type: 'Banner', code: `<img src="https://via.placeholder.com/728x90.png?text=Header+Ad" alt="Header Ad">` },
    { id: 'ad2', name: 'Sidebar Skyscraper', type: 'Skyscraper', code: 'https://example.com/ad- skyscraper.js' },
    { id: 'ad3', name: 'Before Player VAST', type: 'Video', code: '<VAST version="3.0"><Ad><Wrapper>...</Wrapper></Ad></VAST>' },
    { id: 'ad4', name: 'Footer Banner', type: 'Banner', code: '<div>Footer Ad Code Here</div>' },
    { id: 'ad5', name: 'Pop-under Ad', type: 'Pop-under', code: 'https://example.com/popunder.js' },
    { id: 'ad6', name: 'In-article Ad', type: 'Banner', code: '<script>...in-article-ad...</script>' },
    { id: 'ad7', name: 'Global Direct Link Push', type: 'Direct Link', code: 'https://www.google.com/search?q=movie+streaming' },
];

export const MOCK_DATA: ContentItem[] = [
  {
    id: '1',
    slug: 'war-2',
    title: 'WAR 2',
    posterPath: 'https://i.ibb.co/6rW3C9j/movie-poster-1.jpg',
    backdropPath: 'https://i.ibb.co/F8B65V9/movie-backdrop-1.jpg',
    overview: 'Things get complicated when Kabir Dhaliwal, a secret agent, is accused of betraying his nation and his former batchmate considers the responsibility of finding him.',
    releaseYear: 2025,
    rating: 8.5,
    genres: ['Action', 'Thriller'],
    type: ItemType.Movie,
    quality: 'Full HD',
    status: 'New',
    adminStatus: 'Published',
    runtime: 170,
    country: 'India',
    language: ['Hindi'],
    director: 'Ayan Mukerji',
    cast: ['Hrithik Roshan', 'N.T. Rama Rao Jr.', 'Kiara Advani'],
    screenshots: [
      'https://i.ibb.co/F8B65V9/movie-backdrop-1.jpg',
      'https://i.ibb.co/y6kdtfD/movie-backdrop-2.jpg',
      'https://i.ibb.co/vLNk2GV/movie-backdrop-3.jpg',
    ],
    servers: [
      { name: 'SR 1', url: 'https://www.youtube.com/embed/S2pXBg_sK-Q' },
      { name: 'SR 2', url: 'https://www.youtube.com/embed/MIT92HomeyY' },
      { name: 'SR 3', url: 'https://www.youtube.com/embed/MEg-hY_86a4' },
      { name: 'SR 4', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
    downloadLinks: [
      { label: 'DLoad 1', url: '#' },
      { label: 'DLoad 2', url: '#' },
      { label: 'DLoad 3', url: '#' },
      { label: 'DLoad 4', url: '#' },
    ],
    downloadGroups: [
      {
        title: 'DOWNLOAD IN 480P',
        icon: 'quality',
        links: [
          { label: 'DOWNLOAD IN 480P - MIRROR 1', url: '#' },
          { label: 'DOWNLOAD IN 480P - MIRROR 2', url: '#' }
        ]
      },
      {
        title: 'DOWNLOAD IN 720P',
        icon: 'quality',
        links: [
          { label: 'DOWNLOAD IN 720P - MIRROR 1', url: '#' },
          { label: 'DOWNLOAD IN 720P - MIRROR 2', url: '#' }
        ]
      }
    ],
    seoTitle: 'Watch WAR 2 (2025) Full Movie Online - MovieHubBD',
    seoDescription: 'Stream and download WAR 2 starring Hrithik Roshan and N.T. Rama Rao Jr. An action-packed thriller where a secret agent is framed. Available in Full HD on MovieHubBD.',
  },
  {
    id: '2',
    slug: 'dhumketu',
    title: 'Dhumketu',
    posterPath: 'https://i.ibb.co/k2hJg9z/movie-poster-2.jpg',
    backdropPath: 'https://i.ibb.co/y6kdtfD/movie-backdrop-2.jpg',
    overview: 'A gripping tale of a man who rises from the ashes to reclaim his honor and protect his family from the shadows of his past.',
    releaseYear: 2025,
    rating: 8.6,
    genres: ['Drama', 'Thriller'],
    type: ItemType.Movie,
    quality: 'HD',
    adminStatus: 'Published',
    runtime: 131,
    country: 'India',
    language: ['Bangla'],
    servers: [
      { name: 'SR 1', url: 'https://www.youtube.com/embed/MEg-hY_86a4' },
      { name: 'SR 2', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { name: 'SR 3', url: 'https://www.youtube.com/embed/S2pXBg_sK-Q' },
    ],
    downloadGroups: [
        {
            title: 'DOWNLOAD IN 480P',
            icon: 'quality',
            links: [{ label: 'DOWNLOAD IN 480P', url: '#' }]
        },
        {
            title: 'DOWNLOAD IN 720P',
            icon: 'quality',
            links: [{ label: 'DOWNLOAD IN 720P', url: '#' }]
        },
        {
            title: 'DOWNLOAD FROM SERVER 1',
            icon: 'server',
            links: [{ label: 'DOWNLOAD FROM SERVER 1', url: '#' }]
        },
        {
            title: 'DOWNLOAD FROM SERVER 2',
            icon: 'server',
            links: [{ label: 'DOWNLOAD FROM SERVER 2', url: '#' }]
        },
        {
            title: 'DOWNLOAD FROM SERVER 3',
            icon: 'server',
            links: [{ label: 'DOWNLOAD FROM SERVER 3', url: '#' }]
        },
        {
            title: 'DOWNLOAD FROM SERVER 4',
            icon: 'server',
            links: [{ label: 'DOWNLOAD FROM SERVER 4', url: '#' }]
        }
    ]
  },
  {
    id: '3',
    slug: 'echoes-of-time',
    title: 'Echoes of Time',
    posterPath: 'https://i.ibb.co/L6xKDX6/series-poster-1.jpg',
    backdropPath: 'https://i.ibb.co/vLNk2GV/movie-backdrop-3.jpg',
    overview: 'A gripping series about a group of individuals who discover they can communicate with their past selves, leading to unforeseen consequences.',
    releaseYear: 2024,
    rating: 9.1,
    genres: ['Drama', 'Sci-Fi', 'Thriller'],
    type: ItemType.Series,
    quality: 'HD',
    adminStatus: 'Draft',
    country: 'Canada',
    language: ['English', 'French'],
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { 
            id: 's1e1', 
            episodeNumber: 1, 
            title: 'The First Signal', 
            runtime: 52, 
            servers: [{ name: 'SR 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }],
            downloadLinks: [{ label: '1080p', url: '#' }, { label: '720p', url: '#' }] 
          },
          { 
            id: 's1e2', 
            episodeNumber: 2, 
            title: 'Ripple Effect', 
            runtime: 55, 
            servers: [{ name: 'SR 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }],
            downloadLinks: [{ label: '1080p', url: '#' }, { label: '720p', url: '#' }] 
          },
        ]
      }
    ]
  },
  {
    id: '4',
    slug: 'vettiyan',
    title: 'Vettiyan',
    posterPath: 'https://i.ibb.co/fDbP2dY/movie-poster-3.jpg',
    backdropPath: 'https://i.ibb.co/y6kdtfD/movie-backdrop-2.jpg',
    overview: 'An action-packed story of a righteous man fighting against a corrupt system to bring justice to his people.',
    releaseYear: 2024,
    rating: 8.5,
    genres: ['Action', 'Drama'],
    type: ItemType.Movie,
    quality: 'HD',
    status: 'Updated',
    adminStatus: 'Published',
    runtime: 183,
    country: 'India',
    language: ['Hindi (Dual-Aud)'],
  },
    {
    id: '5',
    slug: 'thug-life',
    title: 'Thug Life',
    posterPath: 'https://i.ibb.co/51bS1D0/movie-poster-4.jpg',
    backdropPath: 'https://i.ibb.co/vLNk2GV/movie-backdrop-3.jpg',
    overview: 'In the criminal underworld, a new leader emerges, challenging the old guards and rewriting the rules of the game.',
    releaseYear: 2025,
    rating: 8.8,
    genres: ['Crime', 'Action'],
    type: ItemType.Movie,
    quality: 'Pre-DVDRip',
    adminStatus: 'Pending',
    runtime: 120,
    language: ['Hindi (Dual-Aud)'],
  },
  {
    id: '6',
    slug: 'kudumbasthan',
    title: 'Kudumbasthan',
    posterPath: 'https://i.ibb.co/kH05g9G/movie-poster-5.jpg',
    backdropPath: 'https://i.ibb.co/F8B65V9/movie-backdrop-1.jpg',
    overview: 'A heartwarming family drama that explores the bonds, conflicts, and love within a large joint family.',
    releaseYear: 2025,
    rating: 8.4,
    genres: ['Family', 'Drama'],
    type: ItemType.Movie,
    quality: 'HD',
    adminStatus: 'Published',
    runtime: 154,
    language: ['Hindi (Dual-Aud)'],
  },
    {
    id: '7',
    slug: 'taandob-extended',
    title: 'Taandob - Extended',
    posterPath: 'https://i.ibb.co/Wc2g3fG/series-poster-2.jpg',
    backdropPath: 'https://i.ibb.co/F8B65V9/movie-backdrop-1.jpg',
    overview: 'A deep dive into the chaotic world of politics, where power is the only currency and betrayal is a way of life.',
    releaseYear: 2025,
    rating: 8.6,
    genres: ['Drama', 'Thriller'],
    type: ItemType.Series,
    quality: 'WEB-DL',
    adminStatus: 'Published',
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { 
            id: 'taandob-s1e1', 
            episodeNumber: 1, 
            title: 'The Rise', 
            runtime: 45, 
            servers: [{ name: 'SR 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }],
            downloadLinks: [{ label: 'HD', url: '#' }] 
          },
        ]
      }
    ]
  },
  {
    id: '8',
    slug: 'bachelor-point',
    title: 'Bachelor Point',
    posterPath: 'https://i.ibb.co/RzFpMyz/series-poster-3.jpg',
    backdropPath: 'https://i.ibb.co/y6kdtfD/movie-backdrop-2.jpg',
    overview: 'Follow the hilarious and relatable lives of a group of bachelors navigating work, friendship, and love in the big city.',
    releaseYear: 2022,
    rating: 8.8,
    genres: ['Comedy', 'Drama'],
    type: ItemType.Series,
    quality: 'HDTV',
    adminStatus: 'Draft',
    language: ['Bangla'],
    seasons: [
       {
        seasonNumber: 1,
        episodes: [
          { 
            id: 'bachelor-s1e1', 
            episodeNumber: 1, 
            title: 'The Beginning', 
            runtime: 22, 
            servers: [{ name: 'SR 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }],
            downloadLinks: [{ label: 'HD', url: '#' }] 
          },
        ]
      }
    ]
  },
  {
    id: '9',
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    posterPath: 'https://i.ibb.co/1nC5L0g/jujutsu-kaisen-poster.jpg',
    backdropPath: 'https://i.ibb.co/yY1kM8c/jujutsu-kaisen-backdrop.jpg',
    overview: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman\'s school to be able to locate the demon\'s other body parts and thus exorcise himself.',
    releaseYear: 2020,
    rating: 8.7,
    genres: ['Action', 'Supernatural', 'Dark Fantasy'],
    type: ItemType.Anime,
    quality: 'HD',
    adminStatus: 'Published',
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { 
            id: 's1e1-anime', 
            episodeNumber: 1, 
            title: 'Ryomen Sukuna', 
            runtime: 24, 
            servers: [{ name: 'SR 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }],
            downloadLinks: [{ label: '1080p', url: '#' }] 
          },
        ]
      }
    ]
  },
  {
    id: '10',
    slug: 'crash-landing-on-you',
    title: 'Crash Landing on You',
    posterPath: 'https://i.ibb.co/Pz8K9Cq/cloy-poster.jpg',
    backdropPath: 'https://i.ibb.co/3sZ8X9R/cloy-backdrop.jpg',
    overview: 'A paragliding mishap drops a South Korean heiress in North Korea - and into the life of an army officer, who decides he will help her hide.',
    releaseYear: 2019,
    rating: 8.7,
    genres: ['Romance', 'Comedy', 'Drama'],
    type: ItemType.Kdrama,
    quality: 'HD',
    adminStatus: 'Pending',
    country: 'South Korea',
    language: ['Korean'],
    seasons: [
       {
        seasonNumber: 1,
        episodes: [
          { 
            id: 's1e1-kdrama', 
            episodeNumber: 1, 
            title: 'Episode 1', 
            runtime: 85, 
            servers: [{ name: 'SR 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }],
            downloadLinks: [{ label: '1080p', url: '#' }] 
          },
        ]
      }
    ]
  },
  {
    id: '11',
    slug: 'naruto-shippuden',
    title: 'Naruto Shippuden',
    posterPath: 'https://i.ibb.co/9vY1Vjq/naruto-poster.jpg',
    backdropPath: 'https://i.ibb.co/c3pLSMZ/naruto-backdrop.jpg',
    overview: 'Naruto Uzumaki wants to be the best ninja in the land. He\'s done well so far, but with the looming danger of the Akatsuki, he must train harder than ever and confront his mysterious past.',
    releaseYear: 2007,
    rating: 8.7,
    genres: ['Action', 'Adventure', 'Anime'],
    type: ItemType.Anime,
    quality: 'HD',
    adminStatus: 'Published',
    country: 'Japan',
    language: ['Japanese', 'English'],
    seasons: [
      {
        seasonNumber: 1,
        episodes: generateNarutoEpisodes(520),
      }
    ]
  }
];