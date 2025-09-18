#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const versionType = process.argv[2] || 'patch';

// Read current version from package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

console.log(`Current version: ${currentVersion}`);
console.log(`Bumping ${versionType} version...`);

try {
  // Run standard-version
  execSync(`npx standard-version --release-as ${versionType}`, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('✅ Version bumped successfully!');
  console.log('📝 Don\'t forget to push the changes:');
  console.log('   git push --follow-tags origin main');
  
} catch (error) {
  console.error('❌ Error bumping version:', error.message);
  process.exit(1);
}
