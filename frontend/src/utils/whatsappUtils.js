/**
 * WhatsApp Utility Helper Functions for RaithaSetu AI
 */

/**
 * Get display phone number exactly as stored in user profile without adding artificial prefixes.
 */
export const getDisplayPhone = (phone) => {
  if (!phone) return '';
  return phone.toString().trim();
};

/**
 * Clean and format phone numbers for WhatsApp click-to-chat (wa.me)
 * Removes +, spaces, hyphens, brackets, etc.
 * Prepends country code '91' for 10-digit Indian numbers internally for URL routing.
 */
export const formatWhatsAppPhone = (phone) => {
  if (!phone) return null;
  
  let cleaned = phone.toString().replace(/[^0-9]/g, '');

  // 10-digit standard Indian mobile number without country code
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return cleaned;
  }

  return null;
};

/**
 * Generate Worker Job Offer WhatsApp Message
 * Hello <WorkerName>, I would like to offer you ₹<OfferedWage>/<Unit> for <Crop> <WorkTask> work.
 */
export const generateWorkerWhatsAppMessage = ({
  workerName,
  offeredWage,
  durationUnit = 'day',
  crop = 'Paddy',
  workTask = 'Harvesting'
}) => {
  const nameStr = (workerName || 'Worker').trim();
  const wageStr = offeredWage || 750;
  const unitStr = (durationUnit || 'day').toLowerCase();
  const cropStr = (crop || 'Paddy').trim();
  const taskStr = (workTask || 'Harvesting').trim();

  return `Hello ${nameStr}, I would like to offer you ₹${wageStr}/${unitStr} for ${cropStr} ${taskStr} work.`;
};

/**
 * Generate Trader Crop Offer WhatsApp Message
 * Hello <TraderName>, I would like to offer ₹<OfferPrice>/<PriceUnit> for <Quantity> <QuantityUnit> of <CropName>.
 */
export const generateTraderWhatsAppMessage = ({
  traderName,
  farmerOfferPrice,
  priceUnit = 'box',
  quantity = 35,
  quantityUnit = 'boxes',
  cropName = 'Fresh Farm Potato'
}) => {
  const nameStr = (traderName || 'Trader').trim();
  const priceStr = (farmerOfferPrice !== undefined && farmerOfferPrice !== null) ? farmerOfferPrice : 550;
  const unitStr = (priceUnit || 'box').trim();
  const qtyStr = (quantity !== undefined && quantity !== null) ? quantity : 35;
  const qtyUnitStr = (quantityUnit || unitStr || 'boxes').trim();
  const cropStr = (cropName || 'Crop').trim();

  return `Hello ${nameStr}, I would like to offer ₹${priceStr}/${unitStr} for ${qtyStr} ${qtyUnitStr} of ${cropStr}.`;
};

/**
 * Safely open WhatsApp click-to-chat window using wa.me format
 */
export const openWhatsAppChat = (phone, message) => {
  const cleanedPhone = formatWhatsAppPhone(phone);
  if (!cleanedPhone) {
    alert('Phone number not available');
    return false;
  }

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${cleanedPhone}?text=${encodedMsg}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
  return true;
};
