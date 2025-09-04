import React, { useState } from 'react';
import { HeartIcon, FacebookIcon, TelegramIcon, WhatsAppIcon, TwitterIcon, CopyIcon, BoltIcon } from './Icons';

const PreDetailsSection: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <section className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700 text-center space-y-6">
      {/* Like Button */}
      <div className="flex justify-center">
        <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity">
          <HeartIcon className="w-6 h-6" />
          <span>121</span>
        </button>
      </div>

      {/* Instructions */}
      <p className="text-gray-300 flex items-center justify-center gap-1.5 flex-wrap">
        <span>Click</span> <HeartIcon className="w-5 h-5 inline-block text-red-500" /> <span>If You're Ready To Watch</span> <BoltIcon className="w-4 h-4 inline-block text-yellow-400" /> <span>Tap</span> <HeartIcon className="w-5 h-5 inline-block text-red-500" /> <span>If The Link Is Broken!</span>
      </p>

      {/* How to Download */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-cyan-400 tracking-wider">HOW TO DOWNLOAD??</h2>
        <p className="text-gray-400 text-sm">Click on the logo to see Download Process</p>
      </div>

      {/* Watch Button */}
      <div>
        <button className="bg-gradient-to-b from-cyan-400 to-cyan-600 text-white font-bold py-3 px-10 rounded-lg shadow-xl hover:opacity-90 transition-opacity text-lg tracking-wider">
          CLICK ME TO WATCH!
        </button>
      </div>

      {/* Social Join */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        <a href="#" className="bg-gray-900/50 hover:bg-gray-900/80 transition-colors p-4 rounded-lg flex items-center justify-center gap-4">
          <FacebookIcon className="w-8 h-8 text-white flex-shrink-0" />
          <div className="text-left">
            <span className="text-sm text-gray-400">Join us on</span>
            <p className="font-bold text-lg text-white leading-tight">FACEBOOK</p>
          </div>
        </a>
        <a href="#" className="bg-cyan-600/80 hover:bg-cyan-600 transition-colors p-4 rounded-lg flex items-center justify-center gap-4">
          <TelegramIcon className="w-8 h-8 text-white flex-shrink-0" />
          <div className="text-left">
            <span className="text-sm text-gray-300">Join us on</span>
            <p className="font-bold text-lg text-white leading-tight">TELEGRAM</p>
          </div>
        </a>
      </div>
      
      {/* Social Share */}
      <div className="flex items-center justify-center gap-3">
         <a href="#" aria-label="Share on Facebook" className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
           <FacebookIcon className="w-5 h-5" />
         </a>
         <a href="#" aria-label="Share on WhatsApp" className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
           <WhatsAppIcon className="w-6 h-6" />
         </a>
         <a href="#" aria-label="Share on Twitter" className="bg-sky-500 w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
           <TwitterIcon className="w-5 h-5" />
         </a>
         <button onClick={handleCopy} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md flex items-center gap-2 hover:bg-gray-500 transition-colors min-w-[100px] justify-center">
            <CopyIcon className="w-5 h-5" />
            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
         </button>
      </div>

    </section>
  );
};

export default PreDetailsSection;