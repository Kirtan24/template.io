const fs = require('fs');
const path = require('path');

const IGNORED_FOLDERS = new Set(['node_modules', 'public', '.git', '.vscode', 'assets']);
const MAX_ITEMS_PER_FOLDER = 12;

/**
 * Recursively prints the directory tree structure.
 * @param {string} dirPath - The starting directory path.
 * @param {string} prefix - Prefix used to format the tree branches.
 */
function listDirectoryStructure(dirPath, prefix = '') {
  // console.log(dirPath)
  if (!fs.existsSync(dirPath)) {
    console.error(`The directory "${dirPath}" does not exist.`);
    return;
  }
  
  const stats = fs.statSync(dirPath);
  
  if (stats.isDirectory()) {
    const folderName = path.basename(dirPath);
    console.log(folderName)
    if (IGNORED_FOLDERS.has(folderName)) {
      return;
    }

    const contents = fs.readdirSync(dirPath);
    if (contents.length > MAX_ITEMS_PER_FOLDER) {
      return;
    }

    console.log(`${prefix}${folderName}/`);

    const total = contents.length;
    contents.forEach((item, index) => {
      const itemPath = path.join(dirPath, item);
      const isLast = index === total - 1;
      const branch = isLast ? '└── ' : '├── ';
      const newPrefix = prefix + (isLast ? '    ' : '│   ');

      const itemStats = fs.statSync(itemPath);
      if (itemStats.isDirectory()) {
        listDirectoryStructure(itemPath, newPrefix);
      } else {
        console.log(`${prefix}${branch}${item}`);
      }
    });
  }
}

function printDirectoryStructure() {
  const rootPath = __dirname + '/src';
  listDirectoryStructure(rootPath, '');
}

printDirectoryStructure();
