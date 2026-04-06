import React, { useState, useEffect } from 'react';
import { getQuranPageImage } from '../hooks/useQuranImageCache';

/**
 * مكون لعرض صفحة المصحف مع التخزين المحلي
 * يحمّل الصور من CDN ويخزنها للاستخدام offline
 */
function CachedQuranPage({ 
  pageNumber, 
  riwayah = 'hafs',
  className = '',
  onLoad,
  onError
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      setLoading(true);
      setError(false);

      try {
        // جلب الصورة (من الذاكرة أو CDN)
        const src = await getQuranPageImage(riwayah, pageNumber);

        if (isMounted) {
          setImageSrc(src);
          setLoading(false);
          onLoad?.(pageNumber);
        }
      } catch (err) {
        console.error('Error loading page:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
          onError?.(pageNumber, err);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [pageNumber, riwayah]);

  // حالة التحميل
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center bg-white rounded-md min-h-[400px] ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D4AF37] border-t-transparent mb-4"></div>
      </div>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-white rounded-md min-h-[400px] p-6 ${className}`}>
        <div className="text-5xl mb-4">⚠️</div>
        <p className="font-cairo text-[#8B7355] text-center mb-2">
          تعذر تحميل الصفحة {pageNumber}
        </p>
        <p className="font-cairo text-[#A0917B] text-sm text-center">
          تحقق من اتصالك بالإنترنت وحاول مرة أخرى
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageSrc}
        alt={`صفحة ${pageNumber} من المصحف الشريف`}
        className="w-full h-auto object-contain"
        loading="lazy"
      />

      {/* رقم الصفحة */}
      <div className="absolute bottom-1 right-0 left-0 text-center opacity-40 font-cairo text-[10px] text-black bg-white/60 w-fit mx-auto px-3 rounded-t-lg shadow-sm">
        صفحة {pageNumber}
      </div>
    </div>
  );
}

export default CachedQuranPage;
