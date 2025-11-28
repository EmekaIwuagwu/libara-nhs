const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/migrations/create_nhs_credentials.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');

    console.log('📄 Running NHS credentials migration...');

    // Execute the migration
    await connection.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Table created: nhs_credentials');
    console.log('- Stores encrypted NHS portal credentials');
    console.log('- Supports both NHS Scotland and NHS England');
    console.log('- Uses unique constraint on (user_id, portal)');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

runMigration();
