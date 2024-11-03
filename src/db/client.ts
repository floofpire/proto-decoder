import { DefaultLogger, type LogWriter } from 'drizzle-orm';
import { type MySql2Database, drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';

import { logger } from '../logger';

let db: MySql2Database;

class MyLogWriter implements LogWriter {
  write(message: string) {
    logger.silly(message);
  }
}

const drizzleLogger = new DefaultLogger({ writer: new MyLogWriter() });

export const doesNotHaveDbConfig = (): boolean => {
  return (
    !process.env.DATABASE_HOST ||
    !process.env.DATABASE_USER ||
    !process.env.DATABASE_PASSWORD ||
    !process.env.DATABASE_NAME
  );
};

export const getDbClient = async () => {
  if (db) {
    return db;
  }

  if (doesNotHaveDbConfig()) {
    logger.info('Missing DB config, skipping DB persistence');
    db = drizzle.mock({ logger: drizzleLogger });

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
  if (doesNotHaveDbConfig()) {
    return;
  }
  await migrate(db, { migrationsFolder: './drizzle' });
};
