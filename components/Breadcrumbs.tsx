import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from './Icons';

interface Crumb {
    name: string;
    path?: string;
}

interface BreadcrumbsProps {
    crumbs: Crumb[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ crumbs }) => {
    return (
        <nav className="flex items-center text-sm text-gray-400" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                {crumbs.map((crumb, index) => (
                    <li key={index} className="inline-flex items-center">
                        {index > 0 && (
                             <ChevronRightIcon className="w-4 h-4 text-gray-500 mx-1" />
                        )}
                        {crumb.path && index < crumbs.length - 1 ? (
                            <Link to={crumb.path} className="hover:text-cyan-400 transition-colors">
                                {crumb.name}
                            </Link>
                        ) : (
                            <span className={index === crumbs.length - 1 ? "text-white font-medium" : ""}>
                                {crumb.name}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
