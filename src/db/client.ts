import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';

let db: MySql2Database;

export const getDbClient = async () => {
  if (db) {
    return db;
  }

  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: Number(process.env.DATABASE_PORT),
  });

  db = drizzle(connection);

  return db;
};

export const runMigrations = async () => {
  const db = await getDbClient();
  await migrate(db, { migrationsFolder: './drizzle' });
};
