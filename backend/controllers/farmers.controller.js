
const { execute } = require('../config/db');
const path        = require('path');
const fs          = require('fs');

// ── GET ALL FARMERS ────────────────────────────────────────
const getAllFarmers = async (req, res) => {
    try {
        const result = await execute(
            `SELECT
                FarmerIdNum,
                FarmerId,
                FarmerName,
                TO_CHAR(DateOfBirth, 'YYYY-MM-DD')         AS DateOfBirth,
                FLOOR(MONTHS_BETWEEN(
                    SYSDATE, DateOfBirth) / 12)             AS Age,
                Gender,
                Email,
                Location,
                Contact,
                TO_CHAR(EnrolmentDate, 'YYYY-MM-DD')       AS EnrolmentDate,
                ProfilePicUrl,
                TO_CHAR(CreatedAt, 'YYYY-MM-DD HH24:MI:SS') AS CreatedAt,
                TO_CHAR(UpdatedAt, 'YYYY-MM-DD HH24:MI:SS') AS UpdatedAt
             FROM Farmers
             ORDER BY FarmerIdNum`
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getAllFarmers error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch farmers.'
        });
    }
};

// ── GET ONE FARMER ─────────────────────────────────────────
const getFarmerById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT
                FarmerIdNum,
                FarmerId,
                FarmerName,
                TO_CHAR(DateOfBirth, 'YYYY-MM-DD')          AS DateOfBirth,
                FLOOR(MONTHS_BETWEEN(
                    SYSDATE, DateOfBirth) / 12)              AS Age,
                Gender,
                Email,
                Location,
                Contact,
                TO_CHAR(EnrolmentDate, 'YYYY-MM-DD')        AS EnrolmentDate,
                ProfilePicUrl,
                TO_CHAR(CreatedAt, 'YYYY-MM-DD HH24:MI:SS') AS CreatedAt,
                TO_CHAR(UpdatedAt, 'YYYY-MM-DD HH24:MI:SS') AS UpdatedAt
             FROM Farmers
             WHERE FarmerId = :id`,
            { id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Farmer ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });

    } catch (err) {
        console.error('getFarmerById error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch farmer.'
        });
    }
};

// ── GET FARMER SUMMARY (Lifetime) ─────────────────────────
const getFarmerSummary = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT *
             FROM   vw_farmer_lifetime_earnings
             WHERE  FarmerId = :id`,
            { id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Farmer ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });

    } catch (err) {
        console.error('getFarmerSummary error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch farmer summary.'
        });
    }
};

// ── GET FARMER MONTHLY EARNINGS ────────────────────────────
const getFarmerMonthlyEarnings = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT *
             FROM   vw_monthly_earnings
             WHERE  FarmerId = :id
             ORDER  BY SummaryMonth DESC`,
            { id }
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getFarmerMonthlyEarnings error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly earnings.'
        });
    }
};

// ── GET FARMER TRANSACTIONS ────────────────────────────────
const getFarmerTransactions = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT
                'Delivery'      AS TransactionType,
                DeliveryId      AS TransactionId,
                TO_CHAR(DeliveryDate,'YYYY-MM-DD') AS TxDate,
                Amount          AS Amount,
                'CREDIT'        AS Direction
             FROM Deliveries WHERE FarmerId = :id

             UNION ALL

             SELECT
                'Input Purchase',
                PurchaseId,
                TO_CHAR(DateOfPurchase,'YYYY-MM-DD'),
                PurchaseAmount,
                'DEBIT'
             FROM InputPurchases WHERE FarmerId = :id

             UNION ALL

             SELECT
                'Loan Repayment',
                RepaymentId,
                TO_CHAR(RepaymentDate,'YYYY-MM-DD'),
                RepaymentAmount,
                'DEBIT'
             FROM LoanRepayments
             WHERE FarmerId = :id
             AND   RepaymentStatus = 'Paid'

             UNION ALL

             SELECT
                'Commission',
                SaleId,
                TO_CHAR(SaleDate,'YYYY-MM-DD'),
                Commission,
                'DEBIT'
             FROM Sales WHERE FarmerId = :id

             ORDER BY TxDate DESC`,
            { id }
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getFarmerTransactions error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions.'
        });
    }
};

// ── CREATE FARMER ──────────────────────────────────────────
const createFarmer = async (req, res) => {
    try {
        const {
            farmerName, dateOfBirth, gender,
            email, location, contact, enrolmentDate
        } = req.body;

        // Validation
        if (!farmerName || !dateOfBirth || !gender ||
            !email || !location || !contact) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: farmerName, dateOfBirth,' +
                         ' gender, email, location, contact.'
            });
        }

        // Profile pic URL
        const profilePicUrl = req.file
            ? `uploads/farmers/${req.file.filename}`
            : process.env.DEFAULT_PROFILE;

        const result = await execute(
            `INSERT INTO Farmers (
                FarmerName, DateOfBirth, Gender,
                Email, Location, Contact,
                EnrolmentDate, ProfilePicUrl
             )
             VALUES (
                :farmerName,
                TO_DATE(:dateOfBirth, 'YYYY-MM-DD'),
                :gender, :email, :location, :contact,
                NVL(TO_DATE(:enrolmentDate,'YYYY-MM-DD'), SYSDATE),
                :profilePicUrl
             )
             RETURNING FarmerId INTO :farmerId`,
            {
                farmerName,
                dateOfBirth,
                gender,
                email,
                location,
                contact,
                enrolmentDate: enrolmentDate || null,
                profilePicUrl,
                farmerId: { dir: require('oracledb').BIND_OUT,
                            type: require('oracledb').STRING }
            }
        );

        return res.status(201).json({
            success:  true,
            message:  'Farmer registered successfully.',
            farmerId: result.outBinds.farmerId[0]
        });

    } catch (err) {
        // Duplicate email
        if (err.errorNum === 1) {
            return res.status(409).json({
                success: false,
                message: 'A farmer with this email already exists.'
            });
        }
        console.error('createFarmer error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to register farmer.'
        });
    }
};

// ── UPDATE FARMER ──────────────────────────────────────────
const updateFarmer = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            farmerName, dateOfBirth, gender,
            email, location, contact
        } = req.body;

        // Check exists
        const check = await execute(
            `SELECT FarmerId FROM Farmers WHERE FarmerId = :id`,
            { id }
        );
        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Farmer ${id} not found.`
            });
        }

        await execute(
            `UPDATE Farmers SET
                FarmerName  = NVL(:farmerName, FarmerName),
                DateOfBirth = NVL(TO_DATE(:dob,'YYYY-MM-DD'), DateOfBirth),
                Gender      = NVL(:gender,     Gender),
                Email       = NVL(:email,      Email),
                Location    = NVL(:location,   Location),
                Contact     = NVL(:contact,    Contact)
             WHERE FarmerId = :id`,
            {
                farmerName: farmerName || null,
                dob:        dateOfBirth || null,
                gender:     gender || null,
                email:      email || null,
                location:   location || null,
                contact:    contact || null,
                id
            }
        );

        return res.status(200).json({
            success: true,
            message: `Farmer ${id} updated successfully.`
        });

    } catch (err) {
        if (err.errorNum === 1) {
            return res.status(409).json({
                success: false,
                message: 'Email already in use by another farmer.'
            });
        }
        console.error('updateFarmer error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update farmer.'
        });
    }
};

// ── UPDATE PROFILE PICTURE ─────────────────────────────────
const updateProfilePic = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file uploaded.'
            });
        }

        // Get old pic to delete
        const old = await execute(
            `SELECT ProfilePicUrl FROM Farmers WHERE FarmerId = :id`,
            { id }
        );

        if (old.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Farmer ${id} not found.`
            });
        }

        const newUrl = `uploads/farmers/${req.file.filename}`;

        await execute(
            `UPDATE Farmers
             SET    ProfilePicUrl = :url
             WHERE  FarmerId = :id`,
            { url: newUrl, id }
        );

        // Delete old file if not default
        const oldUrl = old.rows[0].PROFILEPICURL;
        if (oldUrl && !oldUrl.includes('default')) {
            const oldPath = path.join(__dirname, '..', oldUrl);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        return res.status(200).json({
            success:     true,
            message:     'Profile picture updated.',
            profilePicUrl: newUrl
        });

    } catch (err) {
        console.error('updateProfilePic error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update profile picture.'
        });
    }
};

// ── DELETE FARMER ──────────────────────────────────────────
const deleteFarmer = async (req, res) => {
    try {
        const { id } = req.params;

        const check = await execute(
            `SELECT FarmerId FROM Farmers WHERE FarmerId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Farmer ${id} not found.`
            });
        }

        await execute(
            `DELETE FROM Farmers WHERE FarmerId = :id`,
            { id }
        );

        return res.status(200).json({
            success: true,
            message: `Farmer ${id} deleted successfully.`
        });

    } catch (err) {
        console.error('deleteFarmer error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete farmer.'
        });
    }
};

module.exports = {
    getAllFarmers,
    getFarmerById,
    getFarmerSummary,
    getFarmerMonthlyEarnings,
    getFarmerTransactions,
    createFarmer,
    updateFarmer,
    updateProfilePic,
    deleteFarmer
};