const fs = require('fs');
const path = require('path');

// Mock data and constants
const shopsData = JSON.parse(fs.readFileSync('src/lib/data/shops.json', 'utf8'));
const SEOUL_COORDS = { lat: 37.5665, lng: 126.9780 };

try {
    console.log('Starting data processing test...');

    let rawShops = shopsData.map((shop, index) => {
        let tier = shop.tier || 'common';
        if (tier === 'basic') tier = 'common';

        if (tier === 'common') {
            if (index % 100 === 5) tier = 'deluxe';
            else if (index % 100 === 10) tier = 'special';
            else if (index % 100 === 15) tier = 'urgent';
            else if (index % 100 === 20) tier = 'recommended';
            else if (index % 100 === 25) tier = 'native';
        }

        if (tier === 'grand' && index % 3 === 1) tier = 'premium';

        let currentTitle = shop.title || shop.name;
        const effects = ['[네온]', '[무지개]', '[반짝]', '[GIF]', '[HOT]'];
        let currentOptions = { ...shop.options };

        if (tier === 'grand' || tier === 'premium') {
            const effect = effects[index % effects.length];
            currentTitle = `${effect} ${currentTitle}`;

            if (!currentOptions.mediaUrl) {
                currentOptions = {
                    ...currentOptions,
                    mediaUrl: `https://picsum.photos/400/300?random=${index}`
                };
            }
        }

        let lat = shop.lat;
        let lng = shop.lng;

        if (!lat) {
            lat = SEOUL_COORDS.lat + (Math.sin(index) * 0.05);
            lng = SEOUL_COORDS.lng + (Math.cos(index) * 0.05);
        }

        return { ...shop, tier, title: currentTitle, options: currentOptions, lat, lng };
    });

    console.log(`Successfully processed ${rawShops.length} shops.`);
    console.log('Sample shop:', JSON.stringify(rawShops[0], null, 2));

} catch (err) {
    console.error('CRASH DETECTED during data processing:');
    console.error(err);
    process.exit(1);
}
