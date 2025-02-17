const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { sanitizePath } = require('../utils/path');

const ROOT_DIR = path.join(process.cwd(), 'data');

// List directories
router.get('/', async (req, res) => {
  try {
    const items = await fs.readdir(ROOT_DIR, { withFileTypes: true });
    const directories = items
      .filter(item => item.isDirectory())
      .map(item => ({
        name: item.name,
        path: item.name
      }));
    res.json(directories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create directory
router.post('/:path(*)', async (req, res) => {
  try {
    const dirPath = sanitizePath(req.params.path);
    const fullPath = path.join(ROOT_DIR, dirPath);
    await fs.mkdir(fullPath, { recursive: true });
    res.json({ message: 'Directory created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete directory
router.delete('/:path(*)', async (req, res) => {
  try {
    const dirPath = sanitizePath(req.params.path);
    const fullPath = path.join(ROOT_DIR, dirPath);
    await fs.rmdir(fullPath, { recursive: true });
    res.json({ message: 'Directory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 