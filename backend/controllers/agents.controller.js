// ============================================================
// controllers/agents.controller.js
// ============================================================

const { execute } = require('../config/db');

// ── GET ALL AGENTS ─────────────────────────────────────────
const getAllAgents = async (req, res) => {
    try {
        const result = await execute(
            `SELECT
                AgentIdNum,
                AgentId,
                AgentName,
                Contact,
                Location,
                TO_CHAR(CreatedAt, 'YYYY-MM-DD HH24:MI:SS') AS CreatedAt,
                TO_CHAR(UpdatedAt, 'YYYY-MM-DD HH24:MI:SS') AS UpdatedAt
             FROM Agents
             ORDER BY AgentIdNum`
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getAllAgents error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch agents.'
        });
    }
};

// ── GET ONE AGENT ──────────────────────────────────────────
const getAgentById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT
                AgentIdNum,
                AgentId,
                AgentName,
                Contact,
                Location,
                TO_CHAR(CreatedAt, 'YYYY-MM-DD HH24:MI:SS') AS CreatedAt,
                TO_CHAR(UpdatedAt, 'YYYY-MM-DD HH24:MI:SS') AS UpdatedAt
             FROM Agents
             WHERE AgentId = :id`,
            { id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Agent ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });

    } catch (err) {
        console.error('getAgentById error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch agent.'
        });
    }
};

// ── GET AGENT PERFORMANCE ──────────────────────────────────
const getAgentPerformance = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT *
             FROM vw_agent_performance
             WHERE AgentId = :id`,
            { id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Agent ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data:    result.rows[0]
        });

    } catch (err) {
        console.error('getAgentPerformance error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch agent performance.'
        });
    }
};

// ── GET AGENT SALES ────────────────────────────────────────
const getAgentSales = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await execute(
            `SELECT *
             FROM   vw_sales
             WHERE  AgentId = :id
             ORDER  BY SaleDate DESC`,
            { id }
        );

        return res.status(200).json({
            success: true,
            count:   result.rows.length,
            data:    result.rows
        });

    } catch (err) {
        console.error('getAgentSales error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch agent sales.'
        });
    }
};

// ── CREATE AGENT ───────────────────────────────────────────
const createAgent = async (req, res) => {
    try {
        const { agentName, contact, location } = req.body;

        if (!agentName || !contact || !location) {
            return res.status(400).json({
                success: false,
                message: 'All fields required: agentName, contact, location.'
            });
        }

        const result = await execute(
            `INSERT INTO Agents (AgentName, Contact, Location)
             VALUES (:agentName, :contact, :location)
             RETURNING AgentId INTO :agentId`,
            {
                agentName,
                contact,
                location,
                agentId: {
                    dir:  require('oracledb').BIND_OUT,
                    type: require('oracledb').STRING
                }
            }
        );

        return res.status(201).json({
            success: true,
            message: 'Agent created successfully.',
            agentId: result.outBinds.agentId[0]
        });

    } catch (err) {
        console.error('createAgent error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to create agent.'
        });
    }
};

// ── UPDATE AGENT ───────────────────────────────────────────
const updateAgent = async (req, res) => {
    try {
        const { id }  = req.params;
        const { agentName, contact, location } = req.body;

        const check = await execute(
            `SELECT AgentId FROM Agents WHERE AgentId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Agent ${id} not found.`
            });
        }

        await execute(
            `UPDATE Agents SET
                AgentName = NVL(:agentName, AgentName),
                Contact   = NVL(:contact,   Contact),
                Location  = NVL(:location,  Location)
             WHERE AgentId = :id`,
            {
                agentName: agentName || null,
                contact:   contact   || null,
                location:  location  || null,
                id
            }
        );

        return res.status(200).json({
            success: true,
            message: `Agent ${id} updated successfully.`
        });

    } catch (err) {
        console.error('updateAgent error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to update agent.'
        });
    }
};

// ── DELETE AGENT ───────────────────────────────────────────
const deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;

        const check = await execute(
            `SELECT AgentId FROM Agents WHERE AgentId = :id`,
            { id }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Agent ${id} not found.`
            });
        }

        // Check if agent has sales
        const sales = await execute(
            `SELECT COUNT(*) AS SaleCount
             FROM Sales WHERE AgentId = :id`,
            { id }
        );

        if (sales.rows[0].SALECOUNT > 0) {
            return res.status(409).json({
                success: false,
                message: `Cannot delete agent ${id}.` +
                         ` They have ${sales.rows[0].SALECOUNT}` +
                         ` sales on record.`
            });
        }

        await execute(
            `DELETE FROM Agents WHERE AgentId = :id`,
            { id }
        );

        return res.status(200).json({
            success: true,
            message: `Agent ${id} deleted successfully.`
        });

    } catch (err) {
        console.error('deleteAgent error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete agent.'
        });
    }
};

module.exports = {
    getAllAgents,
    getAgentById,
    getAgentPerformance,
    getAgentSales,
    createAgent,
    updateAgent,
    deleteAgent
};