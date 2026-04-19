const db = require('./config/database');

async function updateTomatoSauceImage() {
    try {
        console.log('Update Tomato Sauce image starting...');
        
        // Use a LIKE pattern to find "Tomato Sauce" or "Tomato sause"
        const [result] = await db.query(
            "UPDATE products SET image_url = '/images/Tomato sause.png' WHERE name LIKE '%Tomato%Sauce%' OR name LIKE '%Tomato%sause%'"
        );
        
        if (result.affectedRows > 0) {
            console.log(`✅ Successfully updated image for ${result.affectedRows} product(s)`);
        } else {
            console.log('⚠️ No product named "Tomato Sauce" was found to update.');
            
            // Log what we do have
            const [allProducts] = await db.query("SELECT name FROM products WHERE name LIKE '%Tomato%'");
            if (allProducts.length > 0) {
                console.log('Found these products instead:', allProducts.map(p => p.name).join(', '));
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating product image:', err);
        process.exit(1);
    }
}

updateTomatoSauceImage();
