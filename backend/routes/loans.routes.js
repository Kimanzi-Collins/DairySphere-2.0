// ============================================================
// routes/loans.routes.js
// ============================================================

const express          = require('express');
const router           = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const {
    getAllLoans,
    getLoanById,
    getLoansByFarmer,
    getLoanRepaymentSchedule,
    createLoan,
    deleteLoan
} = require('../controllers/loans.controller');

router.use(authenticate);

router.get('/',                          getAllLoans);
router.get('/:id',                       getLoanById);
router.get('/farmer/:farmerId',          getLoansByFarmer);
router.get('/:id/schedule',             getLoanRepaymentSchedule);
router.post('/', authorize('Admin','Manager'), createLoan);
router.delete('/:id', authorize('Admin'),      deleteLoan);

module.exports = router;