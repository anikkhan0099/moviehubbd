import React from 'react';
import { Episode } from '../../types';
import { TrashIcon } from '../Icons';
import EditableLinkList from './EditableLinkList';

interface EpisodeEditorProps {
    episode: Episode;
    onEpisodeChange: (updatedEpisode: Episode) => void;
    onDelete: () => void;
}

const EpisodeEditor: React.FC<EpisodeEditorProps> = ({ episode, onEpisodeChange, onDelete }) => {
    
    const handleInputChange = (field: keyof Episode, value: any) => {
        onEpisodeChange({ ...episode, [field]: value });
    };

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Episode {episode.episodeNumber}</h3>
                <button type="button" onClick={onDelete} className="text-red-500 hover:text-red-400" aria-label="Delete Episode">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Episode No.</label>
                    <input
                        type="number"
                        value={episode.episodeNumber}
                        onChange={(e) => handleInputChange('episodeNumber', parseInt(e.target.value, 10))}
                        className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                    <input
                        type="text"
                        value={episode.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Runtime (min)</label>
                    <input
                        type="number"
                        value={episode.runtime}
                        onChange={(e) => handleInputChange('runtime', parseInt(e.target.value, 10))}
                        className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <EditableLinkList 
                    links={episode.servers}
                    onLinksChange={(newLinks) => handleInputChange('servers', newLinks)}
                    linkType="Server"
                />
                <EditableLinkList 
                    links={episode.downloadLinks}
                    onLinksChange={(newLinks) => handleInputChange('downloadLinks', newLinks)}
                    linkType="Download"
                />
            </div>
        </div>
    );
};

export default EpisodeEditor;