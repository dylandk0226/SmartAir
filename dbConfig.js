const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
  },
};

let pool;

async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
      console.log('Database connection pool created');
      
      pool.on('error', err => {
        console.error('Database pool error:', err);
        pool = null;
      });
    }
    return pool;
  } catch (error) {
    console.error('Failed to create database pool:', error);
    throw error;
  }
}

async function closePool() {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Database connection pool closed');
    }
  } catch (error) {
    console.error('Error closing pool:', error);
  }
}

module.exports = {
  sql,
  dbConfig,
  getConnection,
  closePool,
};