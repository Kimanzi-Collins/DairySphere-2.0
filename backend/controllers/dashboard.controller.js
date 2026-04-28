
const { execute } = require('../config/db');

// ── SOCIETY LIFETIME SUMMARY ───────────────────────────────
const getLifetimeSummary = async (req, res) => {
    try {
        const result = await execute(
            `SELECT * FROM vw_society_lifetime_summary`
        );
        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });
    } catch (err) {
        console.error('getLifetimeSummary error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch lifetime summary.'
        });
    }
};

// ── SOCIETY MONTHLY SUMMARY ────────────────────────────────
const getMonthlySummary = async (req, res) => {
    try {
        const result = await execute(
            `SELECT * FROM vw_society_monthly_summary
             ORDER BY SummaryMonth DESC`
        );
        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });
    } catch (err) {
        console.error('getMonthlySummary error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly summary.'
        });
    }
};

// ── TOP FARMERS ────────────────────────────────────────────
const getTopFarmers = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const result = await execute(
            `SELECT *
             FROM (
                SELECT
                    f.FarmerId,
                    f.FarmerName,
                    f.Location,
                    SUM(d.MilkQuantity)                    AS TotalLitres,
                    SUM(d.Amount)                          AS TotalEarnings,
                    RANK() OVER (
                        ORDER BY SUM(d.MilkQuantity) DESC
                    )                                      AS MilkRank
                FROM Deliveries d
                JOIN Farmers    f ON d.FarmerId = f.FarmerId
                GROUP BY f.FarmerId, f.FarmerName, f.Location
             )
             WHERE MilkRank <= :limit
             ORDER BY MilkRank`,
            { limit: parseInt(limit) }
        );
        return res.status(200).json({
            success: true,
            data:    result.rows
        });
    } catch (err) {
        console.error('getTopFarmers error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch top farmers.'
        });
    }
};

// ── AGENT PERFORMANCE ──────────────────────────────────────
const getAgentPerformance = async (req, res) => {
    try {
        const result = await execute(
            `SELECT * FROM vw_agent_performance
             ORDER BY TotalCommission DESC`
        );
        return res.status(200).json({
            success: true,
            data:    result.rows
        });
    } catch (err) {
        console.error('getAgentPerformance error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch agent performance.'
        });
    }
};

// ── LOAN STATUS OVERVIEW ───────────────────────────────────
const getLoanOverview = async (req, res) => {
    try {
        const result = await execute(
            `SELECT * FROM vw_loan_status
             ORDER BY LoanStatus, FarmerName`
        );
        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });
    } catch (err) {
        console.error('getLoanOverview error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch loan overview.'
        });
    }
};

module.exports = {
    getLifetimeSummary,
    getMonthlySummary,
    getTopFarmers,
    getAgentPerformance,
    getLoanOverview
};