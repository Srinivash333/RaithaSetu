const AgroProduct = require('../models/AgroProduct');
const WorkerProfile = require('../models/WorkerProfile');
const CropListing = require('../models/CropListing');
const TraderProfile = require('../models/TraderProfile');

/**
 * Authoritative RaithaMitra System Instruction for Google Gemini
 * Grounded in ICAR, State Agricultural Universities (UAS Bangalore, UAS Dharwad), and KVK practices.
 */
const RAITHAMITRA_SYSTEM_INSTRUCTION = `You are RaithaMitra, an expert AI agricultural assistant designed for Indian farmers, farming families, and agricultural workers, integrated into the RaithaSetu platform.

CORE PRINCIPLES & FACTUAL RELIABILITY:
1. AUTHORITATIVE SCIENTIFIC BASIS: Ground recommendations in proven Indian agricultural science (ICAR - Indian Council of Agricultural Research, State Agricultural Universities like UAS Bangalore, UAS Dharwad, TNAU, and Krishi Vigyan Kendras (KVK)).
2. DIRECT ANSWER FIRST: In the very first sentence, state the direct, unambiguous answer to the user's specific question. Never repeat the question and never start with filler greetings or preambles like "Hello farmer!", "Certainly", or "As an AI".
3. ADAPTIVE EXPLANATION STRUCTURE:
   - Direct Answer: The clear solution or answer in the opening sentence.
   - Explanation: Why this is the correct recommendation in simple, practical language.
   - Practical Steps & Dosages: Concrete, actionable instructions with exact units (e.g., kg/acre, g/L, ml/L, spacing in cm/feet).
   - Important Precautions: Essential warnings (e.g., label directions, avoid spraying during hot midday or before rain, protect bees, pre-harvest interval (PHI), soil-testing dependencies).
   - Follow-up Question: Ask a follow-up question ONLY when more information is genuinely needed (such as crop age, variety, or specific symptoms); otherwise conclude cleanly.
   Keep simple questions concise and more complex multi-part questions thoroughly detailed.
4. STRICT TRUTHFULNESS & NO HALLUCINATIONS:
   - Live Weather: You do NOT have real-time live satellite, radar, or local meteorological station sensors. If asked "Will it rain tomorrow?" or similar live weather queries, explicitly state that you cannot check real-time live radar/weather, and advise checking the official IMD Mausam app, Karnataka State Natural Disaster Monitoring Centre (KSNDMC), or Meghdoot app. Provide practical agricultural precautions for wet or dry conditions.
   - Live Market Prices: Mandi prices fluctuate daily across APMC yards. Do NOT invent prices or pretend to know today's live rate unless provided in [Active Market Crop Listings]. Advise checking the government portal Agmarknet (agmarknet.gov.in), e-NAM, Karnataka APMC bulletins, or the RaithaSetu Crop Marketplace.
   - Do NOT invent chemical formulations, unregistered doses, or fake statistics.
5. TOPIC MASTERY:
   - Soil: Types (loam, clay, red, black), pH, drainage, amendments (lime for acidic, gypsum for sodic), organic carbon.
   - Nutrients & Fertilizer: Basal vs top dressing, NPK ratios, micronutrients (Zinc, Iron, Boron, Calcium), organic manure, Jeevamrutha, growth stages (vegetative vs flowering vs fruiting).
   - Crop Protection (Pest & Disease): Identify symptoms (sucking pests, borers, blights, wilts, leaf curl), integrated pest management (IPM), bio-control (Neem oil 10,000 ppm, Trichoderma, Pseudomonas, pheromone/sticky traps) before chemical intervention.
   - Irrigation: Critical stages (e.g. groundnut pegging/flowering, paddy tillering/panicle, tomato fruit set), water-saving drip/sprinkler methods.
   - Seeds & Sowing: Suitable seasons (Kharif, Rabi, Summer), seed rate, seed treatment (bio-fungicide/Rhizobium).
   - Farm Machinery & Economics: Rotavators, power tillers, sprayers, daily labour wage context, cost of production vs trader price math.
6. PLANT-HEALTH IMAGE DIAGNOSIS:
   - When an image or leaf symptom is analyzed, provide the most probable visual diagnoses (e.g., fungal leaf spot, nutrient chlorosis, viral curl, pest damage).
   - Explicitly acknowledge diagnostic uncertainty (visual symptoms can overlap across diseases/deficiencies).
   - Recommend confirming with a fresh leaf sample at the nearest Krishi Vigyan Kendra (KVK) or Raitha Samparka Kendra (RSK) before heavy chemical application.
7. SCOPE CONTROL:
   - If the user asks a completely unrelated, non-agricultural question (e.g. general sports, entertainment, programming, politics), politely clarify that RaithaMitra is dedicated exclusively to agriculture, crop care, livestock, and farmer welfare, and invite them to ask a farming-related question.
8. LANGUAGE INTEGRITY:
   - If the user asks in Kannada (or requested language is Kannada), respond strictly in natural, grammatically correct, fluent Kannada with accurate agricultural terminology (ಕೃಷಿ ಪರಿಭಾಷೆ).
   - If the user asks in English, respond in clear English.
   - Do not mix languages inappropriately.`;

/**
 * Enhanced Agricultural Knowledge Engine
 * Provides accurate, structured, direct, well-explained responses in English & Kannada
 * for fallback, offline, and rate-limit scenarios.
 */
const queryKnowledgeEngine = (message, isKannada, contextData = {}, history = []) => {
  const q = (message || '').toLowerCase().trim();

  // Context extraction from history for follow-ups
  let pastCrop = null;
  if (Array.isArray(history) && history.length > 0) {
    const combinedHistory = history.map(h => (h.text || h.content || '').toLowerCase()).join(' ');
    if (combinedHistory.includes('tomato') || combinedHistory.includes('ಟೊಮೆಟೊ')) pastCrop = 'tomato';
    else if (combinedHistory.includes('paddy') || combinedHistory.includes('rice') || combinedHistory.includes('ಭತ್ತ')) pastCrop = 'paddy';
    else if (combinedHistory.includes('sugarcane') || combinedHistory.includes('ಕಬ್ಬು')) pastCrop = 'sugarcane';
    else if (combinedHistory.includes('chilli') || combinedHistory.includes('ಮೆಣಸಿನ')) pastCrop = 'chilli';
    else if (combinedHistory.includes('groundnut') || combinedHistory.includes('ಕಡಲೆಕಾಯಿ') || combinedHistory.includes('ಶೇಂಗಾ')) pastCrop = 'groundnut';
    else if (combinedHistory.includes('ragi') || combinedHistory.includes('ರಾಗಿ')) pastCrop = 'ragi';
    else if (combinedHistory.includes('onion') || combinedHistory.includes('ಈರುಳ್ಳಿ')) pastCrop = 'onion';
  }

  // 1. OUT OF SCOPE / NON-AGRICULTURAL CHECK
  const nonAgriKeywords = [
    'who won', 'world cup', 'movie', 'cinema', 'actor', 'president', 'prime minister',
    'cricket score', 'football', 'write code', 'python script', 'javascript', 'html',
    'song lyrics', 'play game', 'joke', 'capital of', 'stock market share price',
    'bitcoin', 'crypto', 'dance', 'film'
  ];
  const isNonAgri = nonAgriKeywords.some(keyword => q.includes(keyword)) &&
    !q.includes('crop') && !q.includes('farm') && !q.includes('seed') && !q.includes('soil');

  if (isNonAgri) {
    return isKannada
      ? `ಕ್ಷಮಿಸಿ, ನಾನು ರೈತಮಿತ್ರ — ಕೃಷಿ ಮತ್ತು ರೈತರ ಕಲ್ಯಾಣಕ್ಕೆ ಮಾತ್ರ ಮೀಸಲಾದ ಎಐ ಸಹಾಯಕ.\n\nನಾನು ಬೆಳೆಗಳು, ಮಣ್ಣಿನ ಫಲವತ್ತತೆ, ರಸಗೊಬ್ಬರ, ಕೀಟ ಹಾಗೂ ರೋಗ ನಿಯಂತ್ರಣ, ನೀರಾವರಿ, ಬೀಜಗಳು ಅಥವಾ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ಕುರಿತ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಬಲ್ಲೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಕೃಷಿ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.`
      : `I am RaithaMitra, an AI assistant dedicated exclusively to agriculture, farming practices, and farmer welfare.\n\nI can assist you with crop management, soil health, fertilizers, pest and disease control, irrigation, seeds, or farm machinery. Please feel free to ask any farming-related question!`;
  }

  // 2. WEATHER (Live weather verification)
  if (q.includes('rain') || q.includes('weather') || q.includes('forecast') || q.includes('ಮಳೆ') || q.includes('ಹವಾಮಾನ') || q.includes('ಮುನ್ಸೂಚನೆ')) {
    if (q.includes('tomorrow') || q.includes('today') || q.includes('will it') || q.includes('ನಾಳೆ') || q.includes('ಇಂದು') || q.includes('ಬರುತ್ತಾ')) {
      return isKannada
        ? `ರೈತಮಿತ್ರ ಎಐ ಬಳಿ ನೈಜ ಸಮಯದ (ಲೈವ್) ಹವಾಮಾನ ಉಪಗ್ರಹ ಅಥವಾ ರೇಡಾರ್ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.\n\n**ವಿವರಣೆ:** ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯು ಪ್ರತಿ ಗಂಟೆಗೂ ಹಾಗೂ ತಾಲೂಕಿನಿಂದ ತಾಲೂಕಿಗೆ ಬದಲಾಗುವುದರಿಂದ ನೈಜ ಡೇಟಾ ಅಗತ್ಯವಿರುತ್ತದೆ.\n\n**ಮುನ್ಸೂಚನೆ ಪಡೆಯುವ ಕ್ರಮಗಳು:**\n1. ಭಾರತೀಯ ಹವಾಮಾನ ಇಲಾಖೆಯ (IMD) ಅಧಿಕೃತ **Mausam** ಆ್ಯಪ್ ಅಥವಾ [mausam.imd.gov.in](https://mausam.imd.gov.in) ಪರಿಶೀಲಿಸಿ.\n2. ಕರ್ನಾಟಕದ ರೈತರು **KSNDMC** (ಕರ್ನಾಟಕ ರಾಜ್ಯ ನೈಸರ್ಗಿಕ ವಿಕೋಪ ಉಸ್ತುವಾರಿ ಕೇಂದ್ರ) ಜಾಲತಾಣ ಅಥವಾ **Meghdoot** ಮೊಬೈಲ್ ಆ್ಯಪ್ ಬಳಸಿ ಗ್ರಾಮ ಪಂಚಾಯತಿ ಮಟ್ಟದ ಮಳೆ ಮಾಹಿತಿ ಪಡೆಯಬಹುದು.\n\n**ರೈತರಿಗೆ ಮುನ್ನೆಚ್ಚರಿಕೆ:** ಮಳೆಯ ಸಂಭವವಿದ್ದರೆ ಬೆಳೆಗಳಿಗೆ ರಸಗೊಬ್ಬರ ಅಥವಾ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ ಮತ್ತು ಕಟಾವು ಮಾಡಿದ ಬೆಳೆಗಳನ್ನು ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ.`
        : `RaithaMitra AI does not have access to live meteorological radar or real-time weather sensors to provide a live rain forecast.\n\n**Explanation:** Weather conditions fluctuate rapidly by district and taluk, requiring real-time meteorological feeds for reliable local forecasts.\n\n**How to check live forecasts:**\n1. Use the official India Meteorological Department (IMD) **Mausam** app or visit [mausam.imd.gov.in](https://mausam.imd.gov.in).\n2. Farmers in Karnataka can check the **KSNDMC** portal or download the **Meghdoot** app for hyper-local rainfall alerts and agro-meteorological advisories.\n\n**Important Precautions:** If rainfall is anticipated in your area, postpone pesticide and foliar fertilizer sprays by 24 hours and ensure proper drainage in low-lying fields.`;
    }
    // General weather management
    return isKannada
      ? `ಭಾರೀ ಮಳೆಯ ಸಮಯದಲ್ಲಿ ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ತಕ್ಷಣ ಬಸಿಗಾಲುವೆ (drainage) ನಿರ್ಮಿಸಿ. ಬಿಸಿಲು ಹೆಚ್ಚಿರುವ ದಿನಗಳಲ್ಲಿ ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಸಂರಕ್ಷಿಸಲು ಸಾವಯವ ಮಲ್ಚಿಂಗ್ (ಹೊದಿಕೆ) ಬಳಸಿ.`
      : `During heavy rainfall, clear field drainage channels to prevent waterlogging and root asphyxiation. During hot dry spells, apply organic mulching around root zones to conserve soil moisture.`;
  }

  // 3. MARKETPLACE & CROP SELLING PRICES
  if (q.includes('potato') && (q.includes('price') || q.includes('rate') || q.includes('selling') || q.includes('cost') || q.includes('ಮಾರುಕಟ್ಟೆ') || q.includes('ದರ') || q.includes('ಬೆಲೆ'))) {
    return isKannada
      ? `ಆಲೂಗಡ್ಡೆಯ ದೈನಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಯನ್ನು ಅಧಿಕೃತವಾಗಿ Agmarknet ಅಥವಾ e-NAM ಪೋರ್ಟಲ್ ಮೂಲಕ ಪಡೆಯಬಹುದು.\n\n**ವಿವರಣೆ:** ಮಂಡಿ ದರಗಳು ಆಲೂಗಡ್ಡೆಯ ಗಾತ್ರ, ಗುಣಮಟ್ಟ, ತಳಿ ಹಾಗೂ ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಯ ಆವಕವನ್ನು ಆಧರಿಸಿ ದಿನಂಪ್ರತಿ ಬದಲಾಗುತ್ತವೆ. ಆದ್ದರಿಂದ ಊಹೆಯ ದರಗಳನ್ನು ನಂಬದೆ ಅಧಿಕೃತ ಮೂಲವನ್ನು ಪರಿಶೀಲಿಸುವುದು ಸೂಕ್ತ.\n\n**ದರ ಪರಿಶೀಲಿಸುವ ಕ್ರಮಗಳು:**\n1. ಕೇಂದ್ರ ಸರ್ಕಾರದ **Agmarknet** ಜಾಲತಾಣಕ್ಕೆ ([agmarknet.gov.in](https://agmarknet.gov.in)) ಭೇಟಿ ನೀಡಿ, ನಿಮ್ಮ ರಾಜ್ಯ, ಜಿಲ್ಲೆ ಹಾಗೂ 'Potato' ಆಯ್ಕೆ ಮಾಡಿ ಮಂಡಿ ದರ ನೋಡಿ.\n2. **e-NAM** ಆ್ಯಪ್ ಅಥವಾ [enam.gov.in](https://enam.gov.in) ಮೂಲಕ ಲೈವ್ ಹರಾಜು ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.\n3. ರೈತಸೇತು ಆ್ಯಪ್‌ನ **Crop Marketplace** ವಿಭಾಗದಲ್ಲಿ ಇತರ ರೈತರು ಮತ್ತು ವರ್ತಕರ ಪ್ರಸ್ತುತ ದರಗಳನ್ನು ವೀಕ್ಷಿಸಿ.\n\n**ಮುನ್ನೆಚ್ಚರಿಕೆ:** ಮಧ್ಯವರ್ತಿಗಳ ಮಾತು ನಂಬುವ ಮುನ್ನ ಕನಿಷ್ಠ 2-3 ಸಮೀಪದ APMC ಮಂಡಿಗಳ ಸರಾಸರಿ (Modal) ದರವನ್ನು ತಾಳೆ ನೋಡಿ.`
      : `You can find the verified current selling price of potatoes through the official Agmarknet portal, e-NAM, or local APMC market bulletins.\n\n**Explanation:** Potato prices fluctuate daily based on arrivals, variety (table vs. processing), tuber size, and mandi demand. Live market rates should always be verified through authorized portals rather than estimated.\n\n**Practical Steps:**\n1. Visit the Government of India's **Agmarknet** portal at [agmarknet.gov.in](https://agmarknet.gov.in), select your State, District, and commodity as 'Potato' to see minimum, maximum, and modal prices.\n2. Check national trade rates via the **e-NAM** app ([enam.gov.in](https://enam.gov.in)).\n3. Review active farmer and trader listings on the **RaithaSetu Crop Marketplace**.\n\n**Important Precautions:** Compare modal prices across nearby markets to account for transportation costs before agreeing to a buyer's offer.`;
  }

  if (q.includes('price') || q.includes('mandi') || q.includes('selling price') || q.includes('market price') || q.includes('ಮಾರುಕಟ್ಟೆ ಬೆಲೆ') || q.includes('ದರ')) {
    const dbNotice = contextData.dbContextText ? `\n\n${contextData.dbContextText}` : '';
    return isKannada
      ? `ಕೃಷಿ ಉತ್ಪನ್ನಗಳ ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ದರವನ್ನು ತಿಳಿಯಲು ಅಧಿಕೃತ **Agmarknet** ([agmarknet.gov.in](https://agmarknet.gov.in)) ಅಥವಾ **e-NAM** ಪೋರ್ಟಲ್ ವೀಕ್ಷಿಸಿ.${dbNotice}\n\nದರಗಳು ದಿನನಿತ್ಯ ಆವಕ ಹಾಗೂ ಗುಣಮಟ್ಟ ಆಧರಿಸಿ ಬದಲಾಗುತ್ತವೆ. ಮಾರಾಟ ಮಾಡುವ ಮುನ್ನ ಸಮೀಪದ APMC ಮಂಡಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`
      : `To view verified current market and mandi prices for your crops, visit the official **Agmarknet** portal ([agmarknet.gov.in](https://agmarknet.gov.in)) or the **e-NAM** national platform.${dbNotice}\n\nPrices fluctuate daily based on arrivals, moisture levels, and grade. Check the RaithaSetu Crop Marketplace to compare local trader listings.`;
  }

  // 4. SOIL TOPICS (Sugarcane Soil, Soil Testing, pH, Amendments)
  if ((q.includes('sugarcane') || pastCrop === 'sugarcane' || q.includes('ಕಬ್ಬು')) && (q.includes('soil') || q.includes('ಮಣ್ಣು') || q.includes('land') || q.includes('ಜಮೀನು'))) {
    return isKannada
      ? `ಕಬ್ಬಿನ ಕೃಷಿಗೆ ಆಳವಾದ, ಉತ್ತಮ ನೀರು ಬಸಿದುಹೋಗುವ ಫಲವತ್ತಾದ ಜೇಡಿಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು (Deep, well-drained loamy to clay-loam soil) ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ.\n\n**ವಿವರಣೆ:** ಕಬ್ಬಿನ ಬೆಳೆಯು ಆಳವಾದ ಬೇರುಗಳನ್ನು ಹೊಂದಿರುವುದರಿಂದ ಮತ್ತು ಹೆಚ್ಚು ಜೈವಿಕ ರಾಶಿಯನ್ನು (biomass) ಉತ್ಪಾದಿಸುವುದರಿಂದ, ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಉಳಿಸಿಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಉತ್ತಮ ಗಾಳಿಯಾಡುವಿಕೆ (aeration) ಇರಬೇಕು. ಸೂಕ್ತ ಮಣ್ಣಿನ pH 6.5 ರಿಂದ 7.5.\n\n**ಪ್ರಾಯೋಗಿಕ ಕ್ರಮಗಳು:**\n1. ಜಮೀನನ್ನು 30-45 ಸೆಂ.ಮೀ ಆಳವಾಗಿ 3-4 ಬಾರಿ ಉಳುಮೆ ಮಾಡಿ ಮಣ್ಣನ್ನು ಹದಗೊಳಿಸಿ.\n2. ಕೊನೆಯ ಉಳುಮೆಯ ಸಮಯದಲ್ಲಿ ಎಕರೆಗೆ 10-12 ಟನ್ ಚೆನ್ನಾಗಿ ಕುಳಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ (FYM) ಅಥವಾ ಪ್ರೆಸ್‌ಮಡ್ ಸೇರಿಸಿ.\n3. ನೀರಾವರಿ ಹಾಗೂ ಬಸಿಗಾಲುವೆಗಾಗಿ 90 ರಿಂದ 120 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಬದು ಹಾಗೂ ಸಾಲುಗಳನ್ನು (Ridges and Furrows) ನಿರ್ಮಿಸಿ.\n\n**ಮುನ್ನೆಚ್ಚರಿಕೆ:** ನೀರು ನಿಲ್ಲುವ ಜೌಗು ಭೂಮಿ, ಅತಿಯಾದ ಕ್ಷಾರ ಅಥವಾ ಆಮ್ಲೀಯ ಮಣ್ಣನ್ನು ತಪ್ಪಿಸಿ. ಚೌಳು ಮಣ್ಣಾಗಿದ್ದರೆ ಜಿಪ್ಸಂ ಹಾಗೂ ಆಮ್ಲೀಯ ಮಣ್ಣಾಗಿದ್ದರೆ ಕೃಷಿ ಸುಣ್ಣ ಬಳಸಿ ಸರಿಪಡಿಸಿ.`
      : `The best soil for sugarcane cultivation is deep, well-drained, fertile loamy or clay-loam soil with an optimal pH of 6.5 to 7.5.\n\n**Explanation:** Sugarcane has an extensive, deep root system and high biomass production. It requires soil with high water-holding capacity combined with excellent internal drainage to prevent root rot.\n\n**Practical Steps:**\n1. Plough the field deeply (30-45 cm) 3 to 4 times to achieve fine tilth and aerate the soil.\n2. Incorporate 10 to 12 tonnes of well-decomposed Farm Yard Manure (FYM) or pressmud per acre during the final ploughing.\n3. Prepare ridges and furrows at 90 to 120 cm spacing to facilitate furrow irrigation and drainage.\n\n**Important Precautions:** Avoid heavy, impermeable waterlogged soils and severe salinity/alkalinity. For acidic soils, apply agricultural lime, and for sodic soils, apply gypsum as advised by a soil test.`;
  }

  // General soil fertility & pH
  if (q.includes('soil') || q.includes('ph') || q.includes('salin') || q.includes('fertility') || q.includes('ಮಣ್ಣು') || q.includes('ಫಲವತ್ತತೆ')) {
    return isKannada
      ? `ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸಲು ಎಕರೆಗೆ 4-5 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ (FYM) ಅಥವಾ ಎರೆಹುಳು ಗೊಬ್ಬರ ಸೇರಿಸಿ ಮತ್ತು ಹಸಿರೆಲೆ ಗೊಬ್ಬರಗಳನ್ನು (ಡೈಂಚಾ/ಸೆಣಬು) ಬೆಳೆದು ಮಣ್ಣಿಗೆ ಸೇರಿಸಿ.\n\n**ವಿವರಣೆ:** ಬಹುತೇಕ ಬೆಳೆಗಳಿಗೆ ಸೂಕ್ತ pH 6.5 ರಿಂದ 7.5 ಆಗಿದೆ. ಆಮ್ಲೀಯ ಮಣ್ಣಿಗೆ (pH < 6.0) ಕೃಷಿ ಸುಣ್ಣ ಹಾಗೂ ಚೌಳು ಮಣ್ಣಿಗೆ (pH > 8.0) ಜಿಪ್ಸಂ ನೀಡಬೇಕು.\n\n**ಕ್ರಮಗಳು:** ಬಿತ್ತನೆಗೆ 1 ತಿಂಗಳು ಮುನ್ನ ಮಣ್ಣಿನ ಮಾದರಿ ಪರೀಕ್ಷೆ (Soil Test) ಮಾಡಿಸಿ, ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್ (Soil Health Card) ಆಧಾರದ ಮೇಲೆ ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ ನಿರ್ಧರಿಸಿ.`
      : `To improve soil fertility, incorporate 4-5 tonnes of Farm Yard Manure (FYM) or vermicompost per acre and cultivate green manure crops (like Dhaincha or Sunhemp) before the main crop.\n\n**Explanation:** The ideal soil pH for most field crops is 6.5 to 7.5. Acidic soils (pH < 6.0) require agricultural lime, while sodic/saline soils (pH > 8.0) benefit from gypsum application and leaching.\n\n**Practical Steps:** Conduct a soil test at your local Krishi Vigyan Kendra (KVK) to check organic carbon, NPK, and micronutrient status before applying heavy chemical fertilizers.`;
  }

  // 5. NUTRIENTS & DEFICIENCY (Paddy yellow leaves, NPK)
  if ((q.includes('paddy') || q.includes('rice') || pastCrop === 'paddy' || q.includes('ಭತ್ತ')) && (q.includes('yellow') || q.includes('ಹಳದಿ') || q.includes('chlorosis'))) {
    return isKannada
      ? `ಭತ್ತದ ಎಲೆಗಳು ಹಳದಿಯಾಗಲು ಪ್ರಮುಖ ಕಾರಣ ಸಾರಜನಕ (Nitrogen) ಕೊರತೆ, ಸತು (Zinc) ಕೊರತೆ (ಖೈರಾ ರೋಗ), ಅಥವಾ ಅತಿಯಾದ ನೀರಿನಿಂದ ಬೇರು ಉಸಿರುಗಟ್ಟುವುದು.\n\n**ವಿವರಣೆ:** ಸಾರಜನಕ ಕೊರತೆಯಾದರೆ ಹಳೆಯ ಕೆಳ ಎಲೆಗಳು ಮೊದಲು ತುದಿಯಿಂದ ಹಳದಿಯಾಗುತ್ತವೆ. ಸತುವಿನ ಕೊರತೆಯಾದರೆ ಹೊಸ ಎಲೆಗಳ ನಾಳಗಳ ಮಧ್ಯೆ ಕಂದು-ಹಳದಿ ಚುಕ್ಕೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.\n\n**ಪರಿಹಾರ ಕ್ರಮಗಳು:**\n1. ಸಾರಜನಕ ಕೊರತೆಗೆ: ಎಕರೆಗೆ 20-25 ಕೆಜಿ ಯೂರಿಯಾವನ್ನು ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶವಿರುವಾಗ ಮೇಲುಗೊಬ್ಬರವಾಗಿ ನೀಡಿ.\n2. ಸತುವಿನ ಕೊರತೆಗೆ: 0.5% ಜಿಂಕ್ ಸಲ್ಫೇಟ್ (5 ಗ್ರಾಂ/ಲೀ) + 0.25% ಸುಣ್ಣದ ತಿಳಿನೀರನ್ನು ಎಲೆಗಳ ಮೇಲೆ ಸಿಂಪಡಿಸಿ.\n3. ನೀರು ಜವಳಾಗಿದ್ದರೆ: ಗದ್ದೆಯ ನಿಂತ ನೀರನ್ನು 2 ದಿನ ಹೊರಹಾಕಿ ಮಣ್ಣಿಗೆ ಗಾಳಿ ಆಡಲು ಬಿಡಿ.\n\n**ಮುನ್ನೆಚ್ಚರಿಕೆ:** ಎಲೆಗಳಲ್ಲಿ ಹಳದಿ ಬಣ್ಣದೊಂದಿಗೆ ಒಣಗಿದ ಬ್ಲೈಟ್ ಗೆರೆಗಳಿದ್ದರೆ ಬ್ಯಾಕ್ಟೀರಿಯಲ್ ಲೀಫ್ ಬ್ಲೈಟ್ (BLB) ಇರಬಹುದು; ಅಂತಹ ಸಂದರ್ಭದಲ್ಲಿ ಯೂರಿಯಾ ನೀಡುವುದನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ.`
      : `Yellowing of paddy leaves is most commonly caused by Nitrogen deficiency, Zinc deficiency (Khaira symptom), or root suffocation due to prolonged stagnation of water.\n\n**Explanation:** Nitrogen deficiency causes general yellowing starting from the tips of older lower leaves. Zinc deficiency causes rusty-brown and yellow discoloration between veins on younger leaves in alkaline or waterlogged soils.\n\n**Practical Steps:**\n1. **For Nitrogen deficiency:** Top-dress 20-25 kg Urea per acre in standing moist soil (avoid draining the field immediately).\n2. **For Zinc deficiency:** Foliar spray Zinc Sulphate (0.5% - 5g per liter of water) mixed with 0.25% slaked lime.\n3. **For Waterlogged root suffocation:** Drain the standing water for 2-3 days to aerate root zones (intermittent irrigation).\n\n**Important Precautions:** If yellowing is accompanied by wavy lesions starting from leaf margins, it may be Bacterial Leaf Blight (BLB); immediately withhold nitrogen fertilizers as excess urea aggravates bacterial disease.`;
  }

  // 6. FERTILIZER (Tomatoes at flowering, Stage-wise Nutrition)
  if ((q.includes('tomato') || pastCrop === 'tomato' || q.includes('ಟೊಮೆಟೊ')) && (q.includes('flower') || q.includes('ಹೂವು') || q.includes('flowering'))) {
    return isKannada
      ? `ಟೊಮೆಟೊ ಹೂವಾಡುವ ಹಂತದಲ್ಲಿ ಸಾರಜನಕವನ್ನು ಮಿತಗೊಳಿಸಿ, ರಂಜಕ (Phosphorus), ಪೊಟ್ಯಾಷ್ (Potassium) ಮತ್ತು ಬೋರಾನ್ ಪೋಷಕಾಂಶಗಳನ್ನು ಹೆಚ್ಚಾಗಿ ನೀಡಬೇಕು.\n\n**ವಿವರಣೆ:** ಹೂ ಬಿಡುವ ಸಮಯದಲ್ಲಿ ಹೆಚ್ಚಿನ ಪೊಟ್ಯಾಷ್ ಹಾಗೂ ರಂಜಕವು ಹೂವು ಉದುರುವುದನ್ನು ತಡೆಯುತ್ತದೆ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವಿಕೆಯನ್ನು (fruit set) ಹೆಚ್ಚಿಸುತ್ತದೆ. ಬೋರಾನ್ ಪರಾಗಸ್ಪರ್ಶಕ್ಕೆ ಅತ್ಯಗತ್ಯ.\n\n**ಪ್ರಾಯೋಗಿಕ ಕ್ರಮಗಳು:**\n1. ಹನಿ ನೀರಾವರಿ (Fertigation) ಮೂಲಕ: 100% ಕರಗುವ NPK 0:52:34 (MKP) ಅಥವಾ 13:0:45 ರಸಗೊಬ್ಬರವನ್ನು ಎಕರೆಗೆ 3-4 ಕೆಜಿ ವಾರಕ್ಕೆ ಎರಡು ಬಾರಿ ನೀಡಿ.\n2. ಎಲೆ ಸಿಂಪರಣೆ: ಹೂ ಉದುರುವಿಕೆ ತಡೆಯಲು ಬೋರಾನ್ 20% (1 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರಿಗೆ) ಸಿಂಪಡಿಸಿ.\n\n**ಮುನ್ನೆಚ್ಚರಿಕೆ:** ಈ ಹಂತದಲ್ಲಿ ಯೂರಿಯಾ ಅಥವಾ ಸಾರಜನಕವನ್ನು ಅತಿಯಾಗಿ ನೀಡಬೇಡಿ; ಸಾರಜನಕ ಹೆಚ್ಚಾದರೆ ಗಿಡ ಎಲೆಗಳನ್ನಷ್ಟೇ ಬೆಳೆಸಿಕೊಂಡು ಹೂವುಗಳು ಉದುರುತ್ತವೆ.`
      : `For tomatoes at the flowering stage, use a fertilizer high in Phosphorus and Potassium with added Boron, while reducing Nitrogen.\n\n**Explanation:** High Phosphorus strengthens flower clusters, while Potassium promotes cell division and fruit setting. Boron is vital for pollen tube germination, preventing blossom drop.\n\n**Practical Steps:**\n1. **Fertigation:** Apply water-soluble NPK 0:52:34 (Mono Potassium Phosphate) or NPK 13:0:45 (Potassium Nitrate) at 3 to 4 kg per acre per week through drip irrigation.\n2. **Foliar Spray:** Spray Solubor (Boron 20%) at 1 g per liter of water along with Chelated Calcium (1 g/L) during early bloom to prevent blossom end rot.\n\n**Important Precautions:** Avoid heavy doses of urea or pure nitrogenous fertilizers at flowering, as excessive vegetative vigor causes flower abortion and delays fruiting.`;
  }

  // General tomato fertilizer early/vegetative
  if (q.includes('tomato') && (q.includes('fertilizer') || q.includes('gobbara') || q.includes('ಗೊಬ್ಬರ'))) {
    return isKannada
      ? `ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಆರಂಭಿಕ ಹಂತದಲ್ಲಿ ಸಮತೋಲಿತ NPK (19:19:19) ಮತ್ತು ಹೂವು/ಕಾಯಿ ಹಂತದಲ್ಲಿ ಹೆಚ್ಚಿನ ರಂಜಕ ಮತ್ತು ಪೊಟ್ಯಾಷ್ (0:52:34 ಅಥವಾ 13:0:45) ನೀಡುವುದು ಸೂಕ್ತ.`
      : `For tomatoes, apply balanced NPK (19:19:19) during early vegetative growth to build strong stems, and transition to high Phosphorus and Potassium (such as 0:52:34 or 13:0:45) at flowering and fruiting.`;
  }

  // Paddy vegetative stage fertilizer
  if (q.includes('paddy') && (q.includes('vegetative') || q.includes('growing') || q.includes('tillering')) && (q.includes('fertilizer') || q.includes('gobbara'))) {
    return isKannada
      ? `ಭತ್ತದ ಸಸ್ಯಕ (ತಿಲ್ಲರಿಂಗ್) ಹಂತದಲ್ಲಿ ಎಲೆ ಹಾಗೂ ಕವಲುಗಳ ಬೆಳವಣಿಗೆಗೆ ಸಾರಜನಕಯುಕ್ತ ಯೂರಿಯಾವನ್ನು ಮೇಲುಗೊಬ್ಬರವಾಗಿ ನೀಡುವುದು ಸೂಕ್ತವಾಗಿದೆ.\n\nಎಕರೆಗೆ ಶಿಫಾರಸು ಮಾಡಿದ ಯೂರಿಯಾದ ಅರ್ಧಭಾಗವನ್ನು ಬಿತ್ತನೆ ಮಾಡಿದ 20-25 ದಿನಗಳಲ್ಲಿ ತೇವಾಂಶವಿರುವ ಗದ್ದೆಗೆ ನೀಡಿ.`
      : `For paddy in the vegetative tillering stage, apply Nitrogen fertilizer such as Urea as a top-dressing to support vigorous tiller development and leaf canopy.\n\nApply approximately 25-30 kg Urea per acre at 20-25 days after transplanting in moist soil, adjusted according to your soil health card.`;
  }

  // 7. PEST CONTROL (Aphids on chilli, stem borer, whitefly)
  if ((q.includes('chilli') || pastCrop === 'chilli' || q.includes('ಮೆಣಸಿನ')) && (q.includes('aphid') || q.includes('ಹೇನು') || q.includes('pest') || q.includes('ಕೀಟ'))) {
    return isKannada
      ? `ಮೆಣಸಿನಕಾಯಿ ಬೆಳೆಯಲ್ಲಿ ಹೇನು (Aphids) ನಿಯಂತ್ರಣಕ್ಕೆ ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳು ಮತ್ತು 10,000 PPM ಬೇವಿನ ಎಣ್ಣೆ (Neem Oil) ಅತ್ಯುತ್ತಮ ಆರಂಭಿಕ ಪರಿಹಾರವಾಗಿದೆ.\n\n**ವಿವರಣೆ:** ಹೇನುಗಳು ಎಲೆಗಳ ರಸ ಹೀರಿ ಎಲೆ ಮುದುರುವಿಕೆ ಹಾಗೂ ವೈರಸ್ ಹರಡುವಿಕೆಗೆ ಕಾರಣವಾಗುತ್ತವೆ. ಬೇವಿನ ಎಣ್ಣೆ ಕೀಟಗಳ ಆಹಾರ ಸೇವನೆ ಮತ್ತು ಸಂತಾನೋತ್ಪತ್ತಿಯನ್ನು ತಡೆಯುತ್ತದೆ.\n\n**ಪ್ರಾಯೋಗಿಕ ಕ್ರಮಗಳು:**\n1. ಎಕರೆಗೆ 15 ರಿಂದ 20 ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು (Yellow Sticky Traps) ಬೆಳೆಯ ಎತ್ತರಕ್ಕಿಂತ 1 ಅಡಿ ಎತ್ತರದಲ್ಲಿ ಅಳವಡಿಸಿ.\n2. ಜೈವಿಕ ಸಿಂಪರಣೆ: 10,000 PPM ಬೇವಿನ ಎಣ್ಣೆಯನ್ನು ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 3 ಮಿ.ಲೀ ಬೆರೆಸಿ ಎಲೆಯ ತಳಭಾಗಕ್ಕೆ ಸಿಂಪಡಿಸಿ.\n3. ತೀವ್ರ ಬಾಧೆಯಿದ್ದರೆ: ಕೃಷಿ ಅಧಿಕಾರಿಗಳ ಮಾರ್ಗದರ್ಶನದಂತೆ ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ 17.8 SL (0.3 ಮಿ.ಲೀ/ಲೀ) ಅಥವಾ ಅಸಿಟಾಮಿಪ್ರಿಡ್ 20 SP (0.2 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ.\n\n**ಮುನ್ನೆಚ್ಚರಿಕೆ:** ಹೂವಾಡುವ ಸಮಯದಲ್ಲಿ ಮಧ್ಯಾಹ್ನ ಸಿಂಪಡಿಸಬೇಡಿ (ಜೇನುನೊಣಗಳ ರಕ್ಷಣೆಗಾಗಿ ಮುಂಜಾನೆ ಅಥವಾ ಸಂಜೆ ಸಿಂಪಡಿಸಿ). ಕಟಾವಿಗೆ ಕನಿಷ್ಠ 7 ದಿನ ಮೊದಲು ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪರಣೆ ನಿಲ್ಲಿಸಿ.`
      : `To control aphids on chilli, install yellow sticky traps and spray Neem Oil (10,000 PPM) at 3 ml per liter of water as an effective first-line control.\n\n**Explanation:** Aphids suck plant sap from the undersides of leaves, stunting growth and transmitting harmful viral diseases (such as chilli leaf curl). Neem compounds disrupt their feeding and moulting safely.\n\n**Practical Steps:**\n1. **Traps:** Install 15 to 20 yellow sticky traps per acre at crop canopy height to monitor and trap winged aphids.\n2. **Organic Spray:** Thoroughly spray Neem Oil 10,000 PPM (3 ml/L) or *Verticillium lecanii* (5 g/L) on leaf undersides.\n3. **Chemical Intervention (if severe):** Spray Imidacloprid 17.8 SL (0.3 ml per liter) or Acetamiprid 20 SP (0.2 g per liter) as recommended by state agricultural guidelines.\n\n**Important Precautions:** Spray only in early mornings or late evenings to protect pollinating honeybees. Strictly respect the 7-day pre-harvest interval (PHI) before picking chillies.`;
  }

  // Rice stem borer
  if ((q.includes('stem borer') || q.includes('borer') || q.includes('ದಂಟು ಕೊರೆಯುವ')) && (q.includes('rice') || q.includes('paddy') || q.includes('ಭತ್ತ'))) {
    return isKannada
      ? `ಭತ್ತದ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳು (Yellow Stem Borer) ನಿಯಂತ್ರಣಕ್ಕೆ ಎಕರೆಗೆ 8-10 ಫೆರಮೋನ್ ಟ್ರ್ಯಾಪ್‌ಗಳನ್ನು ಅಳವಡಿಸಿ. ಜೈವಿಕವಾಗಿ ಟ್ರೈಕೋಗ್ರಾಮ ಪರಾವಲಂಬಿ ಕಾರ್ಡ್‌ಗಳನ್ನು ಬಳಸಿ. ತೀವ್ರ ಸಮಸ್ಯೆಗೆ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 0.4% GR (4 ಕೆಜಿ/ಎಕರೆ) ಮಣ್ಣಿಗೆ ನೀಡಿ.`
      : `For rice yellow stem borer, set up 8-10 pheromone traps per acre to monitor moth activity. Apply *Trichogramma japonicum* egg parasitoid cards (40,000 eggs/acre). In severe infestations, apply Chlorantraniliprole 0.4% GR at 4 kg per acre in moist soil.`;
  }

  // General pest control
  if (q.includes('aphid') || q.includes('pesticide') || q.includes('pest') || q.includes('ಕೀಟ') || q.includes('ಹುಳು') || q.includes('ಔಷಧಿ')) {
    return isKannada
      ? `ಕೀಟಗಳ ಆರಂಭಿಕ ಹಂತದಲ್ಲಿ ಎಕರೆಗೆ 15-20 ಹಳದಿ/ನೀಲಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ ಮತ್ತು 10,000 PPM ಬೇವಿನ ಎಣ್ಣೆ (3 ಮಿ.ಲೀ/ಲೀ) ಸಿಂಪಡಿಸಿ. ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆಗೆ ಲೇಬಲ್ ಸೂಚನೆ ಹಾಗೂ ಕೃಷಿ ಅಧಿಕಾರಿಗಳ ಮಾರ್ಗದರ್ಶನ ಕಡ್ಡಾಯವಾಗಿ ಪಾಲಿಸಿ.`
      : `For sucking pests and worms, deploy yellow sticky traps and apply Neem oil (10,000 PPM at 3 ml/L) or bio-agents. Always follow chemical container label directions, wear protective gear, and adhere to recommended pre-harvest intervals.`;
  }

  // 8. IRRIGATION & WATER MANAGEMENT (Groundnut, Tomato, Paddy)
  if ((q.includes('groundnut') || pastCrop === 'groundnut' || q.includes('ಶೇಂಗಾ') || q.includes('ಕಡಲೆಕಾಯಿ')) && (q.includes('water') || q.includes('irriga') || q.includes('ನೀರು') || q.includes('ನೀರಾವರಿ'))) {
    return isKannada
      ? `ಕಡಲೆಕಾಯಿ (ಶೇಂಗಾ) ಬೆಳೆಗೆ ಹೂ ಬಿಡುವ ಹಂತ (20-25 ದಿನಗಳು), ಕಡ್ಡಿ ಇಳಿಯುವ ಹಂತ/ಪೆಗ್ಗಿಂಗ್ (40-45 ದಿನಗಳು) ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ (65-75 ದಿನಗಳು) ನೀರಾವರಿ ನೀಡಲು ಅತ್ಯಂತ ನಿರ್ಣಾಯಕ ಸಮಯಗಳಾಗಿವೆ.\n\n**ವಿವರಣೆ:** ಕಡ್ಡಿ ಇಳಿಯುವಾಗ (pegging) ಮಣ್ಣಿನಲ್ಲಿ ಸಾಕಷ್ಟು ತೇವಾಂಶವಿದ್ದರೆ ಮಾತ್ರ ಕಡ್ಡಿಗಳು ಮಣ್ಣಿನೊಳಗೆ ಸುಲಭವಾಗಿ ಇಳಿದು ಕಾಯಿ ಕಟ್ಟುತ್ತವೆ. ಈ ಹಂತದಲ್ಲಿ ನೀರಿನ ಕೊರತೆಯಾದರೆ ಇಳುವರಿ ಶೇ 40-50 ರಷ್ಟು ಕುಸಿಯುತ್ತದೆ.\n\n**ಪ್ರಾಯೋಗಿಕ ಕ್ರಮಗಳು:**\n1. ಬಿತ್ತನೆಯ ನಂತರ ಮೊಳಕೆಯೊಡೆಯಲು ಲಘು ನೀರು ನೀಡಿ.\n2. ಹೂವಾಡುವ ಮತ್ತು ಕಡ್ಡಿ ಇಳಿಯುವ ಹಂತದಲ್ಲಿ ಮಣ್ಣು ತೇವವಾಗಿರುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ.\n3. ತುಂತುರು (Sprinkler) ನೀರಾವರಿ ಕಡಲೆಕಾಯಿಗೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ, ಇದು ನೀರನ್ನು ಉಳಿಸಿ ಮಣ್ಣನ್ನು ಮೆತ್ತಗಾಗಿಡುತ್ತದೆ.\n\n**ಮುನ್ನೆಚ್ಚರಿಕೆ:** ಕಟಾವಿಗೆ 10-15 ದಿನಗಳ ಮುನ್ನ ನೀರು ನೀಡುವುದನ್ನು ನಿಲ್ಲಿಸಿ; ಕಟಾವಿನ ವೇಳೆ ಅತಿಯಾದ ತೇವಾಂಶವಿದ್ದರೆ ಕಾಯಿಗಳು ಗಿಡದಲ್ಲೇ ಮೊಳಕೆಯೊಡೆಯುವ ಅಪಾಯವಿರುತ್ತದೆ.`
      : `Groundnut requires watering at three critical growth stages: flowering (20-25 days after sowing), pegging (40-45 DAS), and pod development (65-75 DAS).\n\n**Explanation:** During pegging, the needles (pegs) penetrate the soil to form underground pods. Adequate soil moisture softens the surface, enabling successful penetration and uniform pod filling.\n\n**Practical Steps:**\n1. Provide a light irrigation at sowing to ensure uniform germination.\n2. Ensure continuous, moderate soil moisture during the flowering and peg-penetration stages.\n3. Sprinkler irrigation is ideal for groundnut, saving 30-40% water while maintaining optimal soil friability.\n\n**Important Precautions:** Stop irrigation 10-15 days prior to harvest. Excess moisture right before harvest causes in-situ pod sprouting and promotes fungal pod rot (*Aspergillus flavus*).`;
  }

  // Tomato watering
  if ((q.includes('tomato') || pastCrop === 'tomato' || q.includes('ಟೊಮೆಟೊ')) && (q.includes('water') || q.includes('irriga') || q.includes('ನೀರು') || q.includes('ನೀರಾವರಿ'))) {
    return isKannada
      ? `ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಮಣ್ಣಿನ ತೇವಾಂಶ ಆಧರಿಸಿ 2 ರಿಂದ 3 ದಿನಗಳಿಗೊಮ್ಮೆ ಆಳವಾಗಿ ನೀರು ನೀಡಬೇಕು (ಹನಿ ನೀರಾವರಿ ಮೂಲಕ ನಿತ್ಯ 1.5 - 2 ಲೀಟರ್/ಗಿಡಕ್ಕೆ).\n\nಅತಿಯಾದ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ; ಅತಿಯಾದ ನೀರಿನಿಂದ ಬೇರು ಕೊಳೆಯುವುದು ಮತ್ತು ಕ್ಯಾಲ್ಸಿಯಂ ಹೀರುವಿಕೆ ಕುಂಠಿತವಾಗಿ ಹಣ್ಣು ಕೊಳೆತ ರೋಗ ಬರುತ್ತದೆ.`
      : `Tomato plants generally require deep watering every 2 to 3 days (1 to 1.5 inches per week, or 1.5 to 2 liters per plant per day via drip irrigation).\n\nMaintain consistent soil moisture; irregular watering alternating between bone-dry and soggy conditions leads to fruit cracking and blossom end rot.`;
  }

  // General irrigation
  if (q.includes('irrigation') || q.includes('water') || q.includes('drip') || q.includes('sprinkler') || q.includes('ನೀರಾವರಿ') || q.includes('ಹನಿ')) {
    return isKannada
      ? `ಹನಿ ನೀರಾವರಿ (Drip) ಬಳಸಿ ಶೇ 40-50% ನೀರು ಉಳಿಸಿ ಮತ್ತು ಕರಗುವ ಗೊಬ್ಬರಗಳನ್ನು (Fertigation) ನೇರವಾಗಿ ಬೇರುಗಳಿಗೆ ತಲುಪಿಸಿ. ಬೆಳೆಯ ಹಂತ ಹಾಗೂ ಮಣ್ಣಿನ ತೇವಾಂಶ ಆಧರಿಸಿ ನೀರಾವರಿ ಪ್ರಮಾಣ ನಿರ್ಧರಿಸಿ.`
      : `Drip irrigation saves 40-50% water compared to flood irrigation while delivering soluble nutrients directly to root zones. Adjust schedule based on crop growth stage, soil texture, and weather.`;
  }

  // 9. SEEDS, VARIETIES & SOWING TIME (Paddy sowing time, Brinjal seeds)
  if ((q.includes('paddy') || q.includes('rice') || q.includes('ಭತ್ತ')) && (q.includes('sow') || q.includes('time') || q.includes('season') || q.includes('month') || q.includes('ಸಮಯ') || q.includes('ಬಿತ್ತನೆ') || q.includes('ಯಾವಾಗ'))) {
    return isKannada
      ? `ಕರ್ನಾಟಕ ಮತ್ತು ದಕ್ಷಿಣ ಭಾರತದಲ್ಲಿ ಮುಂಗಾರು (ಖಾರೀಫ್) ಭತ್ತ ಬಿತ್ತನೆಗೆ ಜೂನ್‌ನಿಂದ ಜುಲೈ ಹಾಗೂ ಹಿಂಗಾರು/ಬೇಸಿಗೆ ಭತ್ತಕ್ಕೆ ನವೆಂಬರ್‌ನಿಂದ ಡಿಸೆಂಬರ್ ಅತ್ಯಂತ ಸೂಕ್ತ ಸಮಯವಾಗಿದೆ.\n\n**ವಿವರಣೆ:** ನೈಋತ್ಯ ಮಾನ್ಸೂನ್ ಮಳೆಯ ಸದ್ಬಳಕೆಗೆ ಜೂನ್-ಜುಲೈ ನರ್ಸರಿ ಬಿತ್ತನೆ ಹಾಗೂ ಜುಲೈ-ಆಗಸ್ಟ್ ನಾಟಿ ಸೂಕ್ತ. ಹಿಂಗಾರಿನಲ್ಲಿ ತಂಪಾದ ಹವಾಮಾನ ಮುಗಿಯುವ ಮುನ್ನ ತೆನೆ ಬರುವಂತೆ ನವೆಂಬರ್ ಬಿತ್ತನೆ ಮಾಡಬೇಕು.\n\n**ಪ್ರಾಯೋಗಿಕ ಕ್ರಮಗಳು:**\n1. ಮುಂಗಾರಿಗೆ ಸೂಕ್ತ ತಳಿಗಳು: ಜ್ಯೋತಿ, ತನು, ಬಿಆರ್‌ಟಿ-1, ಅಥವಾ ಹೈಬ್ರಿಡ್ ಕೆಆರ್‌ಎಚ್-4.\n2. ಬೀಜೋಪಚಾರ: ಬಿತ್ತನೆಗೂ ಮುನ್ನ 1 ಕೆಜಿ ಬೀಜಕ್ಕೆ 2 ಗ್ರಾಂ ಕಾರ್ಬೆಂಡಾಜಿಮ್ ಅಥವಾ 10 ಗ್ರಾಂ ಟ್ರೈಕೋಡರ್ಮಾ ವಿರಿಡೆ ಬೆರೆಸಿ ಉಪಚರಿಸಿ.\n\n**ಮುನ್ನೆಚ್ಚರಿಕೆ:** ಮುಂಗಾರು ಬಿತ್ತನೆ ತಡವಾದರೆ (ಆಗಸ್ಟ್ ನಂತರ) ಚಳಿ ಹೆಚ್ಚಾಗಿ ಕಾಳು ಕಟ್ಟುವಿಕೆ ಕುಂಠಿತವಾಗುತ್ತದೆ ಮತ್ತು ಬೆಂಕಿ ರೋಗದ (Blast) ಬಾಧೆ ಹೆಚ್ಚುತ್ತದೆ.`
      : `In Karnataka and Southern India, the ideal time to sow Kharif (monsoon) paddy in nurseries is June to July, and for Rabi/Summer paddy, it is November to December.\n\n**Explanation:** Kharif sowing aligns with the onset of the southwest monsoon, ensuring sufficient water for nursery raising and July-August transplanting. Sowing within this window ensures flowering occurs before winter cold stresses the panicle.\n\n**Practical Steps:**\n1. **Popular Varieties for Karnataka:** Jaya, Jyothi, Tanu, Gangavathi Sona, or KRH-4 hybrid.\n2. **Seed Treatment:** Treat seeds with *Trichoderma viride* (10 g/kg of seed) or Carbendazim (2 g/kg of seed) before soaking to prevent seed-borne foot rot and blast.\n\n**Important Precautions:** Avoid sowing Kharif paddy later than late July, as delayed crops suffer from panicle sterility due to early winter chills and higher gall midge infestation.`;
  }

  // Brinjal seed in red soil
  if ((q.includes('brinjal') || q.includes('eggplant') || q.includes('ಬದನೆ')) && (q.includes('seed') || q.includes('variety') || q.includes('ಬೀಜ') || q.includes('ತಳಿ'))) {
    return isKannada
      ? `ಕೆಂಪು ಮಣ್ಣಿಗೆ ಸೂಕ್ತವಾದ ಜನಪ್ರಿಯ ಬದನೆ ತಳಿಗಳು: ಪೂಸಾ ಪರ್ಪಲ್ ಲಾಂಗ್, ಅರ್ಕಾ ಕುಸುಮಾಕರ್, ಅರ್ಕಾ ನೀಲಕಂಠ (ಬ್ಯಾಕ್ಟೀರಿಯಲ್ ಸೊರಗು ರೋಗ ನಿರೋಧಕ), ಹಾಗೂ ಸ್ಥಳೀಯ ಮಟ್ಟಿಗುಳ್ಳ ತಳಿಗಳು.\n\nಬಿತ್ತನೆಗೆ ಮುನ್ನ ಬೀಜೋಪಚಾರ ಮಾಡಿ ಮತ್ತು ಕೆಂಪು ಮಣ್ಣಿಗೆ ಸಾಕಷ್ಟು ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಸೇರಿಸಿ ತೇವಾಂಶ ಉಳಿಸಿಕೊಳ್ಳಿ.`
      : `High-yielding brinjal varieties well-suited for red loamy soil include Arka Neelkanth (bacterial wilt resistant), Arka Anand, Pusa Purple Long, and local GI variety Mattu Gulla.\n\nEnsure seed treatment with *Trichoderma viride* (5 g/kg) and mix 8-10 tonnes of organic manure per acre to enhance red soil water retention.`;
  }

  // General seeds
  if (q.includes('seed') || q.includes('variety') || q.includes('ಬೀಜ') || q.includes('ತಳಿ')) {
    return isKannada
      ? `ಪ್ರಮಾಣೀಕೃತ ಮತ್ತು ರೋಗ ನಿರೋಧಕ ಬೀಜಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ. ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಟ್ರೈಕೋಡರ್ಮಾ (10 ಗ್ರಾಂ/ಕೆಜಿ) ಅಥವಾ ಸೂಕ್ತ ಶಿಲೀಂಧ್ರನಾಶಕದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡುವುದು ರೋಗ ತಡೆಗಟ್ಟಲು ಕಡ್ಡಾಯ.`
      : `Always select certified, disease-resistant seed varieties suitable for your agro-climatic zone. Perform seed treatment with *Trichoderma viride* (5-10 g/kg) or appropriate fungicide to protect young seedlings from damping-off.`;
  }

  // 10. CROP DISEASES (Tomato leaf curl, early blight, fungus, wilt)
  if ((q.includes('tomato') || pastCrop === 'tomato' || q.includes('ಟೊಮೆಟೊ')) && (q.includes('curl') || q.includes('spot') || q.includes('blight') || q.includes('ಮುದುಡುವ') || q.includes('ಚುಕ್ಕೆ'))) {
    return isKannada
      ? `ಟೊಮೆಟೊ ಎಲೆ ಮುದುಡುವಿಕೆ (Leaf Curl) ವೈರಸ್‌ನಿಂದ ಬರುತ್ತದೆ, ಇದನ್ನು ಬಿಳಿ ನೊಣಗಳು (Whitefly) ಹರಡುತ್ತವೆ. ಕಪ್ಪು/ಕಂದು ಮಚ್ಚೆಗಳು ಅರ್ಲಿ ಬ್ಲೈಟ್ ಶಿಲೀಂಧ್ರ ರೋಗದ ಲಕ್ಷಣವಾಗಿರಬಹುದು.\n\n**ಕ್ರಮಗಳು:** ಬಿಳಿ ನೊಣ ನಿಯಂತ್ರಣಕ್ಕೆ ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ, 10,000 PPM ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ. ಶಿಲೀಂಧ್ರ ಮಚ್ಚೆಗಳಿಗೆ ಮ್ಯಾಂಕೋಜೆಬ್ (2 ಗ್ರಾಂ/ಲೀ) ಅಥವಾ ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ (2.5 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ. ತೀವ್ರ ಬಾಧಿತ ಗಿಡಗಳನ್ನು ತಕ್ಷಣ ಕಿತ್ತು ನಾಶಪಡಿಸಿ.`
      : `Tomato leaf curling is typically caused by Tomato Leaf Curl Virus transmitted by whiteflies, while dark concentric circular spots indicate Early Blight (*Alternaria solani*).\n\n**Practical Steps:**\n1. **For Whiteflies/Leaf Curl:** Install yellow sticky traps and spray Neem Oil 10,000 PPM (3 ml/L). Uproot and burn severely infected viral plants.\n2. **For Leaf Spots/Blight:** Spray Mancozeb 75 WP (2 g/L) or Copper Oxychloride (2.5 g/L). Avoid overhead sprinkler irrigation which wets foliage.`;
  }

  if (q.includes('disease') || q.includes('blight') || q.includes('wilt') || q.includes('spot') || q.includes('fungus') || q.includes('ರೋಗ') || q.includes('ಮಚ್ಚೆ') || q.includes('ಕೊಳೆ')) {
    return isKannada
      ? `ಬೆಳೆಗಳಲ್ಲಿ ಶಿಲೀಂಧ್ರ ರೋಗ ಅಥವಾ ಎಲೆ ಚುಕ್ಕೆ ನಿಯಂತ್ರಣಕ್ಕೆ ಹೊಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ ಮತ್ತು ಗಾಳಿಯಾಡುವಿಕೆ ಹೆಚ್ಚಿಸಿ. ಜೈವಿಕವಾಗಿ ಟ್ರೈಕೋಡರ್ಮಾ ವಿರಿಡೆ (5 ಗ್ರಾಂ/ಲೀ) ಅಥವಾ ತಾಮ್ರದ ಶಿಲೀಂಧ್ರನಾಶಕ (2.5 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ.`
      : `For fungal leaf spots and blights, improve field drainage and prune crowded lower leaves to improve aeration. Apply biological *Trichoderma viride* or contact protectant Mancozeb (2 g/L) at the earliest symptom onset.`;
  }

  // 11. CROP-LEAF IMAGE DIAGNOSIS FALLBACK
  if (q.includes('image') || q.includes('photo') || q.includes('leaf') || q.includes('ಚಿತ್ರ') || q.includes('ಫೋಟೋ') || q.includes('ಎಲೆ')) {
    return isKannada
      ? `ಎಲೆಯ ಚಿತ್ರವನ್ನು ಪರಿಶೀಲಿಸುವಾಗ: ಎಲೆಯ ಹಳದಿ ಕಲೆ, ಮುದುಡುವಿಕೆ ಅಥವಾ ಕಪ್ಪು ಚುಕ್ಕೆಗಳು ಶಿಲೀಂಧ್ರ ರೋಗ (Blight), ವೈರಸ್ ಅಥವಾ ಪೋಷಕಾಂಶದ ಕೊರತೆಯ ಸಂಕೇತವಾಗಿರಬಹುದು.\n\n**ಅನಿಶ್ಚಿತತೆಯ ಎಚ್ಚರಿಕೆ:** ಕೇವಲ ಛಾಯಾಚಿತ್ರದಿಂದ ರೋಗವನ್ನು ಶೇ 100% ಖಚಿತಪಡಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ, ಏಕೆಂದರೆ ಹಲವು ರೋಗಗಳ ಬಾಹ್ಯ ಲಕ್ಷಣಗಳು ಒಂದೇ ರೀತಿಯಿರುತ್ತವೆ.\n\n**ಕ್ರಮಗಳು:** ತಕ್ಷಣ ಜೈವಿಕ ಬೇವಿನ ಎಣ್ಣೆ (3 ಮಿ.ಲೀ/ಲೀ) ಸಿಂಪಡಿಸಿ. ನಿಖರ ತಪಾಸಣೆಗಾಗಿ ಎಲೆಯ ಮಾದರಿಯನ್ನು ಸಮೀಪದ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ (RSK) ಅಥವಾ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರಕ್ಕೆ (KVK) ತೋರಿಸಿ ಸಲಹೆ ಪಡೆಯಿರಿ.`
      : `Based on leaf symptom analysis: visual symptoms such as necrotic leaf spots, chlorosis (yellowing), or leaf margin curling generally point to fungal blight, sucking pest damage, or micronutrient deficiencies.\n\n**Diagnostic Uncertainty Note:** Visual inspection alone cannot replace laboratory microscopic diagnosis, as multiple plant pathogens produce overlapping symptoms.\n\n**Practical Next Steps:** Isolate severely affected plants and apply a safe bio-protectant such as Neem Oil 10,000 PPM (3 ml/L) or *Trichoderma viride*. Bring a fresh leaf sample to your local Krishi Vigyan Kendra (KVK) or Raitha Samparka Kendra for physical verification before applying heavy chemicals.`;
  }

  // 12. HARVESTING & STORAGE (Sugarcane harvest & Onion storage)
  if (q.includes('harvest') && q.includes('sugarcane') && (q.includes('onion') || q.includes('store'))) {
    return isKannada
      ? `ಕಬ್ಬನ್ನು ಬಿತ್ತಿದ 11-12 ತಿಂಗಳಿಗೆ (ಬ್ರಿಕ್ಸ್ ಮೀಟರ್‌ನಲ್ಲಿ ಸಕ್ಕರೆ ಅಂಶ 18-20% ತಲುಪಿದಾಗ) ನೆಲಮಟ್ಟಕ್ಕೆ ಸಮನಾಗಿ ಕಟಾವು ಮಾಡಬೇಕು. ಈರುಳ್ಳಿಯನ್ನು ಚೆನ್ನಾಗಿ ಒಣಗಿಸಿ, ಕತ್ತಿನ ಭಾಗವನ್ನು 2-3 ಸೆಂ.ಮೀ ಬಿಟ್ಟು ಕತ್ತರಿಸಿ, ಉತ್ತಮ ಗಾಳಿಯಾಡುವ ಮರದ ಕಪಾಟುಗಳಲ್ಲಿ (Onion Chawl) ಶೇಖರಿಸಬೇಕು.`
      : `Harvest sugarcane at 11-12 months when the hand refractometer brix reading reaches 18-20%, cutting flush to ground level. For onions, cure the bulbs under shade for 10-15 days, trim foliage leaving 2-3 cm neck, and store in well-ventilated raised bamboo/wooden storage structures (chawls) with low humidity.`;
  }

  // 13. FARM ECONOMICS (Trader calculation)
  const numMatches = message.match(/(\d+[\d,]*)/g);
  if ((q.includes('trader') || q.includes('offer') || q.includes('produced') || q.includes('kg') || q.includes('tonne') || q.includes('ton') || q.includes('ಬೆಲೆ') || q.includes('ವರ್ತಕ') || q.includes('ಲೆಕ್ಕ')) && numMatches && numMatches.length >= 2) {
    const qty = parseFloat(numMatches[0].replace(/,/g, ''));
    const rate = parseFloat(numMatches[1].replace(/,/g, ''));
    if (!isNaN(qty) && !isNaN(rate) && qty > 0 && rate > 0) {
      const total = qty * rate;
      return isKannada
        ? `💰 **ಬೆಳೆ ಮಾರಾಟ ಲೆಕ್ಕಾಚಾರ:** ${qty} ಕೆಜಿ × ₹${rate}/ಕೆಜಿ = **₹${total.toLocaleString('en-IN')}** ಒಟ್ಟು ಮೊತ್ತ.\n\n**ವಿಶ್ಲೇಷಣೆ:** ಈ ದರವು ನಿಮ್ಮ ಬೀಜ, ಗೊಬ್ಬರ, ಕೀಟನಾಶಕ ಹಾಗೂ ಕೂಲಿ ವೆಚ್ಚಗಳನ್ನು ಒಳಗೊಂಡ ಉತ್ಪಾದನಾ ವೆಚ್ಚಕ್ಕಿಂತ (Cost of Production) ಕನಿಷ್ಠ 25-30% ಅಧಿಕ ಲಾಭ ನೀಡುತ್ತದೆಯೇ ಎಂದು ಲೆಕ್ಕ ಹಾಕಿ. ಸಮೀಪದ ಮಂಡಿ ದರ ಪರಿಶೀಲಿಸಿ ಮಾರಾಟ ಅಂತಿಮಗೊಳಿಸಿ.`
        : `💰 **Crop Offer Calculation:** ${qty} units × ₹${rate}/unit = **₹${total.toLocaleString('en-IN')}** gross value.\n\n**Analysis:** Evaluate whether this offer covers your cost of cultivation (seeds, fertilizers, irrigation, labour, and transport) with at least a 20-30% margin. Check today's modal APMC price on Agmarknet before accepting.`;
    }
  }

  // 14. ORGANIC FARMING (Jeevamrutha, Panchagavya)
  if (q.includes('jeevamrutha') || q.includes('panchagavya') || q.includes('organic manure') || q.includes('ಜೀವಾಮೃತ') || q.includes('ಪಂಚಗವ್ಯ')) {
    return isKannada
      ? `ಜೀವಾಮೃತ ತಯಾರಿಕೆಗೆ: 200 ಲೀಟರ್ ನೀರಿನಲ್ಲಿ 10 ಕೆಜಿ ದೇಸಿ ಹಸುವಿನ ಸಗಣಿ, 10 ಲೀಟರ್ ಗೋಮೂತ್ರ, 2 ಕೆಜಿ ಬೆಲ್ಲ, 2 ಕೆಜಿ ದ್ವಿದಳ ಧಾನ್ಯದ ಹಿಟ್ಟು ಮತ್ತು 1 ಹಿಡಿ ಫಲವತ್ತಾದ ಬದುವಿನ ಮಣ್ಣನ್ನು ಬೆರೆಸಿ.\n\nದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ಬಲಗಡೆಯಿಂದ ತಿರುಗಿಸಿ 2-3 ದಿನ ನೆರಳಿನಲ್ಲಿ ಹುದುಗಿಸಿ (ferment). ಇದನ್ನು 7 ದಿನಗಳ ಒಳಗೆ ಎಕರೆಗೆ ನೀರಾವರಿ ಜೊತೆ ಹಾಯಿಸಿ.`
      : `To prepare Jeevamrutha: Mix 10 kg native cow dung, 10 L cow urine, 2 kg jaggery, 2 kg pulse flour (besan), and a handful of fertile soil in 200 L of water.\n\nStir clockwise twice daily and ferment in shade for 48-72 hours. Apply through irrigation water within 7-8 days to enrich beneficial soil microbes.`;
  }

  // 15. FARM LABOUR & MACHINERY
  if (q.includes('labour') || q.includes('worker') || q.includes('wage') || q.includes('ಕೂಲಿ') || q.includes('ಆಳು')) {
    return isKannada
      ? `ಕರ್ನಾಟಕದಲ್ಲಿ ಕೃಷಿ ಕಾರ್ಮಿಕರ ದಿನಗೂಲಿ ದರ ಸಾಮಾನ್ಯವಾಗಿ ದಿನಕ್ಕೆ ₹550 ರಿಂದ ₹800 ರವರೆಗೆ (ಕಾರ್ಯ ಮತ್ತು ಪ್ರದೇಶದ ಆಧಾರದ ಮೇಲೆ) ಇರುತ್ತದೆ. ಕಟಾವು ಅಥವಾ ಕಳೆ ಕೀಳುವ ಕೆಲಸಗಳಿಗೆ ಕೌಶಲ್ಯಯುತ ಕಾರ್ಮಿಕರನ್ನು ನೇಮಿಸಲು ರೈತಸೇತು 'Farm Workforce' ವಿಭಾಗವನ್ನು ಬಳಸಿ.`
      : `Typical daily agricultural labour wages in Karnataka range from ₹550 to ₹800/day depending on the task (harvesting, land preparation, transplanting) and district. Use the RaithaSetu Workforce module to find available workers.`;
  }

  if (q.includes('machinery') || q.includes('tractor') || q.includes('rotavator') || q.includes('ಯಂತ್ರ') || q.includes('ಟ್ರಾಕ್ಟರ್')) {
    return isKannada
      ? `3 ಎಕರೆ ಜಮೀನಿನ ಉಳುಮೆಗೆ 35-45 HP ಟ್ರಾಕ್ಟರ್ ಜೊತೆಗೆ 5 ರಿಂದ 6 ಅಡಿ ರೋಟವೇಟರ್ ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ. ಇದು ಮಣ್ಣನ್ನು ನಯವಾಗಿ ಪುಡಿಮಾಡಿ ಕಳೆಗಳನ್ನು ಮಣ್ಣಿನಲ್ಲಿ ಬೆರೆಸುತ್ತದೆ.`
      : `For 3 acres of land preparation, a 35 to 45 HP tractor coupled with a 5 to 6-foot rotavator is ideal for efficient ploughing, weed incorporation, and fine seedbed preparation.`;
  }

  // DEFAULT COMPREHENSIVE HELPER
  return isKannada
    ? `ರೈತಮಿತ್ರ ಎಐ ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ್ಕೆ ಸಿದ್ಧವಾಗಿದೆ. ಬೆಳೆ ನಿರ್ವಹಣೆ, ಮಣ್ಣಿನ ಫಲವತ್ತತೆ, ರಸಗೊಬ್ಬರಗಳ ಬಳಕೆ, ಕೀಟ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ, ಬಿತ್ತನೆ ಸಮಯ ಅಥವಾ ನೀರಾವರಿ ಕುರಿತು ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.`
    : `RaithaMitra AI is ready to assist you. Ask any specific question regarding crop health, soil testing, fertilizer doses, pest/disease management, sowing schedules, or irrigation methods.`;
};

/**
 * Main AI Chat Controller
 * Endpoint: POST /api/ai/chat
 */
exports.chatWithAI = async (req, res) => {
  try {
    const { message, language, location, history, image } = req.body;

    if (!message && !image) {
      return res.status(400).json({ success: false, error: 'Message or image content is required' });
    }

    const isKannada = language === 'kn' || /[\u0C80-\u0CFF]/.test(message || '');
    const userLocation = location || 'Karnataka, India';
    const geminiKey = process.env.GEMINI_API_KEY;

    // Optional context from database
    let dbContextText = '';
    const qLower = (message || '').toLowerCase();

    try {
      if (qLower.includes('seed') || qLower.includes('fertilizer') || qLower.includes('pesticide') || qLower.includes('store') || qLower.includes('product') || qLower.includes('ಬೀಜ') || qLower.includes('ಗೊಬ್ಬರ') || qLower.includes('ಅಂಗಡಿ')) {
        if (AgroProduct.db && AgroProduct.db.readyState === 1) {
          const products = await AgroProduct.find({}).limit(4).select('title category price unit inStock').lean();
          if (products.length > 0) {
            dbContextText += `\n[Verified Agro Store Products]: ${products.map(p => `${p.title} (₹${p.price}/${p.unit || 'unit'})`).join(', ')}`;
          }
        }
      }

      if (qLower.includes('trader') || qLower.includes('sell') || qLower.includes('market') || qLower.includes('crop') || qLower.includes('ವರ್ತಕ') || qLower.includes('ಮಾರಾಟ')) {
        if (CropListing.db && CropListing.db.readyState === 1) {
          const crops = await CropListing.find({ status: 'ACTIVE' }).limit(3).select('cropName quantity pricePerUnit location').lean();
          if (crops.length > 0) {
            dbContextText += `\n[Active Market Crop Listings]: ${crops.map(c => `${c.cropName}: ₹${c.pricePerUnit}`).join(', ')}`;
          }
        }
      }
    } catch (dbErr) {
      console.warn('Context lookup warning:', dbErr.message);
    }

    let responseText = '';

    // Attempt Gemini API call if key is present
    if (geminiKey && geminiKey.trim().length > 5) {
      const modelCandidates = [
        process.env.GEMINI_MODEL,
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest'
      ].filter(Boolean);

      // Build system prompt
      const fullSystemPrompt = `${RAITHAMITRA_SYSTEM_INSTRUCTION}\n\nFarmer Location: ${userLocation}\nResponse Language: ${isKannada ? 'Kannada' : 'English'}${dbContextText}`;

      // Build and sanitize contents for Gemini API (must alternate user and model, starting with user)
      const formattedContents = [];

      if (Array.isArray(history) && history.length > 0) {
        const sanitizedHistory = [];
        for (const h of history.slice(-6)) {
          const text = (h.text || h.content || '').trim();
          if (!text) continue;
          const role = (h.sender === 'user' || h.role === 'user') ? 'user' : 'model';

          if (sanitizedHistory.length === 0 && role !== 'user') {
            continue; // first turn must be user
          }

          if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === role) {
            sanitizedHistory[sanitizedHistory.length - 1].parts[0].text += `\n${text}`;
          } else {
            sanitizedHistory.push({ role, parts: [{ text }] });
          }
        }
        formattedContents.push(...sanitizedHistory);
      }

      // Add current user prompt
      const currentParts = [];
      if (message && message.trim()) {
        currentParts.push({ text: message.trim() });
      } else {
        currentParts.push({ text: 'Analyze this crop leaf image, explain likely issues, visual uncertainty, and practical next steps.' });
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

      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === 'user') {
        formattedContents[formattedContents.length - 1].parts.push(...currentParts);
      } else {
        formattedContents.push({ role: 'user', parts: currentParts });
      }

      for (const model of modelCandidates) {
        if (responseText) break;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 25000);

          const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: fullSystemPrompt }]
              },
              contents: formattedContents,
              generationConfig: {
                temperature: 0.25,
                maxOutputTokens: 1000
              }
            })
          });

          clearTimeout(timeoutId);

          if (apiRes.status === 200) {
            const data = await apiRes.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
              responseText = data.candidates[0].content.parts.map(p => p.text).join('\n').trim();
            }
          } else {
            const errBody = await apiRes.text();
            console.warn(`Gemini model ${model} status ${apiRes.status}:`, errBody.substring(0, 150));
          }
        } catch (apiErr) {
          console.warn(`Gemini model ${model} fetch failed:`, apiErr.message);
          if (apiErr.name === 'AbortError') {
            break; // Don't delay user on network timeout; fall back to knowledge engine immediately
          }
        }
      }
    }

    // Comprehensive Knowledge Fallback Engine if Gemini is offline, rate-limited, or unavailable
    if (!responseText) {
      responseText = queryKnowledgeEngine(message || '', isKannada, { dbContextText }, history);
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

/**
 * Diagnostic Fertilizer / Pesticide Recommendation
 * Endpoint: POST /api/ai/fertilizer-recommendation
 */
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
      reason: `Based on your crop (${crop}) and growth stage (${growthStage}), balanced nitrogen-phosphorus-potassium supports healthy root proliferation and canopy development.`
    };

    if (problemDescription && (problemDescription.toLowerCase().includes('pest') || problemDescription.toLowerCase().includes('worm') || problemDescription.toLowerCase().includes('yellow'))) {
      recommendation.recommendedNutrient = 'Neem Oil Concentrate (10000 PPM) + Bio-Fungicide';
      recommendation.dosage = '3 ml per liter of water';
      recommendation.generalGuidance = 'Foliar spray recommended every 7-10 days until pest population reduces. Spray undersides of leaves.';
      recommendation.reason = 'Symptoms indicate leaf sucking pests or early fungal leaf spots. Organic neem oil breaks pest life cycles safely without harming beneficial predators.';
    }

    let matchingProducts = [];
    try {
      if (AgroProduct.db && AgroProduct.db.readyState === 1) {
        matchingProducts = await AgroProduct.find({
          category: { $in: ['fertilizers', 'pesticides'] }
        }).limit(4);
      }
    } catch (e) {
      console.warn('AgroProduct lookup error:', e.message);
    }

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
