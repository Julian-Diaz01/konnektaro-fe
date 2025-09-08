#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Source directories
const publicSourceDir = path.join(__dirname, 'public');
//const stylesSourceDir = path.join(__dirname, 'src', 'styles');

// Target directories
const targetDirs = [
  path.join(__dirname, 'apps', 'admin'),
  path.join(__dirname, 'apps', 'user')
];

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function syncAssets() {
  console.log('🔄 Syncing assets...');
  
  targetDirs.forEach(targetDir => {
    console.log(`📁 Syncing to ${targetDir}`);
    
    // Sync public assets
    const publicTargetDir = path.join(targetDir, 'public');
    if (fs.existsSync(publicSourceDir)) {
      console.log(`  📂 Syncing public assets to ${publicTargetDir}`);
      copyDir(publicSourceDir, publicTargetDir);
    }
    /*
    // Sync styles
    const stylesTargetDir = path.join(targetDir, 'src', 'styles');
    if (fs.existsSync(stylesSourceDir)) {
      console.log(`  📂 Syncing styles to ${stylesTargetDir}`);
      copyDir(stylesSourceDir, stylesTargetDir);
    }*/
  });
  
  console.log('✅ Assets synced successfully!');
}

// Run the sync
syncAssets();