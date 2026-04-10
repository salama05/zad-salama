# كيفية استخدام Capacitor Assets لتحديث اللوغو

## الخطوات:

### 1. تثبيت الأدوات المطلوبة:
```bash
npm install --save-dev @capacitor/assets
npm install --global @capacitor/assets
```

### 2. تثبيت ImageMagick (مطلوب لتحويل الصور):

**على Windows:**
- قم بتنزيل من: https://imagemagick.org/script/download.php
- أو استخدم: `choco install imagemagick`

**على macOS:**
```bash
brew install imagemagick
```

**على Linux:**
```bash
sudo apt-get install imagemagick
```

### 3. تشغيل الأمر لتوليد الأيقونات:
```bash
npx capacitor-assets generate
```

سيقوم بـ:
- تحويل SVG إلى PNG بجودة عالية
- إنشاء جميع أحجام الأيقونات المطلوبة
- وضعها في المجلدات الصحيحة:
  - `android/app/src/main/res/mipmap-*/ic_launcher.png`
  - `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### 4. مزامنة مع التطبيق:
```bash
npx capacitor sync android
npx capacitor sync ios
```

### 5. إعادة بناء وتشغيل:
```bash
npm run build
npx capacitor build android
npx capacitor run android
```

---

## الملفات المطلوبة:
- ✅ `resources/icon.svg` - اللوغو (تم إنشاؤه)
- ✅ `capacitor.assets.config.json` - ملف الإعدادات (تم إنشاؤه)
- ✅ `package.json` - يحتوي على `@capacitor/assets` (يجب إضافته)

## ملاحظات:
- تأكد من وجود ImageMagick مثبت قبل تشغيل الأمر
- اللوغو يجب أن يكون بخلفية شفافة (PNG) أو SVG
- يمكنك تعديل الألوان في `capacitor.assets.config.json`
