const db = require('./config/database');

async function seedSuppliers() {
    try {
        const suppliers = [
            {
                farm_name: 'Green Field Organic Farm',
                owner_name: 'Mahinda Rajapaksa',
                location: 'Kandy, Sri Lanka',
                phone: '0771234567',
                email: 'greenfield@organic.com',
                product_types: 'Vegetables, Fruits',
                license_number: 'LIC-2023-001',
                farm_size: '5 Acres',
                capacity: '500kg per week',
                rating: 4.8,
                total_deliveries: 45,
                status: 'Active'
            },
            {
                farm_name: 'Sunny Valley Plantations',
                owner_name: 'Nimal Sirisena',
                location: 'Nuwara Eliya, Sri Lanka',
                phone: '0719876543',
                email: 'sunnyvalley@outlook.com',
                product_types: 'Tea, Potatoes, Carrots',
                license_number: 'LIC-2023-002',
                farm_size: '10 Acres',
                capacity: '1000kg per week',
                rating: 4.5,
                total_deliveries: 120,
                status: 'Active'
            },
            {
                farm_name: 'Blue Water Fruits',
                owner_name: 'Saman Kumara',
                location: 'Galle, Sri Lanka',
                phone: '0723456789',
                email: 'bwfruits@gmail.com',
                product_types: 'Pineapple, Mango, Papaya',
                license_number: 'LIC-2023-003',
                farm_size: '3 Acres',
                capacity: '300kg per week',
                rating: 4.2,
                total_deliveries: 30,
                status: 'Active'
            },
            {
                farm_name: 'Hill Country Honey',
                owner_name: 'Kumari Perera',
                location: 'Matale, Sri Lanka',
                phone: '0754567890',
                email: 'hillcountryhoney@yahoo.com',
                product_types: 'Organic Honey, Spices',
                license_number: 'LIC-2023-004',
                farm_size: '1 Acre',
                capacity: '50kg per month',
                rating: 4.9,
                total_deliveries: 80,
                status: 'Pending'
            }
        ];

        for (const s of suppliers) {
            const [existing] = await db.query('SELECT * FROM suppliers WHERE farm_name = ?', [s.farm_name]);
            if (existing.length === 0) {
                await db.query(`
          INSERT INTO suppliers (
            farm_name, owner_name, location, phone, email, product_types, 
            license_number, farm_size, capacity, rating, total_deliveries, 
            status, applied_date, approved_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURDATE())
        `, [
                    s.farm_name, s.owner_name, s.location, s.phone, s.email, s.product_types,
                    s.license_number, s.farm_size, s.capacity, s.rating, s.total_deliveries, s.status
                ]);
                console.log(`Added supplier: ${s.farm_name}`);
            } else {
                console.log(`Supplier already exists: ${s.farm_name}`);
            }
        }

        console.log('✅ Suppliers seeding complete');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding suppliers:', err);
        process.exit(1);
    }
}

seedSuppliers();
