// ============================================================
// routes/inputs.routes.js
// ============================================================

const express          = require('express');
const router           = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const {
    getAllInputs,
    getInputById,
    createInput,
    updateInput,
    deleteInput
} = require('../controllers/inputs.controller');

router.use(authenticate);

router.get('/',    getAllInputs);
router.get('/:id', getInputById);
router.post('/',   authorize('Admin', 'Manager'), createInput);
router.put('/:id', authorize('Admin', 'Manager'), updateInput);
router.delete('/:id', authorize('Admin'),         deleteInput);

module.exports = router;