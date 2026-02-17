const fs = require('fs');
const path = require('path');

const CSV_PATH = 'c:/My-site/shop_db_final_enriched_20260213.csv';
const JSON_PATH = 'c:/My-site/통합사이트/브랜드_통합_시스템/src/lib/data/shops.json';

// Improved CSV parser that handles quoted commas
function parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    return lines.slice(1).map(line => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim().replace(/^"|"$/g, ''));

        return {
            site: result[0],
            category: result[1],
            name: result[2],
            region: result[3],
            title: result[4],
            phone: result[5],
            kakao: result[6],
            url: result[7]
        };
    });
}

const csvRaw = fs.readFileSync(CSV_PATH, 'utf-8');
const realShops = parseCSV(csvRaw);

const jsonRaw = fs.readFileSync(JSON_PATH, 'utf-8');
let shops = JSON.parse(jsonRaw);

// Placeholder names to replace
const placeHolders = [
    '아틀란티스', '오션뷰', '에메랄드', '달리기', '핫플레이스', '브이아이피', '두바이', '황진이', '오렌지', '럭셔리'
];

let replacedCount = 0;

shops = shops.map((shop, index) => {
    // Only replace if it looks like a placeholder OR we want to force-refresh first 200
    const isPlaceholder = placeHolders.some(p => shop.name.includes(p));

    if (isPlaceholder || (index < 200)) {
        const realData = realShops[index % realShops.length];
        if (realData) {
            replacedCount++;
            return {
                ...shop,
                name: realData.name || shop.name,
                region: realData.region ? `[${realData.region}]` : shop.region,
                phone: realData.phone || shop.phone,
                kakao: realData.kakao !== '정보 없음' ? realData.kakao : shop.kakao,
                title: realData.title !== '상세참조' ? realData.title : shop.title,
            };
        }
    }
    return shop;
});

fs.writeFileSync(JSON_PATH, JSON.stringify(shops, null, 2));
console.log(`Successfully replaced ${replacedCount} shops with cleaned real data.`);
