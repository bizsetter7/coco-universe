
const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'lib', 'data', 'shops.json');

try {
    const raw = fs.readFileSync(filePath, 'utf8');
    let shops = JSON.parse(raw);
    let modifiedCount = 0;

    shops = shops.map(shop => {
        // Condition: Pay Type contains "시" (Hourly) AND Pay is suspiciously low (< 10,000)
        // Note: Minimum wage is ~9,860. But given the context of this site (high pay), anything below 10,000 is likely a typo for 10,000+ or x100.
        // However, 9,900 might be valid.
        // But 1,200 or 1,500 is definitely invalid.
        // Let's set threshold at 5,000 to be safe.

        const payStr = String(shop.pay).replace(/,/g, '');
        const payNum = Number(payStr);
        const isHourly = shop.payType && shop.payType.includes('시');

        if (isHourly && payNum > 0 && payNum < 8000) { // 8000 is safe below min wage
            const newPay = payNum * 100;
            console.log(`[Fixing] No.${shop.adNo} (${shop.name}): ${payNum} -> ${newPay}`);
            shop.pay = String(newPay);
            modifiedCount++;
        }
        return shop;
    });

    if (modifiedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(shops, null, 2), 'utf8');
        console.log(`Successfully fixed ${modifiedCount} suspicious hourly rates.`);
    } else {
        console.log("No suspicious hourly rates found.");
    }

} catch (e) {
    console.error("Error:", e);
}
