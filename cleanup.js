const fs = require('fs');
const path = require('path');

function removeTxtFiles(dir) {
    if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                removeTxtFiles(filePath);
            } else if (file.endsWith('.txt')) {
                fs.unlinkSync(filePath);
                console.log(`Removed: ${filePath}`);
            }
        });
    }
}

function cleanupAppDirectories() {
    const appDirs = ['./apps/user', './apps/admin'];
    
    appDirs.forEach(appDir => {
        console.log(`\nCleaning up ${appDir}...`);
        
        // Clean up only the out directory - scan for .txt files
        const outDir = path.join(appDir, 'out');
        if (fs.existsSync(outDir)) {
            console.log(`Scanning out directory: ${outDir}`);
            removeTxtFiles(outDir);
        } else {
            console.log(`Out directory not found: ${outDir}`);
        }
    });
}

// Main cleanup execution
console.log('Starting cleanup process...');

// Clean up app directories only
cleanupAppDirectories();

console.log('\nCleanup completed!');