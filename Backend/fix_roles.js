const fs = require('fs');
const path = require('path');
const routesDir = path.join(__dirname, 'routes');

const filesToUpdate = ['adminRoutes.js', 'orderRoutes.js', 'productRoutes.js', 'supplierRoutes.js'];

filesToUpdate.forEach(file => {
  const filePath = path.join(routesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(/'administrator'/g, "'admin'");
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
