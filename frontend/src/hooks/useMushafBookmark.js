import { useState, useEffect, useCallback } from 'react';

const BOOKMARK_KEY = 'mushaf-bookmark';
const SYNC_ENDPOINT = '/api/user/mushaf-bookmark';

/**
 * Hook لإدارة العلامات المرجعية للمصحف
 * يحفظ في localStorage ويزامن مع MongoDB عند توفر الإنترنت
 */
export function useMushafBookmark(userId = null) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // تحميل العلامة المرجعية من localStorage عند بدء التشغيل
  useEffect(() => {
    const loadBookmark = async () => {
      try {
        // أولاً: تحميل من localStorage
        const savedBookmark = localStorage.getItem(BOOKMARK_KEY);
        if (savedBookmark) {
          const parsed = JSON.parse(savedBookmark);
          setCurrentPage(parsed.page || 1);
          setLastSyncTime(parsed.syncTime || null);
        }

        // ثانياً: محاولة المزامنة مع السيرفر إذا كان المستخدم مسجل
        if (userId && navigator.onLine) {
          await syncFromServer();
        }
      } catch (error) {
        console.error('Error loading mushaf bookmark:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmark();
  }, [userId]);

  // مزامنة من السيرفر
  const syncFromServer = async () => {
    if (!userId || !navigator.onLine) return;

    try {
      const response = await fetch(`${SYNC_ENDPOINT}?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.page) {
          const localData = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '{}');
          
          // استخدم البيانات الأحدث
          if (!localData.syncTime || new Date(data.updatedAt) > new Date(localData.syncTime)) {
            setCurrentPage(data.page);
            saveToLocal(data.page, data.updatedAt);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to sync from server:', error);
    }
  };

  // حفظ في localStorage
  const saveToLocal = (page, syncTime = null) => {
    const bookmark = {
      page,
      updatedAt: new Date().toISOString(),
      syncTime
    };
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmark));
  };

  // مزامنة إلى السيرفر
  const syncToServer = async (page) => {
    if (!userId || !navigator.onLine) return false;

    try {
      const response = await fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          page,
          updatedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        setLastSyncTime(new Date().toISOString());
        return true;
      }
    } catch (error) {
      console.warn('Failed to sync to server:', error);
    }
    return false;
  };

  // تحديث الصفحة الحالية
  const updatePage = useCallback(async (page) => {
    if (page < 1 || page > 604) return;
    
    setCurrentPage(page);
    saveToLocal(page);

    // محاولة المزامنة مع السيرفر (بدون انتظار)
    if (userId && navigator.onLine) {
      syncToServer(page);
    }
  }, [userId]);

  // الذهاب للصفحة التالية
  const nextPage = useCallback(() => {
    if (currentPage < 604) {
      updatePage(currentPage + 1);
    }
  }, [currentPage, updatePage]);

  // الذهاب للصفحة السابقة
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      updatePage(currentPage - 1);
    }
  }, [currentPage, updatePage]);

  // الذهاب لصفحة معينة
  const goToPage = useCallback((page) => {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= 604) {
      updatePage(pageNum);
    }
  }, [updatePage]);

  // مزامنة يدوية
  const forceSync = useCallback(async () => {
    if (navigator.onLine) {
      const synced = await syncToServer(currentPage);
      if (synced) {
        saveToLocal(currentPage, new Date().toISOString());
      }
      return synced;
    }
    return false;
  }, [currentPage, userId]);

  return {
    currentPage,
    isLoading,
    lastSyncTime,
    nextPage,
    prevPage,
    goToPage,
    forceSync,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
  };
}

export default useMushafBookmark;
