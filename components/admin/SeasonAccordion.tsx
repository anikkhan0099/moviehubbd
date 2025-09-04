import React, { useState } from 'react';
import { Season, Episode } from '../../types';
import { ChevronDownIcon, TrashIcon, PlusCircleIcon } from '../Icons';
import EpisodeEditor from './EpisodeEditor';

interface SeasonAccordionProps {
    season: Season;
    onSeasonChange: (updatedSeason: Season) => void;
    onDelete: () => void;
}

const SeasonAccordion: React.FC<SeasonAccordionProps> = ({ season, onSeasonChange, onDelete }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleEpisodeChange = (index: number, updatedEpisode: Episode) => {
        const newEpisodes = [...season.episodes];
        newEpisodes[index] = updatedEpisode;
        onSeasonChange({ ...season, episodes: newEpisodes });
    };

    const addEpisode = () => {
        const newEpisode: Episode = {
            id: `s${season.seasonNumber}e${season.episodes.length + 1}-${Date.now()}`,
            episodeNumber: season.episodes.length + 1,
            title: `New Episode`,
            runtime: 0,
            servers: [],
            downloadLinks: [],
        };
        onSeasonChange({ ...season, episodes: [...season.episodes, newEpisode] });
    };

    const deleteEpisode = (index: number) => {
        const newEpisodes = season.episodes.filter((_, i) => i !== index);
        onSeasonChange({ ...season, episodes: newEpisodes });
    };

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
            <button
                type="button"
                className="w-full flex items-center justify-between p-4 text-left text-white font-semibold"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center">
                    <span>Season {season.seasonNumber}</span>
                    <span className="ml-3 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        {season.episodes.length} Episodes
                    </span>
                </div>
                <div className="flex items-center gap-4">
                     <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="text-red-500 hover:text-red-400"
                        aria-label="Delete Season"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-700 space-y-4">
                    {season.episodes.map((episode, index) => (
                        <EpisodeEditor
                            key={episode.id}
                            episode={episode}
                            onEpisodeChange={(updatedEpisode) => handleEpisodeChange(index, updatedEpisode)}
                            onDelete={() => deleteEpisode(index)}
                        />
                    ))}
                    <button
                        type="button"
                        onClick={addEpisode}
                        className="w-full flex items-center justify-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold py-3 border-2 border-dashed border-gray-600 hover:border-cyan-500 rounded-lg transition-colors"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        Add Episode
                    </button>
                </div>
            )}
        </div>
    );
};

export default SeasonAccordion;