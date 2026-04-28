// ============================================================
// routes/agents.routes.js
// ============================================================

const express          = require('express');
const router           = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const {
    getAllAgents,
    getAgentById,
    getAgentPerformance,
    getAgentSales,
    createAgent,
    updateAgent,
    deleteAgent
} = require('../controllers/agents.controller');

router.use(authenticate);

// GET  /api/agents
router.get('/', getAllAgents);

// GET  /api/agents/:id
router.get('/:id', getAgentById);

// GET  /api/agents/:id/performance
router.get('/:id/performance', getAgentPerformance);

// GET  /api/agents/:id/sales
router.get('/:id/sales', getAgentSales);

// POST /api/agents
router.post('/', authorize('Admin', 'Manager'), createAgent);

// PUT  /api/agents/:id
router.put('/:id', authorize('Admin', 'Manager'), updateAgent);

// DELETE /api/agents/:id
router.delete('/:id', authorize('Admin'), deleteAgent);

module.exports = router;