const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  surahNumber: { type: Number, required: true },
  ayahNumber: { type: Number, required: true },
  surahName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true }, // Client-side generated UUID
  username: { type: String },
  settings: {
    reciter: { type: String, default: 'ar.mahermuaiqly' }, // Default Edition Key
    version: { type: String, enum: ['hafs', 'warsh'], default: 'hafs' },
    mushafTheme: { type: String, enum: ['Classic', 'Dark', 'Golden', 'Blue'], default: 'Classic' }
  },
  bookmarks: [bookmarkSchema],
  favorites: {
    surahs: [{ type: Number }], // Surah numbers
    reciters: [{ type: String }] // Reciter edition keys
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
