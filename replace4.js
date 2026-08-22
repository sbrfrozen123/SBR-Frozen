const fs = require('fs');
const glob = require('fs').readdirSync; // not recursive, but I can hardcode the files

const files = [
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/page.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/rincian/page.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/by-shift/shift-sales-client.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/terlaris/page.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/sales/grafik/page.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/reports/financial-summary/page.tsx',
    'c:/Projects/SBR Frozen/src/app/(dashboard)/page.tsx', // Dashboard stats
];

for (const path of files) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');
    
    // Add .eq('order_status', 'completed') after .from('transactions') if it doesn't already have it
    if (content.includes(".from('transactions')") && !content.includes("order_status")) {
        // Only modify if we find a clear chain
        content = content.replace(/\.from\('transactions'\)/g, ".from('transactions').eq('order_status', 'completed')");
        fs.writeFileSync(path, content, 'utf8');
        console.log('Updated: ' + path);
    }
}
