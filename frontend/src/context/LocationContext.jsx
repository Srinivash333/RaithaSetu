import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';

const LocationContext = createContext();

export const KARNATAKA_DISTRICTS = [
  { key: 'bengaluru', en: 'Bengaluru, Karnataka', kn: 'ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ', lat: 12.9716, lon: 77.5946 },
  { key: 'mysuru', en: 'Mysuru, Karnataka', kn: 'ಮೈಸೂರು, ಕರ್ನಾಟಕ', lat: 12.2958, lon: 76.6394 },
  { key: 'mandya', en: 'Mandya, Karnataka', kn: 'ಮಂಡ್ಯ, ಕರ್ನಾಟಕ', lat: 12.5218, lon: 76.8951 },
  { key: 'hassan', en: 'Hassan, Karnataka', kn: 'ಹಾಸನ, ಕರ್ನಾಟಕ', lat: 13.0033, lon: 76.1004 },
  { key: 'tumakuru', en: 'Tumakuru, Karnataka', kn: 'ತುಮಕೂರು, ಕರ್ನಾಟಕ', lat: 13.3409, lon: 77.1006 },
  { key: 'shivamogga', en: 'Shivamogga, Karnataka', kn: 'ಶಿವಮೊಗ್ಗ, ಕರ್ನಾಟಕ', lat: 13.9299, lon: 75.5681 },
  { key: 'belagavi', en: 'Belagavi, Karnataka', kn: 'ಬೆಳಗಾವಿ, ಕರ್ನಾಟಕ', lat: 15.8497, lon: 74.4977 },
  { key: 'hubballi', en: 'Hubballi-Dharwad, Karnataka', kn: 'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ, ಕರ್ನಾಟಕ', lat: 15.3647, lon: 75.1240 },
  { key: 'kalaburagi', en: 'Kalaburagi, Karnataka', kn: 'ಕಲಬುರಗಿ, ಕರ್ನಾಟಕ', lat: 17.3297, lon: 76.8343 },
  { key: 'mangaluru', en: 'Mangaluru, Karnataka', kn: 'ಮಂಗಳೂರು, ಕರ್ನಾಟಕ', lat: 12.9141, lon: 74.8560 },
  { key: 'davangere', en: 'Davangere, Karnataka', kn: 'ದಾವಣಗೆರೆ, ಕರ್ನಾಟಕ', lat: 14.4644, lon: 75.9218 },
  { key: 'ballari', en: 'Ballari, Karnataka', kn: 'ಬಳ್ಳಾರಿ, ಕರ್ನಾಟಕ', lat: 15.1394, lon: 76.9214 },
  { key: 'chikkamagaluru', en: 'Chikkamagaluru, Karnataka', kn: 'ಚಿಕ್ಕಮಗಳೂರು, ಕರ್ನಾಟಕ', lat: 13.3161, lon: 75.7720 },
  { key: 'vijayapura', en: 'Vijayapura, Karnataka', kn: 'ವಿಜಯಪುರ, ಕರ್ನಾಟಕ', lat: 16.8302, lon: 75.7100 },
  { key: 'udupi', en: 'Udupi, Karnataka', kn: 'ಉಡುಪಿ, ಕರ್ನಾಟಕ', lat: 13.3409, lon: 74.7421 },
  { key: 'ramanagara', en: 'Ramanagara, Karnataka', kn: 'ರಾಮನಗರ, ಕರ್ನಾಟಕ', lat: 12.7150, lon: 77.2813 },
  { key: 'kolar', en: 'Kolar, Karnataka', kn: 'ಕೋಲಾರ, ಕರ್ನಾಟಕ', lat: 13.1367, lon: 78.1291 },
  { key: 'chamarajanagar', en: 'Chamarajanagar, Karnataka', kn: 'ಚಾಮರಾಜನಗರ, ಕರ್ನಾಟಕ', lat: 11.9261, lon: 76.9437 },
  { key: 'chitradurga', en: 'Chitradurga, Karnataka', kn: 'ಚಿತ್ರದುರ್ಗ, ಕರ್ನಾಟಕ', lat: 14.2251, lon: 76.3980 },
  { key: 'bagalkote', en: 'Bagalkote, Karnataka', kn: 'ಬಾಗಲಕೋಟೆ, ಕರ್ನಾಟಕ', lat: 16.1852, lon: 75.6961 },
  { key: 'koppal', en: 'Koppal, Karnataka', kn: 'ಕೊಪ್ಪಳ, ಕರ್ನಾಟಕ', lat: 15.3524, lon: 76.1549 },
  { key: 'yadgir', en: 'Yadgir, Karnataka', kn: 'ಯಾದಗಿರಿ, ಕರ್ನಾಟಕ', lat: 16.7630, lon: 77.1350 },
  { key: 'gadag', en: 'Gadag, Karnataka', kn: 'ಗದಗ, ಕರ್ನಾಟಕ', lat: 15.4319, lon: 75.6355 },
  { key: 'haveri', en: 'Haveri, Karnataka', kn: 'ಹಾವೇರಿ, ಕರ್ನಾಟಕ', lat: 14.7958, lon: 75.3992 },
  { key: 'karwar', en: 'Karwar, Karnataka', kn: 'ಕಾರವಾರ, ಕರ್ನಾಟಕ', lat: 14.8090, lon: 74.1300 },
  { key: 'madikeri', en: 'Madikeri, Karnataka', kn: 'ಮಡಿಕೇರಿ, ಕರ್ನಾಟಕ', lat: 12.4244, lon: 75.7382 }
];

const CITY_TRANSLATIONS = {
  'bengaluru': { en: 'Bengaluru, Karnataka', kn: 'ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ' },
  'bangalore': { en: 'Bengaluru, Karnataka', kn: 'ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ' },
  'ಬೆಂಗಳೂರು': { en: 'Bengaluru, Karnataka', kn: 'ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ' },
  'mysuru': { en: 'Mysuru, Karnataka', kn: 'ಮೈಸೂರು, ಕರ್ನಾಟಕ' },
  'mysore': { en: 'Mysuru, Karnataka', kn: 'ಮೈಸೂರು, ಕರ್ನಾಟಕ' },
  'ಮೈಸೂರು': { en: 'Mysuru, Karnataka', kn: 'ಮೈಸೂರು, ಕರ್ನಾಟಕ' },
  'mandya': { en: 'Mandya, Karnataka', kn: 'ಮಂಡ್ಯ, ಕರ್ನಾಟಕ' },
  'ಮಂಡ್ಯ': { en: 'Mandya, Karnataka', kn: 'ಮಂಡ್ಯ, ಕರ್ನಾಟಕ' },
  'maddur': { en: 'Maddur, Karnataka', kn: 'ಮದ್ದೂರು, ಕರ್ನಾಟಕ' },
  'ಮದ್ದೂರು': { en: 'Maddur, Karnataka', kn: 'ಮದ್ದೂರು, ಕರ್ನಾಟಕ' },
  'hassan': { en: 'Hassan, Karnataka', kn: 'ಹಾಸನ, ಕರ್ನಾಟಕ' },
  'ಹಾಸನ': { en: 'Hassan, Karnataka', kn: 'ಹಾಸನ, ಕರ್ನಾಟಕ' },
  'tumakuru': { en: 'Tumakuru, Karnataka', kn: 'ತುಮಕೂರು, ಕರ್ನಾಟಕ' },
  'tumkur': { en: 'Tumakuru, Karnataka', kn: 'ತುಮಕೂರು, ಕರ್ನಾಟಕ' },
  'ತುಮಕೂರು': { en: 'Tumakuru, Karnataka', kn: 'ತುಮಕೂರು, ಕರ್ನಾಟಕ' },
  'shivamogga': { en: 'Shivamogga, Karnataka', kn: 'ಶಿವಮೊಗ್ಗ, ಕರ್ನಾಟಕ' },
  'shimoga': { en: 'Shivamogga, Karnataka', kn: 'ಶಿವಮೊಗ್ಗ, ಕರ್ನಾಟಕ' },
  'ಶಿವಮೊಗ್ಗ': { en: 'Shivamogga, Karnataka', kn: 'ಶಿವಮೊಗ್ಗ, ಕರ್ನಾಟಕ' },
  'belagavi': { en: 'Belagavi, Karnataka', kn: 'ಬೆಳಗಾವಿ, ಕರ್ನಾಟಕ' },
  'belgaum': { en: 'Belagavi, Karnataka', kn: 'ಬೆಳಗಾವಿ, ಕರ್ನಾಟಕ' },
  'ಬೆಳಗಾವಿ': { en: 'Belagavi, Karnataka', kn: 'ಬೆಳಗಾವಿ, ಕರ್ನಾಟಕ' },
  'hubballi': { en: 'Hubballi-Dharwad, Karnataka', kn: 'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ, ಕರ್ನಾಟಕ' },
  'dharwad': { en: 'Hubballi-Dharwad, Karnataka', kn: 'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ, ಕರ್ನಾಟಕ' },
  'ಹುಬ್ಬಳ್ಳಿ': { en: 'Hubballi-Dharwad, Karnataka', kn: 'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ, ಕರ್ನಾಟಕ' },
  'kalaburagi': { en: 'Kalaburagi, Karnataka', kn: 'ಕಲಬುರಗಿ, ಕರ್ನಾಟಕ' },
  'gulbarga': { en: 'Kalaburagi, Karnataka', kn: 'ಕಲಬುರಗಿ, ಕರ್ನಾಟಕ' },
  'ಕಲಬುರಗಿ': { en: 'Kalaburagi, Karnataka', kn: 'ಕಲಬುರಗಿ, ಕರ್ನಾಟಕ' },
  'mangaluru': { en: 'Mangaluru, Karnataka', kn: 'ಮಂಗಳೂರು, ಕರ್ನಾಟಕ' },
  'mangalore': { en: 'Mangaluru, Karnataka', kn: 'ಮಂಗಳೂರು, ಕರ್ನಾಟಕ' },
  'ಮಂಗಳೂರು': { en: 'Mangaluru, Karnataka', kn: 'ಮಂಗಳೂರು, ಕರ್ನಾಟಕ' },
  'davangere': { en: 'Davangere, Karnataka', kn: 'ದಾವಣಗೆರೆ, ಕರ್ನಾಟಕ' },
  'ದಾವಣಗೆರೆ': { en: 'Davangere, Karnataka', kn: 'ದಾವಣಗೆರೆ, ಕರ್ನಾಟಕ' },
  'ballari': { en: 'Ballari, Karnataka', kn: 'ಬಳ್ಳಾರಿ, ಕರ್ನಾಟಕ' },
  'bellary': { en: 'Ballari, Karnataka', kn: 'ಬಳ್ಳಾರಿ, ಕರ್ನಾಟಕ' },
  'ಬಳ್ಳಾರಿ': { en: 'Ballari, Karnataka', kn: 'ಬಳ್ಳಾರಿ, ಕರ್ನಾಟಕ' },
  'chikkamagaluru': { en: 'Chikkamagaluru, Karnataka', kn: 'ಚಿಕ್ಕಮಗಳೂರು, ಕರ್ನಾಟಕ' },
  'ಚಿಕ್ಕಮಗಳೂರು': { en: 'Chikkamagaluru, Karnataka', kn: 'ಚಿಕ್ಕಮಗಳೂರು, ಕರ್ನಾಟಕ' },
  'vijayapura': { en: 'Vijayapura, Karnataka', kn: 'ವಿಜಯಪುರ, ಕರ್ನಾಟಕ' },
  'bijapur': { en: 'Vijayapura, Karnataka', kn: 'ವಿಜಯಪುರ, Karnataka' },
  'ವಿಜಯಪುರ': { en: 'Vijayapura, Karnataka', kn: 'ವಿಜಯಪುರ, ಕರ್ನಾಟಕ' },
  'udupi': { en: 'Udupi, Karnataka', kn: 'ಉಡುಪಿ, ಕರ್ನಾಟಕ' },
  'ಉಡುಪಿ': { en: 'Udupi, Karnataka', kn: 'ಉಡುಪಿ, ಕರ್ನಾಟಕ' },
  'ramanagara': { en: 'Ramanagara, Karnataka', kn: 'ರಾಮನಗರ, ಕರ್ನಾಟಕ' },
  'ರಾಮನಗರ': { en: 'Ramanagara, Karnataka', kn: 'ರಾಮನಗರ, ಕರ್ನಾಟಕ' },
  'kolar': { en: 'Kolar, Karnataka', kn: 'ಕೋಲಾರ, ಕರ್ನಾಟಕ' },
  'ಕೋಲಾರ': { en: 'Kolar, Karnataka', kn: 'ಕೋಲಾರ, ಕರ್ನಾಟಕ' },
  'chamarajanagar': { en: 'Chamarajanagar, Karnataka', kn: 'ಚಾಮರಾಜನಗರ, ಕರ್ನಾಟಕ' },
  'ಚಾಮರಾಜನಗರ': { en: 'Chamarajanagar, Karnataka', kn: 'ಚಾಮರಾಜನಗರ, ಕರ್ನಾಟಕ' },
  'chitradurga': { en: 'Chitradurga, Karnataka', kn: 'ಚಿತ್ರದುರ್ಗ, ಕರ್ನಾಟಕ' },
  'ಚಿತ್ರದುರ್ಗ': { en: 'Chitradurga, Karnataka', kn: 'ಚಿತ್ರದುರ್ಗ, ಕರ್ನಾಟಕ' }
};

export const LocationProvider = ({ children }) => {
  const { language } = useLanguage();

  const [coords, setCoords] = useState(() => {
    const saved = localStorage.getItem('raitha_coords');
    return saved ? JSON.parse(saved) : null;
  });

  const [locationNameEN, setLocationNameEN] = useState(() => {
    return localStorage.getItem('raitha_loc_en') || null;
  });

  const [locationNameKN, setLocationNameKN] = useState(() => {
    return localStorage.getItem('raitha_loc_kn') || null;
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState(null);

  const lastCoordsRef = useRef(coords);

  // Helper to format place bilingual
  const formatBilingualLocation = (cityName, stateName = '', countryName = '') => {
    const rawCity = (cityName || '').trim();
    const normalized = rawCity.toLowerCase();

    for (const [key, map] of Object.entries(CITY_TRANSLATIONS)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return { nameEN: map.en, nameKN: map.kn };
      }
    }

    const region = stateName || countryName || '';
    const enStr = region ? `${rawCity}, ${region}` : rawCity;
    const knRegion = stateName === 'Karnataka' ? 'ಕರ್ನಾಟಕ' : region;
    const knStr = knRegion ? `${rawCity}, ${knRegion}` : rawCity;

    return { nameEN: enStr, nameKN: knStr };
  };

  // Reverse Geocoding with Nominatim and BigDataCloud
  const reverseGeocode = async (lat, lon, accuracy = null) => {
    let result = null;

    // Try OpenStreetMap Nominatim first
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county || addr.state_district;
        const state = addr.state || addr.country;

        if (city) {
          result = formatBilingualLocation(city, state, addr.country);
        }
      }
    } catch (err) {
      console.warn('Nominatim reverse geocoding warning:', err.message);
    }

    // Try BigDataCloud if Nominatim failed
    if (!result) {
      try {
        const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}`);
        if (bdcRes.ok) {
          const bdcData = await bdcRes.json();
          const city = bdcData.city || bdcData.locality || bdcData.principalSubdivision;
          const state = bdcData.principalSubdivision || bdcData.countryName;
          if (city) {
            result = formatBilingualLocation(city, state, bdcData.countryName);
          }
        }
      } catch (bdcErr) {
        console.warn('BigDataCloud reverse geocoding warning:', bdcErr.message);
      }
    }

    // If reverse geocoding returns valid result, save it
    if (result && result.nameEN) {
      saveLocation(lat, lon, accuracy, result.nameEN, result.nameKN);
      return result;
    }

    // Fallback: If no reverse geocode name found, format lat/lon cleanly
    const rawEN = `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
    saveLocation(lat, lon, accuracy, rawEN, rawEN);
    return { nameEN: rawEN, nameKN: rawEN };
  };

  const saveLocation = (lat, lon, accuracy, nameEN, nameKN) => {
    const newCoords = { latitude: lat, longitude: lon, accuracy: accuracy || 0 };
    setCoords(newCoords);
    setLocationNameEN(nameEN);
    setLocationNameKN(nameKN);
    setPermissionDenied(false);
    setError(null);
    lastCoordsRef.current = newCoords;

    localStorage.setItem('raitha_coords', JSON.stringify(newCoords));
    localStorage.setItem('raitha_loc_en', nameEN);
    localStorage.setItem('raitha_loc_kn', nameKN);
  };

  const requestLocation = async (forceRefresh = false) => {
    setIsDetecting(true);
    setError(null);

    if (!navigator.geolocation) {
      setIsDetecting(false);
      setPermissionDenied(true);
      setError('Geolocation is not supported by your browser.');
      clearSavedLocation();
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: forceRefresh ? 0 : 0,
      timeout: 15000
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        await reverseGeocode(lat, lon, accuracy);
        setIsDetecting(false);
      },
      (err) => {
        console.warn('Geolocation position request failed:', err.message);
        setIsDetecting(false);
        setPermissionDenied(true);
        setError('Location permission is required to detect your current location.');
        clearSavedLocation();
      },
      geoOptions
    );
  };

  const clearSavedLocation = () => {
    setCoords(null);
    setLocationNameEN(null);
    setLocationNameKN(null);
    localStorage.removeItem('raitha_coords');
    localStorage.removeItem('raitha_loc_en');
    localStorage.removeItem('raitha_loc_kn');
  };

  const selectCity = (district) => {
    if (!district) return;
    saveLocation(district.lat, district.lon, null, district.en, district.kn);
  };

  // Watch position hook
  useEffect(() => {
    requestLocation();

    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        const prev = lastCoordsRef.current;
        // Only trigger reverse geocoding if location shifted meaningfully (> 0.005 deg)
        if (!prev || Math.abs(prev.latitude - lat) > 0.005 || Math.abs(prev.longitude - lon) > 0.005) {
          reverseGeocode(lat, lon, accuracy);
        }
      },
      (err) => {
        console.warn('Geolocation watchPosition notice:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const getLocationName = () => {
    if (isDetecting && !locationNameEN && !locationNameKN) {
      return language === 'kn' ? 'ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Detecting location...';
    }

    if (permissionDenied || (!coords && !locationNameEN)) {
      return language === 'kn' ? 'ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ' : 'Location unavailable';
    }

    if (language === 'kn') {
      return locationNameKN || locationNameEN || 'ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ';
    }
    return locationNameEN || locationNameKN || 'Location unavailable';
  };

  return (
    <LocationContext.Provider value={{
      coords,
      locationName: getLocationName(),
      locationNameEN,
      locationNameKN,
      isDetecting,
      permissionDenied,
      error,
      requestLocation: () => requestLocation(true),
      refreshLocation: () => requestLocation(true),
      selectCity,
      districts: KARNATAKA_DISTRICTS
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
