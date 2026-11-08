const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAIHealth, forecastDonations, predictCampaignSuccess, detectAnomalies, nlpAssistant } = require('../controllers/aiController');

router.get('/health', getAIHealth);
router.post('/forecast-donations', protect, forecastDonations);
router.post('/predict-campaign', protect, predictCampaignSuccess);
router.post('/detect-anomalies', protect, detectAnomalies);
router.post('/assistant', protect, nlpAssistant);

module.exports = router;
