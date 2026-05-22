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

walkDir('c:/Users/aksha/Desktop/MAD/frontend', (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('createdAt') || content.includes('updatedAt') || content.includes('Date')) {
      console.log('File:', filePath);
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('createdAt') || line.includes('updatedAt') || line.includes('Date')) {
          console.log(`  L${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
});
