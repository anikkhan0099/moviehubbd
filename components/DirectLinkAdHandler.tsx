import { useEffect } from 'react';
import { MOCK_ADS } from '../constants';

const DirectLinkAdHandler: React.FC = () => {
  useEffect(() => {
    const directLinkAd = MOCK_ADS.find(ad => ad.type === 'Direct Link');
    
    if (!directLinkAd || !directLinkAd.code) {
      return; // No direct link ad configured or URL is empty
    }

    const handleFirstClick = () => {
      // Open the ad link in a new tab. 'noopener' and 'noreferrer' are important for security.
      window.open(directLinkAd.code, '_blank', 'noopener,noreferrer');
      
      // Remove the event listener immediately after the first click so it only fires once.
      document.removeEventListener('click', handleFirstClick);
    };

    // Add the event listener to the entire document.
    document.addEventListener('click', handleFirstClick);

    // Cleanup function: remove the listener when the component unmounts (e.g., user navigates away)
    // to prevent memory leaks, although it would have already been removed after the first click.
    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, []); // The empty dependency array ensures this effect runs only once when the component mounts.

  return null; // This component is purely logical and does not render any UI.
};

export default DirectLinkAdHandler;