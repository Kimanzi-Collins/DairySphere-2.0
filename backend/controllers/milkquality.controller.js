// ============================================================
// controllers/milkquality.controller.js
// ============================================================

const { execute } = require('../config/db');

const getAllGrades = async (req, res) => {
    try {
        const result = await execute(
            `SELECT
                QualityIdNum, QualityId, Grade, PricePerLitre,
                TO_CHAR(CreatedAt,'YYYY-MM-DD HH24:MI:SS') AS CreatedAt,
                TO_CHAR(UpdatedAt,'YYYY-MM-DD HH24:MI:SS') AS UpdatedAt
             FROM MilkQuality
             ORDER BY QualityIdNum`
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getAllGrades error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch milk quality grades.'
        });
    }
};

const getGradeById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT
                QualityIdNum, QualityId, Grade, PricePerLitre,
                TO_CHAR(CreatedAt,'YYYY-MM-DD HH24:MI:SS') AS CreatedAt,
                TO_CHAR(UpdatedAt,'YYYY-MM-DD HH24:MI:SS') AS UpdatedAt
             FROM MilkQuality
             WHERE QualityId = :id`,
            { id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Grade ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });

    } catch (err) {
        console.error('getGradeById error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch grade.'
        });
    }
};

const createGrade = async (req, res) => {
    try {
        const { grade, pricePerLitre } = req.body;

        if (!grade || !pricePerLitre) {
            return res.status(400).json({
                success: false,
                message: 'grade and pricePerLitre are required.'
            });
        }

        if (!['A', 'AA', 'B'].includes(grade)) {
            return res.status(400).json({
                success: false,
                message: 'Grade must be A, AA, or B.'
            });
        }

        if (isNaN(pricePerLitre) || Number(pricePerLitre) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'pricePerLitre must be a positive number.'
            });
        }

        const result = await execute(
            `INSERT INTO MilkQuality (Grade, PricePerLitre)
             VALUES (:grade, :pricePerLitre)
             RETURNING QualityId INTO :qualityId`,
            {
                grade,
                pricePerLitre: Number(pricePerLitre),
                qualityId: {
                    dir:  require('oracledb').BIND_OUT,
                    type: require('oracledb').STRING
                }
            }
        );

        return res.status(201).json({
            success:   true,
            message:   'Grade created successfully.',
            qualityId: result.outBinds.qualityId[0]
        });

    } catch (err) {
        if (err.errorNum === 1) {
            return res.status(409).json({
                success: false,
                message: 'This grade already exists.'
            });
        }
        console.error('createGrade error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to create grade.'
        });
    }
};

const updateGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const { pricePerLitre } = req.body;

        if (!pricePerLitre) {
            return res.status(400).json({
                success: false,
                message: 'pricePerLitre is required.'
            });
        }

        if (isNaN(pricePerLitre) || Number(pricePerLitre) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'pricePerLitre must be a positive number.'
            });
        }

        const check = await execute(
            `SELECT QualityId FROM MilkQuality WHERE QualityId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Grade ${id} not found.`
            });
        }

        await execute(
            `UPDATE MilkQuality
             SET PricePerLitre = :pricePerLitre
             WHERE QualityId   = :id`,
            { pricePerLitre: Number(pricePerLitre), id }
        );

        return res.status(200).json({
            success: true,
            message: `Grade ${id} price updated successfully.`
        });

    } catch (err) {
        console.error('updateGrade error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update grade.'
        });
    }
};

const deleteGrade = async (req, res) => {
    try {
        const { id } = req.params;

        const check = await execute(
            `SELECT QualityId FROM MilkQuality WHERE QualityId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Grade ${id} not found.`
            });
        }

        const inUse = await execute(
            `SELECT COUNT(*) AS UseCount
             FROM Deliveries WHERE QualityId = :id`,
            { id }
        );

        if (inUse.rows[0].USECOUNT > 0) {
            return res.status(409).json({
                success: false,
                message: `Cannot delete grade ${id}.` +
                         ` It is used in ${inUse.rows[0].USECOUNT}` +
                         ` deliveries.`
            });
        }

        await execute(
            `DELETE FROM MilkQuality WHERE QualityId = :id`,
            { id }
        );

        return res.status(200).json({
            success: true,
            message: `Grade ${id} deleted successfully.`
        });

    } catch (err) {
        console.error('deleteGrade error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete grade.'
        });
    }
};

module.exports = {
    getAllGrades,
    getGradeById,
    createGrade,
    updateGrade,
    deleteGrade
};