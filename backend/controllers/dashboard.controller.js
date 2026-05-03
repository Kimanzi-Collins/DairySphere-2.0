
const { execute } = require('../config/db');

// ── SOCIETY LIFETIME SUMMARY ───────────────────────────────
const getLifetimeSummary = async (req, res) => {
    try {
        // Real-time aggregation to bypass potentially stale summary tables
        const result = await execute(
            `SELECT
                (SELECT COUNT(*) FROM Farmers)                      AS TotalFarmers,
                (SELECT COUNT(*) FROM Agents)                       AS TotalAgents,
                (SELECT COUNT(*) FROM Factories)                    AS TotalFactories,
                (SELECT COUNT(*) FROM Inputs)                       AS TotalInputTypes,

                NVL(d.TotalLitres, 0)                               AS TotalLitresAllTime,
                fn_format_currency(NVL(d.TotalAmount, 0))           AS TotalMilkRevenueAllTime,
                fn_format_currency(NVL(s.TotalComm, 0))             AS TotalCommissionAllTime,
                fn_format_currency(NVL(lr.TotalPaid, 0))            AS TotalLoanDeductionsAllTime,
                fn_format_currency(NVL(p.TotalPurch, 0))            AS TotalInputsAllTime,
                fn_format_currency(
                    NVL(d.TotalAmount, 0) - NVL(s.TotalComm, 0) - 
                    NVL(lr.TotalPaid, 0) - NVL(p.TotalPurch, 0)
                )                                                   AS TotalNetEarningsAllTime,

                fn_format_currency(
                    NVL((SELECT SUM(LoanAmount) FROM Loans), 0)
                )                                                   AS TotalLoansIssued,
                fn_format_currency(
                    NVL((SELECT SUM(LoanAmount - TotalRepaid) 
                         FROM Loans WHERE LoanStatus = 'Active'), 0)
                )                                                   AS TotalOutstandingLoans,

                (SELECT COUNT(*) FROM Loans WHERE LoanStatus = 'Active')    AS ActiveLoans,
                (SELECT COUNT(*) FROM Loans WHERE LoanStatus = 'Completed') AS CompletedLoans,
                (SELECT COUNT(*) FROM Loans WHERE LoanStatus = 'Defaulted') AS DefaultedLoans
            FROM DUAL
            CROSS JOIN (SELECT SUM(MilkQuantity) as TotalLitres, SUM(Amount) as TotalAmount FROM Deliveries) d
            CROSS JOIN (SELECT SUM(Commission) as TotalComm FROM Sales) s
            CROSS JOIN (SELECT SUM(PurchaseAmount) as TotalPurch FROM InputPurchases) p
            CROSS JOIN (SELECT SUM(RepaymentAmount) as TotalPaid FROM LoanRepayments WHERE RepaymentStatus = 'Paid') lr`
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
            `SELECT 
                SummaryMonth,
                COUNT(DISTINCT FarmerId) AS ActiveFarmers,
                SUM(Litres)              AS TotalLitresDelivered,
                SUM(Revenue)             AS TotalMilkRevenue,
                SUM(Commission)          AS TotalCommissionPaid,
                SUM(Loans)               AS TotalLoanDeductions,
                SUM(Purchases)           AS TotalInputsPurchased,
                SUM(Revenue - Commission - Loans - Purchases) AS TotalNetEarnings,
                fn_format_currency(SUM(Revenue))    AS FMT_MilkRevenue,
                fn_format_currency(SUM(Commission)) AS FMT_Commission,
                fn_format_currency(SUM(Loans))      AS FMT_Loans,
                fn_format_currency(SUM(Purchases))  AS FMT_Inputs,
                fn_format_currency(SUM(Revenue - Commission - Loans - Purchases)) AS FMT_NetEarnings
            FROM (
                SELECT FarmerId, TO_CHAR(DeliveryDate, 'YYYY-MM') as SummaryMonth, MilkQuantity as Litres, Amount as Revenue, 0 as Commission, 0 as Loans, 0 as Purchases FROM Deliveries
                UNION ALL
                SELECT FarmerId, TO_CHAR(SaleDate, 'YYYY-MM'), 0, 0, Commission, 0, 0 FROM Sales
                UNION ALL
                SELECT FarmerId, RepaymentMonth, 0, 0, 0, RepaymentAmount, 0 FROM LoanRepayments WHERE RepaymentStatus = 'Paid'
                UNION ALL
                SELECT FarmerId, TO_CHAR(DateOfPurchase, 'YYYY-MM'), 0, 0, 0, 0, PurchaseAmount FROM InputPurchases
            )
            GROUP BY SummaryMonth
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