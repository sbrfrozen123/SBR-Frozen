const fs = require('fs');
const files = [
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/page.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/rincian/page.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/by-shift/shift-sales-client.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/terlaris/page.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/grafik/page.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/financial-summary/page.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/page.tsx',
];

for (const path of files) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');
    
    // Revert the wrong replacement
    if (content.includes(".from('transactions').eq('order_status', 'completed')")) {
        content = content.replace(/\.from\('transactions'\)\.eq\('order_status', 'completed'\)/g, ".from('transactions')");
        fs.writeFileSync(path, content, 'utf8');
        console.log('Reverted: ' + path);
    }
}
