/**
 * LAKLIGHT - Complete Database Seeder
 * Populates all tables with realistic sample data
 */

const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function seedAll() {
  console.log('🌱 Starting full database seed...\n');

  try {
    // ─── Helper: get ID from lookup table ───────────────────────
    const getId = async (table, pk, col, val) => {
      const [rows] = await db.query(`SELECT ${pk} FROM ${table} WHERE ${col} = ?`, [val]);
      return rows.length > 0 ? rows[0][pk] : null;
    };

    // ─── 1. USERS (customers + farmers + employees) ───────────────
    console.log('👤 Seeding users...');
    const hashPw = async (pw) => bcrypt.hash(pw, 10);

    const adminRoleId     = await getId('user_roles', 'role_id', 'role_name', 'admin');
    const customerRoleId  = await getId('user_roles', 'role_id', 'role_name', 'customer');
    const farmerRoleId    = await getId('user_roles', 'role_id', 'role_name', 'farmer');
    const employeeRoleId  = await getId('user_roles', 'role_id', 'role_name', 'employee');
    const activeStatusId  = await getId('account_statuses', 'status_id', 'status_name', 'active');

    // Check existing users
    const [existingUsers] = await db.query('SELECT email FROM users');
    const existingEmails = existingUsers.map(u => u.email);

    const usersToAdd = [
      { full_name: 'Nimali Perera',     email: 'nimali@example.com',    phone: '0771234501', role_id: customerRoleId,  password: 'Customer@123' },
      { full_name: 'Kamal Silva',       email: 'kamal@example.com',     phone: '0771234502', role_id: customerRoleId,  password: 'Customer@123' },
      { full_name: 'Sachini Fernando',  email: 'sachini@example.com',   phone: '0771234503', role_id: customerRoleId,  password: 'Customer@123' },
      { full_name: 'Ruwan Gamage',      email: 'ruwan@example.com',     phone: '0771234504', role_id: customerRoleId,  password: 'Customer@123' },
      { full_name: 'Asanka Bandara',    email: 'asanka.farmer@example.com', phone: '0771234510', role_id: farmerRoleId, password: 'Farmer@123' },
      { full_name: 'Sujeewa Rathnayake',email: 'sujeewa.farmer@example.com',phone: '0771234511', role_id: farmerRoleId, password: 'Farmer@123' },
      { full_name: 'Prasanna Wijesinghe',email:'prasanna.emp@example.com',  phone: '0771234520', role_id: employeeRoleId,password: 'Employee@123' },
    ];

    let newCustomerIds = [];
    let newFarmerIds = [];

    for (const u of usersToAdd) {
      if (existingEmails.includes(u.email)) {
        console.log(`  ↩  Skipping existing user: ${u.email}`);
        const [rows] = await db.query('SELECT user_id, role_id FROM users WHERE email = ?', [u.email]);
        if (rows[0].role_id === customerRoleId) newCustomerIds.push(rows[0].user_id);
        if (rows[0].role_id === farmerRoleId)   newFarmerIds.push(rows[0].user_id);
        continue;
      }
      const hash = await hashPw(u.password);
      const [result] = await db.query(
        'INSERT INTO users (full_name, email, phone, password_hash, role_id, status_id) VALUES (?, ?, ?, ?, ?, ?)',
        [u.full_name, u.email, u.phone, hash, u.role_id, activeStatusId]
      );
      if (u.role_id === customerRoleId) newCustomerIds.push(result.insertId);
      if (u.role_id === farmerRoleId)   newFarmerIds.push(result.insertId);
      console.log(`  ✅ Added user: ${u.full_name}`);
    }

    // ─── 2. FARMER PROFILES ──────────────────────────────────────
    console.log('\n🌾 Seeding farmer profiles...');
    const [existingProfiles] = await db.query('SELECT farmer_id FROM farmer_profiles');
    const profileFarmerIds = existingProfiles.map(p => p.farmer_id);

    const farmerProfileData = [
      { name: 'Green Valley Farm',    location: 'Kandy' },
      { name: 'Sunrise Fruit Estate', location: 'Nuwara Eliya' },
    ];

    for (let i = 0; i < newFarmerIds.length && i < farmerProfileData.length; i++) {
      const fid = newFarmerIds[i];
      if (profileFarmerIds.includes(fid)) continue;
      await db.query(
        'INSERT INTO farmer_profiles (farmer_id, farm_name, location, rating, is_verified) VALUES (?, ?, ?, ?, ?)',
        [fid, farmerProfileData[i].name, farmerProfileData[i].location, 4.8, true]
      );
      console.log(`  ✅ Farmer profile: ${farmerProfileData[i].name}`);
    }

    // ─── 3. PRODUCTS ─────────────────────────────────────────────
    console.log('\n📦 Seeding products...');
    const [existingProducts] = await db.query('SELECT name FROM products');
    const existingProductNames = existingProducts.map(p => p.name);

    const bevCatId  = await getId('product_categories', 'category_id', 'category_name', 'beverages');
    const desCatId  = await getId('product_categories', 'category_id', 'category_name', 'desserts');
    const vegCatId  = await getId('product_categories', 'category_id', 'category_name', 'vegetables');
    const othCatId  = await getId('product_categories', 'category_id', 'category_name', 'other');
    const kgUnitId  = await getId('measurement_units',  'unit_id',     'unit_name',     'kg');
    const botUnitId = await getId('measurement_units',  'unit_id',     'unit_name',     'bottle');
    const pckUnitId = await getId('measurement_units',  'unit_id',     'unit_name',     'pack');
    const untUnitId = await getId('measurement_units',  'unit_id',     'unit_name',     'unit');

    const productsToAdd = [
      { name: 'Lime Mix',            category_id: bevCatId,  description: 'Refreshing lime cordial 350ml',                  price: 150.00,  unit_id: botUnitId, stock: 150, image_url: '/images/Lime Mix.png' },
      { name: 'Wood Apple Juice',    category_id: bevCatId,  description: 'Traditional wood apple nectar 200ml',            price: 100.00,  unit_id: botUnitId, stock: 200, image_url: '/images/Wood Apple Juice.png' },
      { name: 'Mango Jelly',         category_id: desCatId,  description: 'Premium mango jelly 100g',                       price: 200.00,  unit_id: pckUnitId, stock: 45,  image_url: '/images/Mango Jelly.png' },
      { name: 'Custard Powder',      category_id: desCatId,  description: 'Mango flavored custard powder 100g',             price: 300.00,  unit_id: pckUnitId, stock: 100, image_url: '/images/Custard powder.png' },
      { name: 'Mango Cordial',       category_id: bevCatId,  description: 'Sweet mango cordial concentrate 500ml',          price: 220.00,  unit_id: botUnitId, stock: 120, image_url: '/images/mango drink.png' },
      { name: 'Passion Fruit Juice', category_id: bevCatId,  description: 'Freshly squeezed passion fruit juice 250ml',     price: 180.00,  unit_id: botUnitId, stock: 90,  image_url: '/images/passion fruit.png' },
      { name: 'Ginger Beer Extract', category_id: bevCatId,  description: 'Homemade style ginger beer extract 200ml',       price: 160.00,  unit_id: botUnitId, stock: 60,  image_url: null },
      { name: 'Mixed Jam Collection',category_id: desCatId,  description: 'Assorted Sri Lankan fruit jams',                 price: 350.00,  unit_id: pckUnitId, stock: 50,  image_url: '/images/mixed jam.png' },
      { name: 'Tomato Sauce',        category_id: othCatId,  description: 'Rich homemade tomato sauce 200ml',               price: 250.00,  unit_id: botUnitId, stock: 70,  image_url: '/images/Tomato sause.png' },
    ];

    let productIds = {};
    for (const p of productsToAdd) {
      if (existingProductNames.includes(p.name)) {
        const [rows] = await db.query('SELECT product_id FROM products WHERE name = ?', [p.name]);
        productIds[p.name] = rows[0].product_id;
        console.log(`  ↩  Skipping existing product: ${p.name}`);
        continue;
      }
      const [result] = await db.query(
        'INSERT INTO products (name, category_id, description, price, unit_id, stock_quantity, is_available, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.name, p.category_id, p.description, p.price, p.unit_id, p.stock, true, p.image_url]
      );
      productIds[p.name] = result.insertId;
      console.log(`  ✅ Added product: ${p.name}`);
    }

    // ─── 4. INVENTORY RAW (Fruit/Raw Materials) ───────────────────
    console.log('\n🍋 Seeding raw inventory...');
    const [existingRaw] = await db.query('SELECT material_name FROM inventory_raw WHERE submission_id IS NULL');
    const existingRawNames = existingRaw.map(r => r.material_name);

    const gradeAId = await getId('quality_grades', 'grade_id', 'grade_name', 'Grade A');
    const gradeBId = await getId('quality_grades', 'grade_id', 'grade_name', 'Grade B');

    const rawItems = [
      { material_name: 'Fresh Mango - Grade A',    grade_id: gradeAId, quantity: 85.5,  unit_id: kgUnitId,  days_to_expiry: 12, location: 'Cold Storage A - C01-R02' },
      { material_name: 'Ripe Pineapple - Grade A', grade_id: gradeAId, quantity: 62.0,  unit_id: kgUnitId,  days_to_expiry: 8,  location: 'Cold Storage A - C02-R01' },
      { material_name: 'Fresh Papaya - Grade B',   grade_id: gradeBId, quantity: 48.0,  unit_id: kgUnitId,  days_to_expiry: 6,  location: 'Cold Storage B - C01-R03' },
      { material_name: 'Passion Fruit - Grade A',  grade_id: gradeAId, quantity: 30.0,  unit_id: kgUnitId,  days_to_expiry: 10, location: 'Cold Storage A - C03-R02' },
      { material_name: 'Wood Apple - Grade B',     grade_id: gradeBId, quantity: 40.0,  unit_id: kgUnitId,  days_to_expiry: 15, location: 'Cold Storage B - C02-R04' },
      { material_name: 'Fresh Lime - Grade A',     grade_id: gradeAId, quantity: 25.5,  unit_id: kgUnitId,  days_to_expiry: 20, location: 'Cold Storage A - C04-R01' },
      { material_name: 'Ginger Root - Grade A',    grade_id: gradeAId, quantity: 18.0,  unit_id: kgUnitId,  days_to_expiry: 30, location: 'Dry Store     - DS-01' },
      { material_name: 'Chili Peppers - Grade B',  grade_id: gradeBId, quantity: 12.0,  unit_id: kgUnitId,  days_to_expiry: 7,  location: 'Cold Storage B - C03-R01' },
    ];

    for (const r of rawItems) {
      if (existingRawNames.includes(r.material_name)) {
        console.log(`  ↩  Skipping existing raw: ${r.material_name}`);
        continue;
      }
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + r.days_to_expiry);
      const expiryStr = expiry.toISOString().split('T')[0];
      await db.query(
        'INSERT INTO inventory_raw (material_name, grade_id, quantity_units, unit_id, received_date, expiry_date, storage_location) VALUES (?, ?, ?, ?, CURDATE(), ?, ?)',
        [r.material_name, r.grade_id, r.quantity, r.unit_id, expiryStr, r.location]
      );
      console.log(`  ✅ Raw inventory: ${r.material_name}`);
    }

    // ─── 5. INVENTORY FINISHED (Finished Products) ───────────────
    console.log('\n🏭 Seeding finished inventory...');
    const [existingFinished] = await db.query('SELECT batch_number FROM inventory_finished');
    const existingBatches = existingFinished.map(f => f.batch_number);

    const finishedItems = [
      { product: 'Lime Mix',            batch: 'B2026-LM-001', mfg_days_ago: 30, expiry_days: 365, qty: 120, location: 'Finished Goods - Shelf A-01' },
      { product: 'Wood Apple Juice',    batch: 'B2026-WJ-001', mfg_days_ago: 45, expiry_days: 270, qty: 80,  location: 'Finished Goods - Shelf A-02' },
      { product: 'Mango Jelly',         batch: 'B2026-MJ-001', mfg_days_ago: 60, expiry_days: 300, qty: 45,  location: 'Finished Goods - Shelf B-01' },
      { product: 'Custard Powder',      batch: 'B2026-CP-001', mfg_days_ago: 20, expiry_days: 730, qty: 100, location: 'Finished Goods - Shelf B-02' },
      { product: 'Mango Cordial',       batch: 'B2026-MC-001', mfg_days_ago: 15, expiry_days: 180, qty: 120, location: 'Finished Goods - Shelf C-01' },
      { product: 'Passion Fruit Juice', batch: 'B2026-PJ-001', mfg_days_ago: 10, expiry_days: 120, qty: 90,  location: 'Finished Goods - Shelf C-02' },
      { product: 'Ginger Beer Extract', batch: 'B2026-GE-001', mfg_days_ago: 25, expiry_days: 180, qty: 60,  location: 'Finished Goods - Shelf C-03' },
      { product: 'Mixed Jam Collection',batch: 'B2026-JM-001', mfg_days_ago: 35, expiry_days: 365, qty: 50,  location: 'Finished Goods - Shelf D-01' },
      { product: 'Tomato Sauce',        batch: 'B2026-TS-001', mfg_days_ago: 20, expiry_days: 240, qty: 70,  location: 'Finished Goods - Shelf D-02' },
    ];

    for (const f of finishedItems) {
      if (existingBatches.includes(f.batch)) {
        console.log(`  ↩  Skipping batch: ${f.batch}`);
        continue;
      }
      const pid = productIds[f.product];
      if (!pid) { console.log(`  ⚠️  Product not found for: ${f.product}`); continue; }

      const mfgDate = new Date();
      mfgDate.setDate(mfgDate.getDate() - f.mfg_days_ago);
      const expDate = new Date(mfgDate);
      expDate.setDate(expDate.getDate() + f.expiry_days);

      await db.query(
        'INSERT INTO inventory_finished (product_id, batch_number, manufactured_date, expiry_date, quantity_units, storage_location) VALUES (?, ?, ?, ?, ?, ?)',
        [pid, f.batch, mfgDate.toISOString().split('T')[0], expDate.toISOString().split('T')[0], f.qty, f.location]
      );
      console.log(`  ✅ Finished inventory: ${f.product} [${f.batch}]`);
    }

    // ─── 6. ORDERS ────────────────────────────────────────────────
    console.log('\n🛒 Seeding orders...');
    const [existingOrders] = await db.query('SELECT COUNT(*) as c FROM orders');
    
    const paidStatusId      = await getId('payment_statuses', 'payment_status_id', 'status_name', 'paid');
    const unpaidStatusId    = await getId('payment_statuses', 'payment_status_id', 'status_name', 'unpaid');
    const deliveredStatusId = await getId('order_statuses',   'order_status_id',   'status_name', 'Delivered');
    const processingStatusId= await getId('order_statuses',   'order_status_id',   'status_name', 'Processing');
    const pendingOrderStatusId = await getId('order_statuses','order_status_id',   'status_name', 'Pending');

    if (existingOrders[0].c < 5 && newCustomerIds.length > 0) {
      const ordersToAdd = [
        { customer_id: newCustomerIds[0] || 1, total: 3000, discount: 300, net: 2700, payment_status_id: paidStatusId,   order_status_id: deliveredStatusId,  method: 'Card Payment',       address: '123 Galle Road, Colombo 03', days_ago: 30 },
        { customer_id: newCustomerIds[1] || 1, total: 2400, discount: 0,   net: 2400, payment_status_id: paidStatusId,   order_status_id: deliveredStatusId,  method: 'Online Banking',     address: '45 Lake View Rd, Kandy',     days_ago: 25 },
        { customer_id: newCustomerIds[0] || 1, total: 1800, discount: 0,   net: 1800, payment_status_id: paidStatusId,   order_status_id: processingStatusId, method: 'Cash on Delivery',   address: '78 Hill Street, Galle',      days_ago: 10 },
        { customer_id: newCustomerIds[2] || 1, total: 4500, discount: 450, net: 4050, payment_status_id: paidStatusId,   order_status_id: deliveredStatusId,  method: 'Card Payment',       address: '10 Marine Drive, Negombo',   days_ago: 20 },
        { customer_id: newCustomerIds[3] || 1, total: 1200, discount: 0,   net: 1200, payment_status_id: unpaidStatusId, order_status_id: pendingOrderStatusId, method: 'Cash on Delivery', address: '56 Temple Road, Kurunegala', days_ago: 2  },
        { customer_id: newCustomerIds[1] || 1, total: 2750, discount: 0,   net: 2750, payment_status_id: paidStatusId,   order_status_id: deliveredStatusId,  method: 'Online Banking',     address: '33 Queen Street, Colombo 07',days_ago: 45 },
        { customer_id: newCustomerIds[0] || 1, total: 5000, discount: 500, net: 4500, payment_status_id: paidStatusId,   order_status_id: deliveredStatusId,  method: 'Card Payment',       address: '123 Galle Road, Colombo 03', days_ago: 60 },
      ];

      for (const o of ordersToAdd) {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - o.days_ago);
        const [result] = await db.query(
          'INSERT INTO orders (customer_id, total_amount, discount_amount, net_amount, payment_status_id, order_status_id, payment_method, delivery_address, order_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [o.customer_id, o.total, o.discount, o.net, o.payment_status_id, o.order_status_id, o.method, o.address, orderDate]
        );

        // Add order items
        const prodList = Object.values(productIds).slice(0, 3);
        for (const pid of prodList) {
          const qty = Math.floor(Math.random() * 5) + 1;
          const price = 200 + Math.floor(Math.random() * 300);
          await db.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, subtotal) VALUES (?, ?, ?, ?, ?)',
            [result.insertId, pid, qty, price, qty * price]
          );
        }
        console.log(`  ✅ Order #${result.insertId} added`);
      }
    } else {
      console.log(`  ↩  Skipping orders (${existingOrders[0].c} already exist)`);
    }

    // ─── 7. SUPPLIERS ─────────────────────────────────────────────
    console.log('\n🚚 Seeding suppliers...');
    const [existingSuppliers] = await db.query('SELECT farm_name FROM suppliers');
    const existingFarmNames = existingSuppliers.map(s => s.farm_name);

    const suppliersToAdd = [
      { farm_name: 'Green Valley Estate',      owner_name: 'Asanka Bandara',     location: 'Kandy',           phone: '0771234510', email: 'green@example.com',   product_types: 'Mangoes, Pineapple', license: 'LIC-2024-001', farm_size: '15 acres', capacity: '500 kg/week', rating: 4.8, deliveries: 24, status: 'Active',   applied: '2024-01-15', approved: '2024-01-20' },
      { farm_name: 'Sunrise Fruit Estate',     owner_name: 'Sujeewa Rathnayake', location: 'Nuwara Eliya',    phone: '0771234511', email: 'sunrise@example.com', product_types: 'Strawberries, Lime', license: 'LIC-2024-002', farm_size: '20 acres', capacity: '400 kg/week', rating: 4.6, deliveries: 18, status: 'Active',   applied: '2024-02-01', approved: '2024-02-10' },
      { farm_name: 'Tropical Fresh Farms',     owner_name: 'Nirosh Wickramasinghe',location: 'Matale',         phone: '0712345678', email: 'tropical@example.com',product_types: 'Wood Apple, Papaya',license: 'LIC-2024-003', farm_size: '10 acres', capacity: '300 kg/week', rating: 4.5, deliveries: 12, status: 'Active',   applied: '2024-03-05', approved: '2024-03-15' },
      { farm_name: 'Highland Organic Produce', owner_name: 'Wasana Jayawardhana', location: 'Badulla',         phone: '0763456789', email: 'highland@example.com', product_types: 'Ginger, Chili',     license: 'LIC-2024-004', farm_size: '8 acres',  capacity: '200 kg/week', rating: 4.2, deliveries: 8,  status: 'Active',   applied: '2024-04-10', approved: '2024-04-20' },
      { farm_name: 'Lanka Fresh Connect',      owner_name: 'Chamara Peiris',      location: 'Kurunegala',      phone: '0756789012', email: 'lanka@example.com',   product_types: 'Passion Fruit',     license: 'LIC-2024-005', farm_size: '12 acres', capacity: '350 kg/week', rating: 4.0, deliveries: 5,  status: 'Pending',  applied: '2024-12-01', approved: null },
    ];

    for (const s of suppliersToAdd) {
      if (existingFarmNames.includes(s.farm_name)) {
        console.log(`  ↩  Skipping existing supplier: ${s.farm_name}`);
        continue;
      }
      await db.query(
        'INSERT INTO suppliers (farm_name, owner_name, location, phone, email, product_types, license_number, farm_size, capacity, rating, total_deliveries, status, applied_date, approved_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.farm_name, s.owner_name, s.location, s.phone, s.email, s.product_types, s.license, s.farm_size, s.capacity, s.rating, s.deliveries, s.status, s.applied, s.approved]
      );
      console.log(`  ✅ Supplier: ${s.farm_name}`);
    }

    // ─── 8. SUPPLY HISTORY ────────────────────────────────────────
    console.log('\n📋 Seeding supply history...');
    const [existingHistory] = await db.query('SELECT COUNT(*) as c FROM supply_history');
    if (existingHistory[0].c < 5) {
      const [suppliers] = await db.query('SELECT supplier_id FROM suppliers LIMIT 4');
      const supplyEntries = [
        { product_name: 'Mango Grade A', quantity: '150 kg', price: 180, days_ago: 5 },
        { product_name: 'Pineapple Grade A', quantity: '100 kg', price: 120, days_ago: 10 },
        { product_name: 'Wood Apple Grade B', quantity: '80 kg', price: 95, days_ago: 15 },
        { product_name: 'Lime Grade A', quantity: '60 kg', price: 200, days_ago: 20 },
        { product_name: 'Passion Fruit Grade A', quantity: '50 kg', price: 250, days_ago: 25 },
        { product_name: 'Ginger Root Grade A', quantity: '40 kg', price: 300, days_ago: 30 },
      ];
      for (let i = 0; i < supplyEntries.length; i++) {
        const e = supplyEntries[i];
        const sid = suppliers[i % suppliers.length]?.supplier_id;
        if (!sid) continue;
        const supplyDate = new Date();
        supplyDate.setDate(supplyDate.getDate() - e.days_ago);
        await db.query(
          'INSERT INTO supply_history (supplier_id, product_name, quantity, price, supply_date) VALUES (?, ?, ?, ?, ?)',
          [sid, e.product_name, e.quantity, e.price, supplyDate.toISOString().split('T')[0]]
        );
        console.log(`  ✅ Supply history: ${e.product_name}`);
      }
    } else {
      console.log(`  ↩  Skipping supply history (${existingHistory[0].c} already exist)`);
    }

    // ─── 9. FEEDBACK ─────────────────────────────────────────────
    console.log('\n⭐ Seeding feedback...');
    const [existingFeedback] = await db.query('SELECT COUNT(*) as c FROM feedback');
    if (existingFeedback[0].c < 3 && newCustomerIds.length > 0) {
      const feedbackData = [
        { customer_id: newCustomerIds[0], pq: 5, pkg: 5, dt: 4, cs: 5, vm: 5, text: 'Excellent products! The mango jelly was absolutely delicious.', improvements: '[]' },
        { customer_id: newCustomerIds[1], pq: 4, pkg: 4, dt: 5, cs: 4, vm: 4, text: 'Very fresh and good quality. Delivery was quick.', improvements: '["More variety"]' },
        { customer_id: newCustomerIds[0], pq: 5, pkg: 3, dt: 4, cs: 5, vm: 4, text: 'Love the lime mix! Could improve packaging a bit.',   improvements: '["Better packaging"]' },
      ];
      for (const f of feedbackData) {
        await db.query(
          'INSERT INTO feedback (customer_id, product_quality, packaging, delivery_time, customer_service, value_for_money, feedback_text, improvements) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [f.customer_id, f.pq, f.pkg, f.dt, f.cs, f.vm, f.text, f.improvements]
        );
        console.log(`  ✅ Feedback from customer #${f.customer_id}`);
      }
    } else {
      console.log(`  ↩  Skipping feedback (${existingFeedback[0].c} already exist)`);
    }

    // ─── 10. SYSTEM SETTINGS ─────────────────────────────────────
    console.log('\n⚙️  Seeding system settings...');
    const settings = [
      { key: 'companyName',       value: 'Laklight Food Products' },
      { key: 'companyEmail',      value: 'info@laklight.com' },
      { key: 'companyPhone',      value: '+94 11 234 5678' },
      { key: 'companyWebsite',    value: 'https://www.laklight.com' },
      { key: 'companyAddress',    value: 'No. 45, Galle Road, Colombo 03, Sri Lanka' },
      { key: 'systemTimezone',    value: 'Asia/Colombo' },
      { key: 'systemLanguage',    value: 'en' },
      { key: 'systemCurrency',    value: 'LKR' },
      { key: 'dateFormat',        value: 'DD/MM/YYYY' },
      { key: 'onlineStore',       value: 'true' },
      { key: 'wholesalePricing',  value: 'true' },
      { key: 'guestCheckout',     value: 'false' },
      { key: 'wholesaleThreshold',value: '12' },
      { key: 'wholesaleDiscount', value: '15' },
      { key: 'taxRate',           value: '0' },
      { key: 'deliveryCharge',    value: '200' },
    ];
    for (const s of settings) {
      await db.query(
        'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [s.key, s.value, s.value]
      );
    }
    console.log('  ✅ System settings updated');

    // ─── FINAL SUMMARY ────────────────────────────────────────────
    console.log('\n' + '='.repeat(50));
    console.log('✅ Database seeding complete!');
    const counts = await Promise.all([
      db.query('SELECT COUNT(*) as c FROM users'),
      db.query('SELECT COUNT(*) as c FROM products'),
      db.query('SELECT COUNT(*) as c FROM inventory_raw'),
      db.query('SELECT COUNT(*) as c FROM inventory_finished'),
      db.query('SELECT COUNT(*) as c FROM orders'),
      db.query('SELECT COUNT(*) as c FROM suppliers'),
      db.query('SELECT COUNT(*) as c FROM feedback'),
    ]);
    console.log(`  👤 Users:              ${counts[0][0][0].c}`);
    console.log(`  📦 Products:           ${counts[1][0][0].c}`);
    console.log(`  🍋 Raw Inventory:      ${counts[2][0][0].c}`);
    console.log(`  🏭 Finished Inventory: ${counts[3][0][0].c}`);
    console.log(`  🛒 Orders:             ${counts[4][0][0].c}`);
    console.log(`  🚚 Suppliers:          ${counts[5][0][0].c}`);
    console.log(`  ⭐ Feedback:           ${counts[6][0][0].c}`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seedAll();
