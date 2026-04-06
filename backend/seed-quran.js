require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Quran = require('./src/models/Quran');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zad-salama';

async function seedQuranData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if Quran data already exists
    const existingData = await Quran.findOne({ type: 'hafs' });

    if (existingData) {
      console.log('⚠️  Quran data already exists. Skipping seed...');
      await mongoose.disconnect();
      return;
    }

    console.log('📥 Fetching Quran data from Quran.com API...');

    const surahs = [];

    // Fetch all surahs
    for (let surahNum = 1; surahNum <= 114; surahNum++) {
      try {
        console.log(`⏳ Fetching Surah ${surahNum}...`);

        // Get surah info
        const surahInfoRes = await axios.get(
          `https://api.quran.com/api/v4/chapters/${surahNum}`
        );

        // Get verses for this surah
        const versesRes = await axios.get(
          `https://api.quran.com/api/v4/verses?chapter_number=${surahNum}&words=false&translations=`,
          { params: { limit: 300 } }
        );

        const surahInfo = surahInfoRes.data.chapter;
        const verses = versesRes.data.verses;

        const ayat = verses.map(verse => ({
          ayatNumber: verse.verse_number,
          surahNumber: verse.chapter_number,
          text: verse.text_uthmani || verse.text_simple || '',
          page: verse.page,
          juz: verse.juz
        }));

        surahs.push({
          surahNumber: surahNum,
          nameArabic: surahInfo.name_arabic,
          nameEnglish: surahInfo.name_english,
          revelationType: surahInfo.revelation_place,
          totalAyat: surahInfo.verses_count,
          startPage: verses[0]?.page || 1,
          endPage: verses[verses.length - 1]?.page || 1,
          ayat
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error fetching Surah ${surahNum}:`, error.message);
      }
    }

    console.log(`\n💾 Saving ${surahs.length} surahs to MongoDB...`);

    const quranData = new Quran({
      type: 'hafs',
      surahs
    });

    await quranData.save();
    console.log('✅ Quran data saved successfully!\n');

    console.log('📊 Quran Dataset Summary:');
    console.log(`   - Total Surahs: ${surahs.length}`);
    console.log(`   - Total Verses: ${surahs.reduce((sum, s) => sum + s.ayat.length, 0)}`);

  } catch (error) {
    console.error('❌ Error seeding Quran data:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔓 Disconnected from MongoDB');
  }
}

seedQuranData();
