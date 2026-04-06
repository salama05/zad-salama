const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to ensure sessionId is provided
const requireSessionId = (req, res, next) => {
  const sessionId = req.query.sessionId || req.body.sessionId || req.params.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }
  req.sessionId = sessionId;
  next();
};

// GET or CREATE user by sessionId
router.post('/', async (req, res) => {
  const { sessionId, username } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  try {
    let user = await User.findOne({ sessionId });
    if (!user) {
      user = new User({ sessionId, username });
      await user.save();
    } else if (username && user.username !== username) {
      user.username = username;
      await user.save();
    }
    res.json(user);
  } catch (error) {
    console.error('Error in POST /users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET user info
router.get('/:sessionId', requireSessionId, async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.sessionId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update settings
router.put('/:sessionId/settings', requireSessionId, async (req, res) => {
  const { reciter, version, mushafTheme } = req.body;
  try {
    const updates = {};
    if (reciter) updates['settings.reciter'] = reciter;
    if (version) updates['settings.version'] = version;
    if (mushafTheme) updates['settings.mushafTheme'] = mushafTheme;

    const user = await User.findOneAndUpdate(
      { sessionId: req.sessionId },
      { $set: updates },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST add/remove bookmark
router.post('/:sessionId/bookmarks', requireSessionId, async (req, res) => {
  const { surahNumber, ayahNumber, surahName } = req.body;
  try {
    const user = await User.findOne({ sessionId: req.sessionId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if bookmark exists, if so toggle (remove)
    const existingIndex = user.bookmarks.findIndex(
      b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );

    if (existingIndex > -1) {
      user.bookmarks.splice(existingIndex, 1);
    } else {
      user.bookmarks.push({ surahNumber, ayahNumber, surahName });
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
