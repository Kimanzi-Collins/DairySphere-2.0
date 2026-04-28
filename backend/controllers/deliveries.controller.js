// ============================================================
// controllers/deliveries.controller.js
// ============================================================

const oracledb    = require('oracledb');
const { execute } = require('../config/db');

const getAllDeliveries = async (req, res) => {
    try {
        const result = await execute(
            `SELECT *
             FROM   vw_deliveries
             ORDER  BY DeliveryDate DESC`
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getAllDeliveries error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch deliveries.'
        });
    }
};

const getDeliveryById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT *
             FROM   vw_deliveries
             WHERE  DeliveryId = :id`,
            { id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Delivery ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });

    } catch (err) {
        console.error('getDeliveryById error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch delivery.'
        });
    }
};

const getDeliveriesByFarmer = async (req, res) => {
    try {
        const { farmerId } = req.params;

        const result = await execute(
            `SELECT *
             FROM   vw_deliveries
             WHERE  FarmerId = :farmerId
             ORDER  BY DeliveryDate DESC`,
            { farmerId }
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getDeliveriesByFarmer error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch farmer deliveries.'
        });
    }
};

const createDelivery = async (req, res) => {
    try {
        const {
            farmerId, milkQuantity,
            qualityId, factoryId, deliveryDate
        } = req.body;

        if (!farmerId || !milkQuantity || !qualityId || !factoryId) {
            return res.status(400).json({
                success: false,
                message: 'Required: farmerId, milkQuantity,' +
                         ' qualityId, factoryId.'
            });
        }

        if (isNaN(milkQuantity) || Number(milkQuantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'milkQuantity must be a positive number.'
            });
        }

        const result = await execute(
            `INSERT INTO Deliveries (
                FarmerId, MilkQuantity, QualityId,
                FactoryId, DeliveryDate
             )
             VALUES (
                :farmerId, :milkQuantity, :qualityId,
                :factoryId,
                NVL(TO_DATE(:deliveryDate,'YYYY-MM-DD'), SYSDATE)
             )
             RETURNING DeliveryId, BatchRef
             INTO :deliveryId, :batchRef`,
            {
                farmerId,
                milkQuantity: Number(milkQuantity),
                qualityId,
                factoryId,
                deliveryDate: deliveryDate || null,
                deliveryId: {
                    dir: oracledb.BIND_OUT, type: oracledb.STRING
                },
                batchRef: {
                    dir: oracledb.BIND_OUT, type: oracledb.STRING
                }
            }
        );

        return res.status(201).json({
            success:    true,
            message:    'Delivery recorded successfully.',
            deliveryId: result.outBinds.deliveryId[0],
            batchRef:   result.outBinds.batchRef[0]
        });

    } catch (err) {
        console.error('createDelivery error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to record delivery.'
        });
    }
};

const updateDelivery = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            milkQuantity, qualityId,
            factoryId, deliveryDate
        } = req.body;

        const check = await execute(
            `SELECT DeliveryId FROM Deliveries WHERE DeliveryId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Delivery ${id} not found.`
            });
        }

        if (milkQuantity !== undefined &&
            (isNaN(milkQuantity) || Number(milkQuantity) <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'milkQuantity must be a positive number.'
            });
        }

        await execute(
            `UPDATE Deliveries SET
                MilkQuantity = NVL(:milkQuantity, MilkQuantity),
                QualityId    = NVL(:qualityId,    QualityId),
                FactoryId    = NVL(:factoryId,    FactoryId),
                DeliveryDate = NVL(
                    TO_DATE(:deliveryDate,'YYYY-MM-DD'),
                    DeliveryDate
                )
             WHERE DeliveryId = :id`,
            {
                milkQuantity: milkQuantity
                    ? Number(milkQuantity) : null,
                qualityId:    qualityId    || null,
                factoryId:    factoryId    || null,
                deliveryDate: deliveryDate || null,
                id
            }
        );

        return res.status(200).json({
            success: true,
            message: `Delivery ${id} updated successfully.`
        });

    } catch (err) {
        console.error('updateDelivery error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update delivery.'
        });
    }
};

const deleteDelivery = async (req, res) => {
    try {
        const { id } = req.params;

        const check = await execute(
            `SELECT DeliveryId FROM Deliveries WHERE DeliveryId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Delivery ${id} not found.`
            });
        }

        await execute(
            `DELETE FROM Deliveries WHERE DeliveryId = :id`,
            { id }
        );

        return res.status(200).json({
            success: true,
            message: `Delivery ${id} deleted successfully.`
        });

    } catch (err) {
        console.error('deleteDelivery error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete delivery.'
        });
    }
};

module.exports = {
    getAllDeliveries,
    getDeliveryById,
    getDeliveriesByFarmer,
    createDelivery,
    updateDelivery,
    deleteDelivery
};