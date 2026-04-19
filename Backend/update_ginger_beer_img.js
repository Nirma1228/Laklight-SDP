const db = require('./config/database');

async function updateGingerBeerImage() {
    try {
        console.log('Update Ginger Beer image starting...');
        const [result] = await db.query(
            "UPDATE products SET image_url = '/images/Ginger beer.png' WHERE name LIKE '%Ginger Beer%'"
        );
        
        if (result.affectedRows > 0) {
            console.log('✅ Successfully updated image for products containing "Ginger Beer"');
        } else {
            console.log('⚠️ No product named "Ginger Beer" was found to update.');
            
            // Check if it exists with a different name
            const [allProducts] = await db.query("SELECT name FROM products WHERE name LIKE '%Ginger%'");
            if (allProducts.length > 0) {
                console.log('Found these products:', allProducts.map(p => p.name).join(', '));
            } else {
                console.log('No products found containing "Ginger"');
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating product image:', err);
        process.exit(1);
    }
}

updateGingerBeerImage();
