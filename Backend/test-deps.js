const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
console.log('Testing dependencies...');
for (const dep in pkg.dependencies) {
    try {
        require(dep);
        console.log(`✅ ${dep} found`);
    } catch (err) {
        console.log(`❌ ${dep} MISSING: ${err.message}`);
    }
}
