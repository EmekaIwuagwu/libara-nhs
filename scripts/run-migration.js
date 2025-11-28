// Script to run the text_resumes migration
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function runMigration() {
    try {
        console.log('Reading migration file...');
        const migrationPath = path.join(__dirname, '../database/migrations/add_text_resumes.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('Connecting to database...');
        const connection = await pool.getConnection();

        console.log('Running migration...');
        await connection.query(migrationSQL);

        console.log('✓ Migration completed successfully!');

        // Verify table was created
        const [tables] = await connection.query("SHOW TABLES LIKE 'text_resumes'");
        if (tables.length > 0) {
            console.log('✓ text_resumes table created successfully');

            // Show table structure
            const [columns] = await connection.query('DESCRIBE text_resumes');
            console.log('\nTable structure:');
            columns.forEach(col => {
                console.log(`  - ${col.Field} (${col.Type})`);
            });
        } else {
            console.log('✗ Warning: text_resumes table not found after migration');
        }

        connection.release();
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
