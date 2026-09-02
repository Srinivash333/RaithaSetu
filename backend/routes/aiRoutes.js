const express = require('express');
const router = express.Router();
const { chatWithAI, recommendFertilizerOrPesticide } = require('../controllers/aiController');

router.post('/chat', chatWithAI);
router.post('/fertilizer-recommendation', recommendFertilizerOrPesticide);

module.exports = router;
