const { spawnSync } = require('child_process');
const fs = require('fs');

const payload = JSON.stringify({
  projectId: "8034868767551498692",
  prompt: "Create a dashboard screen to serve as our project AI SOP and Status Sync.\n\n" + fs.readFileSync('C:\\My-site\\통합사이트\\브랜드_통합_시스템\\AI_SOP.md.txt', 'utf8') + "\n\nDesign a beautiful dashboard UI. Make it modern, professional, with a visually appealing layout containing cards for each section of the SOP."
});

const result = spawnSync('npx.cmd', ['-y', '@_davideast/stitch-mcp', 'tool', 'generate_screen_from_text', payload], {
    env: { ...process.env, GOOGLE_CLOUD_PROJECT: 'coco-alba-indexing', CLOUDSDK_CONFIG: 'C:\\Users\\K\\.stitch-mcp\\config' },
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024
});

console.log('STDOUT:\n', result.stdout);
console.error('STDERR:\n', result.stderr);
