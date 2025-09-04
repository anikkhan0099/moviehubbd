import React, { useState } from 'react';
import { ContentItem, Episode, Server } from '../types';
import { SpinnerIcon } from './Icons';

interface SeriesControlsProps {
  item: ContentItem;
  activeEpisode: Episode;
  activeServerUrl: string;
  onSelectEpisode: (episode: Episode) => void;
  onSelectServer: (server: Server) => void;
}

const EPISODES_PER_PAGE = 52; // Increased episodes per page for fewer clicks on large series

const SeriesControls: React.FC<SeriesControlsProps> = ({ 
  item, 
  activeEpisode, 
  activeServerUrl, 
  onSelectEpisode, 
  onSelectServer 
}) => {
  const [visibleCount, setVisibleCount] = useState(EPISODES_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Assuming one season for now as per the UI screenshot
  const allEpisodes = item.seasons?.[0]?.episodes || [];

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate network delay for a smoother feel
    setTimeout(() => {
        setVisibleCount(prevCount => prevCount + EPISODES_PER_PAGE);
        setIsLoadingMore(false);
    }, 500);
  };
  
  if (!item.seasons || item.seasons.length === 0 || allEpisodes.length === 0) {
    return null;
  }

  const activeServerName = activeEpisode.servers.find(s => s.url === activeServerUrl)?.name;

  return (
    <section className="bg-gray-800/70 p-4 md:p-6 rounded-lg border border-gray-700 space-y-6">
      {/* Top Controls: Info, Servers, Downloads */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-grow text-gray-300 bg-gray-900/50 p-3 rounded-md text-center md:text-left">
            <p>You are watching <strong className="font-semibold text-white">Episode {activeEpisode.episodeNumber}</strong></p>
            <p className="text-xs mt-1">If current server does not work, please try another one.</p>
        </div>

        <div className="flex items-center justify-center gap-2 flex-shrink-0 flex-wrap">
            {activeEpisode.servers.map(server => (
                <button 
                    key={server.name}
                    onClick={() => onSelectServer(server)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                        activeServerName === server.name
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {server.name}
                </button>
            ))}
        </div>
      </div>

      {/* Episode Grid */}
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-13 gap-2">
            {allEpisodes.slice(0, visibleCount).map(episode => (
                <button
                    key={episode.id}
                    onClick={() => onSelectEpisode(episode)}
                    className={`py-2 px-1 text-xs sm:text-sm font-semibold rounded-md transition-colors aspect-square flex items-center justify-center ${
                        activeEpisode.id === episode.id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {episode.episodeNumber}
                </button>
            ))}
        </div>

        {visibleCount < allEpisodes.length && (
            <div className="mt-6 text-center">
                <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold py-2 px-6 rounded-md hover:opacity-90 transition-all text-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed min-h-[40px]"
                >
                    {isLoadingMore ? (
                        <>
                            <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
                            <span>Loading...</span>
                        </>
                    ) : (
                        'Load More Episodes'
                    )}
                </button>
            </div>
      )}
      </div>
    </section>
  );
};

export default SeriesControls;