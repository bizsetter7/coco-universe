
const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'lib', 'data', 'shops.json');

try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const shops = JSON.parse(raw);

    console.log(`Loaded ${shops.length} shops.`);

    const targets = shops.filter(s =>
        s.pay === "1000" ||
        s.pay === 1000 ||
        (s.name && (s.name.includes("골드") || s.name.includes("Gold"))) ||
        (s.region && s.region.includes("두정동")) ||
        (s.title && s.title.includes("두정동"))
    );

    console.log(`Found ${targets.length} targets.`);
    targets.forEach(t => {
        console.log(`ID: ${t.id}, Name: ${t.name}, Pay: ${t.pay}, PayType: ${t.payType}`);
    });

} catch (e) {
    console.error("Error:", e);
}
