import axios from 'axios';
import Movie from '../models/Movie.js';
import Series from '../models/Series.js';
import { generateSlug } from '../utils/helpers.js';

class TMDBService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.baseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
    this.imageBaseUrl = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';
    
    if (!this.apiKey) {
      console.warn('TMDB API key not configured. TMDB features will be disabled.');
    }
  }

  // Make API request to TMDB
  async makeRequest(endpoint, params = {}) {
    if (!this.apiKey) {
      throw new Error('TMDB API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params: {
          api_key: this.apiKey,
          ...params
        },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('TMDB API error:', error.response?.data || error.message);
      throw new Error(`TMDB API request failed: ${error.response?.data?.status_message || error.message}`);
    }
  }

  // Get configuration from TMDB
  async getConfiguration() {
    try {
      const config = await this.makeRequest('/configuration');
      return config;
    } catch (error) {
      console.error('Failed to get TMDB configuration:', error);
      return null;
    }
  }

  // Search for movies
  async searchMovies(query, page = 1) {
    try {
      const data = await this.makeRequest('/search/movie', { 
        query, 
        page,
        include_adult: false 
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to search movies: ${error.message}`);
    }
  }

  // Search for TV series
  async searchTVSeries(query, page = 1) {
    try {
      const data = await this.makeRequest('/search/tv', { 
        query, 
        page,
        include_adult: false 
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to search TV series: ${error.message}`);
    }
  }

  // Get movie details by ID
  async getMovieDetails(movieId) {
    try {
      const [movie, credits, videos] = await Promise.all([
        this.makeRequest(`/movie/${movieId}`, { append_to_response: 'keywords,images' }),
        this.makeRequest(`/movie/${movieId}/credits`),
        this.makeRequest(`/movie/${movieId}/videos`)
      ]);

      return {
        ...movie,
        cast: credits.cast,
        crew: credits.crew,
        videos: videos.results
      };
    } catch (error) {
      throw new Error(`Failed to get movie details: ${error.message}`);
    }
  }

  // Get TV series details by ID
  async getTVSeriesDetails(seriesId) {
    try {
      const [series, credits, videos] = await Promise.all([
        this.makeRequest(`/tv/${seriesId}`, { append_to_response: 'keywords,images' }),
        this.makeRequest(`/tv/${seriesId}/credits`),
        this.makeRequest(`/tv/${seriesId}/videos`)
      ]);

      return {
        ...series,
        cast: credits.cast,
        crew: credits.crew,
        videos: videos.results
      };
    } catch (error) {
      throw new Error(`Failed to get TV series details: ${error.message}`);
    }
  }

  // Get season details
  async getSeasonDetails(seriesId, seasonNumber) {
    try {
      const season = await this.makeRequest(`/tv/${seriesId}/season/${seasonNumber}`);
      return season;
    } catch (error) {
      throw new Error(`Failed to get season details: ${error.message}`);
    }
  }

  // Map TMDB movie data to our schema
  mapMovieData(tmdbMovie, userId) {
    const releaseDate = tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null;
    
    return {
      title: tmdbMovie.title,
      slug: generateSlug(tmdbMovie.title, releaseDate?.getFullYear()),
      overview: tmdbMovie.overview || '',
      posterPath: tmdbMovie.poster_path ? `${this.imageBaseUrl}/w500${tmdbMovie.poster_path}` : '',
      backdropPath: tmdbMovie.backdrop_path ? `${this.imageBaseUrl}/w1280${tmdbMovie.backdrop_path}` : '',
      releaseYear: releaseDate?.getFullYear() || new Date().getFullYear(),
      releaseDate: releaseDate,
      rating: Math.round((tmdbMovie.vote_average || 0) * 10) / 10,
      imdbRating: Math.round((tmdbMovie.vote_average || 0) * 10) / 10,
      genres: tmdbMovie.genres?.map(g => g.name) || [],
      type: 'Movie',
      runtime: tmdbMovie.runtime || 0,
      country: tmdbMovie.production_countries?.[0]?.name || '',
      language: tmdbMovie.spoken_languages?.map(l => l.english_name) || ['English'],
      director: tmdbMovie.crew?.find(person => person.job === 'Director')?.name || '',
      cast: tmdbMovie.cast?.slice(0, 10).map(person => ({
        name: person.name,
        character: person.character || '',
        profile_path: person.profile_path ? `${this.imageBaseUrl}/w185${person.profile_path}` : ''
      })) || [],
      tmdbId: tmdbMovie.id,
      imdbId: tmdbMovie.imdb_id || '',
      trailerUrl: this.extractTrailerUrl(tmdbMovie.videos),
      keywords: tmdbMovie.keywords?.keywords?.map(k => k.name) || [],
      adminStatus: 'Draft',
      addedBy: userId
    };
  }

  // Map TMDB TV series data to our schema
  mapSeriesData(tmdbSeries, userId) {
    const firstAirDate = tmdbSeries.first_air_date ? new Date(tmdbSeries.first_air_date) : null;
    const lastAirDate = tmdbSeries.last_air_date ? new Date(tmdbSeries.last_air_date) : null;
    
    return {
      title: tmdbSeries.name,
      slug: generateSlug(tmdbSeries.name, firstAirDate?.getFullYear()),
      overview: tmdbSeries.overview || '',
      posterPath: tmdbSeries.poster_path ? `${this.imageBaseUrl}/w500${tmdbSeries.poster_path}` : '',
      backdropPath: tmdbSeries.backdrop_path ? `${this.imageBaseUrl}/w1280${tmdbSeries.backdrop_path}` : '',
      releaseYear: firstAirDate?.getFullYear() || new Date().getFullYear(),
      firstAirDate: firstAirDate,
      lastAirDate: lastAirDate,
      rating: Math.round((tmdbSeries.vote_average || 0) * 10) / 10,
      imdbRating: Math.round((tmdbSeries.vote_average || 0) * 10) / 10,
      genres: tmdbSeries.genres?.map(g => g.name) || [],
      type: this.determineSeriesType(tmdbSeries),
      numberOfSeasons: tmdbSeries.number_of_seasons || 0,
      numberOfEpisodes: tmdbSeries.number_of_episodes || 0,
      episodeRunTime: tmdbSeries.episode_run_time || [],
      country: tmdbSeries.production_countries?.[0]?.name || '',
      originalCountry: tmdbSeries.origin_country || [],
      language: tmdbSeries.spoken_languages?.map(l => l.english_name) || ['English'],
      originalLanguage: tmdbSeries.original_language || 'en',
      networks: tmdbSeries.networks?.map(network => ({
        name: network.name,
        logoPath: network.logo_path ? `${this.imageBaseUrl}/w92${network.logo_path}` : ''
      })) || [],
      creators: tmdbSeries.created_by?.map(creator => ({
        name: creator.name,
        profile_path: creator.profile_path ? `${this.imageBaseUrl}/w185${creator.profile_path}` : ''
      })) || [],
      cast: tmdbSeries.cast?.slice(0, 10).map(person => ({
        name: person.name,
        character: person.character || '',
        profile_path: person.profile_path ? `${this.imageBaseUrl}/w185${person.profile_path}` : ''
      })) || [],
      seriesStatus: this.mapSeriesStatus(tmdbSeries.status),
      tmdbId: tmdbSeries.id,
      imdbId: tmdbSeries.external_ids?.imdb_id || '',
      tvdbId: tmdbSeries.external_ids?.tvdb_id || null,
      trailerUrl: this.extractTrailerUrl(tmdbSeries.videos),
      keywords: tmdbSeries.keywords?.results?.map(k => k.name) || [],
      adminStatus: 'Draft',
      addedBy: userId,
      seasons: []
    };
  }

  // Map season data
  mapSeasonData(tmdbSeason) {
    return {
      seasonNumber: tmdbSeason.season_number,
      name: tmdbSeason.name,
      overview: tmdbSeason.overview || '',
      posterPath: tmdbSeason.poster_path ? `${this.imageBaseUrl}/w500${tmdbSeason.poster_path}` : '',
      airDate: tmdbSeason.air_date ? new Date(tmdbSeason.air_date) : null,
      tmdbId: tmdbSeason.id,
      episodes: tmdbSeason.episodes?.map(episode => ({
        episodeNumber: episode.episode_number,
        title: episode.name,
        overview: episode.overview || '',
        runtime: episode.runtime || 0,
        airDate: episode.air_date ? new Date(episode.air_date) : null,
        stillPath: episode.still_path ? `${this.imageBaseUrl}/w300${episode.still_path}` : '',
        rating: Math.round((episode.vote_average || 0) * 10) / 10,
        tmdbId: episode.id,
        servers: [],
        downloadLinks: [],
        views: 0,
        isActive: true
      })) || []
    };
  }

  // Determine series type based on TMDB data
  determineSeriesType(tmdbSeries) {
    const genres = tmdbSeries.genres?.map(g => g.name.toLowerCase()) || [];
    const originCountry = tmdbSeries.origin_country || [];
    
    // Check for anime indicators
    if (genres.includes('animation') && originCountry.includes('JP')) {
      return 'Anime';
    }
    
    // Check for K-drama indicators
    if (originCountry.includes('KR')) {
      return 'Kdrama';
    }
    
    return 'Series';
  }

  // Map TMDB series status to our enum
  mapSeriesStatus(tmdbStatus) {
    const statusMap = {
      'Returning Series': 'Returning Series',
      'Ended': 'Ended',
      'Canceled': 'Canceled',
      'In Production': 'In Production',
      'Planned': 'Planned'
    };
    
    return statusMap[tmdbStatus] || 'Returning Series';
  }

  // Extract trailer URL from videos
  extractTrailerUrl(videos) {
    if (!videos || !Array.isArray(videos)) return '';
    
    const trailer = videos.find(video => 
      video.type === 'Trailer' && 
      video.site === 'YouTube'
    );
    
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';
  }

  // Import movie from TMDB
  async importMovie(tmdbId, userId, options = {}) {
    try {
      // Check if movie already exists
      const existingMovie = await Movie.findOne({ tmdbId });
      if (existingMovie && !options.forceUpdate) {
        throw new Error('Movie already exists in database');
      }

      // Get movie details from TMDB
      const tmdbMovie = await this.getMovieDetails(tmdbId);
      
      // Map data to our schema
      const movieData = this.mapMovieData(tmdbMovie, userId);
      
      if (existingMovie && options.forceUpdate) {
        // Update existing movie
        const updatedMovie = await Movie.findByIdAndUpdate(
          existingMovie._id,
          { ...movieData, lastModifiedBy: userId },
          { new: true, runValidators: true }
        );
        return { movie: updatedMovie, isNew: false };
      } else {
        // Create new movie
        const newMovie = new Movie(movieData);
        await newMovie.save();
        return { movie: newMovie, isNew: true };
      }
      
    } catch (error) {
      throw new Error(`Failed to import movie: ${error.message}`);
    }
  }

  // Import TV series from TMDB
  async importSeries(tmdbId, userId, options = {}) {
    try {
      // Check if series already exists
      const existingSeries = await Series.findOne({ tmdbId });
      if (existingSeries && !options.forceUpdate) {
        throw new Error('Series already exists in database');
      }

      // Get series details from TMDB
      const tmdbSeries = await this.getTVSeriesDetails(tmdbId);
      
      // Map data to our schema
      const seriesData = this.mapSeriesData(tmdbSeries, userId);
      
      let series;
      if (existingSeries && options.forceUpdate) {
        // Update existing series (preserve existing seasons unless options.updateSeasons is true)
        const updateData = { ...seriesData, lastModifiedBy: userId };
        if (!options.updateSeasons) {
          delete updateData.seasons;
        }
        series = await Series.findByIdAndUpdate(
          existingSeries._id,
          updateData,
          { new: true, runValidators: true }
        );
      } else {
        // Create new series
        series = new Series(seriesData);
        await series.save();
      }

      // Import seasons if requested
      if (options.importSeasons && tmdbSeries.seasons) {
        await this.importSeasons(series._id, tmdbId, tmdbSeries.seasons, userId);
      }

      return { series, isNew: !existingSeries };
      
    } catch (error) {
      throw new Error(`Failed to import series: ${error.message}`);
    }
  }

  // Import seasons for a series
  async importSeasons(seriesId, tmdbSeriesId, tmdbSeasons, userId) {
    try {
      const series = await Series.findById(seriesId);
      if (!series) {
        throw new Error('Series not found');
      }

      for (const tmdbSeason of tmdbSeasons) {
        // Skip special seasons if not requested
        if (tmdbSeason.season_number === 0) continue;
        
        try {
          // Get detailed season data
          const seasonDetails = await this.getSeasonDetails(tmdbSeriesId, tmdbSeason.season_number);
          const seasonData = this.mapSeasonData(seasonDetails);
          
          // Check if season already exists
          const existingSeasonIndex = series.seasons.findIndex(s => s.seasonNumber === seasonData.seasonNumber);
          
          if (existingSeasonIndex >= 0) {
            // Update existing season
            series.seasons[existingSeasonIndex] = seasonData;
          } else {
            // Add new season
            series.seasons.push(seasonData);
          }
        } catch (seasonError) {
          console.error(`Failed to import season ${tmdbSeason.season_number}:`, seasonError.message);
          // Continue with other seasons
        }
      }

      series.lastModifiedBy = userId;
      await series.save();
      
      return series;
    } catch (error) {
      throw new Error(`Failed to import seasons: ${error.message}`);
    }
  }

  // Bulk import popular movies
  async importPopularMovies(userId, pages = 1) {
    const results = {
      imported: [],
      skipped: [],
      errors: []
    };

    try {
      for (let page = 1; page <= pages; page++) {
        const data = await this.makeRequest('/movie/popular', { page });
        
        for (const movie of data.results) {
          try {
            const result = await this.importMovie(movie.id, userId);
            results.imported.push({
              tmdbId: movie.id,
              title: movie.title,
              isNew: result.isNew
            });
          } catch (error) {
            if (error.message.includes('already exists')) {
              results.skipped.push({
                tmdbId: movie.id,
                title: movie.title,
                reason: 'Already exists'
              });
            } else {
              results.errors.push({
                tmdbId: movie.id,
                title: movie.title,
                error: error.message
              });
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Bulk import failed: ${error.message}`);
    }

    return results;
  }

  // Bulk import popular TV series
  async importPopularSeries(userId, pages = 1, importSeasons = false) {
    const results = {
      imported: [],
      skipped: [],
      errors: []
    };

    try {
      for (let page = 1; page <= pages; page++) {
        const data = await this.makeRequest('/tv/popular', { page });
        
        for (const series of data.results) {
          try {
            const result = await this.importSeries(series.id, userId, { importSeasons });
            results.imported.push({
              tmdbId: series.id,
              title: series.name,
              isNew: result.isNew
            });
          } catch (error) {
            if (error.message.includes('already exists')) {
              results.skipped.push({
                tmdbId: series.id,
                title: series.name,
                reason: 'Already exists'
              });
            } else {
              results.errors.push({
                tmdbId: series.id,
                title: series.name,
                error: error.message
              });
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Bulk import failed: ${error.message}`);
    }

    return results;
  }

  // Get trending content
  async getTrending(mediaType = 'all', timeWindow = 'day') {
    try {
      const data = await this.makeRequest(`/trending/${mediaType}/${timeWindow}`);
      return data.results;
    } catch (error) {
      throw new Error(`Failed to get trending content: ${error.message}`);
    }
  }

  // Check service health
  isConfigured() {
    return !!this.apiKey;
  }

  // Get service status
  async getStatus() {
    if (!this.apiKey) {
      return {
        configured: false,
        error: 'API key not configured'
      };
    }

    try {
      await this.makeRequest('/configuration');
      return {
        configured: true,
        connected: true
      };
    } catch (error) {
      return {
        configured: true,
        connected: false,
        error: error.message
      };
    }
  }
}

export default new TMDBService();
