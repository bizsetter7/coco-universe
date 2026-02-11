const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'data', 'shops.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const shops = JSON.parse(rawData);

const cleanedShops = shops.map(shop => {
    // Regex to remove [Region], (Phrase), {Extra}
    const cleanedName = shop.name.replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim();
    return { ...shop, name: cleanedName };
});

fs.writeFileSync(filePath, JSON.stringify(cleanedShops, null, 2), 'utf8');
console.log('shops.json cleaned successfully.');
