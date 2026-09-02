/**
 * Utility functions for RaithaSetu AI
 */

export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export const formatDistance = (distanceKm, language = 'en') => {
  if (distanceKm === null || distanceKm === undefined) {
    return language === 'kn' ? 'ಸಮೀಪದಲ್ಲಿದೆ' : 'Nearby';
  }
  if (distanceKm < 1) {
    return language === 'kn' ? '1 ಕಿ.ಮೀ. ಗಿಂತ ಕಮ್ಮಿ' : 'Within 1 km';
  }
  if (language === 'kn') {
    return `${distanceKm} ಕಿ.ಮೀ. ದೂರ`;
  }
  return `${distanceKm} km away`;
};

export const formatDistanceKm = formatDistance;

export const formatCurrency = (amount, unit = '') => {
  if (!amount) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}${unit ? ` ${unit}` : ''}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
