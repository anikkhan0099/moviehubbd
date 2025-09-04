import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ContentItem } from '../types';
import { PlayIcon } from './Icons';

interface HeroSliderProps {
  items: ContentItem[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  }, [items.length]);

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000); // Autoplay every 5 seconds
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-900 overflow-hidden">
      {/* Sliding background track */}
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
           <div
            key={`slide-${item.id}`}
            className="relative w-full h-full flex-shrink-0"
          >
            <img
              src={item.backdropPath}
              alt={item.title}
              srcSet={`${item.backdropPath} 780w, ${item.backdropPath} 1280w, ${item.backdropPath} 1920w`}
              sizes="100vw"
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
           </div>
        ))}
      </div>

      {/* Fading text content */}
      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="relative">
            {items.map((item, index) => (
              <div 
                key={`content-${item.id}`}
                className={`
                  text-white pb-8 md:pb-12 lg:pb-16
                  transition-all duration-700 ease-in-out
                  ${
                    index === currentIndex
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }
                  ${index !== currentIndex ? 'absolute bottom-0 w-full' : 'static'}
                `}
              >
                 <h1 className="text-3xl md:text-5xl font-bold mb-3">{item.title}</h1>
                 <div className="flex items-center space-x-4 text-gray-300 mb-4">
                     <span>Duration: {item.runtime} Min</span>
                     <span>&#8226;</span>
                     <span>HMDB: {item.rating.toFixed(1)}</span>
                 </div>
                 <div className="flex items-center space-x-4 text-gray-300 mb-6">
                     <span>Genres: {item.genres.join(', ')}</span>
                 </div>
                 <p className="max-w-xl text-sm md:text-base mb-8 hidden md:block">{item.overview}</p>
                 <Link
                   to={`/item/${item.slug}`}
                   className="inline-flex items-center bg-transparent hover:bg-cyan-500 text-cyan-400 font-semibold hover:text-white py-2 px-4 border border-cyan-400 hover:border-transparent rounded transition duration-300"
                 >
                   <PlayIcon className="w-5 h-5 mr-2"/>
                   Watch Now
                 </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-cyan-400' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;