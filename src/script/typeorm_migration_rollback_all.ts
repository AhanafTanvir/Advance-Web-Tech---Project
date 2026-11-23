import { dataSourceOptions } from "@/config/database.config";
import { DataSource, MigrationExecutor } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const migrateRollbackAll = async () => {
  console.log(`Rolling back all migrations...`);
  const ds = new DataSource({
    ...dataSourceOptions,
  } as PostgresConnectionOptions);

  try {
    await ds.initialize();
    const migrationExecutor = new MigrationExecutor(ds);
    const executedMigrations = await migrationExecutor.getExecutedMigrations();
    console.log(`Found ${executedMigrations.length} executed migration(s) to rollback.`);

    for (let i = 0; i < executedMigrations.length; i++) {
      await migrationExecutor.undoLastMigration();
    }
    console.log("All migrations rolled back successfully.");
  } catch (err) {
    console.error("Rollback all failed:", err);
    process.exit(1);
  } finally {
    if (ds.isInitialized) {
      await ds.destroy();
    }
  }
};

migrateRollbackAll();
