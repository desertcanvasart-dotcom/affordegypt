import { migrateExistingDataToTranslations } from "./translationUtils";

async function main() {
  console.log("Starting translation migration...");
  
  try {
    await migrateExistingDataToTranslations();
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();