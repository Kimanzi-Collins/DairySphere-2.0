// ============================================================
// controllers/loanrepayments.controller.js
// ============================================================

const { execute } = require('../config/db');

const getRepaymentsByLoan = async (req, res) => {
    try {
        const { loanId } = req.params;

        const result = await execute(
            `SELECT
                RepaymentId,
                LoanId,
                FarmerId,
                RepaymentMonth,
                TO_CHAR(ScheduledDate,'YYYY-MM-DD') AS ScheduledDate,
                TO_CHAR(PaidDate,'YYYY-MM-DD')      AS PaidDate,
                RepaymentAmount,
                RemainingBalance,
                RepaymentStatus,
                Notes
             FROM LoanRepayments
             WHERE  LoanId = :loanId
             ORDER  BY ScheduledDate`,
            { loanId }
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getRepaymentsByLoan error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch repayment schedule.'
        });
    }
};

const getAllRepayments = async (req, res) => {
    try {
        const { status, farmerId, month } = req.query;

        let sql = `
            SELECT
                lr.RepaymentId,
                lr.LoanId,
                lr.FarmerId,
                f.FarmerName,
                lr.RepaymentMonth,
                TO_CHAR(lr.ScheduledDate,'YYYY-MM-DD') AS ScheduledDate,
                TO_CHAR(lr.PaidDate,'YYYY-MM-DD')      AS PaidDate,
                lr.RepaymentAmount,
                lr.RemainingBalance,
                lr.RepaymentStatus,
                lr.Notes
            FROM LoanRepayments lr
            JOIN Farmers f ON lr.FarmerId = f.FarmerId
            WHERE 1=1
        `;

        const binds = {};

        if (status) {
            sql += ` AND lr.RepaymentStatus = :status`;
            binds.status = status;
        }
        if (farmerId) {
            sql += ` AND lr.FarmerId = :farmerId`;
            binds.farmerId = farmerId;
        }
        if (month) {
            sql += ` AND lr.RepaymentMonth = :month`;
            binds.month = month;
        }

        sql += ` ORDER BY lr.ScheduledDate DESC`;

        const result = await execute(sql, binds);

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getAllRepayments error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch repayments.'
        });
    }
};

const processMonthlyDeductions = async (req, res) => {
    try {
        const { month } = req.body;
        const targetMonth = month ||
            new Date().toISOString().slice(0, 7); // YYYY-MM

        await execute(
            `BEGIN
                sp_process_monthly_loan_deductions(:month);
                sp_sync_loan_balances();
             END;`,
            { month: targetMonth }
        );

        return res.status(200).json({
            success: true,
            message: `Monthly deductions processed for ${targetMonth}.`
        });

    } catch (err) {
        console.error('processMonthlyDeductions error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to process monthly deductions.'
        });
    }
};

module.exports = {
    getAllRepayments,
    getRepaymentsByLoan,
    processMonthlyDeductions
};