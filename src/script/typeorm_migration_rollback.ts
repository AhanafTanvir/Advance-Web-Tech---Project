import { dataSourceOptions } from "@/config/database.config";
import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const migrateRollback = async () => {
  console.log(`Rolling back.....`);
  const ds = new DataSource({
    ...dataSourceOptions,
  } as PostgresConnectionOptions);

  try {
    await ds.initialize();
    await ds.undoLastMigration();
    console.log("Rollback completed.");
  } catch (err) {
    console.error("Rollback failed:", err);
    process.exit(1);
  } finally {
    if (ds.isInitialized) {
      await ds.destroy();
    }
  }
};

migrateRollback();
