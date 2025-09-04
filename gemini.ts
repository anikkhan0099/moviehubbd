import { GoogleGenAI, Type } from "@google/genai";
import { ContentItem, ItemType, Season, Episode } from './types';

// Helper to create a URL-friendly slug
const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove non-word characters
    .replace(/[\s_-]+/g, '-') // collapse whitespace and replace underscores with a single dash
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const movieSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The full title of the movie." },
    overview: { type: Type.STRING, description: "A compelling and detailed plot summary, at least 3 sentences long." },
    releaseYear: { type: Type.INTEGER, description: "The year the movie was released." },
    rating: { type: Type.NUMBER, description: "A fictional rating out of 10, e.g., 8.7" },
    genres: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-4 relevant genres." },
    runtime: { type: Type.INTEGER, description: "Runtime in minutes, e.g., 145." },
    country: { type: Type.STRING, description: "The primary country of production." },
    language: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of spoken languages." },
    director: { type: Type.STRING, description: "The name of the director." },
    cast: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of the main cast members (at least 3)." },
  },
  required: ["title", "overview", "releaseYear", "rating", "genres", "runtime", "cast", "director", "country", "language"],
};

const seriesSchema = {
    type: Type.OBJECT,
    properties: {
      ...movieSchema.properties,
      seasons: {
        type: Type.ARRAY,
        description: "An array of seasons for the series.",
        items: {
            type: Type.OBJECT,
            properties: {
                seasonNumber: { type: Type.INTEGER },
                episodes: {
                    type: Type.ARRAY,
                    description: "An array of episodes for this season (at least 3).",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            episodeNumber: { type: Type.INTEGER },
                            title: { type: Type.STRING, description: "A creative title for the episode." },
                            runtime: { type: Type.INTEGER, description: "Runtime in minutes, e.g., 45." },
                        },
                        required: ["episodeNumber", "title", "runtime"]
                    }
                }
            },
            required: ["seasonNumber", "episodes"]
        }
      }
    },
    required: ["title", "overview", "releaseYear", "rating", "genres", "seasons", "cast", "country", "language"],
};


export const generateContentFromTitle = async (title: string, type: 'movie' | 'tv'): Promise<ContentItem> => {
    const prompt = `Generate detailed information for a fictional ${type === 'movie' ? 'movie' : 'TV series'} titled "${title}". The generated data must be very high quality, realistic, and strictly adhere to the provided JSON schema. Include a compelling overview, cast, director (if movie), genres, and other relevant details. For a series, generate details for at least one season with 3-5 episodes.`;

    const schema = type === 'movie' ? movieSchema : seriesSchema;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    const generatedData = JSON.parse(response.text);

    // Map the AI-generated data to our ContentItem structure
    const newItem: ContentItem = {
        id: `ai-${Date.now()}`,
        slug: createSlug(generatedData.title),
        title: generatedData.title,
        posterPath: `https://via.placeholder.com/500x750.png?text=${encodeURIComponent(createSlug(generatedData.title))}`,
        backdropPath: `https://via.placeholder.com/1280x720.png?text=${encodeURIComponent(createSlug(generatedData.title))}`,
        overview: generatedData.overview,
        releaseYear: generatedData.releaseYear,
        rating: parseFloat(generatedData.rating.toFixed(1)),
        genres: generatedData.genres,
        type: type === 'movie' ? ItemType.Movie : ItemType.Series,
        runtime: generatedData.runtime,
        tmdbId: undefined,
        adminStatus: 'Draft',
        language: generatedData.language,
        country: generatedData.country,
        director: generatedData.director,
        cast: generatedData.cast,
        seasons: generatedData.seasons?.map((s: any): Season => ({
            seasonNumber: s.seasonNumber,
            episodes: s.episodes.map((e: any, index: number): Episode => ({
                id: `s${s.seasonNumber}e${e.episodeNumber}-${Date.now() + index}`,
                episodeNumber: e.episodeNumber,
                title: e.title,
                runtime: e.runtime,
                servers: [],
                downloadLinks: [],
            })),
        })),
        servers: [],
        downloadGroups: [],
        downloadLinks: [],
        screenshots: [],
    };
    
    return newItem;
};