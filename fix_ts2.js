const fs = require('fs');
const path = 'c:/Projects/SBR Frozen/src/app/(dashboard)/pos/pos-client.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/reduce\(\(sum, item\)/g, "reduce((sum: number, item: any)");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed TS errors in pos-client.tsx again');
