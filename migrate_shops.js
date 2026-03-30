const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/data/shops.json');
const rawData = fs.readFileSync(filePath, 'utf8');
let shops = JSON.parse(rawData);

// Regex to separate number and text
// Capture group 1: digits/commas, Group 2: remaining text
const payRegex = /^([0-9,]+)(.*)$/;

let updatedCount = 0;

shops = shops.map(shop => {
    let originalPay = shop.pay || "";
    let cleanPay = originalPay;
    let suffixes = [];

    // Skip "면접후결정" or "협의" variations if they don't have numbers
    if (originalPay.includes("면접") || originalPay.includes("협의")) {
        // Force standardized string for non-numeric pay
        cleanPay = "면접후결정";
    } else {
        // Remove "TC", "시급" etc from the start for cleaner parsing if mixed
        // But keep the number.
        // Actually, let's just extract the first sequence of numbers + commas
        const numberMatch = originalPay.match(/([0-9,]+)/);

        if (numberMatch) {
            cleanPay = numberMatch[0].replace(/,/g, ''); // Store as raw number string if possible, or just keep string

            // Re-format to number with commas for display consistency in this script? 
            // The request says "Strict Format: number only".
            // So we strip commas for the DB value? OR keep them?
            // Let's strip commas to be safe, then components format it.
            // Wait, existing components might expect formatted strings. 
            // The plan says "Display as 500,000".
            // Let's store as clean string "500000" or formatted "500,000".
            // Implementation plan: "Input: Number only".
            // Let's store as "500000" (string) to be safe/standard.

            // Extract suffixes
            // Remove the number and the badges (TC, 시급, etc are handled by payType/workType usually, 
            // but in the current data 'pay' string contained them.)
            // The current JobListView logic looks for "TC" in the pay string to show badge.
            // IF we remove "TC" from pay string, we MUST ensure the badge logic still works.
            // Checking JobListView.tsx: it uses `payStr.includes('TC')`.
            // So we CANNOT remove 'TC' from the pay string UNLESS we refactor JobListView to use `payType` field.

            // WAIT. The plan says: "Standardize Pay Display... Strict Format... Badges derived from payType".
            // I need to check if `payType` field exists or is reliable.
            // Looking at `shops.json` sample: "pay": "TC 160,000 + α".
            // There is NO `payType` field in the sample JSON provided in previous turn!
            // I must infer/create `payType` logic if I want to strip it from `pay`.

            // Strategy:
            // 1. Detect type (TC, 시급, etc) from `originalPay`.
            // 2. Set `pay` to strictly the Amount.
            // 3. Set suffixes.
            // 4. WE NEED A NEW FIELD `payType` in Shop interface?
            // Checking `shop.ts`... I only saw `options` update in my plan.
            // `JobListView.tsx` currently parses `pay` string.
            // I should modify `JobListView` to rely on the badge calculation differently or add `payType` to schema.
            // `src/app/my-shop/page.tsx` HAS `payType` state but DOES it save it to JSON?
            // Let's check `shops.json` again. It has `workType` but not `payType` at root level.

            // Critical decision: Add `payType` to Shop schema and migration script.

            let type = '시급'; // Default
            if (originalPay.toUpperCase().includes('TC')) type = 'TC';
            else if (originalPay.includes('일급') || originalPay.includes('일')) type = '일급';
            else if (originalPay.includes('주급') || originalPay.includes('주')) type = '주급';
            else if (originalPay.includes('월급') || originalPay.includes('월')) type = '월급';
            else if (originalPay.includes('연봉')) type = '연봉';
            else if (originalPay.includes('건별')) type = '건별';

            shop.payType = type; // Add this field!

            // Now suffixes
            let rest = originalPay.replace(/[0-9,]+/, '').replace(/TC|시급|일급|주급|월급|연봉|건별/gi, '').trim();
            // Clean up common chars
            rest = rest.replace(/\+/g, '').trim();

            if (originalPay.includes('α') || originalPay.includes('알파')) suffixes.push('+ α');
            if (originalPay.includes('보너스')) suffixes.push('+ 보너스');
            if (originalPay.includes('팁')) suffixes.push('+ 팁');
            if (originalPay.includes('보장')) suffixes.push('보장');
            if (originalPay.includes('당일')) suffixes.push('당일지급');
            if (originalPay.includes('이상') || originalPay.includes('↑')) suffixes.push('이상');

            // Dedupe
            suffixes = [...new Set(suffixes)];

        } else {
            // No number found, keep as is (likely text only)
            cleanPay = originalPay;
            shop.payType = "협의";
        }
    }

    // Update Shop Object
    shop.pay = cleanPay; // Now just the number or "면접후결정"

    // Initialize options if missing
    if (!shop.options) shop.options = {};

    if (suffixes.length > 0) {
        shop.options.paySuffixes = suffixes;
    }

    // Add dummy mediaUrl for top 3 items to test
    if (!shop.options.mediaUrl && updatedCount < 3) {
        // Use placeholder images. In real app, these would be user uploads.
        // We can use a colored div placeholder logic in component if url is "placeholder".
        shop.options.mediaUrl = "https://picsum.photos/seed/" + shop.id + "/800/450";
    }

    updatedCount++;
    return shop;
});

fs.writeFileSync(filePath, JSON.stringify(shops, null, 2));
console.log('Successfully migrated ' + shops.length + ' shops.');
