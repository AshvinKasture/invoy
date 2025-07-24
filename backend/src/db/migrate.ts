#!/usr/bin/env node

import Database from "better-sqlite3";
import dotenv from "dotenv";
import { MigrationRunner } from "./migrationRunner";

// Load environment variables
dotenv.config();

// Simple CLI for database migrations
class MigrationCLI {
  private db: Database.Database;
  private runner: MigrationRunner;

  constructor() {
    this.db = new Database("database.db");
    this.runner = new MigrationRunner(this.db);
  }

  private async showHelp(): Promise<void> {
    console.log(`
🔧 Migration CLI

Usage:
  npm run migrate <command>

Commands:
  up                Run all pending migrations
  down <id>         Rollback a specific migration by ID
  status            Show migration status
  help              Show this help message

Examples:
  npm run migrate up
  npm run migrate down 001
  npm run migrate status
`);
  }

  private async showStatus(): Promise<void> {
    console.log("📊 Migration Status\n");

    // Get executed migrations
    const executedStmt = this.db.prepare(
      "SELECT id, name, executed_at FROM migrations ORDER BY executed_at"
    );
    const executed = executedStmt.all() as {
      id: string;
      name: string;
      executed_at: string;
    }[];

    if (executed.length === 0) {
      console.log("❌ No migrations have been executed yet");
      return;
    }

    console.log("✅ Executed Migrations:");
    executed.forEach((migration) => {
      console.log(
        `  ${migration.id} - ${migration.name} (${migration.executed_at})`
      );
    });
  }

  private async rollbackMigration(migrationId: string): Promise<void> {
    try {
      console.log(`🔄 Rolling back migration: ${migrationId}`);

      // Check if migration exists in executed migrations
      const stmt = this.db.prepare("SELECT * FROM migrations WHERE id = ?");
      const existingMigration = stmt.get(migrationId);

      if (!existingMigration) {
        console.log(
          `❌ Migration ${migrationId} is not executed or doesn't exist`
        );
        return;
      }

      // Load migrations to find the rollback SQL
      const allMigrations = await this.runner.loadMigrations();
      const migration = allMigrations.find((m) => m.id === migrationId);

      if (!migration) {
        console.log(`❌ Migration file for ${migrationId} not found`);
        return;
      }

      // Start transaction
      this.db.exec("BEGIN TRANSACTION");

      try {
        // Run the down migration - handle both string and function
        console.log(`⏳ Executing rollback SQL for ${migrationId}`);
        const downSQL =
          typeof migration.down === "function"
            ? migration.down()
            : migration.down;
        this.db.exec(downSQL);

        // Remove from migrations table
        const deleteStmt = this.db.prepare(
          "DELETE FROM migrations WHERE id = ?"
        );
        deleteStmt.run(migrationId);

        // Commit transaction
        this.db.exec("COMMIT");

        console.log(`✅ Successfully rolled back migration: ${migrationId}`);
      } catch (error) {
        // Rollback transaction on error
        this.db.exec("ROLLBACK");
        throw error;
      }
    } catch (error) {
      console.error(`❌ Rollback failed for ${migrationId}:`, error);
      throw error;
    }
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case "up":
          await this.runner.runMigrations();
          break;

        case "down":
          const migrationId = args[1];
          if (!migrationId) {
            console.log("❌ Please specify a migration ID to rollback");
            console.log("Example: npm run migrate down 001");
            return;
          }
          await this.rollbackMigration(migrationId);
          break;

        case "status":
          await this.showStatus();
          break;

        case "help":
        case "--help":
        case "-h":
          await this.showHelp();
          break;

        default:
          console.log(`❌ Unknown command: ${command}`);
          await this.showHelp();
          break;
      }
    } catch (error) {
      console.error("❌ Migration command failed:", error);
      process.exit(1);
    } finally {
      this.db.close();
    }
  }
}

// Run the CLI
if (require.main === module) {
  const cli = new MigrationCLI();
  cli.run().catch((error) => {
    console.error("❌ CLI Error:", error);
    process.exit(1);
  });
}

export { MigrationCLI };
