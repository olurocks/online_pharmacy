import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import sequelize from "../config.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  try {
    console.log("Starting database migrations...");

    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    const migrationSQL = readFileSync(
      join(__dirname, "001-create-tables.sql"),
      "utf8"
    );

    await sequelize.query(migrationSQL);
    console.log("Database tables created successfully.");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

(async () => {
  await runMigrations();
})();

export default runMigrations;
