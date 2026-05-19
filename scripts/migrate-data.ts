import pg from "pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("No DIRECT_URL or DATABASE_URL found");
  process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function migrateMagazinePublishedStatus() {
  console.log("Migrating magazines.is_published (int) → published (boolean)...");

  const result = await client.query(`
    UPDATE magazines SET published = (is_published = 1)
    WHERE published = false AND is_published IS NOT NULL
  `);

  console.log(`  Migrated ${result.rowCount} magazines`);
}

async function migrateResourcePublishedStatus() {
  console.log("Migrating resources.status (text) → is_published (boolean)...");

  const result = await client.query(`
    UPDATE resources SET is_published = (status = 'Published')
    WHERE is_published = false
  `);

  console.log(`  Migrated ${result.rowCount} resources`);
}

async function migratePaymentData() {
  console.log("Migrating participants payment fields → payments table...");

  const result = await client.query(`
    INSERT INTO payments (participant_id, competition_id, amount, payment_provider, transaction_id, status, created_at, updated_at)
    SELECT
      p.id,
      cp.competition_id,
      0,
      p.payment_provider,
      p.transaction_id,
      'pending',
      p.created_at,
      p.updated_at
    FROM participants p
    JOIN competitions_participants cp ON cp.participant_id = p.id
    WHERE p.transaction_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM payments pay
      WHERE pay.participant_id = p.id
      AND pay.transaction_id = p.transaction_id
    )
  `);

  console.log(`  Created ${result.rowCount} payment records`);
}

async function main() {
  console.log("Connecting to database...");
  await client.connect();
  console.log("Connected. Starting data migration...\n");

  try {
    await migrateMagazinePublishedStatus();
    await migrateResourcePublishedStatus();
    await migratePaymentData();

    console.log("\nData migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
