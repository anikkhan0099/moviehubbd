import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string; // e.g., from-cyan-500 to-blue-500
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
  return (
    <div className={`relative p-6 rounded-xl overflow-hidden bg-gray-800 border border-gray-700`}>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClass}`}></div>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold text-white mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gray-700/50`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
