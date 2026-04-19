const fs = require('fs');
const path = require('path');
const db = require('./config/database');

async function runMigration() {
    const migrationFile = process.argv[2];
    if (!migrationFile) {
        console.error('Usage: node run-migration.js <migration_file_path>');
        process.exit(1);
    }

    try {
        const migrationPath = path.resolve(migrationFile);
        if (!fs.existsSync(migrationPath)) {
            console.error(`File not found: ${migrationPath}`);
            process.exit(1);
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Split by semicolon to handle multiple statements if any, though raw query might support it depending on config
        // The db config has multipleStatements: true usually, let's try running it directly.
        // However, the file has comments and multiple statements.

        console.log('🔄 Running migration from:', migrationPath);

        // Simple parsing to get the ALTER TABLE statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 100)}...`);
            await db.query(statement);
        }

        console.log('✅ Migration completed successfully.');

        // Verification
        console.log('🔍 Current table schema:');
        const [cols] = await db.query('DESCRIBE farmer_submissions');
        console.table(cols.map(c => ({ Field: c.Field, Type: c.Type })));

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
