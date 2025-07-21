import Database from "better-sqlite3";
import { promises as fs } from "fs";
import path from "path";

export interface Migration {
  id: string;
  name: string;
  up: string | (() => string); // SQL string or function that returns SQL
  down: string | (() => string); // SQL string or function that returns SQL
}

export class MigrationRunner {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // Initialize migrations table if it doesn't exist
  private initMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Get list of executed migrations
  private getExecutedMigrations(): string[] {
    const stmt = this.db.prepare(
      "SELECT id FROM migrations ORDER BY executed_at"
    );
    const rows = stmt.all() as { id: string }[];
    return rows.map((row) => row.id);
  }

  // Load migrations from migrations directory
  async loadMigrations(): Promise<Migration[]> {
    const migrationsDir = path.join(__dirname, "migrations");

    try {
      await fs.access(migrationsDir);
    } catch {
      // Migrations directory doesn't exist, create it
      await fs.mkdir(migrationsDir, { recursive: true });
      console.log("📁 Created migrations directory - no migrations found");
      return [];
    }

    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter((file) => file.endsWith(".js")).sort();

    const migrations: Migration[] = [];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      try {
        const migration = await import(filePath);
        if (migration.default) {
          migrations.push(migration.default);
        }
      } catch (error) {
        console.error(`Error loading migration ${file}:`, error);
      }
    }

    return migrations;
  }

  // Run pending migrations
  async runMigrations(): Promise<void> {
    console.log("🔄 Checking for database migrations...");

    this.initMigrationsTable();

    const allMigrations = await this.loadMigrations();
    const executedMigrations = this.getExecutedMigrations();
    const pendingMigrations = allMigrations.filter(
      (migration) => !executedMigrations.includes(migration.id)
    );

    if (pendingMigrations.length === 0) {
      console.log("✅ Database is up to date");
      return;
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migration(s)`);

    for (const migration of pendingMigrations) {
      try {
        console.log(
          `⏳ Running migration: ${migration.id} - ${migration.name}`
        );

        // Start transaction
        this.db.exec("BEGIN TRANSACTION");

        // Run migration SQL - handle both string and function
        const upSQL =
          typeof migration.up === "function" ? migration.up() : migration.up;
        this.db.exec(upSQL);

        // Record migration
        const stmt = this.db.prepare(
          "INSERT INTO migrations (id, name) VALUES (?, ?)"
        );
        stmt.run(migration.id, migration.name);

        // Commit transaction
        this.db.exec("COMMIT");

        console.log(`✅ Completed migration: ${migration.id}`);
      } catch (error) {
        // Rollback on error
        this.db.exec("ROLLBACK");
        console.error(`❌ Migration failed: ${migration.id}`, error);
        throw error;
      }
    }

    console.log("🎉 All migrations completed successfully!");
  }
}
