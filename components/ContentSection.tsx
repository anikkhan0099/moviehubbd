import React, { useState } from 'react';
import { ContentItem } from '../types';
import MovieCard from './MovieCard';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { Link } from 'react-router-dom';

interface ContentSectionProps {
  title: string;
  items: ContentItem[];
  isTrending?: boolean;
}

const ITEMS_PER_PAGE = 8; // Items per page, matches the max number of columns for a clean look

const ContentSection: React.FC<ContentSectionProps> = ({ title, items, isTrending = false }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <section>
      {/* Section Header with Title and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="w-1 h-7 bg-cyan-500 rounded-full mr-3"></span>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="#" className="text-sm text-cyan-400 hover:text-white transition-colors">
            See All
          </Link>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 bg-gray-800 rounded-full hover:bg-cyan-500 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-800 rounded-full hover:bg-cyan-500 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-8 min-h-[300px]">
            {paginatedItems.map((item) => (
              <MovieCard key={item.id} item={item} isTrending={isTrending} />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-10 text-center">
          <p className="text-gray-400">No content found in this category at the moment.</p>
        </div>
      )}
    </section>
  );
};

export default ContentSection;