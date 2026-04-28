// ============================================================
// routes/loanrepayments.routes.js
// ============================================================

const express          = require('express');
const router           = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const {
    getAllRepayments,
    getRepaymentsByLoan,
    processMonthlyDeductions
} = require('../controllers/loanrepayments.controller');

router.use(authenticate);

// GET  /api/loan-repayments?status=Pending&farmerId=F0001&month=2025-01
router.get('/', getAllRepayments);

// GET  /api/loan-repayments/:loanId
router.get('/:loanId', getRepaymentsByLoan);

// POST /api/loan-repayments/process  { month: "2025-06" }
router.post(
    '/process',
    authorize('Admin'),
    processMonthlyDeductions
);

module.exports = router;