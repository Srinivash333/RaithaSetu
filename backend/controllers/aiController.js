const AgroProduct = require('../models/AgroProduct');
const WorkerProfile = require('../models/WorkerProfile');
const CropListing = require('../models/CropListing');
const TraderProfile = require('../models/TraderProfile');

const RAITHAMITRA_SYSTEM_INSTRUCTION = `You are RaithaMitra, an AI agricultural assistant for farmers.

Your purpose is to provide practical, clear, accurate and understandable agricultural guidance.

You can answer questions about crops, seeds, soil, fertilizers, irrigation, pests, diseases, pesticides, organic farming, farm machinery, labour, harvesting, storage, crop selling, trader negotiation and other agriculture-related topics.

Always understand the farmer's actual question before answering.

Give useful guidance even when some information is missing, but clearly identify assumptions and ask relevant follow-up questions when needed.

Never fabricate pesticide names, fertilizer dosages, seed varieties, market prices, weather information, products, traders, stores or government information.

For pesticide and disease questions, identify the crop and likely pest/disease before giving specific chemical recommendations.

Do not invent dosage or mixing instructions. When chemical treatment is discussed, advise following the product label and appropriate agricultural guidance.

For uncertain crop disease or pest identification, explain that the diagnosis is not certain and recommend providing symptoms or an image. Always use non-absolute phrasing like "This may be..." rather than "This is definitely..." when identifying pests or diseases from partial descriptions or images.

Use simple language suitable for farmers.

Do not overwhelm the farmer with unnecessary technical information.

Answer simple questions simply and complex questions in structured detail.

For farm economics (e.g. crop selling or trader offers), perform basic calculations clearly (e.g. 500 kg x ₹20/kg = ₹10,000) to help the farmer evaluate the deal, but do not make final financial decisions for them.

If live weather data is requested but unavailable, state that live weather data is unavailable while still offering general situational advice (for heavy rain, drought, heat, humidity, etc.).

If products or store items are queried, reference actual verified store products if provided in context, otherwise guide the farmer to the Agro Store without inventing fake products.

Remember the conversation context.

Use the farmer's location when relevant.

Respond entirely in the selected language: English or Kannada.`;

/**
 * Enhanced Agricultural Knowledge Fallback Engine
 * Provides structured responses in English and Kannada for offline / fallback scenarios
 */
const queryKnowledgeEngine = (message, isKannada, contextData = {}) => {
  const q = message.toLowerCase();

  // Extract numbers for math calculations (e.g., "500 kg tomato and trader offers 20/kg")
  const numMatches = message.match(/(\d+[\d,]*)/g);

  // 1. FARM ECONOMICS & TRADER NEGOTIATION CALCULATIONS
  if ((q.includes('trader') || q.includes('offer') || q.includes('produced') || q.includes('kg') || q.includes('tonne') || q.includes('ton') || q.includes('ಬೆಲೆ') || q.includes('ವರ್ತಕ') || q.includes('ಮಾರಾಟ') || q.includes('ಲೆಕ್ಕ')) && numMatches && numMatches.length >= 2) {
    const qty = parseFloat(numMatches[0].replace(/,/g, ''));
    const rate = parseFloat(numMatches[1].replace(/,/g, ''));
    if (!isNaN(qty) && !isNaN(rate) && qty > 0 && rate > 0) {
      const total = qty * rate;
      return isKannada
        ? `💰 **ಬೆಳೆ ಮಾರಾಟ ಮತ್ತು ವರ್ತಕರ ನೀಡಿಕೆ ಲೆಕ್ಕಾಚಾರ:**\n\n- **ಪ್ರಮಾಣ:** ${qty} ಕೆಜಿ / ಘಟಕ\n- **ವರ್ತಕ ನೀಡಿದ ದರ:** ₹${rate} / ಕೆಜಿ\n- **ಒಟ್ಟು ಮೌಲ್ಯ:** ${qty} × ₹${rate} = **₹${total.toLocaleString('en-IN')}**\n\n💡 *ಸಲಹೆ: ಈ ಬೆಲೆ ನಿಮ್ಮ ಉತ್ಪಾದನಾ ವೆಚ್ಚಕ್ಕಿಂತ ಹೆಚ್ಚಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ. ಇತರ ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ ದರಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಿ.*`
        : `💰 **Crop Selling & Trader Offer Calculation:**\n\n- **Quantity:** ${qty} units / kg\n- **Offered Rate:** ₹${rate} / unit\n- **Total Amount:** ${qty} × ₹${rate} = **₹${total.toLocaleString('en-IN')}**\n\n💡 *Guidance: Verify if this price covers your input & labor costs. Compare with local APMC market benchmarks before finalizing.*`;
    }
  }

  // 2. PESTICIDE & PEST CONTROL
  if (q.includes('pesticide') || q.includes('pest') || q.includes('stem borer') || q.includes('borer') || q.includes('whitefly') || q.includes('aphid') || q.includes('thrip') || q.includes('worm') || q.includes('ಕೀಟ') || q.includes('ಹುಳು') || q.includes('ಔಷಧಿ') || q.includes('ಕೀಟನಾಶಕ')) {
    if (q.includes('tomato') || q.includes('ಟೊಮೆಟೊ') || q.includes('ಟೊಮ್ಯಾಟೊ')) {
      return isKannada
        ? `🐛 **ಟೊಮೆಟೊ ಕೀಟ ನಿರ್ವಹಣೆ (ಕಾಂಡ/ಹಣ್ಣು ಕೊರೆಯುವ ಹುಳು & ಹೀರುವ ಕೀಟಗಳು):**\n\n- **ಲಕ್ಷಣಗಳು:** ಹಣ್ಣಿನಲ್ಲಿ ರಂಧ್ರಗಳು లేదా ಎಲೆ ಕೆಳಗೆ ಸಣ್ಣ ಕೀಟಗಳು.\n- **ಜೈವಿಕ ನಿಯಂತ್ರಣ:** 10,000 PPM ನೀಮ್ ಎಣ್ಣೆ (3 ಮಿ.ಲೀ/ಲೀ ನೀರು) ಅಥವಾ ಹಳದಿ ಅಂಟಿನ ಕಾರ್ಡ್‌ಗಳು.\n- **ರಾಸಾಯನಿಕ ಸಿಂಪರಣೆ:** ಕೀಟನಾಶಕ ಬಳಸುವ ಮುನ್ನ ಕೃಷಿ ಅಧಿಕಾರಿಯ ಸಲಹೆ ಪಡೆಯಿರಿ ಹಾಗೂ ಪ್ಯಾಕ್ ಮೇಲಿನ ಸೂಚನೆ ತಪ್ಪದೇ ಪಾಲಿಸಿ.\n\n⚠️ *ಪ್ರಶ್ನೆ: ಕೀಟದ ಲಕ್ಷಣ ಅಥವಾ ಎಲೆಯ ಫೋಟೋ ಕಳುಹಿಸಿದರೆ ಮತ್ತಷ್ಟು ನಿಖರ ಸಲಹೆ ನೀಡಬಹುದು.*`
        : `🐛 **Tomato Pest Management (Fruit Borer / Sucking Pests):**\n\n- **Symptoms:** Holes in fruit or sticky leaves.\n- **Biological Control:** Spray 10,000 PPM Neem Oil @ 3ml/liter or set up yellow sticky traps.\n- **Chemical Protection:** Consult local agri-officer for recommended chemical sprays and strictly follow the product label.\n\n⚠️ *Follow-up: Could you share the specific symptoms or a photo of the affected leaf/fruit?*`;
    }
    return isKannada
      ? `🛡️ **ಕೀಟ & ಕೀಟನಾಶಕ ಸಲಹೆ:**\n\n- **ಹೀರುವ ಕೀಟಗಳು (ಅಫಿಡ್ಸ್/ಥ್ರಿಪ್ಸ್):** ಜೈವಿಕ ನೀಮ್ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.\n- **ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು (Stem Borer):** ಫೆರಮೋನ್ ಟ್ರ್ಯಾಪ್ ಬಳಸಿ.\n- **ಸುರಕ್ಷತೆ:** ರಾಸಾಯನಿಕ ಕೀಟನಾಶಕ ಬಳಸುವಾಗ ಬಾಟಲಿಯ ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ. ಸರಿಯಾದ ಲಕ್ಷಣ ತಿಳಿಸಿದರೆ ಸೂಕ್ತ ಕೀಟನಾಶಕ ತಿಳಿಸಬಹುದು.`
      : `🛡️ **Pest & Pesticide Safety Advice:**\n\n- **Sucking Pests:** Spray Neem oil solution (10,000 PPM) @ 3ml/L.\n- **Stem Borers:** Install pheromone traps across the field.\n- **Safety:** Always follow the pesticide product label instructions. Tell me the specific crop & symptoms to narrow down recommendations.`;
  }

  // 3. CROP DISEASES (Fungal, Bacterial, Viral, Leaf Spot, Blight)
  if (q.includes('disease') || q.includes('blight') || q.includes('wilt') || q.includes('spot') || q.includes('curl') || q.includes('fungus') || q.includes('ರೋಗ') || q.includes('ಮಚ್ಚೆ') || q.includes('ಚುಕ್ಕೆ') || q.includes('ಉದುರುವುದು')) {
    return isKannada
      ? `🦠 **ಬೆಳೆ ರೋಗ ನಿರ್ವಹಣೆ (ಶಿಲೀಂಧ್ರ/ಬ್ಯಾಕ್ಟೀರಿಯಾ ರೋಗಗಳು):**\n\n- **ಎಲೆ ಚುಕ್ಕೆ / ಕಪ್ಪು ಮಚ್ಚೆ:** ಗಾಳಿ ಚಲನೆ ಹೆಚ್ಚಿಸಿ, ಹೆಚ್ಚುವರಿ ನೀರನ್ನು ತೆರವುಗೊಳಿಸಿ.\n- **ಜೈವಿಕ ಪರಿಹಾರ:** ಟ್ರೈಕೋಡರ್ಮಾ ಅಥವಾ ಸೂಡೊಮೊನಾಸ್ ಬಳಸಿ.\n- **ಸೂಚನೆ:** ನಿಖರವಾದ ರೋಗ ನಿರ್ಣಯಕ್ಕೆ ಎಲೆಯ ಫೋಟೋ ಅಥವಾ ಹೆಚ್ಚಿನ ಲಕ್ಷಣ ತಿಳಿಸಿ.`
      : `🦠 **Crop Disease Guidance:**\n\n- **Leaf Spot & Blight:** Improve drainage and avoid over-irrigation.\n- **Bio-Control:** Apply Trichoderma viride or Pseudomonas fluorescens.\n- **Note:** For exact disease identification, share a leaf photo or list the symptoms (yellowing, spot color, wilting).`;
  }

  // 4. FERTILIZERS & SOIL NUTRITION
  if (q.includes('fertilizer') || q.includes('npk') || q.includes('urea') || q.includes('dap') || q.includes('potash') || q.includes('micronutrient') || q.includes('ಗೊಬ್ಬರ') || q.includes('ಪೋಷಕಾಂಶ')) {
    return isKannada
      ? `🌱 **ರಸಗೊಬ್ಬರ ಮತ್ತು NPK ಪೋಷಣೆ:**\n\n1. **ಬಿತ್ತನೆ ಹಂತ:** NPK (18:46:0 DAP ಅಥವಾ 10:26:26) ಮೂಲ ಗೊಬ್ಬರವಾಗಿ ನೀಡಿ.\n2. **ಬೆಳವಣಿಗೆ ಹಂತ:** ಸಾರಜನಕ (Urea) 2-3 ಕಂತುಗಳಲ್ಲಿ ನೀಡಿ.\n3. **ಹೂವು & ಕಾಯಿ ಹಂತ:** 19:19:19 ಅಥವಾ 0:0:50 ಪೊಟ್ಯಾಷ್ ಸಿಂಪಡಿಸಿ.\n\n💡 *ಸಲಹೆ: ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ವರದಿಯ ಆಧಾರದ ಮೇಲೆ ಗೊಬ್ಬರ ಪ್ರಮಾಣ ನಿಗದಿಪಡಿಸುವುದು ಅತ್ಯುತ್ತಮ.*`
      : `🌱 **Fertilizer & NPK Dosage Guidance:**\n\n1. **Sowing Stage:** Apply DAP (18:46:0) or NPK 10:26:26 as basal dose.\n2. **Vegetative Stage:** Apply Nitrogen (Urea) in 2 split applications.\n3. **Flowering & Fruit Stage:** Spray NPK 19:19:19 or 0:0:50 Potash.\n\n💡 *Tip: Perform a soil test to determine exact micronutrient requirements.*`;
  }

  // 5. ORGANIC FARMING & JEEVAMRUTHA
  if (q.includes('organic') || q.includes('jeevamrutha') || q.includes('panchagavya') || q.includes('compost') || q.includes('vermicompost') || q.includes('ಜೈವಿಕ') || q.includes('ಜೀವಾಮೃತ') || q.includes('ಪಂಚಗವ್ಯ') || q.includes('ಸಾಂದ್ರ')) {
    return isKannada
      ? `🌿 **ಜೈವಿಕ ಮತ್ತು ನೈಸರ್ಗಿಕ ಕೃಷಿ (ಜೀವಾಮೃತ ತಯಾರಿಕೆ):**\n\n- **ಸಾಮಗ್ರಿ:** 10 ಕೆಜಿ ದೇಸಿ ಹಸುವಿನ ಸಗಣಿ + 10 ಲೀ ಗಂಜಲ + 2 ಕೆಜಿ ಬೆಲ್ಲ + 2 ಕೆಜಿ ದ್ವಿದಳ ಧಾನ್ಯದ ಹಿಟ್ಟು + 200 ಲೀ ನೀರು.\n- **ವಿಧಾನ:** 2-3 ದಿನ ನೆರಳಿನಲ್ಲಿ ಕಲಕಿ ಹುದುಗಿಸಿ, ಎಕರೆಗೆ ನೀರಾವರಿ ಮೂಲಕ ಹಾಯಿಸಿ.\n- **ಪ್ರಯೋಜನ:** ಮಣ್ಣಿನ ಜೈವಿಕ ಸೂಕ್ಷ್ಮಾಣು ಜೀವಿಗಳನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.`
      : `🌿 **Organic Farming & Jeevamrutha Preparation:**\n\n- **Ingredients:** 10 kg cow dung + 10 L cow urine + 2 kg jaggery + 2 kg pulse flour + 200 L water.\n- **Preparation:** Ferment in shade for 2-3 days while stirring daily. Apply per acre with irrigation.\n- **Benefits:** Enhances beneficial soil microbes and organic carbon.`;
  }

  // 6. WATER & IRRIGATION
  if (q.includes('water') || q.includes('irrigation') || q.includes('drip') || q.includes('sprinkler') || q.includes('ನೀರು') || q.includes('ನೀರಾವರಿ') || q.includes('ಹನಿ')) {
    return isKannada
      ? `💧 **ನೀರು ಮತ್ತು ಹನಿ ನೀರಾವರಿ ನಿರ್ವಹಣೆ:**\n\n- **ಹನಿ ನೀರಾವರಿ (Drip):** ಶೇ 40-50% ನೀರು ಉಳಿಸುತ್ತದೆ, ಗೊಬ್ಬರ ಬೆರೆಸಿ ನೀಡಲು (Fertigation) ಅನುಕೂಲ.\n- **ಅತಿಯಾದ ನೀರು:** ಬೇರು ಕೊಳೆಯುವಿಕೆಗೆ ಕಾರಣವಾಗಬಹುದು.\n- **ಸೂಚನೆ:** ಬೆಳೆಯ ಬೆಳವಣಿಗೆ ಹಂತ ಮತ್ತು ಮಣ್ಣಿನ ತೇವಾಂಶ ನೋಡಿ ನೀರು ನೀಡಿ.`
      : `💧 **Water & Drip Irrigation Management:**\n\n- **Drip Irrigation:** Saves 40-50% water and enables fertigation direct to roots.\n- **Avoid Over-irrigation:** Excessive water leads to root rot and nutrient leaching.\n- **Scheduling:** Adjust irrigation based on crop growth stage and soil moisture level.`;
  }

  // 7. SOIL HEALTH & PREPARATION
  if (q.includes('soil') || q.includes('ph') || q.includes('salinity') || q.includes(' fertility') || q.includes('ಮಣ್ಣು') || q.includes('ಫಲವತ್ತತೆ')) {
    return isKannada
      ? `🌍 **ಮಣ್ಣಿನ ಸಿದ್ಧತೆ ಮತ್ತು ಫಲವತ್ತತೆ:**\n\n- **ಆಳವಾದ ಳುಗಡೆ:** ಬೇಸಿಗೆಯಲ್ಲಿ ಆಳವಾಗಿ ಉಳುವುದರಿಂದ ಕ್ರಿಮಿಕೀಟಗಳು ನಾಶವಾಗುತ್ತವೆ.\n- **ಮಣ್ಣಿನ pH:** 6.5 - 7.5 ಅತ್ಯುತ್ತಮ. ಆಮ್ಲೀಯ ಮಣ್ಣಿಗೆ ಸುಣ್ಣ (Lime) ಬಳಸಿ.\n- **ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ:** ಎಕರೆಗೆ 4-5 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಸೇರಿಸಿ.`
      : `🌍 **Soil Health & Land Preparation:**\n\n- **Deep Summer Ploughing:** Exposes soil-borne pests and weeds to sunlight.\n- **Ideal pH:** 6.5 to 7.5. Apply lime for acidic soils or gypsum for alkaline soils.\n- **Organic Matter:** Add 4-5 tonnes of farmyard manure per acre.`;
  }

  // 8. WEATHER & CLIMATE ADVICE
  if (q.includes('weather') || q.includes('rain') || q.includes('drought') || q.includes('heat') || q.includes('ಹವಾಮಾನ') || q.includes('ಮಳೆ') || q.includes('ಬಿಸಿಲು')) {
    return isKannada
      ? `🌦️ **ಹವಾಮಾನ ಆಧಾರಿತ ಕೃಷಿ ಸಲಹೆ:**\n\n- *ಗಮನಿಸಿ: ಪ್ರಸ್ತುತ ಲೈವ್ ಹವಾಮಾನ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲದಿದ್ದರೆ,* ಈ ಕೆಳಗಿನ ಸಾಮಾನ್ಯ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಿ:\n- **ಭಾರೀ ಮಳೆ:** ಜಮೀನಿನ ನೀರು ಹೊರಹೋಗಲು ಚರಂಡಿ ವ್ಯವಸ್ಥೆ ಮಾಡಿ.\n- **ಬಿಸಿಲು/ಬರ:** ಶೇಡಿಂಗ್ ಹಾಗೂ ಮಲ್ಚಿಂಗ್ (Mulching) ಮಾಡಿ ನೀರು ಆವಿಯಾಗುವುದನ್ನು ತಡೆಯಿರಿ.`
      : `🌦️ **Weather & Agricultural Guidance:**\n\n- *Note: Live weather feed is currently offline.* Follow these core guidelines:\n- **Heavy Rainfall:** Clear field drainage channels to prevent waterlogging.\n- **High Heat / Dry Spell:** Use organic mulching around crop roots to conserve moisture.`;
  }

  // 9. FARM LABOUR & MACHINERY
  if (q.includes('labour') || q.includes('worker') || q.includes('machinery') || q.includes('tractor') || q.includes('sprayer') || q.includes('ಕೂಲಿ') || q.includes('ಆಳು') || q.includes('ಯಂತ್ರ') || q.includes('ಟ್ರಾಕ್ಟರ್')) {
    return isKannada
      ? `🚜 **ಕೃಷಿ ಕಾರ್ಮಿಕರು & ಯಂತ್ರೋಪಕರಣ ಮಾರ್ಗದರ್ಶಿ:**\n\n- **ದಿನಗೂಲಿ ಅಂದಾಜು:** ಪ್ರಸ್ತುತ ಕರ್ನಾಟಕ ಬೆಂಚ್‌ಮಾರ್ಕ್ ₹550 - ₹800/ದಿನ (ಕೆಲಸದ ಆಧಾರದ ಮೇಲೆ).\n- **ಯಂತ್ರಗಳು:** ರೋಟವೇಟರ್, ಟ್ರಾಕ್ಟರ್ ಮತ್ತು ಪವರ್ ಸ್ಪ್ರೇಯರ್‌ಗಳ ಬಳಕೆಯಿಂದ ಸಮಯ ಹಾಗೂ ವೆಚ್ಚ ಉಳಿತಾಯವಾಗುತ್ತದೆ.`
      : `🚜 **Farm Labour & Machinery Benchmark:**\n\n- **Daily Wage Rates:** Typical Karnataka daily labour rates range from ₹550 - ₹800/day depending on job type.\n- **Machinery:** Rotavators, tractor-driven seed drills, and battery sprayers cut labor costs significantly.`;
  }

  // 10. AGRO STORE PRODUCTS
  if (q.includes('seed') || q.includes('store') || q.includes('buy') || q.includes('shop') || q.includes('ಬೀಜ') || q.includes('ಅಂಗಡಿ')) {
    return isKannada
      ? `🏪 **ಕೃಷಿ ಮಳಿಗೆ (Agro Store):**\n\nಗುಣಮಟ್ಟದ ಬೀಜಗಳು, ರಸಗೊಬ್ಬರಗಳು ಮತ್ತು ಉಪಕರಣಗಳಿಗಾಗಿ 'ಕೃಷಿ ಮಳಿಗೆ' (Agro Store) ವಿಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ.`
      : `🏪 **Agro Store Supplies:**\n\nBrowse certified hybrid seeds, fertilizers, and farm equipment under our 'Agro Store' section for direct ordering.`;
  }

  // DEFAULT COMPREHENSIVE RESPONSE
  return isKannada
    ? `🌿 **ರೈತಮಿತ್ರ AI ಕೃಷಿ ಸಹಾಯಕ:**\n\nನಾನು ನಿಮಗೆ ಈ ಕೆಳಗಿನ ಪ್ರತಿಯೊಂದು ಕೃಷಿ ವಿಷಯದಲ್ಲೂ ಸ್ಪಷ್ಟ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ:\n- 🌾 **ಬೆಳೆ & ಬೀಜ ಆಯ್ಕೆ:** ಭತ್ತ, ರಾಗಿ, ಮೆಕ್ಕೆಜೋಳ, ಟೊಮೆಟೊ, ಮೆಣಸಿನಕಾಯಿ ಮುಂತಾದವು\n- 🌱 **ರಸಗೊಬ್ಬರ & NPK:** ನಿಖರ ಡೋಸೇಜ್ ಮತ್ತು ಮಣ್ಣಿನ ಫಲವತ್ತತೆ\n- 🛡️ **ಕೀಟ & ರೋಗ ನಿಯಂತ್ರಣ:** ರೋಗ ಲಕ್ಷಣ ಮತ್ತು ಕೀಟನಾಶಕ ಸಲಹೆ\n- 🌿 **ಜೈವಿಕ ಕೃಷಿ:** ಜೀವಾಮೃತ, ಪಂಚಗವ್ಯ, ವರ್ಮಿಖೊಂಪೋಸ್ಟ್\n- 💧 **ನೀರಾವರಿ:** ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಮಳೆ ನೀರು ನಿರ್ವಹಣೆ\n- 💰 **ಬೆಳೆ ಮಾರಾಟ & ಲೆಕ್ಕಾಚಾರ:** ವರ್ತಕರ ನೀಡಿಕೆ ಮೌಲ್ಯಮಾಪನ\n- 🚜 **ಕೂಲಿ & ಯಂತ್ರೋಪಕರಣ:** ದರ ಅಂದಾಜು ಮತ್ತು ಉಪಕರಣಗಳು`
    : `🌿 **RaithaMitra AI Agricultural Assistant:**\n\nI can help you with comprehensive guidance across all agricultural domains:\n- 🌾 **Crops & Seed Selection:** Paddy, Ragi, Maize, Tomato, Brinjal, Chilli, Sugarcane, Cotton, etc.\n- 🌱 **Fertilizers & Soil:** NPK ratios, organic manure, soil pH & nutrient advice\n- 🛡️ **Pest & Disease Control:** Symptom diagnosis & safe pesticide advice\n- 🌿 **Organic Farming:** Jeevamrutha, Vermicompost, Neem oil & IPM\n- 💧 **Irrigation & Water:** Drip irrigation, fertigation & drainage\n- 💰 **Farm Economics:** Profit, yield & trader negotiation calculations\n- 🚜 **Labour & Machinery:** Benchmark wage rates & farm tools`;
};

// Main Chat Handler
exports.chatWithAI = async (req, res) => {
  try {
    const { message, language, location, history, image } = req.body;

    if (!message && !image) {
      return res.status(400).json({ success: false, error: 'Message or image content is required' });
    }

    const isKannada = language === 'kn' || /[\u0C80-\u0CFF]/.test(message || '');
    const userLocation = location || 'Karnataka, India';
    const geminiKey = process.env.GEMINI_API_KEY;

    // Query local DB context dynamically based on user query
    let dbContextText = '';
    const qLower = (message || '').toLowerCase();

    try {
      if (qLower.includes('seed') || qLower.includes('fertilizer') || qLower.includes('pesticide') || qLower.includes('store') || qLower.includes('product') || qLower.includes('ಬೀಜ') || qLower.includes('ಗೊಬ್ಬರ') || qLower.includes('ಅಂಗಡಿ')) {
        const products = await AgroProduct.find({}).limit(5).select('title category price unit inStock').lean();
        if (products.length > 0) {
          dbContextText += `\n[Verified Agro Store Products in Database]: ${products.map(p => `${p.title} (${p.category}): ₹${p.price}/${p.unit || 'unit'}`).join(', ')}`;
        }
      }

      if (qLower.includes('trader') || qLower.includes('sell') || qLower.includes('market') || qLower.includes('crop') || qLower.includes('ವರ್ತಕ') || qLower.includes('ಮಾರಾಟ')) {
        const crops = await CropListing.find({ status: 'ACTIVE' }).limit(3).select('cropName quantity pricePerUnit location').lean();
        if (crops.length > 0) {
          dbContextText += `\n[Active Crop Listings in Market]: ${crops.map(c => `${c.cropName} (${c.quantity}): ₹${c.pricePerUnit}`).join(', ')}`;
        }
      }
    } catch (dbErr) {
      console.warn('Context lookup warning:', dbErr.message);
    }

    let responseText = '';

    // Attempt Gemini API call if API key exists
    if (geminiKey && geminiKey.trim().length > 5) {
      const modelCandidates = [
        'gemini-3.6-flash',
        'gemma-4-26b-a4b-it',
        'gemini-flash-latest',
        'gemini-1.5-flash',
        'gemini-pro-latest'
      ];

      // Format conversation history for Gemini API payload
      const formattedContents = [];

      // Include system instruction in prompt context
      const fullSystemPrompt = `${RAITHAMITRA_SYSTEM_INSTRUCTION}\n\nFarmer Location Context: ${userLocation}\nSelected Response Language: ${isKannada ? 'Kannada' : 'English'}${dbContextText}`;

      // Append multi-turn history if provided
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach(h => {
          if (h.sender === 'user' || h.role === 'user') {
            formattedContents.push({ role: 'user', parts: [{ text: h.text || h.content || '' }] });
          } else if (h.sender === 'ai' || h.role === 'model') {
            formattedContents.push({ role: 'model', parts: [{ text: h.text || h.content || '' }] });
          }
        });
      }

      // Add current message and image payload if provided
      const currentParts = [];
      if (message) {
        currentParts.push({ text: `[System Context: ${fullSystemPrompt}]\n\nFarmer Question: ${message}` });
      } else {
        currentParts.push({ text: `[System Context: ${fullSystemPrompt}]\n\nFarmer sent an image for analysis.` });
      }

      if (image && typeof image === 'string' && image.startsWith('data:image')) {
        const mimeType = image.substring(image.indexOf(':') + 1, image.indexOf(';'));
        const base64Data = image.substring(image.indexOf(',') + 1);
        currentParts.push({
          inline_data: {
            mime_type: mimeType || 'image/jpeg',
            data: base64Data
          }
        });
      }

      formattedContents.push({ role: 'user', parts: currentParts });

      for (const model of modelCandidates) {
        if (responseText) break;
        try {
          const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: formattedContents
            })
          });

          const data = await apiRes.json();
          if (apiRes.status === 200 && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            responseText = data.candidates[0].content.parts.map(p => p.text).join('\n');
          } else {
            console.warn(`Gemini model ${model} API note:`, data.error ? data.error.message : apiRes.status);
          }
        } catch (apiErr) {
          console.warn(`Gemini model ${model} fetch failed:`, apiErr.message);
        }
      }
    }

    // Knowledge Fallback Engine if API key is invalid or offline
    if (!responseText) {
      responseText = queryKnowledgeEngine(message || '', isKannada, { dbContextText });
    }

    res.status(200).json({
      success: true,
      reply: responseText,
      language: isKannada ? 'kn' : 'en',
      location: userLocation
    });
  } catch (error) {
    console.error('RaithaMitra AI Chat Error:', error);
    res.status(500).json({
      success: false,
      reply: "RaithaMitra AI Assistant is experiencing a brief technical issue. Please try again in a moment.",
      error: error.message
    });
  }
};

// Diagnostic Fertilizer / Pesticide Recommendation
exports.recommendFertilizerOrPesticide = async (req, res) => {
  try {
    const { crop, soilType, growthStage, problemDescription } = req.body;

    let recommendation = {
      crop: crop || 'General Crop',
      soilType: soilType || 'Loamy Soil',
      growthStage: growthStage || 'Vegetative Stage',
      recommendedNutrient: 'NPK 19:19:19 + Micronutrients',
      dosage: '5 kg per acre',
      generalGuidance: 'Apply during early morning or late evening hours. Ensure soil has adequate moisture before application.',
      reason: `Based on your crop (${crop}) and growth stage (${growthStage}), nitrogen-phosphorus support promotes root expansion and leaf growth.`
    };

    if (problemDescription && (problemDescription.toLowerCase().includes('pest') || problemDescription.toLowerCase().includes('worm') || problemDescription.toLowerCase().includes('yellow'))) {
      recommendation.recommendedNutrient = 'Neem Oil Concentrate (10000 PPM) + Bio-Fungicide';
      recommendation.dosage = '3 ml per liter of water';
      recommendation.generalGuidance = 'Foliar spray recommended every 7-10 days until pest population reduces.';
      recommendation.reason = 'Symptoms indicate leaf sucking pests or fungal leaf spots. Organic neem oil breaks pest life cycles safely.';
    }

    const matchingProducts = await AgroProduct.find({
      category: { $in: ['fertilizers', 'pesticides'] }
    }).limit(4);

    res.status(200).json({
      success: true,
      recommendation,
      matchingProducts
    });
  } catch (error) {
    console.error('Fertilizer Recommendation Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate diagnostic recommendation' });
  }
};
