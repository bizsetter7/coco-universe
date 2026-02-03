import fs from 'fs';
import path from 'path';

const shopsPath = path.join(__dirname, '../lib/data/shops.json');

try {
    const rawData = fs.readFileSync(shopsPath, 'utf8');
    let shops = JSON.parse(rawData);
    let updatedCount = 0;

    shops = shops.map(shop => {
        let pay = shop.pay ? shop.pay.toString() : '';
        const originalPay = pay;
        const payType = shop.payType;

        if (!pay) return shop;

        // Remove commas
        pay = pay.replace(/,/g, '');

        // If non-numeric strings like "면접후결정", keep as is
        // But normalized ones that are just numbers with units like "1억" should be processed
        const isNumericLike = /[0-9]/.test(pay) || pay.includes('억') || pay.includes('만');
        if (!isNumericLike) {
            return shop;
        }

        // Handle string units
        let multiplier = 1;
        if (pay.includes('억')) {
            multiplier *= 100000000;
            pay = pay.replace('억', '');
        }
        if (pay.includes('천만')) { // Handle "1천만원"
            multiplier *= 10000000;
            pay = pay.replace('천만', '');
        }
        if (pay.includes('만')) {
            multiplier *= 10000;
            pay = pay.replace('만', '');
        }

        // Remove "원" and other chars
        pay = pay.replace(/원/g, '').replace(/\s/g, '');

        // Clean up any remaining non-digit characters (except dot)
        pay = pay.replace(/[^0-9.]/g, '');

        if (!pay) return shop;

        let numVal = parseFloat(pay) * multiplier;

        // Heuristic normalization for inconsistent short numbers
        // Only apply if the original string was purely numeric (or just had commas) to avoid double-processing explicit values like "15만원" (which is 150000)
        // "15" -> 15 (pure number) -> Apply heuristic
        // "15만원" -> 150000 (after unit processing) -> Do NOT apply heuristic (it's already correct)

        const wasShortNumberString = originalPay.replace(/,/g, '').match(/^[0-9.]+$/);

        if (wasShortNumberString) {
            // Only apply heuristic if we haven't already applied a unit multiplier (which would make it large)
            // Wait, if original was "15", multiplier is 1. numVal is 15.
            // If original was "1억", multiplier is 10^8. numVal is 100000000.

            if (numVal < 10000) {
                if (payType === '시급' || payType === 'TC' || payType === '일급') {
                    // 1 ~ 500 range -> likely Man-Won (x10,000)
                    if (numVal > 0 && numVal < 500) {
                        numVal *= 10000;
                    }
                } else if (payType === '월급' || payType === '연봉') {
                    // 1 ~ 10000 range -> likely Man-Won (x10,000)
                    // e.g. "300" (monthly) -> 3,000,000
                    // e.g. "4000" (yearly) -> 40,000,000
                    if (numVal > 0) {
                        numVal *= 10000;
                    }
                }
            }
        }

        if (numVal !== parseFloat(originalPay.replace(/,/g, '')) || originalPay !== numVal.toString()) {
            shop.pay = numVal.toString();
            updatedCount++;
        }
        return shop;
    });

    fs.writeFileSync(shopsPath, JSON.stringify(shops, null, 2), 'utf8');
    console.log(`Successfully updated ${updatedCount} shops.`);

} catch (err) {
    console.error('Error processing shops.json:', err);
}
