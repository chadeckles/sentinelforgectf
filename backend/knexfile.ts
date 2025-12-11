import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Determine if we're using Azure SQL or PostgreSQL
const isAzureSQL = process.env.DATABASE_URL?.includes('sqlserver://') || 
                   process.env.AZURE_SQL_SERVER;

const getConnectionConfig = () => {
  if (isAzureSQL) {
    return {
      client: 'mssql',
      connection: process.env.DATABASE_URL || {
        server: process.env.AZURE_SQL_SERVER || 'localhost',
        port: parseInt(process.env.AZURE_SQL_PORT || '1433', 10),
        user: process.env.AZURE_SQL_USER || 'sa',
        password: process.env.AZURE_SQL_PASSWORD || '',
        database: process.env.AZURE_SQL_DATABASE || 'sentinelforge_ctf',
        options: {
          encrypt: true,
          trustServerCertificate: false,
          enableArithAbort: true
        }
      }
    };
  }

  if (process.env.DATABASE_URL) {
    return {
      client: 'pg',
      connection: process.env.DATABASE_URL
    };
  }

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'sentinelforge_ctf';

  return {
    client: 'pg',
    connection: {
      host,
      port,
      user,
      password,
      database
    }
  };
};

const baseConfig = getConnectionConfig();

const config: { [key: string]: Knex.Config } = {
  development: {
    ...baseConfig,
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
  },

  production: {
    ...baseConfig,
    pool: {
      min: 2,
      max: 20
    },
    migrations: {
      directory: './migrations',
      extension: 'ts'
    },
    seeds: {
      directory: './seeds',
      extension: 'ts'
    }
  }
};

export default config;
