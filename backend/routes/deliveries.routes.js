// ============================================================
// routes/deliveries.routes.js
// ============================================================

const express          = require('express');
const router           = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const {
    getAllDeliveries,
    getDeliveryById,
    getDeliveriesByFarmer,
    createDelivery,
    updateDelivery,
    deleteDelivery
} = require('../controllers/deliveries.controller');

router.use(authenticate);

router.get('/',                      getAllDeliveries);
router.get('/:id',                   getDeliveryById);
router.get('/farmer/:farmerId',      getDeliveriesByFarmer);
router.post('/',   authorize('Admin','Manager'), createDelivery);
router.put('/:id', authorize('Admin'),           updateDelivery);
router.delete('/:id', authorize('Admin'),        deleteDelivery);

module.exports = router;