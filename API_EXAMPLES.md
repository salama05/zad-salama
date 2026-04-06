# 📚 أمثلة عملية - استخدام API المصحف

## الأساسيات

### الحصول على جميع السور

```javascript
// Get all surahs (metadata only, fast)
fetch('/api/quran/surahs')
  .then(res => res.json())
  .then(surahs => {
    console.log(surahs);
    // [
    //   {
    //     surahNumber: 1,
    //     nameArabic: "الفاتحة",
    //     nameEnglish: "Al-Fatihah",
    //     totalAyat: 7,
    //     startPage: 1,
    //     endPage: 1
    //   },
    //   ...
    // ]
  });
```

---

## أمثلة متقدمة

### 1. الحصول على سورة محددة مع كل آياتها

```javascript
async function getSurah(surahNumber) {
  const response = await fetch(`/api/quran/surah/${surahNumber}`);
  const surah = await response.json();

  console.log(`سورة ${surah.nameArabic}:`);
  console.log(`عدد الآيات: ${surah.totalAyat}`);
  console.log(`الصفحات: ${surah.startPage} - ${surah.endPage}`);

  // عرض الآيات
  surah.ayat.forEach(ayah => {
    console.log(`${ayah.ayatNumber}. ${ayah.text}`);
  });

  return surah;
}

// الاستخدام
getSurah(1); // الفاتحة
getSurah(55); // الرحمن
```

### مثال النتيجة:
```
سورة الفاتحة:
عدد الآيات: 7
الصفحات: 1 - 1

1. بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
2. الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
...
```

---

### 2. البحث في القرآن

```javascript
async function searchQuran(query) {
  const response = await fetch(`/api/quran/search?query=${encodeURIComponent(query)}`);
  const result = await response.json();

  console.log(`نتائج البحث عن: "${result.query}"`);
  console.log(`عدد النتائج: ${result.results.length}`);

  result.results.forEach((verse, index) => {
    console.log(`\n${index + 1}. سورة ${verse.surahNameArabic} (${verse.surahNumber}:${verse.ayatNumber})`);
    console.log(`   ${verse.text}`);
  });

  return result.results;
}

// أمثلة البحث
searchQuran("الرحمن");           // البحث عن كلمة
searchQuran("التقوى");           // البحث بالكامل
searchQuran("السلام");           // بحث دقيق
```

### مثال النتيجة:
```
نتائج البحث عن: "الرحمن"
عدد النتائج: 57

1. سورة الفاتحة (1:1)
   بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

2. سورة الفاتحة (1:3)
   الرَّحْمَٰنِ الرَّحِيمِ

3. سورة البقرة (2:163)
   إِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ۖ لَا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ
```

---

### 3. الحصول على آية محددة

```javascript
async function getSpecificVerse(surahNumber, verseNumber) {
  const response = await fetch(
    `/api/quran/surah/${surahNumber}/verse/${verseNumber}`
  );

  if (!response.ok) {
    throw new Error('Verse not found');
  }

  const verse = await response.json();

  return `${verse.surahNumber}:${verse.ayatNumber} - ${verse.text}`;
}

// الاستخدام
console.log(await getSpecificVerse(1, 1));  // الآية الأولى من الفاتحة
console.log(await getSpecificVerse(36, 82)); // آية من يس
```

---

## استخدام الـ Hook في React

### مثال 1: عرض فهرس السور

```javascript
import { useQuranOffline } from './hooks/useQuranOffline';

function QuranIndex() {
  const { quranData, loading, isCached } = useQuranOffline();

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div>
      <h1>مصحف حفص {isCached ? '(محلي)' : '(من الخادم)'}</h1>
      <div className="grid grid-cols-2 gap-4">
        {quranData?.map(surah => (
          <div key={surah.surahNumber} className="border p-4">
            <h3>{surah.nameArabic}</h3>
            <p>{surah.totalAyat} آية</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### مثال 2: عرض سورة محددة

```javascript
import { getSurahFromCache } from './hooks/useQuranOffline';
import { useEffect, useState } from 'react';

function SurahReader({ surahNumber }) {
  const [surah, setSurah] = useState(null);

  useEffect(() => {
    getSurahFromCache(surahNumber).then(setSurah);
  }, [surahNumber]);

  if (!surah) return <div>تحميل...</div>;

  return (
    <div>
      <h2>سورة {surah.nameArabic}</h2>
      <div>
        {surah.ayat.map(ayat => (
          <div key={ayat.ayatNumber} className="verse">
            <p className="text-xl">{ayat.text}</p>
            <span className="verse-number">{ayat.ayatNumber}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### مثال 3: نظام البحث

```javascript
import { useState } from 'react';

function QuranSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);

    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const response = await fetch(
      `/api/quran/search?query=${encodeURIComponent(searchTerm)}`
    );
    const data = await response.json();
    setResults(data.results);
  };

  return (
    <div>
      <input
        type="search"
        placeholder="ابحث في القرآن..."
        value={query}
        onChange={handleSearch}
      />

      <div>
        {results.map((verse, idx) => (
          <div key={idx} className="search-result">
            <strong>
              سورة {verse.surahNameArabic} {verse.surahNumber}:{verse.ayatNumber}
            </strong>
            <p>{verse.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## مثال متكامل: تطبيق قراءة

```javascript
import { useState, useEffect } from 'react';
import { useQuranOffline, getSurahFromCache } from './hooks/useQuranOffline';

function QuranApp() {
  const { quranData, loading } = useQuranOffline();
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [surahDetails, setSurahDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // تحميل تفاصيل السورة
  useEffect(() => {
    getSurahFromCache(selectedSurah).then(setSurahDetails);
  }, [selectedSurah]);

  // البحث
  const handleSearch = async (term) => {
    setSearchQuery(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    const res = await fetch(
      `/api/quran/search?query=${encodeURIComponent(term)}`
    );
    const data = await res.json();
    setSearchResults(data.results);
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="quran-app">
      {/* الشريط العلوي */}
      <div className="header">
        <input
          type="search"
          placeholder="ابحث..."
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* النتائج */}
      {searchQuery && (
        <div className="search-results">
          <h3>نتائج البحث ({searchResults.length})</h3>
          {searchResults.slice(0, 10).map((verse, idx) => (
            <div key={idx} className="verse-result">
              <small>{verse.surahNameArabic}</small>
              <p>{verse.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* فهرس السور */}
      <div className="surahs-list">
        <h2>السور</h2>
        {quranData?.map(surah => (
          <button
            key={surah.surahNumber}
            onClick={() => setSelectedSurah(surah.surahNumber)}
            className={selectedSurah === surah.surahNumber ? 'active' : ''}
          >
            {surah.surahNumber}. {surah.nameArabic}
          </button>
        ))}
      </div>

      {/* محتوى السورة */}
      {surahDetails && (
        <div className="surah-content">
          <h1>سورة {surahDetails.nameArabic}</h1>
          {surahDetails.ayat.map(ayat => (
            <div key={ayat.ayatNumber} className="ayah">
              <p className="text">{ayat.text}</p>
              <span className="number">{ayat.ayatNumber}</span>
              <small className="meta">
                الصفحة {ayat.page} • الجزء {ayat.juz}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuranApp;
```

---

## مثال مع Axios (بديل fetch)

```javascript
import axios from 'axios';

// الحصول على جميع السور
const getAllSurahs = () => {
  return axios.get('/api/quran/surahs');
};

// الحصول على سورة محددة
const getSurah = (surahNumber) => {
  return axios.get(`/api/quran/surah/${surahNumber}`);
};

// البحث
const searchQuran = (query) => {
  return axios.get('/api/quran/search', {
    params: { query }
  });
};

// الاستخدام
async function example() {
  try {
    // جلب جميع السور
    const { data: surahs } = await getAllSurahs();
    console.log(`عدد السور: ${surahs.length}`);

    // جلب سورة محددة
    const { data: surah } = await getSurah(55); // الرحمن
    console.log(`سورة ${surah.nameArabic} تحتوي على ${surah.totalAyat} آية`);

    // البحث
    const { data: search } = await searchQuran('النور');
    console.log(`وجدنا ${search.results.length} نتيجة`);

  } catch (error) {
    console.error('حدث خطأ:', error);
  }
}
```

---

## curl أمثلة (من خط الأوامر)

```bash
# جميع السور
curl http://localhost:5000/api/quran/surahs

# سورة محددة (مثال: سورة يس = 36)
curl http://localhost:5000/api/quran/surah/36

# آية محددة (سورة 36 آية 82)
curl http://localhost:5000/api/quran/surah/36/verse/82

# البحث
curl "http://localhost:5000/api/quran/search?query=السلام"

# فحص صحة API
curl http://localhost:5000/api/quran/health
```

---

## ملاحظات الأداء

```javascript
// ✅ سريع جداً (من IndexedDB)
const surah = await getSurahFromCache(1);  // ~5ms

// ⚠️ أبطأ قليلاً (من MongoDB)
const response = await fetch('/api/quran/surah/1');  // ~50-200ms

// 💡 نصيحة: استخدم الـ hook دائماً للأداء الأفضل
```

---

## الإجابات السريعة

### س: كم عدد النتائج التي يُرجعها البحث؟
**ج:** أقصى 50 نتيجة لكل بحث

### س: هل يمكن البحث بجزء من الكلمة؟
**ج:** نعم، يدعم البحث الجزئي

### س: ما أقل حد للبحث؟
**ج:** حرفين على الأقل

### س: هل يمكن البحث حسب رقم السورة؟
**ج:** نعم، استخدم الرقم مباشرة

---

**استمتع بـ API المصحف! 📚**
