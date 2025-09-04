import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string; // class for the container
  imgClassName?: string; // class for the img itself
  srcSet?: string;
  sizes?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, imgClassName, srcSet, sizes }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '200px' }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative bg-gray-800 overflow-hidden ${className || ''}`}>
      {/* Shimmer Placeholder */}
      <div
        className={`absolute inset-0 animate-shimmer transition-opacity duration-500 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      />
      
      {/* Actual Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          srcSet={srcSet}
          sizes={sizes}
          className={`${imgClassName || ''} transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy" // Fallback
        />
      )}
    </div>
  );
};

export default LazyImage;