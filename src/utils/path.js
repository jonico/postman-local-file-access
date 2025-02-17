const path = require('path');

const sanitizePath = (unsafePath) => {
  // Get the absolute path of the base directory (current working directory)
  const basePath = process.cwd();
  // Resolve the full path
  const fullPath = path.resolve(basePath, unsafePath);
  
  // Ensure the resolved path is within the base directory
  if (!fullPath.startsWith(basePath)) {
    return path.basename(fullPath); // Return just the filename if path tries to escape
  }
  
  // Return the path relative to base directory
  return path.relative(basePath, fullPath);
};

module.exports = { sanitizePath }; 