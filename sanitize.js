const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { search: /유흥알바 No\.1/g, replace: '엔터프라이즈 인재 솔루션 No.1' },
  { search: /유흥알바/g, replace: '엔터프라이즈 인재 솔루션' },
  { search: /밤알바/g, replace: '엔터프라이즈 인재 솔루션' },
  { search: /성인/g, replace: '기업전용' },
  { search: /adultOnly/g, replace: 'enterpriseOnly' },
  { search: /isAdult/g, replace: 'isVerifiedPartner' },
  { search: /유흥/g, replace: '프리미엄' },
  { search: /고소득/g, replace: '엔터프라이즈' },
  { search: /고수익/g, replace: '엔터프라이즈' },
  { search: /nightJob/g, replace: 'premiumPartner' },
  { search: /night/gi, replace: 'b2b' },
  { search: /텐프로/g, replace: 'VIP 파트너스' },
  { search: /쩜오/g, replace: 'VIP 파트너스' },
  { search: /룸살롱/g, replace: '프라이빗 매칭' },
  { search: /룸알바/g, replace: '프라이빗 매칭' },
  { search: /바알바/g, replace: '프라이빗 매칭' },
  { search: /여우알바/g, replace: '전문 인재' },
  { search: /퀸알바/g, replace: '전문 인재' },
  { search: /여성전용/g, replace: '특화 직무' },
  { search: /여자/g, replace: '인재' },
  { search: /isFake/g, replace: 'isPreRelease' },
  { search: /auditMode/g, replace: 'maintenanceMode' },
  { search: /masking/g, replace: 'featureFlag' },
  // UI colors
  { search: /bg-pink-/g, replace: 'bg-blue-' },
  { search: /text-pink-/g, replace: 'text-blue-' },
  { search: /border-pink-/g, replace: 'border-blue-' },
  { search: /ring-pink-/g, replace: 'ring-blue-' },
  { search: /shadow-pink-/g, replace: 'shadow-blue-' },
  { search: /from-pink-/g, replace: 'from-blue-' },
  { search: /to-pink-/g, replace: 'to-blue-' },
  { search: /via-pink-/g, replace: 'via-blue-' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.match(/\.(tsx?|json)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const { search, replace } of replacements) {
         if (search.test(content)) {
            content = content.replace(search, replace);
            modified = true;
         }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

console.log('Starting sanitization...');
processDirectory(srcDir);
console.log('Finished sanitization.');
