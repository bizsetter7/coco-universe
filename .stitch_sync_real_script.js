const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sopText = fs.readFileSync('C:\\My-site\\통합사이트\\브랜드_통합_시스템\\AI_SOP.md.txt', 'utf8');
const promptText = `Please create a clear, beautiful dashboard screen that displays our Master SOP and current P2 progress. Below is the SOP text:\n\n${sopText}\n\nMake it dark-themed and highly professional.`;

const payload = {
  projectId: "8034868767551498692",
  prompt: promptText
};

const payloadPath = path.join(__dirname, '.temp_payload.json');
fs.writeFileSync(payloadPath, JSON.stringify(payload), 'utf8');

try {
  // Using execSync since we have the argument in a file we can read from.
  // Wait, the Stitch CLI tool doesn't take a file for payload. It takes JSON string.
  // So we will just escape it and use execSync. 
  // In powershell escaping double quotes is """ or something, in cmd it's ^".
  // Let's use spawnSync instead with shell=true to make it easier, passing the JSON exactly as a string argument.
  
  const { spawnSync } = require('child_process');
  console.log("Starting spawnSync...");
  const result = spawnSync('npx.cmd', ['-y', '@_davideast/stitch-mcp', 'tool', 'generate_screen_from_text', JSON.stringify(payload)], {
    env: { ...process.env, GOOGLE_CLOUD_PROJECT: 'coco-alba-indexing' },
    shell: true,
    encoding: 'utf8'
  });
  
  console.log("Status:", result.status);
  console.log("Output:\n", result.stdout);
  console.error("Error:\n", result.stderr);

} catch (e) {
  console.error("Exception:", e);
}
