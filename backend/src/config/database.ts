import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Determine if we're using Azure SQL or PostgreSQL
const isAzureSQL = process.env.DATABASE_URL?.includes('sqlserver://') || 
                   process.env.AZURE_SQL_SERVER;

const config = isAzureSQL ? {
  client: 'mssql',
  connection: process.env.DATABASE_URL || {
    server: process.env.AZURE_SQL_SERVER || 'localhost',
    port: parseInt(process.env.AZURE_SQL_PORT || '1433'),
    user: process.env.AZURE_SQL_USER || 'sa',
    password: process.env.AZURE_SQL_PASSWORD || '#8Broncos#8Broncos',
    database: process.env.AZURE_SQL_DATABASE || 'sentinelforge_ctf',
    options: {
      encrypt: true,
      trustServerCertificate: false,
      enableArithAbort: true
    }
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './migrations',
    extension: 'ts'
  },
  seeds: {
    directory: './seeds',
    extension: 'ts'
  }
} : {
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sentinelforge_ctf'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './migrations',
    extension: 'ts'
  },
  seeds: {
    directory: './seeds',
    extension: 'ts'
  }
};

const db = knex(config);

export default db;
export { config };
