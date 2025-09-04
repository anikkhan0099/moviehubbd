import React from 'react';
import { DownloadGroup } from '../types';
import { GlobeIcon, MonitorIcon, BoltIcon } from './Icons';

interface DownloadSectionProps {
    groups: DownloadGroup[];
}

const DownloadSection: React.FC<DownloadSectionProps> = ({ groups }) => {
    const getIcon = (iconType: 'quality' | 'server') => {
        switch(iconType) {
            case 'quality':
                return <MonitorIcon className="w-5 h-5 mr-2 text-cyan-400" />;
            case 'server':
                return <GlobeIcon className="w-5 h-5 mr-2 text-cyan-400" />;
            default:
                return null;
        }
    }
    
    return (
        <section>
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-4">DOWNLOAD NOW</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map((group, index) => (
                    <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
                        <div className="flex items-center text-white font-semibold mb-4">
                            {getIcon(group.icon)}
                            <h3 className="text-md uppercase tracking-wide">{group.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {group.links.map((link, linkIndex) => (
                                <a
                                  key={linkIndex}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-cyan-500 text-cyan-400 font-semibold hover:text-white py-2 px-4 border border-cyan-400 hover:border-transparent rounded-md transition duration-300 w-full sm:w-auto flex-grow"
                                >
                                    <BoltIcon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default DownloadSection;