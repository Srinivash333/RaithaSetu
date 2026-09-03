// Crop, Job, WorkType, and Trader Match Kannada translation utilities

export const CROP_TRANSLATIONS = {
  kn: {
    // Crops
    'Tomato': 'ಟೊಮೆಟೊ',
    'TOMATO': 'ಟೊಮೆಟೊ',
    'Fresh Farm Tomatoes': 'ತಾಜಾ ಟೊಮೆಟೊ',
    'Paddy': 'ಭತ್ತ',
    'PADDY': 'ಭತ್ತ',
    'Organic Sonamasuri Paddy': 'ಸಾವಯವ ಸೋನಾಮಸೂರಿ ಭತ್ತ',
    'Sugarcane': 'ಕಬ್ಬು',
    'SUGARCANE': 'ಕಬ್ಬು',
    'Maize': 'ಮೆಕ್ಕೆಜೋಳ',
    'MAIZE': 'ಮೆಕ್ಕೆಜೋಳ',
    'Rice': 'ಅಕ್ಕಿ',
    'RICE': 'ಅಕ್ಕಿ',
    'Cotton': 'ಹತ್ತಿ',
    'COTTON': 'ಹತ್ತಿ',
    'Ragi': 'ರಾಗಿ',
    'RAGI': 'ರಾಗಿ',
    'Vegetables': 'ತರಕಾರಿಗಳು',
    'VEGETABLES': 'ತರಕಾರಿಗಳು',
    'Pulses': 'ಬೇಳೆಕಾಳುಗಳು',
    'PULSES': 'ಬೇಳೆಕಾಳುಗಳು',

    // Work Types
    'Harvesting': 'ಕೊಯ್ಲು',
    'Planting': 'ನೆಡುವಿಕೆ',
    'Weeding': 'ಕಳೆ ಕೀಳುವುದು',
    'Irrigation': 'ನೀರಾವರಿ',
    'Spraying': 'ಔಷಧಿ ಸಿಂಪಡಣೆ',
    'Loading': 'ಲೋಡಿಂಗ್',
    'Tilling': 'ಉಳುಮೆ',
    'Sorting': 'ವಿಂಗಡಣೆ',

    // Durations
    'DAILY': 'ದೈನಂದಿನ',
    'daily': 'ದೈನಂದಿನ',
    'WEEKLY': 'ವಾರದ',
    'weekly': 'ವಾರದ',
    'MONTHLY': 'ಮಾಸಿಕ',
    'monthly': 'ಮಾಸಿಕ',
    'TOTAL': 'ಒಟ್ಟು',
    'total': 'ಒಟ್ಟು',

    // Job Titles
    'Tomato Harvesting & Sorting': 'ಟೊಮೆಟೊ ಕೊಯ್ಲು ಮತ್ತು ವಿಂಗಡಣೆ',
    'Paddy Harvesting & Threshing': 'ಭತ್ತದ ಕೊಯ್ಲು ಮತ್ತು ಮೆಣೆಯುವಿಕೆ',
    'Sugarcane Cutting & Field Loading': 'ಕಬ್ಬು ಕತ್ತರಿಸುವುದು ಮತ್ತು ಲೋಡಿಂಗ್',
    'Vegetable Harvesting & Packing': 'ತರಕಾರಿ ಕೊಯ್ಲು ಮತ್ತು ಪ್ಯಾಕಿಂಗ್',
    'Farm Weeding & Land Tilling': 'ಜಮೀನಿನ ಕಳೆ ಕೀಳುವುದು ಮತ್ತು ಉಳುಮೆ',

    // Job Descriptions
    'Need workers for tomato picking, sorting, and packing. Workers should be available for the full work period.': 'ಟೊಮೆಟೊ ಕೀಳಲು, ವಿಂಗಡಿಸಲು ಮತ್ತು ಪ್ಯಾಕ್ ಮಾಡಲು ಕಾರ್ಮಿಕರು ಬೇಕಾಗಿದ್ದಾರೆ. ಕೆಲಸದ ಅವಧಿಗೆ ಕಾರ್ಮಿಕರು ಲಭ್ಯವಿರಬೇಕು.',
    'Need workers for paddy harvesting and threshing. Previous harvesting experience preferred.': 'ಭತ್ತದ ಕೊಯ್ಲು ಮತ್ತು ಮೆಣೆಯಲು ಕಾರ್ಮಿಕರು ಬೇಕಾಗಿದ್ದಾರೆ. ಕೊಯ್ಲಿನ ಅನುಭವಕ್ಕೆ ಆದ್ಯತೆ ನೀಡಲಾಗುವುದು.',
    'Need experienced workers for sugarcane cutting and tractor loading.': 'ಕಬ್ಬು ಕತ್ತರಿಸಲು ಮತ್ತು ಟ್ರ್ಯಾಕ್ಟರ್ ಲೋಡಿಂಗ್‌ಗೆ ಅನುಭವಿ ಕಾರ್ಮಿಕರು ಬೇಕಾಗಿದ್ದಾರೆ.',

    // Match & Distance
    'Match': 'ಹೊಂದಾಣಿಕೆ',
    'km away': 'ಕಿಮೀ ದೂರ'
  }
};

export function translateCrop(cropName, language = 'en') {
  if (!cropName) return '';
  if (language === 'kn' && CROP_TRANSLATIONS.kn[cropName]) {
    return CROP_TRANSLATIONS.kn[cropName];
  }
  return cropName;
}

export function translateWorkType(workType, language = 'en') {
  if (!workType) return '';
  if (language === 'kn' && CROP_TRANSLATIONS.kn[workType]) {
    return CROP_TRANSLATIONS.kn[workType];
  }
  return workType;
}

export function translateDuration(duration, language = 'en') {
  if (!duration) return '';
  if (language === 'kn' && CROP_TRANSLATIONS.kn[duration]) {
    return CROP_TRANSLATIONS.kn[duration];
  }
  return duration;
}

export function translateJobTitle(title, language = 'en') {
  if (!title) return '';
  if (language === 'kn' && CROP_TRANSLATIONS.kn[title]) {
    return CROP_TRANSLATIONS.kn[title];
  }
  return title;
}

export function translateDescription(desc, language = 'en') {
  if (!desc) return '';
  if (language === 'kn' && CROP_TRANSLATIONS.kn[desc]) {
    return CROP_TRANSLATIONS.kn[desc];
  }
  return desc;
}

export function translateCropList(crops, language = 'en') {
  if (!Array.isArray(crops)) return '';
  return crops.map(c => translateCrop(c, language)).join(', ');
}

export function getMatchExplanation(traderName, cropName, qty, unit, distanceKm, language = 'en') {
  const cName = translateCrop(cropName, language);
  const dist = distanceKm || 8.2;

  if (language === 'kn') {
    return `"${traderName} ಸಂಸ್ಥೆಯು ${cName} ಬೆಳೆಯನ್ನು ಖರೀದಿಸಲು ಸಿದ್ಧರಿದ್ದಾರೆ, ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣವನ್ನು (${qty} ${unit}) ಸ್ವೀಕರಿಸುತ್ತಾರೆ, ಮತ್ತು ನಿಮ್ಮ ಫಾರ್ಮ್‌ನಿಂದ ${dist} ಕಿಮೀ ದೂರದಲ್ಲಿದ್ದಾರೆ."`;
  }

  return `"${traderName} is looking for ${cropName}, accepts the available quantity (${qty} ${unit}), and is located ${dist} km from your farm."`;
}

export function getPresetCropImage(cropName = '') {
  const name = (cropName || '').toString().toLowerCase();
  if (name.includes('potato')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80';
  if (name.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80';
  if (name.includes('paddy') || name.includes('rice')) return 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=300&q=80';
  if (name.includes('sugarcane')) return 'https://images.unsplash.com/photo-1594951478522-a9b8304033ec?auto=format&fit=crop&w=300&q=80';
  if (name.includes('cotton')) return 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=300&q=80';
  if (name.includes('coffee')) return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80';
  if (name.includes('arecanut')) return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80';
  if (name.includes('maize') || name.includes('corn')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=300&q=80';
  return 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=300&q=80';
}
