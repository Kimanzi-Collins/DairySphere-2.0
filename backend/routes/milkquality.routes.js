// ============================================================
// routes/milkquality.routes.js
// ============================================================

const express          = require('express');
const router           = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const {
    getAllGrades,
    getGradeById,
    createGrade,
    updateGrade,
    deleteGrade
} = require('../controllers/milkquality.controller');

router.use(authenticate);

router.get('/',    getAllGrades);
router.get('/:id', getGradeById);
router.post('/',   authorize('Admin'),         createGrade);
router.put('/:id', authorize('Admin'),         updateGrade);
router.delete('/:id', authorize('Admin'),      deleteGrade);

module.exports = router;