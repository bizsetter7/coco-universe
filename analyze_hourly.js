
const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'lib', 'data', 'shops.json');

try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const shops = JSON.parse(raw);

    // Filter for "Hourly" (시급)
    const hourlyShops = shops.filter(s => s.payType && s.payType.includes('시'));

    console.log(`Total Hourly Shops: ${hourlyShops.length}`);

    const suspicious = hourlyShops.filter(s => {
        const p = Number(String(s.pay).replace(/,/g, ''));
        // Suspicious if less than Minimum Wage (~10,000)
        // Check for 1000 ~ 9999 (likely x100)
        // Check for 10 ~ 999 (likely x1000, e.g. 60 = 60,000)
        return p > 0 && p < 10000;
    });

    console.log(`Suspicious Low Hourly Rates (< 10,000): ${suspicious.length}`);

    suspicious.forEach(s => {
        console.log(`[Target] No.${s.adNo} | Name: ${s.name} | Pay: ${s.pay} (Type: ${s.payType})`);
    });

} catch (e) {
    console.error("Error:", e);
}
