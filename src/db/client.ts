import mysql from 'mysql2/promise';
import { DefaultLogger, LogWriter } from 'drizzle-orm';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { logger } from '../logger.ts';

let db: MySql2Database;

class MyLogWriter implements LogWriter {
  write(message: string) {
    logger.silly(message);
  }
}

const drizzleLogger = new DefaultLogger({ writer: new MyLogWriter() });

export const getDbClient = async () => {
  if (db) {
    return db;
  }

  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: Number(process.env.DATABASE_PORT),
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  db = drizzle(pool, { logger: drizzleLogger });

  return db;
};

export const runMigrations = async () => {
  const db = await getDbClient();
  await migrate(db, { migrationsFolder: './drizzle' });
};
