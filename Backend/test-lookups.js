const db = require('./config/database');

async function verifyLookups() {
    try {
        const category = 'vegetables'; // Front-end sends this
        const unit = 'kg'; // Front-end sends this
        const status = 'under-review';

        console.log(`Checking DB for: ${category}, ${unit}, ${status}`);

        const [cat] = await db.query('SELECT * FROM product_categories WHERE category_name = ?', [category]);
        console.log('Category found:', cat);

        const [u] = await db.query('SELECT * FROM measurement_units WHERE unit_name = ?', [unit]);
        console.log('Unit found:', u);

        const [s] = await db.query('SELECT * FROM submission_statuses WHERE status_name = ?', [status]);
        console.log('Status found:', s);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verifyLookups();
