import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { DB } from "./schema";

const database = new Database("database.db");

const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: database,
  }),
});

export { database };
export default db;
