import { Migration } from "../migrationRunner";

const migration: Migration = {
  id: "001",
  name: "create_users_table",

  up: `
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  down: `
    DROP TABLE IF EXISTS users;
  `,
};

export default migration;
