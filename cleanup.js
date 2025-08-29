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

removeTxtFiles('./out');