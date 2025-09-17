const fs = require('fs');
const path = require('path');

// List of folders to exclude from the directory scan (backend safe)
const excludeDirs = ['node_modules', 'public', '.git', '.vscode', 'uploads', 'assets'];

let maxFile = { name: '', lines: 0 };
let minFile = { name: '', lines: Infinity };

/**
 * Count the number of lines in a file
 * @param {string} filePath - The path to the file
 * @returns {number}
 */
const countLinesInFile = (filePath) => {
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  return fileContents.split('\n').length;
};

/**
 * Recursively explore a directory to count .js/.ts files and their line counts
 * @param {string} dirPath - Directory path to explore
 * @returns {{ totalLines: number, fileCount: number }}
 */
const exploreDirectory = (dirPath) => {
  let totalLines = 0;
  let fileCount = 0;

  const filesAndDirs = fs.readdirSync(dirPath);

  filesAndDirs.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      if (excludeDirs.includes(item)) return;

      const { totalLines: subTotal, fileCount: subCount } = exploreDirectory(fullPath);
      totalLines += subTotal;
      fileCount += subCount;
    } else {
      if (fullPath.endsWith('.js') || fullPath.endsWith('.ts')) {
        const lineCount = countLinesInFile(fullPath);
        const parentFolder = path.basename(path.dirname(fullPath));
        console.log(`📄 Folder: ${parentFolder} | File: ${item} | Lines: ${lineCount}`);

        // Track max
        if (lineCount > maxFile.lines) {
          maxFile = { name: `${parentFolder}/${item}`, lines: lineCount };
        }

        // Track min
        if (lineCount < minFile.lines && lineCount > 0) {
          minFile = { name: `${parentFolder}/${item}`, lines: lineCount };
        }

        totalLines += lineCount;
        fileCount += 1;
      }
    }
  });

  return { totalLines, fileCount };
};

// 📁 Change this to match your backend folder path
const rootDir = __dirname;

const { totalLines, fileCount } = exploreDirectory(rootDir);

console.log('\n======================================');
console.log(`✅ Total JS/TS Files: ${fileCount}`);
console.log(`📊 Total Lines of Code: ${totalLines}`);
console.log(`📈 Longest File: ${maxFile.name} (${maxFile.lines} lines)`);
console.log(`📉 Shortest File: ${minFile.name} (${minFile.lines} lines)`);
console.log('======================================\n');
