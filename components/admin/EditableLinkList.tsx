import React from 'react';
import { DownloadLink, Server } from '../../types';
import { TrashIcon, PlusCircleIcon } from '../Icons';

type LinkItem = DownloadLink | Server;

interface EditableLinkListProps {
  links: LinkItem[];
  onLinksChange: (newLinks: LinkItem[]) => void;
  linkType: 'Server' | 'Download';
}

const EditableLinkList: React.FC<EditableLinkListProps> = ({ links, onLinksChange, linkType }) => {
  const handleLinkChange = (index: number, field: 'label' | 'name' | 'url', value: string) => {
    const newLinks = [...links];
    const key = linkType === 'Server' ? 'name' : 'label';
    if (field === 'label' || field === 'name') {
        (newLinks[index] as any)[key] = value;
    } else {
        (newLinks[index] as any)[field] = value;
    }
    onLinksChange(newLinks);
  };

  const addLink = () => {
    const newLink = linkType === 'Server' ? { name: '', url: '' } : { label: '', url: '' };
    onLinksChange([...links, newLink]);
  };

  const removeLink = (index: number) => {
    onLinksChange(links.filter((_, i) => i !== index));
  };
  
  const labelKey = linkType === 'Server' ? 'name' : 'label';
  const labelPlaceholder = linkType === 'Server' ? 'SR 1' : '1080p';

  return (
    <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-300">{linkType} Links</h4>
        {links.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder={labelPlaceholder}
                    value={(link as any)[labelKey]}
                    onChange={(e) => handleLinkChange(index, labelKey, e.target.value)}
                    className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-1/3 p-2"
                />
                <input
                    type="text"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    className="bg-gray-900 border border-gray-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block w-2/3 p-2"
                />
                <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="text-red-500 hover:text-red-400 p-2"
                    aria-label={`Remove ${linkType}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        ))}
        <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold"
        >
            <PlusCircleIcon className="w-5 h-5" />
            Add {linkType} Link
        </button>
    </div>
  );
};

export default EditableLinkList;