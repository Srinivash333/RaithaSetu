/**
 * Full Parallel Verification Test Suite for RaithaMitra AI Chatbox
 * Tests all 22 real-world agricultural queries concurrently across all mandatory domains in English & Kannada
 */

const BASE_URL = 'http://localhost:5000/api/ai/chat';

const testCases = [
  { id: 1, name: 'Crops (Paddy)', query: 'my paddy is not growing properly, what should I do?', lang: 'en' },
  { id: 2, name: 'Seeds & Variety', query: 'which seed is good for brinjal in red soil?', lang: 'en' },
  { id: 3, name: 'Fertilizer & NPK', query: 'what fertilizer should I use for ragi at vegetative stage?', lang: 'en' },
  { id: 4, name: 'Pesticide for Rice Stem Borer', query: 'what pesticide for rice stem borer?', lang: 'en' },
  { id: 5, name: 'Pest Control (Aphids)', query: 'how can I control aphids in my crop?', lang: 'en' },
  { id: 6, name: 'Crop Diseases (Tomato leaf curling)', query: 'my tomato leaves are curling and showing yellow spots', lang: 'en' },
  { id: 7, name: 'Organic Farming (Jeevamrutha)', query: 'how to prepare Jeevamrutha organic manure?', lang: 'en' },
  { id: 8, name: 'Water & Drip Irrigation', query: 'how much water does ragi need and is drip irrigation suitable?', lang: 'en' },
  { id: 9, name: 'Soil Preparation & Health', query: 'how to improve soil fertility and correct soil pH?', lang: 'en' },
  { id: 10, name: 'Weather Guidance', query: 'what should I do for tomato crops during heavy rainfall?', lang: 'en' },
  { id: 11, name: 'Farm Economics (Trader Math)', query: 'I produced 500 kg tomato and trader offers ₹20/kg. Is it good?', lang: 'en' },
  { id: 12, name: 'Trader Negotiation', query: 'how to negotiate with trader when selling 2 tonnes of paddy?', lang: 'en' },
  { id: 13, name: 'Agro Store Guidance', query: 'where can I get certified tomato seeds and biofertilizers?', lang: 'en' },
  { id: 14, name: 'Farm Labour & Wages', query: 'what is the daily wage rate for paddy harvesting labour in Mandya?', lang: 'en' },
  { id: 15, name: 'Farm Machinery', query: 'what tractor or rotavator is suitable for 3 acres land preparation?', lang: 'en' },
  { id: 16, name: 'Harvesting & Storage', query: 'when should I harvest sugarcane and how to store onion?', lang: 'en' },
  { id: 17, name: 'Intelligent Follow-up Question', query: 'best pesticide for tomato?', lang: 'en' },
  { id: 18, name: 'Simple Question Depth', query: 'what is NPK?', lang: 'en' },
  {
    id: 19,
    name: 'Multi-Turn Conversation Memory',
    query: 'leaves have dark spots',
    lang: 'en',
    history: [
      { sender: 'user', text: 'I am growing tomato.' },
      { sender: 'ai', text: 'Great! How old is your tomato crop?' },
      { sender: 'user', text: 'It is 40 days old.' }
    ]
  },
  { id: 20, name: 'Kannada Pest Query', query: 'ನನ್ನ ಭತ್ತಕ್ಕೆ ಹುಳು ಬಂದಿದೆ', lang: 'kn' },
  { id: 21, name: 'Kannada Fertilizer Query', query: 'ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕು?', lang: 'kn' },
  { id: 22, name: 'Kannada Soil Query', query: 'ಮಣ್ಣಿನ ಫಲವತ್ತತೆಯನ್ನು ಹೇಗೆ ಹೆಚ್ಚಿಸಬೇಕು?', lang: 'kn' }
];

async function runTestCase(tc) {
  const payload = {
    message: tc.query,
    language: tc.lang,
    location: 'Mandya, Karnataka',
    history: tc.history || []
  };

  const startTime = Date.now();
  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const duration = Date.now() - startTime;
    const data = await res.json();

    if (res.status === 200 && data.success && data.reply && data.reply.trim().length > 10) {
      console.log(`[PASS #${tc.id}] ${tc.name} (${duration}ms)`);
      console.log(`   Reply: "${data.reply.substring(0, 120).replace(/\n/g, ' ')}..."\n`);
      return true;
    } else {
      console.error(`[FAIL #${tc.id}] ${tc.name} - Status: ${res.status}, Error:`, data.error || 'Empty reply\n');
      return false;
    }
  } catch (err) {
    console.error(`[FAIL #${tc.id}] ${tc.name} - Network/Server Error:`, err.message, '\n');
    return false;
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('  STARTING RAITHAMITRA AI CHATBOX PARALLEL SUITE');
  console.log('====================================================\n');

  const results = await Promise.all(testCases.map(tc => runTestCase(tc)));
  let passed = 0;
  let failed = 0;

  results.forEach(res => {
    if (res) passed++;
    else failed++;
  });

  console.log('====================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED out of ${testCases.length} TESTS`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
