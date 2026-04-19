const db = require('./Backend/config/database');
async function seedData() {
    try {
        console.log('--- Checking for user nethmini@gmail.com ---');
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', ['nethmini@gmail.com']);
        let farmerId;
        
        if (users.length > 0) {
            farmerId = users[0].id;
            console.log(`User already exists with ID: ${farmerId}`);
        } else {
            console.log('--- Creating user nethmini@gmail.com ---');
            const [userResult] = await db.query(
                'INSERT INTO users (full_name, email, phone, role_id, status_id, address, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
                ['Nethmini Farmer', 'nethmini@gmail.com', '0771234567', 1, 1, '123 Farm Road, Anuradhapura', 'test_hash']
            );
            farmerId = userResult.insertId;
            console.log(`User created with ID: ${farmerId}`);
        }

        console.log('--- Seeding Categories and Units ---');
        // Check column names for product_categories
        const [catCols] = await db.query('DESCRIBE product_categories');
        const catPk = catCols.find(c => c.Key === 'PRI')?.Field || 'id';
        const catValCol = catCols.find(c => c.Field === 'category_name' || c.Field === 'name')?.Field || 'category_name';

        const [catRows] = await db.query(`SELECT ${catPk} as id FROM product_categories WHERE ${catValCol} = "fruits"`);
        let categoryId = catRows.length > 0 ? catRows[0].id : null;
        if (!categoryId) {
            const [cRes] = await db.query(`INSERT INTO product_categories (${catValCol}) VALUES ("fruits")`);
            categoryId = cRes.insertId;
        }

        const [unitCols] = await db.query('DESCRIBE measurement_units');
        const unitPk = unitCols.find(c => c.Key === 'PRI')?.Field || 'id';
        const unitValCol = unitCols.find(c => c.Field === 'unit_name' || c.Field === 'name')?.Field || 'unit_name';

        const [unitRows] = await db.query(`SELECT ${unitPk} as id FROM measurement_units WHERE ${unitValCol} = "kg"`);
        let unitId = unitRows.length > 0 ? unitRows[0].id : null;
        if (!unitId) {
            const [uRes] = await db.query(`INSERT INTO measurement_units (${unitValCol}) VALUES ("kg")`);
            unitId = uRes.insertId;
        }

        console.log('--- Seeding Statuses ---');
        // Descriptions for status tables
        const [subStatCols] = await db.query('DESCRIBE submission_statuses');
        const subStatPk = subStatCols.find(c => c.Key === 'PRI')?.Field || 'id';

        const [subStats] = await db.query('SELECT * FROM submission_statuses');
        console.table(subStats);

        const [delStatCols] = await db.query('DESCRIBE delivery_statuses');
        const delStatPk = delStatCols.find(c => c.Key === 'PRI')?.Field || 'id';
        const delStatValCol = delStatCols.find(c => c.Field === 'status_name' || c.Field === 'name')?.Field || 'status_name';

        // Ensure delivery status 4 (completed) exists
        let completedStatusId = 4;
        const [delStats] = await db.query(`SELECT ${delStatPk} as id FROM delivery_statuses WHERE ${delStatValCol} = "completed"`);
        if (delStats.length > 0) {
            completedStatusId = delStats[0].id;
        } else {
             const [dsRes] = await db.query(`INSERT INTO delivery_statuses (${delStatValCol}) VALUES ("completed")`);
             completedStatusId = dsRes.insertId;
        }

        console.log('--- Creating Submissions and Deliveries ---');
        // Check deliveries schema
        const [delCols] = await db.query('DESCRIBE deliveries');
        const hasDelNum = delCols.some(c => c.Field === 'delivery_number');
        const hasFinalDate = delCols.some(c => c.Field === 'final_delivery_date');

        // 1. One active submission
        const [sub1] = await db.query(
            'INSERT INTO farmer_submissions (farmer_id, product_name, category_id, quantity, unit_id, grade, status_id, harvest_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [farmerId, 'Fresh Mangoes', categoryId, 100, unitId, 'Grade A', 1, '2026-04-10']
        );

        // 2. One completed delivery (submission must be 'selected' - status 2 usually)
        const [sub2] = await db.query(
            'INSERT INTO farmer_submissions (farmer_id, product_name, category_id, quantity, unit_id, grade, status_id, harvest_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [farmerId, 'Fresh Tomatoes', categoryId, 250, unitId, 'Grade B', 2, '2026-04-01']
        );
        
        let cols = ['submission_id', 'status_id'];
        let vals = [sub2.insertId, completedStatusId];

        if (hasDelNum) {
            cols.push('delivery_number');
            vals.push('DEL-' + Date.now());
        }
        if (hasFinalDate) {
            cols.push('final_delivery_date');
            vals.push('2026-04-05');
        }
        
        await db.query(
            `INSERT INTO deliveries (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
            vals
        );

        console.log('✅ Seeding completed! Please log in as nethmini@gmail.com');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seedData();