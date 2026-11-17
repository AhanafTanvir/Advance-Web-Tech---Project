
import { DataSource } from "typeorm";
import { dataSourceOptions } from "@/config/database.config";

async function migrateRollback(): Promise<void> {
  console.log("Starting database migration rollback...");

  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log("Database connection established.");

    await dataSource.undoLastMigration();

    console.log("Last migration successfully reverted.");
  } catch (error) {
    console.error("Migration rollback failed:", error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log("Database connection closed.");
    }
  }
}

void migrateRollback();
