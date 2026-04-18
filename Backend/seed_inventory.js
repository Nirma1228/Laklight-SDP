const db = require('./config/database');

async function seedInventory() {
    try {
        // ─── 1. Lookup reference IDs ─────────────────────────────────────────
        const [[{ gradeA }]] = await db.query(`SELECT grade_id AS gradeA FROM quality_grades WHERE grade_name = 'Grade A'`);
        const [[{ gradeB }]] = await db.query(`SELECT grade_id AS gradeB FROM quality_grades WHERE grade_name = 'Grade B'`);
        const [[{ gradeC }]] = await db.query(`SELECT grade_id AS gradeC FROM quality_grades WHERE grade_name = 'Grade C'`);
        const [[{ kgUnitId }]] = await db.query(`SELECT unit_id AS kgUnitId FROM measurement_units WHERE unit_name = 'kg'`);
        const [[{ unitUnitId }]] = await db.query(`SELECT unit_id AS unitUnitId FROM measurement_units WHERE unit_name = 'unit'`);
        const [[{ packUnitId }]] = await db.query(`SELECT unit_id AS packUnitId FROM measurement_units WHERE unit_name = 'pack'`);
        const [[{ bottleUnitId }]] = await db.query(`SELECT unit_id AS bottleUnitId FROM measurement_units WHERE unit_name = 'bottle'`);

        // Lookup product IDs
        const [productRows] = await db.query(`SELECT product_id, name FROM products`);
        const productMap = {};
        productRows.forEach(p => { productMap[p.name.toLowerCase()] = p.product_id; });

        // ─── 2. Seed inventory_raw ───────────────────────────────────────────
        const rawItems = [
            {
                material_name: 'Fresh Strawberry - Grade A',
                grade_id: gradeA,
                quantity_units: 45.00,
                unit_id: kgUnitId,
                received_date: '2026-03-01',
                expiry_date: '2026-04-01',
                storage_location: 'Warehouse A - Cold Room 1'
            },
            {
                material_name: 'Organic Mango - Premium',
                grade_id: gradeA,
                quantity_units: 80.00,
                unit_id: kgUnitId,
                received_date: '2026-03-05',
                expiry_date: '2026-04-10',
                storage_location: 'Warehouse A - Cold Room 2'
            },
            {
                material_name: 'Fresh Lime - Grade B',
                grade_id: gradeB,
                quantity_units: 30.00,
                unit_id: kgUnitId,
                received_date: '2026-03-03',
                expiry_date: '2026-03-25',
                storage_location: 'Warehouse B - Shelf 3'
            },
            {
                material_name: 'Wood Apple - Grade A',
                grade_id: gradeA,
                quantity_units: 60.00,
                unit_id: kgUnitId,
                received_date: '2026-03-02',
                expiry_date: '2026-04-05',
                storage_location: 'Warehouse A - Cold Room 3'
            },
            {
                material_name: 'Custard Starch - Grade B',
                grade_id: gradeB,
                quantity_units: 15.00,
                unit_id: kgUnitId,
                received_date: '2026-02-20',
                expiry_date: '2026-08-20',
                storage_location: 'Warehouse B - Dry Store 1'
            },
            {
                material_name: 'Coconut - Grade C',
                grade_id: gradeC,
                quantity_units: 8.00,
                unit_id: kgUnitId,
                received_date: '2026-03-08',
                expiry_date: '2026-03-18',
                storage_location: 'Warehouse B - Shelf 1'
            }
        ];

        for (const item of rawItems) {
            const [check] = await db.query(
                `SELECT raw_inventory_id FROM inventory_raw WHERE material_name = ?`,
                [item.material_name]
            );
            if (check.length > 0) {
                await db.query(
                    `UPDATE inventory_raw SET grade_id=?, quantity_units=?, unit_id=?, received_date=?, expiry_date=?, storage_location=? WHERE material_name=?`,
                    [item.grade_id, item.quantity_units, item.unit_id, item.received_date, item.expiry_date, item.storage_location, item.material_name]
                );
                console.log(`✏️  Updated raw: ${item.material_name}`);
            } else {
                await db.query(
                    `INSERT INTO inventory_raw (submission_id, material_name, grade_id, quantity_units, unit_id, received_date, expiry_date, storage_location)
           VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)`,
                    [item.material_name, item.grade_id, item.quantity_units, item.unit_id, item.received_date, item.expiry_date, item.storage_location]
                );
                console.log(`✅ Added raw: ${item.material_name}`);
            }
        }

        // ─── 3. Seed inventory_finished ──────────────────────────────────────
        // Find product IDs — map by loose name match
        const findProduct = (keyword) => {
            const key = Object.keys(productMap).find(k => k.includes(keyword.toLowerCase()));
            return key ? productMap[key] : null;
        };

        const finishedItems = [
            {
                product_name: 'lime mix',
                batch_number: 'PROD-LM-2026-001',
                manufactured_date: '2026-02-15',
                expiry_date: '2027-02-15',
                quantity_units: 120,
                storage_location: 'Warehouse C - Finished Goods 1'
            },
            {
                product_name: 'lime mix',
                batch_number: 'PROD-LM-2026-002',
                manufactured_date: '2026-03-01',
                expiry_date: '2027-03-01',
                quantity_units: 85,
                storage_location: 'Warehouse C - Finished Goods 1'
            },
            {
                product_name: 'wood apple juice',
                batch_number: 'PROD-WA-2026-001',
                manufactured_date: '2026-02-20',
                expiry_date: '2026-08-20',
                quantity_units: 200,
                storage_location: 'Warehouse C - Finished Goods 2'
            },
            {
                product_name: 'mango jelly',
                batch_number: 'PROD-MJ-2026-001',
                manufactured_date: '2026-03-05',
                expiry_date: '2026-09-05',
                quantity_units: 45,
                storage_location: 'Warehouse C - Finished Goods 3'
            },
            {
                product_name: 'custard powder',
                batch_number: 'PROD-CP-2026-001',
                manufactured_date: '2026-01-10',
                expiry_date: '2027-01-10',
                quantity_units: 7,
                storage_location: 'Warehouse C - Finished Goods 4'
            }
        ];

        for (const item of finishedItems) {
            const productId = findProduct(item.product_name);
            if (!productId) {
                console.warn(`⚠️  Product not found for: ${item.product_name} — skipping`);
                continue;
            }
            const [check] = await db.query(
                `SELECT finished_inventory_id FROM inventory_finished WHERE batch_number = ?`,
                [item.batch_number]
            );
            if (check.length > 0) {
                console.log(`⏭️  Batch already exists: ${item.batch_number}`);
            } else {
                await db.query(
                    `INSERT INTO inventory_finished (product_id, batch_number, manufactured_date, expiry_date, quantity_units, storage_location)
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [productId, item.batch_number, item.manufactured_date, item.expiry_date, item.quantity_units, item.storage_location]
                );
                console.log(`✅ Added finished: ${item.batch_number} (${item.product_name.toUpperCase()})`);
            }
        }

        console.log('\n🎉 Inventory seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err.message);
        process.exit(1);
    }
}

seedInventory();
