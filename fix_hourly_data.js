
const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'lib', 'data', 'shops.json');

try {
    const raw = fs.readFileSync(filePath, 'utf8');
    let shops = JSON.parse(raw);

    // Targets: 1028, 1033, 1065
    const targetIds = [1028, 1033, 1065];
    let modifiedCount = 0;

    shops = shops.map(shop => {
        if (shop.adNo && targetIds.includes(shop.adNo)) {
            console.log(`[Before] AdNo: ${shop.adNo}, Pay: ${shop.pay}, Type: ${shop.payType}`);

            // Logic: 1500 -> 150000, 1200 -> 120000. 
            // It seems like a x100 multiplication or just replacement.
            // User said: "1,500 -> 150,000". (x100).
            // Let's apply x100 if value is small.

            const numPay = Number(String(shop.pay).replace(/,/g, ''));
            if (numPay < 10000) {
                const newPay = numPay * 100;
                console.log(`[Fixing] AdNo: ${shop.adNo} -> ${newPay}`);
                shop.pay = String(newPay);
                modifiedCount++;
            }
        }
        return shop;
    });

    if (modifiedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(shops, null, 2), 'utf8');
        console.log(`Fixed ${modifiedCount} shops.`);
    } else {
        console.log("No shops matched criteria.");
    }

} catch (e) {
    console.error("Error:", e);
}
