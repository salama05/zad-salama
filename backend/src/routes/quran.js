const express = require('express');
const Quran = require('../models/Quran');
const router = express.Router();

// Get all surahs (for offline mode)
router.get('/surahs', async (req, res) => {
  try {
    const quran = await Quran.findOne({ type: 'hafs' });

    if (!quran) {
      return res.status(404).json({ message: 'Quran data not found' });
    }

    // Return just the surah info without verses for quick loading
    const surahs = quran.surahs.map(surah => ({
      surahNumber: surah.surahNumber,
      nameArabic: surah.nameArabic,
      nameEnglish: surah.nameEnglish,
      revelationType: surah.revelationType,
      totalAyat: surah.totalAyat,
      startPage: surah.startPage,
      endPage: surah.endPage
    }));

    res.json(surahs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific surah with verses
router.get('/surah/:surahNumber', async (req, res) => {
  try {
    const { surahNumber } = req.params;
    const quran = await Quran.findOne({ type: 'hafs' });

    if (!quran) {
      return res.status(404).json({ message: 'Quran data not found' });
    }

    const surah = quran.surahs.find(s => s.surahNumber === parseInt(surahNumber));

    if (!surah) {
      return res.status(404).json({ message: 'Surah not found' });
    }

    res.json(surah);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get verse by surah and verse number
router.get('/surah/:surahNumber/verse/:verseNumber', async (req, res) => {
  try {
    const { surahNumber, verseNumber } = req.params;
    const quran = await Quran.findOne({ type: 'hafs' });

    if (!quran) {
      return res.status(404).json({ message: 'Quran data not found' });
    }

    const surah = quran.surahs.find(s => s.surahNumber === parseInt(surahNumber));

    if (!surah) {
      return res.status(404).json({ message: 'Surah not found' });
    }

    const verse = surah.ayat.find(a => a.ayatNumber === parseInt(verseNumber));

    if (!verse) {
      return res.status(404).json({ message: 'Verse not found' });
    }

    res.json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all verses (for offline sync)
router.get('/all-verses', async (req, res) => {
  try {
    const quran = await Quran.findOne({ type: 'hafs' });

    if (!quran) {
      return res.status(404).json({ message: 'Quran data not found' });
    }

    const allVerses = [];
    quran.surahs.forEach(surah => {
      surah.ayat.forEach(ayat => {
        allVerses.push({
          ...ayat.toObject(),
          surahNameArabic: surah.nameArabic
        });
      });
    });

    res.json({
      totalVerses: allVerses.length,
      verses: allVerses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search in Quran text
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const quran = await Quran.findOne({ type: 'hafs' });

    if (!quran) {
      return res.status(404).json({ message: 'Quran data not found' });
    }

    const results = [];

    quran.surahs.forEach(surah => {
      surah.ayat.forEach(ayat => {
        if (ayat.text.includes(query)) {
          results.push({
            surahNumber: ayat.surahNumber,
            surahNameArabic: surah.nameArabic,
            ayatNumber: ayat.ayatNumber,
            text: ayat.text
          });
        }
      });
    });

    res.json({
      query,
      results: results.slice(0, 50) // Limit results to first 50
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check for Quran API
router.get('/health', async (req, res) => {
  try {
    const count = await Quran.countDocuments();
    res.json({
      status: 'ok',
      message: 'Quran API is running',
      quranDataExists: count > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
