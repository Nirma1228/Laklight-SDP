const db = require('./config/database');

async function testSubmission() {
    try {
        console.log('🧪 Testing farmer submission...');

        // Test data
        const testData = {
            farmer_id: 1,
            product_name: 'Fresh Mango',
            category: 'fruits',
            quantity: 100,
            unit: 'kg',
            grade: 'grade-a', // Testing FRONTEND value
            custom_price: 250.00,
            harvest_date: '2026-02-01',
            transport: 'self', // Testing FRONTEND value
            delivery_date: '2026-02-05',
            storage_instructions: 'Keep in cool dry place',
            images: JSON.stringify(['image1.jpg', 'image2.jpg']),
            notes: 'Premium quality mangoes',
            status: 'under-review'
        };

        // Helper to get ID
        const getPkId = async (table, pk, col, val) => {
            const [rows] = await db.query(`SELECT ${pk} FROM ${table} WHERE ${col} = ?`, [val]);
            return rows.length > 0 ? rows[0][pk] : null;
        };

        const catId = await getPkId('product_categories', 'category_id', 'category_name', 'fruits');
        const unitId = await getPkId('measurement_units', 'unit_id', 'unit_name', 'kg');
        const statusId = await getPkId('submission_statuses', 'submission_status_id', 'status_name', 'under-review');

        if (!catId || !unitId || !statusId) {
            throw new Error('Reference data not found. Please seed database.');
        }

        // Mimic Controller Mapping Logic
        const gradeMap = {
            'grade-a': 'Grade A',
            'grade-b': 'Grade B',
            'grade-c': 'Grade C'
        };
        const transportMap = {
            'self': 'Self Transport',
            'company': 'Company Truck Pickup'
        };

        const finalGrade = gradeMap[testData.grade] || testData.grade;
        const finalTransport = transportMap[testData.transport] || testData.transport;

        const gradeId = await getPkId('quality_grades', 'grade_id', 'grade_name', finalGrade);
        const transportMethodId = await getPkId('transport_methods', 'transport_method_id', 'method_name', finalTransport);

        const [result] = await db.query(
            `INSERT INTO farmer_submissions 
       (farmer_id, product_name, category_id, quantity, unit_id, grade_id, custom_price, harvest_date, transport_method_id, delivery_date, storage_instructions, images, notes, status_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                testData.farmer_id,
                testData.product_name,
                catId, // category_id
                testData.quantity,
                unitId, // unit_id
                gradeId, // Mapped Grade ID
                testData.custom_price,
                testData.harvest_date,
                transportMethodId, // Mapped Transport ID
                testData.delivery_date,
                testData.storage_instructions,
                testData.images, // Now this column exists!
                testData.notes,
                statusId // status_id
            ]
        );

        console.log('✅ Test submission successful!');
        console.log('Inserted ID:', result.insertId);

        // Verify the data
        const [rows] = await db.query('SELECT * FROM farmer_submissions WHERE submission_id = ?', [result.insertId]);
        console.log('\n📦 Retrieved data:');
        console.log(rows[0]);

        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

testSubmission();
