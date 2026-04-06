const mongoose = require('mongoose');

const AyatSchema = new mongoose.Schema({
  ayatNumber: { type: Number, required: true },
  surahNumber: { type: Number, required: true },
  text: { type: String, required: true },
  page: { type: Number },
  juz: { type: Number },
  sajdah: { type: Boolean, default: false }
});

const SurahSchema = new mongoose.Schema({
  surahNumber: { type: Number, required: true, unique: true },
  nameArabic: { type: String, required: true },
  nameEnglish: { type: String },
  revelationType: { type: String, enum: ['Meccan', 'Medinan'] },
  totalAyat: { type: Number, required: true },
  startPage: { type: Number },
  endPage: { type: Number },
  juzStart: { type: Number },
  ayat: [AyatSchema]
});

const QuranSchema = new mongoose.Schema({
  type: { type: String, default: 'hafs', enum: ['hafs', 'warsh', 'qalun', 'doori'] },
  surahs: [SurahSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quran', QuranSchema);
