import React from 'react';
import { Link } from 'react-router-dom';
import { ContentItem } from '../types';
import { PlayCircleIcon, FireIcon } from './Icons';
import LazyImage from './LazyImage';

interface MovieCardProps {
  item: ContentItem;
  isTrending?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ item, isTrending = false }) => {
  // Since i.ibb.co does not support resizing via URL params,
  // we'll use the same image URL for different width descriptors
  // to demonstrate the `srcset` implementation. A real implementation
  // would point to different-sized images.
  const posterSrcSet = `${item.posterPath} 300w, ${item.posterPath} 500w`;

  const posterSizes = `(max-width: 639px) 45vw, 
                     (max-width: 767px) 30vw,
                     (max-width: 1023px) 22vw,
                     (max-width: 1279px) 15vw,
                     11vw`;
                     
  return (
    <Link to={`/item/${item.slug}`} className="group block">
      {/* Poster Container */}
      <div className="relative w-full aspect-[2/3] rounded-md overflow-hidden shadow-lg border border-gray-700">
        <LazyImage
          src={item.posterPath}
          alt={item.title}
          srcSet={posterSrcSet}
          sizes={posterSizes}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Top-Left Badge: Trending or Status */}
        {isTrending ? (
            <div className="absolute top-2 left-2 flex items-center bg-orange-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md z-10 animate-pulse">
                <FireIcon className="w-3 h-3 mr-1" />
                <span>TRENDING</span>
            </div>
        ) : item.status ? (
          <div className={`absolute top-2 left-2 text-black text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md z-10 ${
            item.status === 'New' ? 'bg-red-600' : 'bg-yellow-500'
          }`}>
            {item.status.toUpperCase()}
          </div>
        ) : null}

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-cyan-500 text-black text-xs font-bold px-2 py-0.5 rounded-md z-10">
          <span>{item.rating.toFixed(1)}</span>
        </div>

        {/* Language/Type Badge (Bottom Left) */}
        {item.language?.[0] && (
            <div className="absolute bottom-2 left-2 bg-cyan-500 text-black text-xs font-semibold px-2 py-0.5 rounded-md z-10">
                {item.language[0]}
            </div>
        )}

        {/* Hover Overlay with Play Icon */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <PlayCircleIcon className="w-20 h-20 text-white" />
        </div>
      </div>

      {/* Info Below Poster */}
      <div className="mt-2">
        <h3 className="font-medium text-sm text-white truncate">{item.title}</h3>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
          <span>{item.releaseYear}</span>
          {item.runtime && <span>{item.runtime} Min</span>}
          <span className="border border-gray-600 rounded-md px-1.5 py-[1px] text-[10px] leading-none">{item.type}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;