const express = require('express');
const router = express.Router();
const fs = require('fs');          // For streams
const fsPromises = require('fs').promises;  // For async operations
const path = require('path');
const { sanitizePath } = require('../utils/path');

const ROOT_DIR = path.join(process.cwd(), 'data');

// List files
router.get('/', async (req, res) => {
  try {
    const files = await fsPromises.readdir(ROOT_DIR);
    const fileStats = await Promise.all(
      files.map(async (file) => {
        try {
          const stats = await fsPromises.stat(path.join(ROOT_DIR, file));
          return {
            name: file,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            modified: stats.mtime
          };
        } catch (error) {
          console.error(`Error getting stats for ${file}:`, error);
          return {
            name: file,
            isDirectory: false,
            size: 0,
            modified: new Date(),
            error: 'Failed to read file stats'
          };
        }
      })
    );
    res.json(fileStats);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ 
      error: 'Failed to list files',
      details: error.message 
    });
  }
});

// Read file
router.get('/:path(*)', async (req, res) => {
  try {
    const filePath = sanitizePath(req.params.path);
    const fullPath = path.join(ROOT_DIR, filePath);
    
    // Get file stats to determine if it's binary
    const stats = await fsPromises.stat(fullPath);
    
    // Set proper Content-Type header
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    
    // Stream the file instead of loading it into memory
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

// Create/Upload file
router.post('/:path(*)', async (req, res) => {
  try {
    const filePath = sanitizePath(req.params.path);
    const fullPath = path.join(ROOT_DIR, filePath);
    
    if (!req.files || !req.files.file) {
      const { content } = req.body;
      await fsPromises.writeFile(fullPath, content || '');
    } else {
      await req.files.file.mv(fullPath);
    }
    
    res.json({ message: 'File created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update file
router.put('/:path(*)', async (req, res) => {
  try {
    const filePath = sanitizePath(req.params.path);
    const fullPath = path.join(ROOT_DIR, filePath);
    const { content } = req.body;
    
    await fsPromises.writeFile(fullPath, content);
    res.json({ message: 'File updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete file
router.delete('/:path(*)', async (req, res) => {
  try {
    const filePath = sanitizePath(req.params.path);
    const fullPath = path.join(ROOT_DIR, filePath);
    await fsPromises.unlink(fullPath);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 