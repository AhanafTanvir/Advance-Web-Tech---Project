import { dataSourceOptions } from "@/config/database.config";
import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const migrateRun = async () => {
  console.log(`Migrating.....`);
  const ds = new DataSource({
    ...dataSourceOptions,
  } as PostgresConnectionOptions);

  try {
    await ds.initialize();
    const migrations = await ds.runMigrations();
    if (migrations.length === 0) {
      console.log("No new migrations to run.");
    } else {
      console.log(`Successfully executed ${migrations.length} migration(s):`);
      migrations.forEach((m) => console.log(`  - ${m.name}`));
    }
    console.log("Migration completed.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    if (ds.isInitialized) {
      await ds.destroy();
    }
  }
};

migrateRun();
