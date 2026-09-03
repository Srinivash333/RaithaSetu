const AgroProduct = require('../models/AgroProduct');
const WorkerProfile = require('../models/WorkerProfile');
const CropListing = require('../models/CropListing');
const TraderProfile = require('../models/TraderProfile');

const RAITHAMITRA_SYSTEM_INSTRUCTION = `You are RaithaMitra, an AI agricultural assistant for farmers.

CRITICAL INSTRUCTIONS FOR SPEED AND DIRECT ANSWERS:
1. ANSWER DIRECTLY: Provide a short, direct answer to the user's exact question in the very first sentence. Never repeat the user's question, and do NOT start with long greetings or generic introductions.
2. CONCISE & SIMPLE: Keep answers simple, short, clear, and practical for farmers (2 to 4 sentences or a few brief bullet points). Avoid long explanations, generic farming advice, or excessive headings.
3. LANGUAGE MATCHING: If the user asks in English, answer strictly in simple English. If the user asks in Kannada, answer strictly in simple Kannada. Never mix languages.
4. TARGETED ANSWERS:
   - For paddy vegetative stage fertilizer: state that nitrogen fertilizer such as urea is commonly used to support leaf and tiller growth, and recommend applying based on soil test guidance.
   - For tomato watering: state watering frequency directly (e.g. deep watering every 2 to 3 days or 1 to 1.5 inches per week based on soil moisture).
   - For tomato fertilizer: state using balanced NPK early on, and higher phosphorus/potassium during flowering/fruiting.
5. CROP & IMAGE ANALYSIS: If an image or crop disease is provided, identify the likely issue concisely and suggest safe practical next steps.
6. NO UNRELATED INFO: Do not add unrelated agricultural information or fake chemical dosages. Keep cautions brief.`;

/**
 * Enhanced Agricultural Knowledge Fallback Engine
 * Provides structured, direct, concise responses in English and Kannada for offline / fallback scenarios
 */
const queryKnowledgeEngine = (message, isKannada, contextData = {}) => {
  const q = message.toLowerCase();

  // 1. SPECIFIC HIGH-FREQUENCY DIRECT ANSWERS
  if (q.includes('paddy') && (q.includes('vegetative') || q.includes('growing')) && (q.includes('fertilizer') || q.includes('gobbara'))) {
    return isKannada
      ? `ಭತ್ತದ ಸಸ್ಯಕ ಹಂತದಲ್ಲಿ ಎಲೆ ಮತ್ತು ಕಂಪುಗಳ (ತಿಲ್ಲರ್) ಸಮೃದ್ಧ ಬೆಳವಣಿಗೆಗೆ ಯೂರಿಯಾದಂತಹ ಸಾರಜನಕ (Nitrogen) ಗೊಬ್ಬರ ಸೂಕ್ತವಾಗಿದೆ. ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಆಧಾರದ ಮೇಲೆ ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಮಾಣದಲ್ಲಿ ನೀಡಿ.`
      : `For paddy in the vegetative stage, nitrogen fertilizer such as urea is commonly used to support leaf and tiller growth. Apply the recommended dose based on your soil test and local agricultural guidance.`;
  }

  if (q.includes('tomato') && (q.includes('water') || q.includes('irriga') || q.includes('neeru'))) {
    return isKannada
      ? `ಟೊಮೆಟೊ ಬೆಳೆಗಳಿಗೆ ಮಣ್ಣಿನ ತೇವಾಂಶ ನೋಡಿ 2 ರಿಂದ 3 ದಿನಗಳಿಗೊಮ್ಮೆ ಆಳವಾಗಿ ನೀರು ಹಾಯಿಸಬೇಕು (ವಾರಕ್ಕೆ 1 ರಿಂದ 1.5 ಇಂಚು ನೀರು). ಅತಿಯಾದ ನೀರು ಬೇರು ಕೊಳೆಯುವಿಕೆಗೆ ಕಾರಣವಾಗಬಹುದು.`
      : `Tomato plants generally need deep watering every 2 to 3 days (about 1 to 1.5 inches of water per week). Adjust frequency based on soil dryness and weather to prevent root rot.`;
  }

  if (q.includes('tomato') && (q.includes('fertilizer') || q.includes('gobbara'))) {
    return isKannada
      ? `ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಆರಂಭಿಕ ಹಂತದಲ್ಲಿ ಸಮತೋಲಿತ NPK (19:19:19) ಮತ್ತು ಹೂವು/ಕಾಯಿ ಬಿಡುವ ಹಂತದಲ್ಲಿ ಹೆಚ್ಚಿನ ರಂಜಕ ಹಾಗೂ ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡುವುದು ಉತ್ತಮ.`
      : `For tomatoes, apply a balanced NPK fertilizer (such as 10-10-10 or 19:19:19) during early growth, and switch to a higher phosphorus and potassium fertilizer during flowering and fruiting to support fruit development.`;
  }

  // Extract numbers for math calculations (e.g., "500 kg tomato and trader offers 20/kg")
  const numMatches = message.match(/(\d+[\d,]*)/g);

  // 2. FARM ECONOMICS & TRADER NEGOTIATION CALCULATIONS
  if ((q.includes('trader') || q.includes('offer') || q.includes('produced') || q.includes('kg') || q.includes('tonne') || q.includes('ton') || q.includes('ಬೆಲೆ') || q.includes('ವರ್ತಕ') || q.includes('ಮಾರಾಟ') || q.includes('ಲೆಕ್ಕ')) && numMatches && numMatches.length >= 2) {
    const qty = parseFloat(numMatches[0].replace(/,/g, ''));
    const rate = parseFloat(numMatches[1].replace(/,/g, ''));
    if (!isNaN(qty) && !isNaN(rate) && qty > 0 && rate > 0) {
      const total = qty * rate;
      return isKannada
        ? `💰 **ಬೆಳೆ ಮಾರಾಟ ಲೆಕ್ಕಾಚಾರ:** ${qty} ಕೆಜಿ × ₹${rate}/ಕೆಜಿ = **₹${total.toLocaleString('en-IN')}**. ಈ ಬೆಲೆ ನಿಮ್ಮ ಉತ್ಪಾದನಾ ವೆಚ್ಚವನ್ನು ಪೂರೈಸುತ್ತದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.`
        : `💰 **Crop Offer Calculation:** ${qty} units × ₹${rate}/unit = **₹${total.toLocaleString('en-IN')}**. Verify if this covers your input and labor costs before finalizing.`;
    }
  }

  // 3. PESTICIDE & PEST CONTROL
  if (q.includes('pesticide') || q.includes('pest') || q.includes('stem borer') || q.includes('borer') || q.includes('whitefly') || q.includes('aphid') || q.includes('thrip') || q.includes('worm') || q.includes('ಕೀಟ') || q.includes('ಹುಳು') || q.includes('ಔಷಧಿ') || q.includes('ಕೀಟನಾಶಕ')) {
    if (q.includes('tomato') || q.includes('ಟೊಮೆಟೊ') || q.includes('ಟೊಮ್ಯಾಟೊ')) {
      return isKannada
        ? `ಟೊಮೆಟೊ ಹುಳು ಮತ್ತು ಕೀಟ ನಿಯಂತ್ರಣಕ್ಕೆ 10,000 PPM ನೀಮ್ ಎಣ್ಣೆ (3 ಮಿ.ಲೀ/ಲೀ ನೀರು) ಸಿಂಪಡಿಸಿ. ತೀವ್ರ ಸಮಸ್ಯೆಗೆ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿ ಸಲಹೆ ಪಡೆಯಿರಿ.`
        : `For tomato pest control, spray 10,000 PPM Neem Oil at 3ml per liter of water. For severe infestations, consult a local agri-officer for recommended sprays.`;
    }
    return isKannada
      ? `ಕೀಟ ಬಾಧೆಗೆ ನೀಮ್ ಎಣ್ಣೆ ಸಿಂಪರಣೆ (3ml/L) ಅಥವಾ ಫೆರಮೋನ್ ಟ್ರ್ಯಾಪ್ ಬಳಸಿ. ರಾಸಾಯನಿಕ ಕೀಟನಾಶಕ ಬಳಸುವ ಮುನ್ನ ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.`
      : `For sucking pests, spray Neem oil solution (3ml/L) or set up pheromone traps. Always strictly follow chemical product label instructions.`;
  }

  // 4. CROP DISEASES (Fungal, Bacterial, Viral, Leaf Spot, Blight)
  if (q.includes('disease') || q.includes('blight') || q.includes('wilt') || q.includes('spot') || q.includes('curl') || q.includes('fungus') || q.includes('ರೋಗ') || q.includes('ಮಚ್ಚೆ') || q.includes('ಚುಕ್ಕೆ') || q.includes('ಉದುರುವುದು')) {
    return isKannada
      ? `ಎಲೆ ಚುಕ್ಕೆ ಅಥವಾ ಶಿಲೀಂಧ್ರ ರೋಗಕ್ಕೆ ಗಾಳಿ ಚಲನೆ ಹೆಚ್ಚಿಸಿ ಮತ್ತು ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ಜೈವಿಕ ಪರಿಹಾರವಾಗಿ ಟ್ರೈಕೋಡರ್ಮಾ ಬಳಸಿ.`
      : `For leaf spot or blight symptoms, improve field drainage and avoid over-watering. Apply Trichoderma viride or recommended fungicide.`;
  }

  // 5. GENERAL FERTILIZER & SOIL NUTRITION
  if (q.includes('fertilizer') || q.includes('npk') || q.includes('urea') || q.includes('dap') || q.includes('potash') || q.includes('micronutrient') || q.includes('ಗೊಬ್ಬರ') || q.includes('ಪೋಷಕಾಂಶ')) {
    return isKannada
      ? `ಬಿತ್ತನೆ ವೇಳೆ ಮೂಲ ಗೊಬ್ಬರವಾಗಿ DAP/NPK ನೀಡಿ. ಬೆಳವಣಿಗೆ ಹಂತದಲ್ಲಿ ಯೂರಿಯಾ ಹಾಗೂ ಹೂವು/ಕಾಯಿ ಹಂತದಲ್ಲಿ ಪೊಟ್ಯಾಷ್ ಗೊಬ್ಬರ ನೀಡಿ.`
      : `Apply DAP or balanced NPK at sowing, Nitrogen (Urea) during early vegetative growth, and Potash during flowering and fruiting.`;
  }

  // 6. ORGANIC FARMING & JEEVAMRUTHA
  if (q.includes('organic') || q.includes('jeevamrutha') || q.includes('panchagavya') || q.includes('compost') || q.includes('vermicompost') || q.includes('ಜೈವಿಕ') || q.includes('ಜೀವಾಮೃತ') || q.includes('ಪಂಚಗವ್ಯ') || q.includes('ಸಾಂದ್ರ')) {
    return isKannada
      ? `ಜೀವಾಮೃತಕ್ಕೆ 10kg ಸಗಣಿ, 10L ಗಂಜಲ, 2kg ಬೆಲ್ಲ, 2kg ಹಿಟ್ಟು ಮತ್ತು 200L ನೀರನ್ನು 2-3 ದಿನ ನೆರಳಿನಲ್ಲಿ ಹುದುಗಿಸಿ ನೀರಾವರಿ ಮೂಲಕ ಹಾಯಿಸಿ.`
      : `Mix 10 kg cow dung, 10 L cow urine, 2 kg jaggery, 2 kg pulse flour in 200 L water. Ferment for 2-3 days and apply via irrigation.`;
  }

  // 7. WATER & IRRIGATION
  if (q.includes('water') || q.includes('irrigation') || q.includes('drip') || q.includes('sprinkler') || q.includes('ನೀರು') || q.includes('ನೀರಾವರಿ') || q.includes('ಹನಿ')) {
    return isKannada
      ? `ಹನಿ ನೀರಾವರಿ (Drip) ಬಳಸಿ ಶೇ 40-50% ನೀರು ಉಳಿಸಿ. ಬೆಳೆಯ ಹಂತ ಮತ್ತು ಮಣ್ಣಿನ ತೇವಾಂಶ ಆಧರಿಸಿ ನೀರು ನೀಡಿ.`
      : `Use drip irrigation to save 40-50% water and deliver nutrients directly to roots. Adjust watering based on crop stage and soil dryness.`;
  }

  // 8. SOIL HEALTH & PREPARATION
  if (q.includes('soil') || q.includes('ph') || q.includes('salinity') || q.includes(' fertility') || q.includes('ಮಣ್ಣು') || q.includes('ಫಲವತ್ತತೆ')) {
    return isKannada
      ? `ಮಣ್ಣಿನ ಫಲವತ್ತತೆಗೆ ಎಕರೆಗೆ 4-5 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಸೇರಿಸಿ ಮತ್ತು ಬೇಸಿಗೆಯಲ್ಲಿ ಆಳವಾದ ಉಳುಮೆ ಮಾಡಿ. ಉತ್ತಮ pH ಪ್ರಮಾಣ 6.5 - 7.5.`
      : `Add 4-5 tonnes of organic manure per acre and perform deep summer ploughing. The ideal soil pH for most crops is 6.5 to 7.5.`;
  }

  // 9. WEATHER & CLIMATE ADVICE
  if (q.includes('weather') || q.includes('rain') || q.includes('drought') || q.includes('heat') || q.includes('ಹವಾಮಾನ') || q.includes('ಮಳೆ') || q.includes('ಬಿಸಿಲು')) {
    return isKannada
      ? `ಭಾರೀ ಮಳೆಯಿದ್ದಾಗ ಜಮೀನಿನಲ್ಲಿ ನೀರು ಹೊರಹೋಗಲು ಚರಂಡಿ ಮಾಡಿ. ಬಿಸಿಲು ಹೆಚ್ಚಿದ್ದಾಗ ತೇವಾಂಶ ಉಳಿಸಲು ಮಲ್ಚಿಂಗ್ ಬಳಸಿ.`
      : `Clear field drainage channels to handle heavy rain. During dry hot spells, use organic mulching around plants to conserve moisture.`;
  }

  // 10. FARM LABOUR & MACHINERY
  if (q.includes('labour') || q.includes('worker') || q.includes('machinery') || q.includes('tractor') || q.includes('sprayer') || q.includes('ಕೂಲಿ') || q.includes('ಆಳು') || q.includes('ಯಂತ್ರ') || q.includes('ಟ್ರಾಕ್ಟರ್')) {
    return isKannada
      ? `ಕರ್ನಾಟಕದಲ್ಲಿ ದಿನಗೂಲಿ ದರ ಅಂದಾಜು ₹550 - ₹800/ದಿನ. ರೋಟವೇಟರ್ ಮತ್ತು ಪವರ್ ಸ್ಪ್ರೇಯರ್‌ಗಳು ಸಮಯ ಹಾಗೂ ವೆಚ್ಚ ಉಳಿಸುತ್ತವೆ.`
      : `Typical daily farm labour rates range from ₹550 to ₹800/day. Using rotavators and battery sprayers helps save time and labor costs.`;
  }

  // 11. AGRO STORE PRODUCTS
  if (q.includes('seed') || q.includes('store') || q.includes('buy') || q.includes('shop') || q.includes('ಬೀಜ') || q.includes('ಅಂಗಡಿ')) {
    return isKannada
      ? `ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳು ಮತ್ತು ಕೃಷಿ ಪರಿಕರಗಳಿಗಾಗಿ ರೈತಸೇತು 'ಕೃಷಿ ಮಳಿಗೆ' (Agro Store) ವಿಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ.`
      : `Browse certified seeds, fertilizers, and farm equipment under the RaithaSetu Agro Store section for direct ordering.`;
  }

  // DEFAULT COMPREHENSIVE RESPONSE
  return isKannada
    ? `ರೈತಮಿತ್ರ ಎಐ ಸಹಾಯಕ್ಕೆ ಸಿದ್ಧವಾಗಿದೆ. ಬೆಳೆ, ಬೀಜ, ಗೊಬ್ಬರ, ಕೀಟನಾಶಕ, ಮಣ್ಣು ಅಥವಾ ನೀರಾವರಿ ಕುರಿತು ನಿಮ್ಮ ನೇರ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.`
    : `RaithaMitra AI is ready to help. Ask any direct question regarding crops, seeds, fertilizers, pest control, soil, or irrigation.`;
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

    // Attempt Gemini API call if API key exists
    if (geminiKey && geminiKey.trim().length > 5) {
      const modelCandidates = [
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-flash-latest',
        'gemini-1.5-pro'
      ];

      // Format conversation history for Gemini API payload
      const formattedContents = [];

      // Build system prompt
      const fullSystemPrompt = `${RAITHAMITRA_SYSTEM_INSTRUCTION}\n\nFarmer Location: ${userLocation}\nResponse Language: ${isKannada ? 'Kannada' : 'English'}${dbContextText}`;

      // Append recent history if provided (limit to last 4 turns for speed)
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-4).forEach(h => {
          if (h.sender === 'user' || h.role === 'user') {
            formattedContents.push({ role: 'user', parts: [{ text: h.text || h.content || '' }] });
          } else if (h.sender === 'ai' || h.role === 'model') {
            formattedContents.push({ role: 'model', parts: [{ text: h.text || h.content || '' }] });
          }
        });
      }

      // Add current user prompt
      const currentParts = [];
      if (message) {
        currentParts.push({ text: message });
      } else {
        currentParts.push({ text: `Analyze this crop image and identify issues or provide agricultural guidance.` });
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
          // Send request with systemInstruction and generationConfig for fast output
          const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: fullSystemPrompt }]
              },
              contents: formattedContents,
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 250
              }
            })
          });

          const data = await apiRes.json();
          if (apiRes.status === 200 && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            responseText = data.candidates[0].content.parts.map(p => p.text).join('\n');
          } else {
            // Fallback request without systemInstruction field if older API format needed
            const fallbackRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  { role: 'user', parts: [{ text: `[System Instruction: ${fullSystemPrompt}]\n\nFarmer Question: ${message || 'Analyze crop image.'}` }] }
                ],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 250
                }
              })
            });
            const fallbackData = await fallbackRes.json();
            if (fallbackRes.status === 200 && fallbackData.candidates && fallbackData.candidates[0] && fallbackData.candidates[0].content && fallbackData.candidates[0].content.parts) {
              responseText = fallbackData.candidates[0].content.parts.map(p => p.text).join('\n');
            }
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
