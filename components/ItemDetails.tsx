import React from 'react';
import { ContentItem } from '../types';

interface ItemDetailsProps {
    item: ContentItem;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ item }) => {
    
    const InfoField = ({ label, value }: { label: string; value?: string | string[] | number }) => (
        value ? <p><strong className="font-semibold text-gray-300">{label}:</strong> {Array.isArray(value) ? value.join(', ') : value}</p> : null
    );

    return (
        <section className="flex flex-col md:flex-row gap-8">
            <div className="w-3/4 mx-auto sm:w-1/2 md:w-1/4 lg:w-1/5 flex-shrink-0 md:mx-0">
                <img 
                    src={item.posterPath} 
                    alt={item.title} 
                    srcSet={`${item.posterPath} 300w, ${item.posterPath} 500w, ${item.posterPath} 780w`}
                    sizes="(max-width: 639px) 75vw, (max-width: 767px) 50vw, (max-width: 1023px) 25vw, 20vw"
                    className="w-full aspect-[2/3] object-cover rounded-lg shadow-lg"
                />
            </div>
            <div className="text-gray-400 flex-grow">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{item.title}</h1>
                <p className="mb-6 leading-relaxed">{item.overview}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <InfoField label="Type" value={item.type} />
                    <InfoField label="Country" value={item.country} />
                    <InfoField label="Language" value={item.language} />
                    <InfoField label="Director" value={item.director} />
                    <InfoField label="Genre" value={item.genres} />
                    <InfoField label="Casts" value={item.cast} />
                    <InfoField label="Year" value={item.releaseYear} />
                </div>
            </div>
        </section>
    );
};

export default ItemDetails;