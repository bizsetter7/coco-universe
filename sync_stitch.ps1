$ErrorActionPreference = "Stop"
$env:GOOGLE_CLOUD_PROJECT = "coco-alba-indexing"

$currentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Read the SOP file using UTF-8 to prevent garbled characters
$sopText = Get-Content -Raw "$currentDir\AI_SOP.md.txt" -Encoding UTF8

$promptText = "Create a clear, dark-themed dashboard screen that displays our Master SOP and current P2 progress. Make it structured with cards for each section of the SOP. Below is the SOP text:`n`n$sopText"

# Create a hashtable to convert to JSON properly
$payloadObj = @{
    projectId = "8034868767551498692"
    prompt = $promptText
}

$payloadJson = $payloadObj | ConvertTo-Json -Depth 10
# Powershell escaping for external commands is completely broken occasionally, 
# so we write the JSON to a temporary file, and use node to read the file and invoke npx properly.

$tempJsonPath = "$currentDir\payload.json"
$payloadJson | Out-File -FilePath $tempJsonPath -Encoding UTF8

$nodeScriptPath = "$currentDir\run_npx.js"
$nodeScript = @"
const { execSync } = require('child_process');
const fs = require('fs');
const payload = fs.readFileSync('$($tempJsonPath -replace "\\", "\\\\")', 'utf8');

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
"@

$nodeScript | Out-File -FilePath $nodeScriptPath -Encoding UTF8

# Execute the node script
node $nodeScriptPath
