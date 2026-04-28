// ============================================================
// controllers/factories.controller.js
// ============================================================

const { execute } = require('../config/db');

const getAllFactories = async (req, res) => {
    try {
        const result = await execute(
            `SELECT
                FactoryIdNum,
                FactoryId,
                FactoryName,
                Location,
                Contact,
                TO_CHAR(CreatedAt, 'YYYY-MM-DD HH24:MI:SS') AS CreatedAt,
                TO_CHAR(UpdatedAt, 'YYYY-MM-DD HH24:MI:SS') AS UpdatedAt
             FROM Factories
             ORDER BY FactoryIdNum`
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getAllFactories error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch factories.'
        });
    }
};

const getFactoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT
                FactoryIdNum, FactoryId, FactoryName,
                Location, Contact,
                TO_CHAR(CreatedAt,'YYYY-MM-DD HH24:MI:SS') AS CreatedAt,
                TO_CHAR(UpdatedAt,'YYYY-MM-DD HH24:MI:SS') AS UpdatedAt
             FROM Factories
             WHERE FactoryId = :id`,
            { id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Factory ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });

    } catch (err) {
        console.error('getFactoryById error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch factory.'
        });
    }
};

const getFactoryDeliveries = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT *
             FROM   vw_deliveries
             WHERE  FactoryId = :id
             ORDER  BY DeliveryDate DESC`,
            { id }
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getFactoryDeliveries error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch factory deliveries.'
        });
    }
};

const createFactory = async (req, res) => {
    try {
        const { factoryName, location, contact } = req.body;

        if (!factoryName || !location || !contact) {
            return res.status(400).json({
                success: false,
                message: 'All fields required: factoryName, location, contact.'
            });
        }

        if (!/^\d{10}$/.test(contact)) {
            return res.status(400).json({
                success: false,
                message: 'Contact must be exactly 10 digits.'
            });
        }

        const result = await execute(
            `INSERT INTO Factories (FactoryName, Location, Contact)
             VALUES (:factoryName, :location, :contact)
             RETURNING FactoryId INTO :factoryId`,
            {
                factoryName,
                location,
                contact,
                factoryId: {
                    dir:  require('oracledb').BIND_OUT,
                    type: require('oracledb').STRING
                }
            }
        );

        return res.status(201).json({
            success:   true,
            message:   'Factory created successfully.',
            factoryId: result.outBinds.factoryId[0]
        });

    } catch (err) {
        console.error('createFactory error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to create factory.'
        });
    }
};

const updateFactory = async (req, res) => {
    try {
        const { id } = req.params;
        const { factoryName, location, contact } = req.body;

        if (contact && !/^\d{10}$/.test(contact)) {
            return res.status(400).json({
                success: false,
                message: 'Contact must be exactly 10 digits.'
            });
        }

        const check = await execute(
            `SELECT FactoryId FROM Factories WHERE FactoryId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Factory ${id} not found.`
            });
        }

        await execute(
            `UPDATE Factories SET
                FactoryName = NVL(:factoryName, FactoryName),
                Location    = NVL(:location,    Location),
                Contact     = NVL(:contact,     Contact)
             WHERE FactoryId = :id`,
            {
                factoryName: factoryName || null,
                location:    location    || null,
                contact:     contact     || null,
                id
            }
        );

        return res.status(200).json({
            success: true,
            message: `Factory ${id} updated successfully.`
        });

    } catch (err) {
        console.error('updateFactory error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update factory.'
        });
    }
};

const deleteFactory = async (req, res) => {
    try {
        const { id } = req.params;

        const check = await execute(
            `SELECT FactoryId FROM Factories WHERE FactoryId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Factory ${id} not found.`
            });
        }

        const deliveries = await execute(
            `SELECT COUNT(*) AS DeliveryCount
             FROM Deliveries WHERE FactoryId = :id`,
            { id }
        );

        if (deliveries.rows[0].DELIVERYCOUNT > 0) {
            return res.status(409).json({
                success: false,
                message: `Cannot delete factory ${id}.` +
                         ` It has ${deliveries.rows[0].DELIVERYCOUNT}` +
                         ` deliveries on record.`
            });
        }

        await execute(
            `DELETE FROM Factories WHERE FactoryId = :id`,
            { id }
        );

        return res.status(200).json({
            success: true,
            message: `Factory ${id} deleted successfully.`
        });

    } catch (err) {
        console.error('deleteFactory error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete factory.'
        });
    }
};

module.exports = {
    getAllFactories,
    getFactoryById,
    getFactoryDeliveries,
    createFactory,
    updateFactory,
    deleteFactory
};