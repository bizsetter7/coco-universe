
const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'lib', 'data', 'shops.json');

try {
    const raw = fs.readFileSync(filePath, 'utf8');
    let shops = JSON.parse(raw);
    let modifiedCount = 0;

    shops = shops.map(shop => {
        // Condition: Pay Type contains "시" (Hourly) AND Pay is suspiciously HIGH (> 1,000,000)
        // No.1014 was 10,000,000 -> 100,000. (Factor 100).
        // Let's look for anything > 500,000 for Hourly.

        const payStr = String(shop.pay).replace(/,/g, '');
        const payNum = Number(payStr);
        const isHourly = shop.payType && shop.payType.includes('시');

        if (isHourly && payNum > 900000) { // Threshold 900,000
            const newPay = payNum / 100;
            console.log(`[Fixing High Hourly] No.${shop.adNo} (${shop.name}): ${payNum} -> ${newPay}`);
            shop.pay = String(newPay);
            modifiedCount++;
        }
        return shop;
    });

    if (modifiedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(shops, null, 2), 'utf8');
        console.log(`Successfully fixed ${modifiedCount} high hourly rates.`);
    } else {
        console.log("No high hourly rates found.");
    }

} catch (e) {
    console.error("Error:", e);
}
