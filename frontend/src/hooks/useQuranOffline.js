import { useEffect, useState } from 'react';

const DB_NAME = 'ZadSalamaDB';
const STORE_NAME = 'quran';
const DB_VERSION = 1;

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: '_id' });
        store.createIndex('surahNumber', 'surahNumber', { unique: false });
        store.createIndex('ayatNumber', 'ayatNumber', { unique: false });
      }
    };
  });
};

// Save Quran data to IndexedDB
export const saveQuranToCache = async (quranData) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Save metadata
    await store.put({
      _id: 'metadata',
      type: 'metadata',
      totalSurahs: quranData.length,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    });

    // Save each surah
    for (const surah of quranData) {
      await store.put({
        _id: `surah_${surah.surahNumber}`,
        ...surah,
        type: 'surah'
      });
    }

    localStorage.setItem('quran-cached', 'true');
    localStorage.setItem('quran-cache-date', new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Error saving to cache:', error);
    return false;
  }
};

// Get Quran from cache
export const getQuranFromCache = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const data = request.result.filter(item => item.type === 'surah');
        resolve(data.sort((a, b) => a.surahNumber - b.surahNumber));
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

// Get single surah from cache
export const getSurahFromCache = async (surahNumber) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = store.get(`surah_${surahNumber}`);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Error reading surah from cache:', error);
    return null;
  }
};

// Check if data is cached
export const isQuranCached = () => {
  return localStorage.getItem('quran-cached') === 'true';
};

// Get cache date
export const getCacheDate = () => {
  return localStorage.getItem('quran-cache-date');
};

// Clear cache
export const clearQuranCache = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    localStorage.removeItem('quran-cached');
    localStorage.removeItem('quran-cache-date');
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Custom React hook for using Quran offline
export const useQuranOffline = () => {
  const [quranData, setQuranData] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuran = async () => {
      try {
        setLoading(true);

        // First check if we have cached data
        const cached = isQuranCached();
        if (cached) {
          const cachedData = await getQuranFromCache();
          if (cachedData && cachedData.length > 0) {
            setQuranData(cachedData);
            setIsCached(true);
            setLoading(false);
            return;
          }
        }

        // If no cache, try to fetch from API
        try {
          const response = await fetch('/api/quran/surahs');
          if (!response.ok) throw new Error('Failed to fetch');

          const surahs = await response.json();

          // Save to cache for offline use
          const fullData = [];
          for (const surah of surahs) {
            const surahRes = await fetch(`/api/quran/surah/${surah.surahNumber}`);
            if (surahRes.ok) {
              const fullSurah = await surahRes.json();
              fullData.push(fullSurah);
            }
          }

          if (fullData.length > 0) {
            await saveQuranToCache(fullData);
            setQuranData(fullData);
            setIsCached(true);
          }
        } catch (apiError) {
          console.warn('API not available, using cached data if available');
          const cachedData = await getQuranFromCache();
          if (cachedData && cachedData.length > 0) {
            setQuranData(cachedData);
            setIsCached(true);
          } else {
            setError('Unable to load Quran data');
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuran();
  }, []);

  return { quranData, isCached, loading, error };
};
