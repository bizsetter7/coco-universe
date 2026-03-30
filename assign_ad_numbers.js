
const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'lib', 'data', 'shops.json');

try {
    const raw = fs.readFileSync(filePath, 'utf8');
    let shops = JSON.parse(raw);
    let startNo = 1001;
    let modifiedCount = 0;

    shops = shops.map((shop, index) => {
        // Assign adNo if missing. 
        // We re-assign all to ensure sequential order? 
        // User said: "All advertising cards... assign respective ad numbers... sequential order"
        // Let's assign based on index for now to be sequential.

        // Check if we want to overwrite existing? 
        // Assuming we are initializing the system, let's overwrite to ensure clean sequence starting 1001.
        const newNo = startNo + index;

        if (shop.adNo !== newNo) {
            shop.adNo = newNo;
            modifiedCount++;
        }
        return shop;
    });

    if (modifiedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(shops, null, 2), 'utf8');
        console.log(`Successfully assigned Ad Numbers to ${shops.length} shops (IDs fixed: ${modifiedCount}). Range: 1001 - ${startNo + shops.length - 1}`);
    } else {
        console.log("No ID assignments needed.");
    }

} catch (e) {
    console.error("Error:", e);
}
