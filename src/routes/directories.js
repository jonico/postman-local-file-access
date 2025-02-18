const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { sanitizePath } = require('../utils/path');

const ROOT_DIR = path.join(process.cwd(), 'data');

// List directory contents (including root)
router.get('/:path(*)?', async (req, res) => {
  try {
    const relativePath = req.params.path || '';
    const dirPath = sanitizePath(relativePath);
    const fullPath = path.join(ROOT_DIR, dirPath);

    // Check if path exists and is a directory
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Path is not a directory' });
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Directory not found' });
      }
      throw error;
    }

    const items = await fs.readdir(fullPath);
    const itemStats = await Promise.all(
      items.map(async (item) => {
        try {
          const itemPath = path.join(fullPath, item);
          const stats = await fs.stat(itemPath);
          return {
            name: item,
            path: path.join(dirPath, item), // Include relative path
            isDirectory: stats.isDirectory(),
            size: stats.size,
            modified: stats.mtime
          };
        } catch (error) {
          console.error(`Error getting stats for ${item}:`, error);
          return {
            name: item,
            path: path.join(dirPath, item),
            error: 'Failed to read item stats'
          };
        }
      })
    );

    res.json(itemStats);
  } catch (error) {
    console.error('Error listing directory:', error);
    res.status(500).json({ error: 'Failed to list directory contents' });
  }
});

// Create directory
router.post('/:path(*)', async (req, res) => {
  try {
    const dirPath = sanitizePath(req.params.path);
    const fullPath = path.join(ROOT_DIR, dirPath);

    // Check if parent directory exists
    const parentDir = path.dirname(fullPath);
    try {
      const stats = await fs.stat(parentDir);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Parent path is not a directory' });
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Parent directory not found' });
      }
      throw error;
    }

    await fs.mkdir(fullPath, { recursive: false });
    res.json({ message: 'Directory created successfully' });
  } catch (error) {
    if (error.code === 'EEXIST') {
      res.status(400).json({ error: 'Directory already exists' });
    } else {
      console.error('Error creating directory:', error);
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete directory
router.delete('/:path(*)', async (req, res) => {
  try {
    const dirPath = sanitizePath(req.params.path);
    const fullPath = path.join(ROOT_DIR, dirPath);

    // Check if path exists and is a directory
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Path is not a directory' });
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ error: 'Directory not found' });
      }
      throw error;
    }

    await fs.rmdir(fullPath);
    res.json({ message: 'Directory deleted successfully' });
  } catch (error) {
    if (error.code === 'ENOTEMPTY') {
      res.status(400).json({ error: 'Directory is not empty' });
    } else {
      console.error('Error deleting directory:', error);
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router; 