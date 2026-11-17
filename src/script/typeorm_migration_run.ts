
import { DataSource } from "typeorm";
import { dataSourceOptions } from "@/config/database.config";

async function migrateRun(): Promise<void> {
  console.log("Starting database migrations...");

  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log("Database connection established.");

    const migrations = await dataSource.runMigrations();

    if (migrations.length === 0) {
      console.log("No pending migrations.");
    } else {
      console.log("Successfully executed migrations:");

      migrations.forEach((migration) => {
        console.log(`- ${migration.name}`);
      });
    }
  } catch (error) {
    console.error("Migration execution failed:", error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log("Database connection closed.");
    }
  }
}

void migrateRun();
