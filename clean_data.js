const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/data/shops.json');
let content = fs.readFileSync(filePath, 'utf8');

// 정규식으로 B2B 잔재 및 경쟁사 흔적 제거
content = content.replace(/엔터프라이즈/g, '여성알바');
content = content.replace(/인재 솔루션/g, '고소득알바');
content = content.replace(/인재알바/g, '여성알바');
content = content.replace(/인재/g, '여성');

// 경쟁사 도메인 및 브랜드명 정화
content = content.replace(/foxalba\.com/g, 'cocoalba.kr');
content = content.replace(/queenalba\.net/g, 'cocoalba.kr');
content = content.replace(/ladyalba\.co\.kr/g, 'cocoalba.kr');
content = content.replace(/foxalba/g, 'cocoalba');
content = content.replace(/queenalba/g, 'cocoalba');
content = content.replace(/ladyalba/g, 'cocoalba');

fs.writeFileSync(filePath, content, 'utf8');
console.log('shops.json 모든 잔재 및 경쟁사 흔적 정화 완료!');
