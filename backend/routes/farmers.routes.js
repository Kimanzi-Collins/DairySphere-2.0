const express      = require('express');
const router       = express.Router();
const upload       = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const {
    getAllFarmers,
    getFarmerById,
    getFarmerSummary,
    getFarmerMonthlyEarnings,
    getFarmerTransactions,
    createFarmer,
    updateFarmer,
    updateProfilePic,
    deleteFarmer
} = require('../controllers/farmers.controller');

// All routes require authentication
router.use(authenticate);

// GET    /api/farmers
router.get('/', getAllFarmers);

// GET    /api/farmers/:id
router.get('/:id', getFarmerById);

// GET    /api/farmers/:id/summary
router.get('/:id/summary', getFarmerSummary);

// GET    /api/farmers/:id/monthly-earnings
router.get('/:id/monthly-earnings', getFarmerMonthlyEarnings);

// GET    /api/farmers/:id/transactions
router.get('/:id/transactions', getFarmerTransactions);

// POST   /api/farmers (Admin, Manager)
router.post(
    '/',
    authorize('Admin', 'Manager'),
    upload.single('profilePic'),
    createFarmer
);

// PUT    /api/farmers/:id (Admin, Manager)
router.put(
    '/:id',
    authorize('Admin', 'Manager'),
    updateFarmer
);

// PUT    /api/farmers/:id/profile-pic (Admin, Manager)
router.put(
    '/:id/profile-pic',
    authorize('Admin', 'Manager'),
    upload.single('profilePic'),
    updateProfilePic
);

// DELETE /api/farmers/:id (Admin only)
router.delete(
    '/:id',
    authorize('Admin'),
    deleteFarmer
);

module.exports = router;