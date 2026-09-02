const express = require('express');
const router = express.Router();
const { sendCropMessage, getCropMessages } = require('../controllers/cropMessageController');
const { protect } = require('../middleware/auth');

router.post('/', protect, sendCropMessage);
router.get('/crop/:cropId/trader/:traderId', protect, getCropMessages);

module.exports = router;
