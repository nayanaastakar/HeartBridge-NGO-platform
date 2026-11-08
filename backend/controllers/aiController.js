const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const http = require('http');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';

function callAI(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const url = new URL(path, AI_SERVICE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = http.request(options, res => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('AI service returned invalid JSON')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const getAIHealth = asyncHandler(async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const url = new URL('/health', AI_SERVICE_URL);
      http.get(`${AI_SERVICE_URL}/health`, r => {
        let raw = '';
        r.on('data', c => { raw += c; });
        r.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });
    res.json({ success: true, data: result });
  } catch (e) {
    res.json({ success: false, message: 'AI service unavailable', error: e.message });
  }
});

const forecastDonations = asyncHandler(async (req, res) => {
  const { historicalData, monthsAhead } = req.body;
  if (!historicalData || !Array.isArray(historicalData)) {
    throw new ApiError(400, 'historicalData array is required');
  }
  try {
    const result = await callAI('/api/v1/ai/forecast-donations', { historicalData, monthsAhead: monthsAhead || 6 });
    res.json({ success: true, data: result });
  } catch (e) {
    throw new ApiError(503, 'AI forecasting service unavailable: ' + e.message);
  }
});

const predictCampaignSuccess = asyncHandler(async (req, res) => {
  const features = req.body;
  if (!features.targetAmount) throw new ApiError(400, 'targetAmount is required');
  try {
    const result = await callAI('/api/v1/ai/predict-campaign-success', features);
    res.json({ success: true, data: result });
  } catch (e) {
    throw new ApiError(503, 'AI prediction service unavailable: ' + e.message);
  }
});

const detectAnomalies = asyncHandler(async (req, res) => {
  const { transactions } = req.body;
  if (!transactions || !Array.isArray(transactions)) {
    throw new ApiError(400, 'transactions array is required');
  }
  try {
    const result = await callAI('/api/v1/ai/detect-anomalies', { transactions });
    res.json({ success: true, data: result });
  } catch (e) {
    throw new ApiError(503, 'AI anomaly detection unavailable: ' + e.message);
  }
});

const nlpAssistant = asyncHandler(async (req, res) => {
  const { query, context } = req.body;
  if (!query || typeof query !== 'string') throw new ApiError(400, 'query is required');
  try {
    const result = await callAI('/api/v1/ai/nlp-assistant', { query, context });
    res.json({ success: true, data: result });
  } catch (e) {
    throw new ApiError(503, 'AI assistant unavailable: ' + e.message);
  }
});

module.exports = { getAIHealth, forecastDonations, predictCampaignSuccess, detectAnomalies, nlpAssistant };
