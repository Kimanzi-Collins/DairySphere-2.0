// ============================================================
// controllers/loans.controller.js
// ============================================================

const oracledb    = require('oracledb');
const { execute } = require('../config/db');

const getAllLoans = async (req, res) => {
    try {
        const result = await execute(
            `SELECT * FROM vw_loan_status ORDER BY LoanId`
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getAllLoans error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch loans.'
        });
    }
};

const getLoanById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT * FROM vw_loan_status WHERE LoanId = :id`,
            { id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Loan ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });

    } catch (err) {
        console.error('getLoanById error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch loan.'
        });
    }
};

const getLoansByFarmer = async (req, res) => {
    try {
        const { farmerId } = req.params;

        const result = await execute(
            `SELECT * FROM vw_loan_status
             WHERE  FarmerId = :farmerId
             ORDER  BY DateBorrowed DESC`,
            { farmerId }
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getLoansByFarmer error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch farmer loans.'
        });
    }
};

const getLoanRepaymentSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT
                RepaymentId,
                RepaymentMonth,
                TO_CHAR(ScheduledDate,'YYYY-MM-DD') AS ScheduledDate,
                TO_CHAR(PaidDate,'YYYY-MM-DD')      AS PaidDate,
                RepaymentAmount,
                RemainingBalance,
                RepaymentStatus,
                Notes
             FROM LoanRepayments
             WHERE  LoanId = :id
             ORDER  BY ScheduledDate`,
            { id }
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getLoanRepaymentSchedule error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch repayment schedule.'
        });
    }
};

const createLoan = async (req, res) => {
    try {
        const {
            farmerId, loanAmount,
            repaymentPeriod, dateBorrowed
        } = req.body;

        if (!farmerId || !loanAmount || !repaymentPeriod) {
            return res.status(400).json({
                success: false,
                message: 'Required: farmerId, loanAmount, repaymentPeriod.'
            });
        }

        if (isNaN(loanAmount) || Number(loanAmount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'loanAmount must be a positive number.'
            });
        }

        if (!Number.isInteger(Number(repaymentPeriod)) ||
            Number(repaymentPeriod) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'repaymentPeriod must be a positive integer (months).'
            });
        }

        const result = await execute(
            `INSERT INTO Loans (
                FarmerId, LoanAmount,
                RepaymentPeriod, DateBorrowed
             )
             VALUES (
                :farmerId, :loanAmount, :repaymentPeriod,
                NVL(TO_DATE(:dateBorrowed,'YYYY-MM-DD'), SYSDATE)
             )
             RETURNING LoanId INTO :loanId`,
            {
                farmerId,
                loanAmount:      Number(loanAmount),
                repaymentPeriod: Number(repaymentPeriod),
                dateBorrowed:    dateBorrowed || null,
                loanId: {
                    dir:  oracledb.BIND_OUT,
                    type: oracledb.STRING
                }
            }
        );

        return res.status(201).json({
            success: true,
            message: 'Loan created. Repayment schedule auto-generated.',
            loanId:  result.outBinds.loanId[0]
        });

    } catch (err) {
        console.error('createLoan error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to create loan.'
        });
    }
};

const deleteLoan = async (req, res) => {
    try {
        const { id } = req.params;

        const check = await execute(
            `SELECT LoanId, LoanStatus FROM Loans WHERE LoanId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Loan ${id} not found.`
            });
        }

        if (check.rows[0].LOANSTATUS === 'Active') {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete an active loan.' +
                         ' Loan must be completed or defaulted first.'
            });
        }

        await execute(
            `DELETE FROM Loans WHERE LoanId = :id`,
            { id }
        );

        return res.status(200).json({
            success: true,
            message: `Loan ${id} deleted successfully.`
        });

    } catch (err) {
        console.error('deleteLoan error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete loan.'
        });
    }
};

module.exports = {
    getAllLoans,
    getLoanById,
    getLoansByFarmer,
    getLoanRepaymentSchedule,
    createLoan,
    deleteLoan
};