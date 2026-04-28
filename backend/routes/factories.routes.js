// ============================================================
// routes/factories.routes.js
// ============================================================

const express          = require('express');
const router           = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const {
    getAllFactories,
    getFactoryById,
    getFactoryDeliveries,
    createFactory,
    updateFactory,
    deleteFactory
} = require('../controllers/factories.controller');

router.use(authenticate);

router.get('/',                 getAllFactories);
router.get('/:id',              getFactoryById);
router.get('/:id/deliveries',   getFactoryDeliveries);
router.post('/',                authorize('Admin'), createFactory);
router.put('/:id',              authorize('Admin'), updateFactory);
router.delete('/:id',           authorize('Admin'), deleteFactory);

module.exports = router;