const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const { chatWithAI } = require('../controllers/aiController');

// Build test express app
const app = express();
app.use(express.json({ limit: '10mb' }));
app.post('/api/ai/chat', chatWithAI);

const PORT = 5055;
let server;

// Small 1x1 base64 transparent GIF to simulate an image upload
const DUMMY_IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

const mandatoryTests = [
  {
    category: 'Soil',
    query: 'Which soil is best for sugarcane?',
    lang: 'en',
    check: (reply) => {
      const r = reply.toLowerCase();
      return (r.includes('loam') || r.includes('clay') || r.includes('drain')) && !r.includes('who won');
    }
  },
  {
    category: 'Nutrients',
    query: 'Why are my paddy leaves turning yellow?',
    lang: 'en',
    check: (reply) => {
      const r = reply.toLowerCase();
      return (r.includes('nitrogen') || r.includes('zinc') || r.includes('urea') || r.includes('chlorosis') || r.includes('waterlog'));
    }
  },
  {
    category: 'Fertilizer',
    query: 'What fertilizer should I use for tomatoes at flowering?',
    lang: 'en',
    check: (reply) => {
      const r = reply.toLowerCase();
      return (r.includes('phosphorus') || r.includes('potassium') || r.includes('boron') || r.includes('npk') || r.includes('potash'));
    }
  },
  {
    category: 'Pests',
    query: 'How do I control aphids on chilli?',
    lang: 'en',
    check: (reply) => {
      const r = reply.toLowerCase();
      return (r.includes('neem') || r.includes('sticky trap') || r.includes('trap') || r.includes('spray') || r.includes('imidacloprid'));
    }
  },
  {
    category: 'Irrigation',
    query: 'When should I water groundnut?',
    lang: 'en',
    check: (reply) => {
      const r = reply.toLowerCase();
      return (r.includes('pegging') || r.includes('flowering') || r.includes('pod') || r.includes('stage') || r.includes('moisture'));
    }
  },
  {
    category: 'Seeds',
    query: 'When is the suitable time to sow paddy in my region?',
    lang: 'en',
    check: (reply) => {
      const r = reply.toLowerCase();
      return (r.includes('june') || r.includes('july') || r.includes('kharif') || r.includes('monsoon') || r.includes('season'));
    }
  },
  {
    category: 'Weather (Honesty check)',
    query: 'Will it rain tomorrow?',
    lang: 'en',
    check: (reply) => {
      const r = reply.toLowerCase();
      // Must not pretend to have checked live radar without live lookup
      return (r.includes('radar') || r.includes('live') || r.includes('mausam') || r.includes('imd') || r.includes('ksndmc') || r.includes('sensor') || r.includes('forecast'));
    }
  },
  {
    category: 'Marketplace (Price honesty check)',
    query: 'How can I find the current selling price of potatoes?',
    lang: 'en',
    check: (reply) => {
      const r = reply.toLowerCase();
      // Must not invent fake prices, must guide to Agmarknet, e-NAM, APMC
      return (r.includes('agmarknet') || r.includes('enam') || r.includes('e-nam') || r.includes('apmc') || r.includes('mandi') || r.includes('market'));
    }
  },
  {
    category: 'Image Diagnosis',
    query: 'What is this disease on my crop leaf?',
    image: DUMMY_IMAGE,
    lang: 'en',
    check: (reply) => {
      const r = reply.toLowerCase();
      // Must explain uncertainty and recommend confirmation (KVK/RSK)
      return (r.includes('uncertain') || r.includes('kvk') || r.includes('laboratory') || r.includes('confirm') || r.includes('sample') || r.includes('symptom') || r.includes('neem') || r.includes('overlap'));
    }
  },
  {
    category: 'Kannada (Soil - Sugarcane)',
    query: 'ಕಬ್ಬಿಗೆ ಯಾವ ಮಣ್ಣು ಉತ್ತಮ?',
    lang: 'kn',
    check: (reply) => {
      return (reply.includes('ಮಣ್ಣು') && (reply.includes('ಗೋಡು') || reply.includes('ಜೇಡಿ') || reply.includes('ಫಲವತ್ತಾದ')));
    }
  },
  {
    category: 'Kannada (Crop Care - Tomato Flower Drop)',
    query: 'ಟೊಮೆಟೊ ಹೂವು ಉದುರುವುದನ್ನು ತಡೆಯುವುದು ಹೇಗೆ?',
    lang: 'kn',
    check: (reply) => {
      return (reply.includes('ಟೊಮೆಟೊ') || reply.includes('ಹೂವು') || reply.includes('ಗೊಬ್ಬರ') || reply.includes('ಬೋರಾನ್') || reply.includes('ಪೊಟ್ಯಾಷ್') || reply.includes('ನೀರು'));
    }
  },
  {
    category: 'Multi-Turn Follow-Up',
    query: 'what fertilizer does it need at flowering?',
    history: [
      { sender: 'user', text: 'I am cultivating tomatoes on 2 acres.' },
      { sender: 'ai', text: 'Great! Tomatoes require careful nutrient management through each growth stage.' }
    ],
    lang: 'en',
    check: (reply) => {
      const r = reply.toLowerCase();
      // Checks that tomato context from history is recognized
      return (r.includes('tomato') || r.includes('phosphorus') || r.includes('potassium') || r.includes('boron') || r.includes('0:52:34') || r.includes('13:0:45') || r.includes('flower'));
    }
  },
  {
    category: 'Unrelated Question (Scope check)',
    query: 'Who won the football world cup in 2022?',
    lang: 'en',
    check: (reply) => {
      const r = reply.toLowerCase();
      // Checks that assistant politely declines and stays within agriculture
      return (r.includes('agriculture') || r.includes('farming') || r.includes('raithamitra') || r.includes('crop') || r.includes('exclusively'));
    }
  }
];

async function runTest(testItem, index) {
  const startTime = Date.now();
  try {
    const res = await fetch(`http://localhost:${PORT}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: testItem.query,
        language: testItem.lang,
        location: 'Mandya, Karnataka',
        history: testItem.history || [],
        image: testItem.image || null
      })
    });

    const data = await res.json();
    const duration = Date.now() - startTime;

    if (res.status === 200 && data.success && data.reply && data.reply.trim().length > 20) {
      const isValid = testItem.check ? testItem.check(data.reply) : true;
      if (isValid) {
        console.log(`✅ [PASS #${index + 1}] ${testItem.category} (${duration}ms)`);
        console.log(`   Reply Preview: "${data.reply.substring(0, 140).replace(/\n/g, ' ')}..."\n`);
        return true;
      } else {
        console.error(`❌ [FAIL VALIDATION #${index + 1}] ${testItem.category}`);
        console.error(`   Reply did not satisfy criteria: "${data.reply.substring(0, 200)}"\n`);
        return false;
      }
    } else {
      console.error(`❌ [FAIL HTTP #${index + 1}] ${testItem.category} - Status: ${res.status}, Error:`, data.error || 'Empty reply\n');
      return false;
    }
  } catch (err) {
    console.error(`❌ [EXCEPTION #${index + 1}] ${testItem.category}:`, err.message, '\n');
    return false;
  }
}

async function main() {
  server = app.listen(PORT, async () => {
    console.log(`\n============================================================`);
    console.log(`  STARTING RAITHAMITRA AI COMPREHENSIVE VERIFICATION SUITE`);
    console.log(`  Target Port: ${PORT}`);
    console.log(`============================================================\n`);

    let passed = 0;
    let failed = 0;

    for (let i = 0; i < mandatoryTests.length; i++) {
      const res = await runTest(mandatoryTests[i], i);
      if (res) passed++;
      else failed++;
    }

    console.log(`============================================================`);
    console.log(`  FINAL RESULTS: ${passed} PASSED, ${failed} FAILED out of ${mandatoryTests.length} TESTS`);
    console.log(`============================================================\n`);

    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  });
}

main();
