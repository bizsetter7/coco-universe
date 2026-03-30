const { execSync } = require('child_process');
const fs = require('fs');
const payload = fs.readFileSync('C:\\\\My-site\\\\통합사이트\\\\브랜드_통합_시스템\\\\payload.json', 'utf8');

// Escaping single quotes in the JSON string for PowerShell cmd 
const escapedPayload = payload.replace(/'/g, "'" + '"' + "'" + '"' + "'");

try {
  // Pass to npx
  const output = execSync('npx.cmd -y @_davideast/stitch-mcp tool generate_screen_from_text ' + JSON.stringify(payload), {
    env: { ...process.env, GOOGLE_CLOUD_PROJECT: "coco-alba-indexing" },
    encoding: 'utf8'
  });
  console.log('Success:', output);
} catch (e) {
  console.error('Failed:', e.stdout);
}
