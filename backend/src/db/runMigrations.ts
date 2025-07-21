import { database } from "./database";
import { MigrationRunner } from "./migrationRunner";

/**
 * Run database migrations synchronously
 * @returns Promise that resolves when migrations complete successfully
 */
export async function runDatabaseMigrations(): Promise<void> {
  const migrationRunner = new MigrationRunner(database);
  await migrationRunner.runMigrations();
}
