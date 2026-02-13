const fs = require('fs');
const path = require('path');

// 1. Load Region Data
const seoRegionsMaster = require('../src/lib/data/seo_regions_master.json');
const baseUrl = 'https://cocoalba.kr';

console.log('🚀 Generating Sitemap & Robots for 17,000+ regions...');

// 2. Generate Sitemap
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/lounge</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
`;

seoRegionsMaster.forEach((region) => {
    sitemapContent += `    <url>
        <loc>${baseUrl}/coco/${encodeURIComponent(region.id)}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>\n`;
});

sitemapContent += '</urlset>';

// 3. Write Sitemap
const publicDir = path.join(__dirname, '../public');
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
console.log('✅ sitemap.xml created in public/');

// 4. Generate Robots.txt
const robotsContent = `User-agent: *
Allow: /
Disallow: /private/

Sitemap: ${baseUrl}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent);
console.log('✅ robots.txt created in public/');
console.log('✨ All metadata generated successfully!');
