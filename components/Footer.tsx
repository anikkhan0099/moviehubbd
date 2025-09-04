import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-cyan-500/20 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400">
        <img src="https://i.ibb.co/hZ5g0J1/Movie-Hub-BD-Logo.png" alt="MovieHubBD Logo" className="h-12 w-auto mx-auto mb-4" />
        <p className="text-sm">Copyright &copy; {new Date().getFullYear()} MovieHubBD. All Rights Reserved.</p>
        <p className="text-sm mt-1">Developed by Mazharul Islam Anik</p>
        <p className="text-xs mt-2 max-w-2xl mx-auto">
            Disclaimer: This site does not store any files on its server.
            All contents are provided by non-affiliated third parties.
        </p>
        <p className="text-sm mt-4">Contact: <a href="mailto:moviehubbdofficial@gmail.com" className="text-cyan-400 hover:underline">moviehubbdofficial@gmail.com</a></p>
      </div>
    </footer>
  );
};

export default Footer;