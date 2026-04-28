// ============================================================
// controllers/inputs.controller.js
// ============================================================

const { execute } = require('../config/db');

const getAllInputs = async (req, res) => {
    try {
        const result = await execute(
            `SELECT
                InputIdNum, InputId, InputName,
                InputPrice,
                TO_CHAR(CreatedAt,'YYYY-MM-DD HH24:MI:SS') AS CreatedAt,
                TO_CHAR(UpdatedAt,'YYYY-MM-DD HH24:MI:SS') AS UpdatedAt
             FROM Inputs
             ORDER BY InputIdNum`
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getAllInputs error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch inputs.'
        });
    }
};

const getInputById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT
                InputIdNum, InputId, InputName, InputPrice,
                TO_CHAR(CreatedAt,'YYYY-MM-DD HH24:MI:SS') AS CreatedAt,
                TO_CHAR(UpdatedAt,'YYYY-MM-DD HH24:MI:SS') AS UpdatedAt
             FROM Inputs WHERE InputId = :id`,
            { id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Input ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });

    } catch (err) {
        console.error('getInputById error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch input.'
        });
    }
};

const createInput = async (req, res) => {
    try {
        const { inputName, inputPrice } = req.body;

        if (!inputName || !inputPrice) {
            return res.status(400).json({
                success: false,
                message: 'inputName and inputPrice are required.'
            });
        }

        if (isNaN(inputPrice) || Number(inputPrice) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'inputPrice must be a positive number.'
            });
        }

        const result = await execute(
            `INSERT INTO Inputs (InputName, InputPrice)
             VALUES (:inputName, :inputPrice)
             RETURNING InputId INTO :inputId`,
            {
                inputName,
                inputPrice: Number(inputPrice),
                inputId: {
                    dir:  require('oracledb').BIND_OUT,
                    type: require('oracledb').STRING
                }
            }
        );

        return res.status(201).json({
            success: true,
            message: 'Input created successfully.',
            inputId: result.outBinds.inputId[0]
        });

    } catch (err) {
        console.error('createInput error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to create input.'
        });
    }
};

const updateInput = async (req, res) => {
    try {
        const { id } = req.params;
        const { inputName, inputPrice } = req.body;

        if (inputPrice !== undefined &&
            (isNaN(inputPrice) || Number(inputPrice) <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'inputPrice must be a positive number.'
            });
        }

        const check = await execute(
            `SELECT InputId FROM Inputs WHERE InputId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Input ${id} not found.`
            });
        }

        await execute(
            `UPDATE Inputs SET
                InputName  = NVL(:inputName,  InputName),
                InputPrice = NVL(:inputPrice, InputPrice)
             WHERE InputId = :id`,
            {
                inputName:  inputName  || null,
                inputPrice: inputPrice ? Number(inputPrice) : null,
                id
            }
        );

        return res.status(200).json({
            success: true,
            message: `Input ${id} updated successfully.`
        });

    } catch (err) {
        console.error('updateInput error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update input.'
        });
    }
};

const deleteInput = async (req, res) => {
    try {
        const { id } = req.params;

        const check = await execute(
            `SELECT InputId FROM Inputs WHERE InputId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Input ${id} not found.`
            });
        }

        const purchases = await execute(
            `SELECT COUNT(*) AS PurchaseCount
             FROM InputPurchases WHERE InputId = :id`,
            { id }
        );

        if (purchases.rows[0].PURCHASECOUNT > 0) {
            return res.status(409).json({
                success: false,
                message: `Cannot delete input ${id}.` +
                         ` It has ${purchases.rows[0].PURCHASECOUNT}` +
                         ` purchase records.`
            });
        }

        await execute(
            `DELETE FROM Inputs WHERE InputId = :id`,
            { id }
        );

        return res.status(200).json({
            success: true,
            message: `Input ${id} deleted successfully.`
        });

    } catch (err) {
        console.error('deleteInput error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete input.'
        });
    }
};

module.exports = {
    getAllInputs,
    getInputById,
    createInput,
    updateInput,
    deleteInput
};