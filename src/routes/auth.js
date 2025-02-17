const express = require('express');
const router = express.Router();
const { setAuthToken, isTokenSet } = require('../middleware/auth');

router.post('/setup', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    setAuthToken(token);
    res.json({ message: 'Token set successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 