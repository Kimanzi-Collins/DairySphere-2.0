// ============================================================
// controllers/sales.controller.js
// ============================================================

const oracledb    = require('oracledb');
const { execute } = require('../config/db');

const getAllSales = async (req, res) => {
    try {
        const result = await execute(
            `SELECT * FROM vw_sales ORDER BY SaleDate DESC`
        );
        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });
    } catch (err) {
        console.error('getAllSales error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch sales.'
        });
    }
};

const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await execute(
            `SELECT * FROM vw_sales WHERE SaleId = :id`,
            { id }
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Sale ${id} not found.`
            });
        }
        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });
    } catch (err) {
        console.error('getSaleById error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch sale.'
        });
    }
};

const getSalesByFarmer = async (req, res) => {
    try {
        const { farmerId } = req.params;
        const result = await execute(
            `SELECT * FROM vw_sales
             WHERE  FarmerId = :farmerId
             ORDER  BY SaleDate DESC`,
            { farmerId }
        );
        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });
    } catch (err) {
        console.error('getSalesByFarmer error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch farmer sales.'
        });
    }
};

const getSalesByAgent = async (req, res) => {
    try {
        const { agentId } = req.params;
        const result = await execute(
            `SELECT * FROM vw_sales
             WHERE  AgentId = :agentId
             ORDER  BY SaleDate DESC`,
            { agentId }
        );
        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });
    } catch (err) {
        console.error('getSalesByAgent error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch agent sales.'
        });
    }
};

const createSale = async (req, res) => {
    try {
        const {
            agentId, farmerId,
            saleAmount, saleDate
        } = req.body;

        if (!agentId || !farmerId || !saleAmount) {
            return res.status(400).json({
                success: false,
                message: 'Required: agentId, farmerId, saleAmount.'
            });
        }

        if (isNaN(saleAmount) || Number(saleAmount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'saleAmount must be a positive number.'
            });
        }

        const result = await execute(
            `INSERT INTO Sales (
                AgentId, FarmerId, SaleAmount, SaleDate
             )
             VALUES (
                :agentId, :farmerId, :saleAmount,
                NVL(TO_DATE(:saleDate,'YYYY-MM-DD'), SYSDATE)
             )
             RETURNING SaleId, Commission
             INTO :saleId, :commission`,
            {
                agentId,
                farmerId,
                saleAmount: Number(saleAmount),
                saleDate:   saleDate || null,
                saleId: {
                    dir: oracledb.BIND_OUT, type: oracledb.STRING
                },
                commission: {
                    dir: oracledb.BIND_OUT, type: oracledb.NUMBER
                }
            }
        );

        return res.status(201).json({
            success:    true,
            message:    'Sale recorded successfully.',
            saleId:     result.outBinds.saleId[0],
            commission: result.outBinds.commission[0]
        });

    } catch (err) {
        console.error('createSale error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to record sale.'
        });
    }
};

const updateSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { agentId, farmerId, saleAmount, saleDate } = req.body;

        const check = await execute(
            `SELECT SaleId FROM Sales WHERE SaleId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Sale ${id} not found.`
            });
        }

        if (saleAmount !== undefined &&
            (isNaN(saleAmount) || Number(saleAmount) <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'saleAmount must be a positive number.'
            });
        }

        await execute(
            `UPDATE Sales SET
                AgentId    = NVL(:agentId,    AgentId),
                FarmerId   = NVL(:farmerId,   FarmerId),
                SaleAmount = NVL(:saleAmount, SaleAmount),
                SaleDate   = NVL(
                    TO_DATE(:saleDate,'YYYY-MM-DD'), SaleDate
                )
             WHERE SaleId = :id`,
            {
                agentId:    agentId    || null,
                farmerId:   farmerId   || null,
                saleAmount: saleAmount ? Number(saleAmount) : null,
                saleDate:   saleDate   || null,
                id
            }
        );

        return res.status(200).json({
            success: true,
            message: `Sale ${id} updated successfully.`
        });

    } catch (err) {
        console.error('updateSale error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update sale.'
        });
    }
};

const deleteSale = async (req, res) => {
    try {
        const { id } = req.params;

        const check = await execute(
            `SELECT SaleId FROM Sales WHERE SaleId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Sale ${id} not found.`
            });
        }

        await execute(
            `DELETE FROM Sales WHERE SaleId = :id`,
            { id }
        );

        return res.status(200).json({
            success: true,
            message: `Sale ${id} deleted successfully.`
        });

    } catch (err) {
        console.error('deleteSale error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete sale.'
        });
    }
};

module.exports = {
    getAllSales,
    getSaleById,
    getSalesByFarmer,
    getSalesByAgent,
    createSale,
    updateSale,
    deleteSale
};