
const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'lib', 'data', 'shops.json');

try {
    const raw = fs.readFileSync(filePath, 'utf8');
    let shops = JSON.parse(raw);
    let modifiedCount = 0;

    shops = shops.map(shop => {
        // Fix specific known bad data: "1000" -> "10000000" (10 million)
        if (shop.pay === "1000" || shop.pay === 1000 || shop.pay === '1000') {
            console.log(`Fixing Shop [${shop.name}] (${shop.id}): Pay ${shop.pay} -> 10000000`);
            shop.pay = "10000000";
            modifiedCount++;
        }

        // Also fix "2000" -> "20000000" if exists? 
        // Let's stick to 1000 for now or low numbers that look like Man-won units.
        // User said "Batch fix" (일괄적으로).
        // If pay is < 10000 (and not 0/agreement), it's likely Man-won.
        // But let's be careful. 
        // 550,000 is normal. 
        // 500 -> 5,000,000? 
        // Let's only fix "1000" for now as requested.
        return shop;
    });

    if (modifiedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(shops, null, 2), 'utf8');
        console.log(`Successfully fixed ${modifiedCount} shops.`);
    } else {
        console.log("No shops needed fixing.");
    }

} catch (e) {
    console.error("Error:", e);
}
