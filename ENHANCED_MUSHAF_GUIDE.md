# دليل المصحف الشريف المحسّن

تم إضافة ثلاثة مكونات جديدة تحسّن من عرض صفحات المصحف برسم عثماني جميل وتصميم كلاسيكي:

## المكونات الجديدة

### 1. **EnhancedMushafPage** 
📁 `frontend/src/components/EnhancedMushafPage.jsx`

مكون يعرض صفحة المصحف برسم عثماني احترافي مع:
- تصميم كلاسيكي جميل يحاكي المصحف الشريف
- ألوان تراثية (بيج، ذهبي، بني)
- إطارات زخرفية عربية
- رؤوس السور مزخرفة
- أرقام الآيات برسم عثماني (۞)

**الخصائص:**
```jsx
<EnhancedMushafPage 
  pageNumber={1}                    // رقم الصفحة (1-604)
  surahName="الفاتحة"               // اسم السورة
  verses={[...]}                    // قائمة الآيات
/>
```

### 2. **QuranPageRenderer**
📁 `frontend/src/components/QuranPageRenderer.jsx`

مكون بديل يعرض القرآن بتنسيق بسيط وجميل مع:
- تصميم نظيف وحديث
- عرض الآيات برسم عثماني
- فواصل السور المزخرفة
- دعم معلومات القارئ

**الخصائص:**
```jsx
<QuranPageRenderer 
  pageNumber={1}
  surahName="الفاتحة"
  verses={[...]}
  reciterName="سعد الغامدي"
/>
```

### 3. **MushafPageDisplay**
📁 `frontend/src/components/MushafPageDisplay.jsx`

مكون متقدم يدعم طريقتي عرض:

**الخصائص:**
```jsx
<MushafPageDisplay 
  pageNumber={1}
  displayMode="image"  // 'image' أو 'text'
  surahName="الفاتحة"
  verses={[...]}
  showPageInfo={true}
/>
```

- **`displayMode="image"`**: يعرض صورة المصحف من مجلد `/public/mushaf/`
- **`displayMode="text"`**: يعرض النصوص برسم عثماني مع تنسيق جميل

### 4. **EnhancedMushafReader**
📁 `frontend/src/pages/EnhancedMushafReader.jsx`

صفحة متكاملة لعرض المصحف مع:
- واجهة تنقل بين الصفحات
- عرض رقم الصفحة والسورة
- دعم أسهم لوحة المفاتيح
- تحميل ديناميكي للآيات

## الألوان والتصميم

تم استخدام ألوان تراثية تناسب المصحف الشريف:

```javascript
colors = {
  bg: '#FBF8F1',          // خلفية البيج الدافئ
  pageBg: '#F5F0E6',      // خلفية الصفحة
  darkBrown: '#2C1810',   // بني غامق للنص
  gold: '#D4AF37',        // ذهبي للزخرفة
  lightGold: '#C5A028',   // ذهبي فاتح
  border: '#8B7355',      // بني للحدود
  divider: '#E8DCC4',     // فاصل خفيف
}
```

## طريقة الاستخدام

### أضف الصفحة الجديدة للمسارات

في `frontend/src/App.jsx` أضف المسار:

```jsx
import EnhancedMushafReader from './pages/EnhancedMushafReader';

// داخل Router
<Route path="/mushaf-reader" element={<EnhancedMushafReader />} />
```

### استخدم المكونات في صفحاتك الموجودة

```jsx
import EnhancedMushafPage from '../components/EnhancedMushafPage';

function MyPage() {
  return (
    <EnhancedMushafPage 
      pageNumber={currentPage}
      surahName={surahName}
      verses={pageVerses}
    />
  );
}
```

## المميزات

✨ **تصميم احترافي**
- يحاكي تصميم المصحف الشريف الفعلي
- إطارات زخرفية عربية جميلة
- ألوان تراثية دافئة

📖 **عرض احترافي**
- أرقام الآيات برسم عثماني
- رؤوس السور مزخرفة
- فواصل وإطارات جميلة

⌨️ **سهولة الاستخدام**
- دعم أسهم لوحة المفاتيح
- تحكم كامل برقم الصفحة
- تحميل سلس وسريع

## بيانات الآيات

يتوقع المكون بيانات بالصيغة التالية:

```javascript
verses = [
  {
    type: 'surah-header',
    surahNumber: 1,
    surahName: 'الفاتحة',
    revelationType: 'Meccan' // أو 'Medinan'
  },
  {
    type: 'ayah',
    text: 'الحمد لله رب العالمين',
    numberInSurah: 1,
    surahNumber: 1,
    page: 1
  },
  // ... آيات أخرى
]
```

## الملفات المضافة

```
frontend/src/
├── components/
│   ├── EnhancedMushafPage.jsx      (مكون المصحف المحسّن)
│   ├── QuranPageRenderer.jsx       (مكون عرض بديل)
│   └── MushafPageDisplay.jsx       (مكون متقدم)
└── pages/
    └── EnhancedMushafReader.jsx    (صفحة المصحف المتكاملة)
```

## ملاحظات تقنية

1. **صور المصحف**: ضع صور المصحف في `public/mushaf/` بصيغة `001.png`, `002.png`, إلخ

2. **بيانات القرآن**: يتوقع الملف `quran-hafs.json` في المجلد `public/`

3. **Tailwind CSS**: تأكد من تثبيت Tailwind CSS للتصميم الأمثل

4. **الخطوط**: استخدم خطوط عربية مناسبة مثل:
   - "Traditional Arabic"
   - "Arabic Typesetting"
   - "Droid Arabic Naskh"

## الخطوات التالية المقترحة

1. ✅ دمج المكونات الجديدة في الصفحات الموجودة
2. ✅ تحسين صور المصحف إذا لزم الأمر
3. ✅ إضافة ميزات إضافية (البحث، الوضع الليلي، إلخ)
4. ✅ اختبار شامل على أجهزة مختلفة

---

**تاريخ الإضافة**: 2026-04-11
**الإصدار**: 1.0
