import React, { useRef, useState, useEffect } from 'react';
import { FilmReelIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import LazyImage from './LazyImage';

const platforms = [
  { name: 'Netflix', logo: 'https://i.ibb.co/6P6w23x/netflix.png', url: '#' },
  { name: 'Prime', logo: 'https://i.ibb.co/5nR19Yv/prime-video.png', url: '#' },
  { name: 'Desney+', logo: 'https://i.ibb.co/yQ6B5C5/disney-plus.png', url: '#' },
  { name: 'HBO Max', logo: 'https://i.ibb.co/L9L73x1/hbo-max.png', url: '#' },
  { name: 'Zee5', logo: 'https://i.ibb.co/CVmGXN4/zee5.png', url: '#' },
  { name: 'Sony Liv', logo: 'https://i.ibb.co/mH9dwdz/sony-liv.png', url: '#' },
  { name: 'Chorki', logo: 'https://i.ibb.co/N1XwNcv/chorki.png', url: '#' },
  { name: 'TOFFEE', logo: 'https://i.ibb.co/vVRgC0p/toffee.png', url: '#' },
  { name: 'Hoichoi', logo: 'https://i.ibb.co/VDP2Gwt/hoichoi.png', url: '#' },
  { name: 'Bongo', logo: 'https://i.ibb.co/qDCMW9G/bongo.png', url: '#' },
  { name: 'Apple Tv', logo: 'https://i.ibb.co/K2K7rM2/apple-tv.png', url: '#' },
  { name: 'Show Max', logo: 'https://i.ibb.co/3zd5SDF/showmax.png', url: '#' },
];

const PopularPlatforms: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for precision
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    checkScrollability();
    
    container?.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', checkScrollability);

    return () => {
      container?.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
            <FilmReelIcon className="w-7 h-7 text-cyan-400 mr-2" />
            <h2 className="text-2xl font-bold text-white">Popular Platforms</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`bg-gray-800/50 hover:bg-gray-700/80 rounded-full p-2 transition-all duration-300 ${!canScrollLeft ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
            aria-label="Scroll Left"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`bg-gray-800/50 hover:bg-gray-700/80 rounded-full p-2 transition-all duration-300 ${!canScrollRight ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
            aria-label="Scroll Right"
          >
            <ChevronRightIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex items-center space-x-6 overflow-x-auto pb-4 scrollbar-hide overscroll-x-contain"
      >
        {platforms.map((platform) => (
          <a href={platform.url} key={platform.name} className="flex flex-col items-center flex-shrink-0 group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-800 border-2 border-gray-700 p-1 flex items-center justify-center transition-all duration-300 group-hover:border-cyan-400 group-hover:scale-105 overflow-hidden">
              <LazyImage
                src={platform.logo}
                alt={`${platform.name} logo`}
                className="w-full h-full rounded-full"
                imgClassName="w-full h-full object-contain rounded-full"
              />
            </div>
            <span className="mt-2 text-sm font-medium text-gray-300 group-hover:text-cyan-400 transition-colors">
              {platform.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default PopularPlatforms;