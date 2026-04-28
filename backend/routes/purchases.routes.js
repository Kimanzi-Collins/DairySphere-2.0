// ============================================================
// routes/purchases.routes.js
// ============================================================

const express          = require('express');
const router           = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const {
    getAllPurchases,
    getPurchaseById,
    getPurchasesByFarmer,
    createPurchase,
    deletePurchase
} = require('../controllers/purchases.controller');

router.use(authenticate);

router.get('/',                     getAllPurchases);
router.get('/:id',                  getPurchaseById);
router.get('/farmer/:farmerId',     getPurchasesByFarmer);
router.post('/', authorize('Admin','Manager'), createPurchase);
router.delete('/:id', authorize('Admin'),      deletePurchase);

module.exports = router;