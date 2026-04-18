const fs = require('fs');
const path = require('path');
const db = require('./config/database');

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, 'database', 'migrations', 'add_images_to_submissions.sql');
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
            if (statement.toUpperCase().startsWith('DESCRIBE')) {
                console.log(`Skipping DESCRIBE statement in automated run.`);
                continue;
            }
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await db.query(statement);
        }

        console.log('✅ Migration completed successfully.');

        // Verification
        console.log('🔍 Verifying table schema...');
        const [cols] = await db.query('DESCRIBE farmer_submissions');
        const imagesCol = cols.find(c => c.Field === 'images');
        if (imagesCol) {
            console.log('✅ Column "images" exists with type:', imagesCol.Type);
        } else {
            console.error('❌ Column "images" missing!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
