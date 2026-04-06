# 📖 مصحف حفص - نسخة بدون إنترنت

## نظرة عامة
تم بناء نسخة **مصحف حفص عن عاصم** كاملة تعمل **بدون الحاجة لاتصال إنترنت**. البيانات محفوظة محلياً في قاعدة بيانات MongoDB وتُخزن في **IndexedDB** للوصول السريع.

---

## 🚀 الميزات الرئيسية

✅ **مصحف كامل بدون إنترنت** - قراءة شاملة لكل 114 سورة
✅ **تخزين محلي ذكي** - استخدام IndexedDB للوصول السريع
✅ **واجهة اقرأ الآيات** - عرض آايات واضح مع تشكيل
✅ **نظام البحث** - البحث في نصوص القرآن الكامل
✅ **إداة التحميل** - واجهة سهلة لتحميل البيانات مقدماً
✅ **متوافق مع الموبايل** - يعمل على جميع الأجهزة

---

## 📋 المكونات المُضافة

### Backend (`/backend`)
- **`src/models/Quran.js`** - نموذج MongoDB لتخزين القرآن
- **`src/routes/quran.js`** - API endpoints للمصحف:
  - `GET /api/quran/surahs` - جميع السور
  - `GET /api/quran/surah/:surahNumber` - سورة محددة
  - `GET /api/quran/surah/:surahNumber/verse/:verseNumber` - آية محددة
  - `GET /api/quran/search?query=...` - البحث
- **`seed-quran.js`** - سكريبت لملء قاعدة البيانات بالقرآن

### Frontend (`/frontend`)
- **`src/hooks/useQuranOffline.js`** - Hook للتخزين المحلي (IndexedDB)
- **`src/pages/QuranSettings.jsx`** - صفحة تحميل وإدارة البيانات
- **`src/pages/QuranIndexOffline.jsx`** - فهرس السور بدون إنترنت
- **`src/pages/SurahDetailOffline.jsx`** - عرض تفاصيل السورة
- **تحديث `App.jsx`** - إضافة المسارات الجديدة

---

## 🔧 خطوات التثبيت والتشغيل

### 1️⃣ **إعداد Backend**

```bash
cd backend
npm install
```

### 2️⃣ **تشغيل MongoDB**
تأكد من أن MongoDB يعمل:
```bash
# الختيار 1: MongoDB local
mongod

# أو الخيار 2: MongoDB Atlas
# استخدم connection string في .env
```

### 3️⃣ **ملء قاعدة البيانات بالقرآن**

```bash
# في مجلد backend
npm run seed:quran
```

**ملاحظة:** قد يستغرق هذا 2-5 دقائق لتحميل جميع السور من Quran.com API

```bash
node seed-quran.js
```

**الإخراج المتوقع:**
```
🔗 Connecting to MongoDB...
✅ Connected to MongoDB

📥 Fetching Quran data from Quran.com API...
⏳ Fetching Surah 1...
⏳ Fetching Surah 2...
...

💾 Saving 114 surahs to MongoDB...
✅ Quran data saved successfully!

📊 Quran Dataset Summary:
   - Total Surahs: 114
   - Total Verses: 6236
```

### 4️⃣ **تشغيل Backend API**

```bash
# من مجلد backend
npm run dev

# أو
node server.js
```

**الإخراج:**
```
Server is running on port 5000
✅ Connected to MongoDB Atlas
```

### 5️⃣ **تشغيل Frontend**

```bash
cd frontend
npm install
npm run dev
```

**الإخراج:**
```
  VITE v8.0.1  ready in 234 ms

  ➜  Local:   http://localhost:5173/
```

---

## 📱 كيفية الاستخدام

### للمرة الأولى:

1. **اذهب إلى "إعدادات المصحف"** من الصفحة الرئيسية
2. **اضغط "تحميل المصحف للعمل بدون إنترنت"**
3. **انتظر اكتمال التحميل** (1-2 دقيقة)
4. **ستظهر رسالة نجاح** عند اكتمال التحميل

### الاستخدام:

1. **اضغط "مصحف بدون إنترنت"** من الصفحة الرئيسية
2. **اختر سورة** من الفهرس
3. **اقرأ الآيات** دون الحاجة للإنترنت
4. **استمع للتسجيل** (إذا كان متاحاً)

---

## 🗄️ هيكل البيانات

### نموذج MongoDB:
```javascript
{
  _id: ObjectId,
  type: "hafs",
  surahs: [
    {
      surahNumber: 1,
      nameArabic: "الفاتحة",
      nameEnglish: "Al-Fatihah",
      revelationType: "Meccan",
      totalAyat: 7,
      startPage: 1,
      endPage: 1,
      ayat: [
        {
          ayatNumber: 1,
          surahNumber: 1,
          text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          page: 1,
          juz: 1
        },
        ...
      ]
    },
    ...
  ]
}
```

### IndexedDB (Local Storage):
```
Database: ZadSalamaDB
Store: quran
Keys:
  - surah_1, surah_2, ..., surah_114 (سور القرآن)
  - metadata (تاريخ التحميل والإحصائيات)
```

---

## 🔍 API Endpoints

### الحصول على جميع السور
```bash
GET /api/quran/surahs
```

### الحصول على سورة محددة مع آياتها
```bash
GET /api/quran/surah/1
```

### الحصول على آية محددة
```bash
GET /api/quran/surah/1/verse/1
```

### البحث في القرآن
```bash
GET /api/quran/search?query=الرحمن
```

### فحص صحة API
```bash
GET /api/quran/health
```

---

## 📊 الإحصائيات

- **إجمالي السور**: 114
- **إجمالي الآيات**: 6,236
- **حجم البيانات**: ~5 MB
- **وقت التحميل الأول**: 1-2 دقيقة
- **سرعة الوصول**: فوري (محلي)

---

## 🛠️ استكشاف الأخطاء

### المشكلة: "لا يمكن الاتصال بـ MongoDB"
**الحل:**
- تأكد من أن MongoDB يعمل
- تحقق من `MONGODB_URI` في `.env`

### المشكلة: "فشل تحميل البيانات"
**الحل:**
- معةد التشغيل: `npm run seed:quran` من جديد
- تحقق من اتصالك بالإنترنت (يُستخدم فقط للتحميل الأول)

### المشكلة: "بطء في التحميل"
**الحل:**
- قد يكون المتصفح يحمل البيانات لأول مرة
- الزيارة الثانية ستكون أسرع (من الذاكرة المحلية)

---

## 🔐 الأمان

- البيانات محفوظة محلياً في IndexedDB (لا تُرسل للخادم)
- استخدام HTTPS مُستحسن في الإنتاج
- لا تُخزن بيانات حساسة

---

## 📦 المتطلبات

### Backend:
- Node.js 16+
- MongoDB 4.0+
- npm/yarn

### Frontend:
- React 19+
- Vite 8+
- IndexedDB support (جميع المتصفحات الحديثة)

---

## 📝 الملاحظات

- تم استخدام بيانات Quran.com API (مفتوحة الترخيص)
- الرواية المستخدمة: **حفص عن عاصم**
- يمكن إضافة روايات أخرى بنفس الطريقة

---

## 🎯 التطويرات المستقبلية

- [ ] إضافة روايات أخرى (ورش، قالون، الدوري)
- [ ] تحميل الصور المصحفة محلياً
- [ ] نظام الإشارات والعلامات
- [ ] تصدير البيانات كـ JSON
- [ ] نظام Sync متقدم

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح issue في المشروع.

---

**ألف مبروك! 🎉 مصحفك جاهز الآن!**
