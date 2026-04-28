// ============================================================
// controllers/purchases.controller.js
// ============================================================

const oracledb    = require('oracledb');
const { execute } = require('../config/db');

const getAllPurchases = async (req, res) => {
    try {
        const result = await execute(
            `SELECT * FROM vw_input_purchases
             ORDER BY PurchaseDate DESC`
        );
        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });
    } catch (err) {
        console.error('getAllPurchases error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch purchases.'
        });
    }
};

const getPurchaseById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await execute(
            `SELECT * FROM vw_input_purchases WHERE PurchaseId = :id`,
            { id }
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Purchase ${id} not found.`
            });
        }
        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });
    } catch (err) {
        console.error('getPurchaseById error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch purchase.'
        });
    }
};

const getPurchasesByFarmer = async (req, res) => {
    try {
        const { farmerId } = req.params;
        const result = await execute(
            `SELECT * FROM vw_input_purchases
             WHERE  FarmerId = :farmerId
             ORDER  BY PurchaseDate DESC`,
            { farmerId }
        );
        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });
    } catch (err) {
        console.error('getPurchasesByFarmer error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch farmer purchases.'
        });
    }
};

const createPurchase = async (req, res) => {
    try {
        const {
            farmerId, inputId,
            quantity, dateOfPurchase
        } = req.body;

        if (!farmerId || !inputId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Required: farmerId, inputId, quantity.'
            });
        }

        if (!Number.isInteger(Number(quantity)) ||
            Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'quantity must be a positive integer.'
            });
        }

        const result = await execute(
            `INSERT INTO InputPurchases (
                FarmerId, InputId, Quantity, DateOfPurchase
             )
             VALUES (
                :farmerId, :inputId, :quantity,
                NVL(TO_DATE(:dateOfPurchase,'YYYY-MM-DD'), SYSDATE)
             )
             RETURNING PurchaseId INTO :purchaseId`,
            {
                farmerId,
                inputId,
                quantity:      Number(quantity),
                dateOfPurchase: dateOfPurchase || null,
                purchaseId: {
                    dir:  oracledb.BIND_OUT,
                    type: oracledb.STRING
                }
            }
        );

        return res.status(201).json({
            success:    true,
            message:    'Purchase recorded successfully.',
            purchaseId: result.outBinds.purchaseId[0]
        });

    } catch (err) {
        console.error('createPurchase error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to record purchase.'
        });
    }
};

const deletePurchase = async (req, res) => {
    try {
        const { id } = req.params;

        const check = await execute(
            `SELECT PurchaseId FROM InputPurchases
             WHERE  PurchaseId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Purchase ${id} not found.`
            });
        }

        await execute(
            `DELETE FROM InputPurchases WHERE PurchaseId = :id`,
            { id }
        );

        return res.status(200).json({
            success: true,
            message: `Purchase ${id} deleted successfully.`
        });

    } catch (err) {
        console.error('deletePurchase error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete purchase.'
        });
    }
};

module.exports = {
    getAllPurchases,
    getPurchaseById,
    getPurchasesByFarmer,
    createPurchase,
    deletePurchase
};