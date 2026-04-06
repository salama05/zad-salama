# ⚡ البدء السريع - مصحف حفص بدون إنترنت

## الخطوات الـ 5 التالية ستجهز المصحف للعمل:

---

## 1️⃣ **تشغيل MongoDB**

### اختر أحد الخيارات:

**الخيار A: MongoDB محلي (Windows)**
```bash
# من أي مجلد
mongod
```

**الخيار B: استخدام MongoDB Atlas (Cloud)**
- اذهب https://www.mongodb.com/cloud/atlas
- أنشئ حساب مجاني
- انسخ Connection String
- ضعه في `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zad-salama
```

---

## 2️⃣ **تثبيت المكتبات**

```bash
# من مجلد Backend
cd backend
npm install

# من مجلد Frontend (في terminal جديد)
cd frontend
npm install
```

---

## 3️⃣ **ملء قاعدة البيانات بالقرآن**

```bash
# من مجلد backend
node seed-quran.js
```

**انتظر حتى تظهر الرسالة:**
```
✅ Quran data saved successfully!
📊 Total Verses: 6236
```

⏱️ **الوقت المتوقع:** 2-5 دقائق

---

## 4️⃣ **تشغيل Backend**

```bash
# من مجلد backend (window 1)
npm run dev
```

**يجب أن ترى:**
```
Server is running on port 5000
✅ Connected to MongoDB
```

---

## 5️⃣ **تشغيل Frontend**

```bash
# من مجلد frontend (window 2)
npm run dev
```

**يجب أن ترى:**
```
VITE ready in 234 ms

➜  Local:   http://localhost:5173/
```

---

## ✅ الآن يمكنك:

1. افتح http://localhost:5173
2. انقر على **"إعدادات المصحف"**
3. اضغط **"تحميل المصحف للعمل بدون إنترنت"**
4. انتظر اكتمال التحميل (1-2 دقيقة)
5. ابدأ القراءة مباشرة! 🚀

---

## 🔧 Cloud Deployment (اختياري)

### Deploy على Vercel/Netlify:
```bash
# من مجلد frontend
npm run build
# ارفع المجلد dist على Vercel
```

### Deploy على Railway/Heroku:
```bash
# من مجلد backend
# اتبع خطوات التطبيق الخاص بهم
```

---

## ⚠️ المشاكل الشائعة

| المشكلة | الحل |
|--------|------|
| "Cannot find module" | `npm install` مرة أخرى |
| "MongoDB connection error" | تحقق من MongoDB و Connection String |
| "Port 5000 already in use" | غيّر PORT في `.env` |
| "Port 5173 already in use" | الـ Vite سيختار port آخر تلقائياً |

---

## 📚 المراجع الإضافية

- [دليل شامل](./QURAN_OFFLINE_GUIDE.md)
- [API Documentation](./QURAN_OFFLINE_GUIDE.md#-api-endpoints)
- [استكشاف الأخطاء](./QURAN_OFFLINE_GUIDE.md#-استكشاف-الأخطاء)

---

**🎉 اكتمل! مصحفك جاهز للعمل بدون إنترنت**
