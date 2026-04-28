const oracledb = require('oracledb');

// Use Thin mode (no Oracle Client needed for Oracle 23ai)
oracledb.initOracleClient(); // Remove this line if using Thin mode

// Connection pool configuration
const poolConfig = {
    user:             process.env.DB_USER,
    password:         process.env.DB_PASSWORD,
    connectionString: process.env.DB_CONNECTION_STRING,
    poolMin:          2,
    poolMax:          10,
    poolIncrement:    1,
    poolTimeout:      60,
    poolPingInterval: 60,
    stmtCacheSize:    30,
};

// Initialize connection pool
async function initializePool() {
    try {
        await oracledb.createPool(poolConfig);
        console.log('✅ Oracle DB connection pool created successfully');
    } catch (err) {
        console.error('❌ Failed to create Oracle connection pool:', err.message);
        process.exit(1);
    }
}

// Get a connection from pool
async function getConnection() {
    try {
        return await oracledb.getConnection();
    } catch (err) {
        console.error('❌ Failed to get DB connection:', err.message);
        throw err;
    }
}

// Execute a query (auto-release connection)
async function execute(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await getConnection();

        const defaultOptions = {
            outFormat:     oracledb.OUT_FORMAT_OBJECT,
            autoCommit:    true,
            fetchTypeMap:  new Map([
                [oracledb.DATE,      { type: oracledb.STRING,
                                       dbFormat: 'YYYY-MM-DD' }],
                [oracledb.TIMESTAMP, { type: oracledb.STRING,
                                       dbFormat: 'YYYY-MM-DD HH24:MI:SS' }],
            ]),
        };

        const result = await connection.execute(
            sql,
            binds,
            { ...defaultOptions, ...options }
        );

        return result;

    } catch (err) {
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error('❌ Error closing connection:', closeErr.message);
            }
        }
    }
}

// Close pool (on shutdown)
async function closePool() {
    try {
        await oracledb.getPool().close(10);
        console.log('✅ Oracle DB pool closed');
    } catch (err) {
        console.error('❌ Error closing pool:', err.message);
    }
}

module.exports = { initializePool, getConnection, execute, closePool };