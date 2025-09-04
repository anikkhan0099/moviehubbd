import React from 'react';
import { ContentItem, Server } from '../types';

interface MovieControlsProps {
  item: ContentItem;
  activeServerUrl: string;
  onSelectServer: (server: Server) => void;
}

const MovieControls: React.FC<MovieControlsProps> = ({ item, activeServerUrl, onSelectServer }) => {
  if ((!item.servers || item.servers.length === 0) && (!item.downloadLinks || item.downloadLinks.length === 0)) {
    return null;
  }

  const activeServerName = item.servers?.find(s => s.url === activeServerUrl)?.name;

  return (
    <section className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Info */}
        <div className="text-gray-300 text-center md:text-left flex-shrink-0">
            <p className="text-sm">You are watching <strong className="font-semibold text-white">{item.title}</strong></p>
            <p className="text-xs mt-1">If current server does not work, try others.</p>
        </div>

        {/* All buttons container */}
        <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-4">
            {/* Server Buttons */}
            {item.servers && item.servers.length > 0 && (
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {item.servers.map(server => (
                        <button 
                            key={server.name}
                            onClick={() => onSelectServer(server)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                activeServerName === server.name
                                ? 'bg-cyan-500 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            {server.name}
                        </button>
                    ))}
                </div>
            )}
            
            {/* Download Buttons */}
            {item.downloadLinks && item.downloadLinks.length > 0 && (
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {item.downloadLinks.map((link, index) => (
                        <a 
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-gray-200 hover:bg-gray-300 text-gray-900"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default MovieControls;