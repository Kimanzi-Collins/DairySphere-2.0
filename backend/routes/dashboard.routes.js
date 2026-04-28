
const express      = require('express');
const router       = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    getLifetimeSummary,
    getMonthlySummary,
    getTopFarmers,
    getAgentPerformance,
    getLoanOverview
} = require('../controllers/dashboard.controller');

router.use(authenticate);

// GET /api/dashboard/lifetime
router.get('/lifetime',         getLifetimeSummary);

// GET /api/dashboard/monthly
router.get('/monthly',          getMonthlySummary);

// GET /api/dashboard/top-farmers?limit=5
router.get('/top-farmers',      getTopFarmers);

// GET /api/dashboard/agent-performance
router.get('/agent-performance', getAgentPerformance);

// GET /api/dashboard/loan-overview
router.get('/loan-overview',    getLoanOverview);

module.exports = router;