// ============================================================
// routes/sales.routes.js
// ============================================================

const express          = require('express');
const router           = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const {
    getAllSales,
    getSaleById,
    getSalesByFarmer,
    getSalesByAgent,
    createSale,
    updateSale,
    deleteSale
} = require('../controllers/sales.controller');

router.use(authenticate);

router.get('/',                    getAllSales);
router.get('/:id',                 getSaleById);
router.get('/farmer/:farmerId',    getSalesByFarmer);
router.get('/agent/:agentId',      getSalesByAgent);
router.post('/', authorize('Admin','Manager'), createSale);
router.put('/:id', authorize('Admin'),        updateSale);
router.delete('/:id', authorize('Admin'),     deleteSale);

module.exports = router;