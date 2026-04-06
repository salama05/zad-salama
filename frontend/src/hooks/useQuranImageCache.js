/**
 * Hook لتخزين صور صفحات المصحف محلياً في IndexedDB
 * يحمّل الصور من CDN ويخزنها للاستخدام offline
 */

const DB_NAME = 'QuranImagesDB';
const STORE_NAME = 'pages';
const DB_VERSION = 1;

// تهيئة قاعدة البيانات
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// تحويل Blob إلى Base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// تحميل صورة من URL
const fetchImageAsBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');
    const blob = await response.blob();
    return await blobToBase64(blob);
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

/**
 * حفظ صورة في IndexedDB
 * @param {string} riwayah - الرواية (hafs/warsh)
 * @param {number} pageNumber - رقم الصفحة
 * @param {string} base64Data - بيانات الصورة بصيغة Base64
 */
export const saveImageToCache = async (riwayah, pageNumber, base64Data) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const id = `${riwayah}_${pageNumber}`;
    await store.put({
      id,
      riwayah,
      pageNumber,
      data: base64Data,
      cachedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error saving image to cache:', error);
    return false;
  }
};

/**
 * جلب صورة من IndexedDB
 * @param {string} riwayah - الرواية
 * @param {number} pageNumber - رقم الصفحة
 * @returns {Promise<string|null>} - بيانات Base64 أو null
 */
export const getImageFromCache = async (riwayah, pageNumber) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const id = `${riwayah}_${pageNumber}`;
    
    return new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

/**
 * التحقق من وجود صورة في الذاكرة المخبأة
 */
export const isImageCached = async (riwayah, pageNumber) => {
  const data = await getImageFromCache(riwayah, pageNumber);
  return data !== null;
};

/**
 * جلب صورة مع التخزين المحلي
 * يحاول أولاً من الذاكرة المخبأة، ثم من CDN إذا لزم الأمر
 * @param {string} riwayah - الرواية (hafs/warsh)
 * @param {number} pageNumber - رقم الصفحة
 * @param {function} onProgress - دالة للإبلاغ عن التقدم
 * @returns {Promise<string|null>} - URL الصورة (data URL أو CDN URL)
 */
export const getQuranPageImage = async (riwayah, pageNumber, onProgress = null) => {
  // أولاً: تحقق من الذاكرة المخبأة
  const cachedData = await getImageFromCache(riwayah, pageNumber);
  if (cachedData) {
    onProgress?.({ status: 'cached', pageNumber });
    return cachedData;
  }

  // ثانياً: حمّل من CDN
  const folder = riwayah === 'warsh' ? 'warsh' : 'hafs-wasat';
  const cdnUrl = `https://raw.githubusercontent.com/QuranHub/quran-pages-images/master/kfgqpc/${folder}/${pageNumber}.jpg`;
  
  onProgress?.({ status: 'downloading', pageNumber });
  
  const base64Data = await fetchImageAsBase64(cdnUrl);
  
  if (base64Data) {
    // احفظ في الذاكرة المخبأة للاستخدام المستقبلي
    await saveImageToCache(riwayah, pageNumber, base64Data);
    onProgress?.({ status: 'saved', pageNumber });
    return base64Data;
  }
  
  // إذا فشل التحميل، أرجع URL المباشر كخيار احتياطي
  onProgress?.({ status: 'fallback', pageNumber });
  return cdnUrl;
};

/**
 * تحميل مجموعة من الصفحات مسبقاً
 * @param {string} riwayah - الرواية
 * @param {number[]} pageNumbers - أرقام الصفحات
 * @param {function} onProgress - دالة للإبلاغ عن التقدم
 */
export const preloadPages = async (riwayah, pageNumbers, onProgress = null) => {
  let completed = 0;
  const total = pageNumbers.length;
  
  for (const pageNumber of pageNumbers) {
    await getQuranPageImage(riwayah, pageNumber, (status) => {
      onProgress?.({
        ...status,
        completed: ++completed,
        total,
        percentage: Math.round((completed / total) * 100)
      });
    });
  }
};

/**
 * الحصول على إحصائيات التخزين
 */
export const getCacheStats = async (riwayah) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const allData = request.result;
        const riwayahData = allData.filter(item => item.riwayah === riwayah);
        
        resolve({
          totalPages: riwayahData.length,
          riwayah,
          lastCached: riwayahData.length > 0 
            ? riwayahData.sort((a, b) => new Date(b.cachedAt) - new Date(a.cachedAt))[0].cachedAt
            : null
        });
      };
      request.onerror = () => resolve({ totalPages: 0, riwayah, lastCached: null });
    });
  } catch (error) {
    return { totalPages: 0, riwayah, lastCached: null };
  }
};

/**
 * مسح ذاكرة التخزين المؤقت لرواية معينة
 */
export const clearRiwayahCache = async (riwayah) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const allData = request.result;
        const toDelete = allData.filter(item => item.riwayah === riwayah);
        
        toDelete.forEach(item => {
          store.delete(item.id);
        });
        
        resolve(toDelete.length);
      };
      request.onerror = () => resolve(0);
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return 0;
  }
};

/**
 * مسح كل الذاكرة المؤقتة
 */
export const clearAllCache = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
    return true;
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return false;
  }
};

export default {
  getQuranPageImage,
  getImageFromCache,
  saveImageToCache,
  isImageCached,
  preloadPages,
  getCacheStats,
  clearRiwayahCache,
  clearAllCache
};
