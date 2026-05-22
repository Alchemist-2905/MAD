const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

walkDir('c:/Users/aksha/Desktop/MAD/backend', (filePath) => {
  if (filePath.endsWith('.js')) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('toISOString')) {
      console.log('File:', filePath);
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('toISOString')) {
          console.log(`  L${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
});
