import React, { useState, useEffect, useRef } from 'react';

/**
 * مكون عرض صفحة المصحف
 * يدعم Lazy Loading ومعالجة الأخطاء
 */
function MushafPage({ pageNumber, isVisible = true, onLoad, onError }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef(null);

  // تنسيق رقم الصفحة (001, 002, ...)
  const formattedPage = String(pageNumber).padStart(3, '0');
  
  // مسار الصورة - نجرب PNG أولاً ثم WebP
  const pngPath = `/mushaf/${formattedPage}.png`;
  const webpPath = `/mushaf/${formattedPage}.webp`;
  const jpgPath = `/mushaf/${formattedPage}.jpg`;

  useEffect(() => {
    if (!isVisible) return;

    setIsLoaded(false);
    setHasError(false);

    // محاولة تحميل الصورة
    const img = new Image();
    
    const tryLoad = (paths, index = 0) => {
      if (index >= paths.length) {
        setHasError(true);
        onError?.(pageNumber);
        return;
      }

      img.onload = () => {
        setImageSrc(paths[index]);
        setIsLoaded(true);
        onLoad?.(pageNumber);
      };

      img.onerror = () => {
        tryLoad(paths, index + 1);
      };

      img.src = paths[index];
    };

    tryLoad([pngPath, webpPath, jpgPath]);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [pageNumber, isVisible]);

  // حالة التحميل
  if (!isLoaded && !hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FBF8F1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D4AF37] border-t-transparent mx-auto mb-4"></div>
          <p className="font-cairo text-[#8B7355] text-sm">جارِ تحميل الصفحة {pageNumber}...</p>
        </div>
      </div>
    );
  }

  // حالة الخطأ
  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FBF8F1]">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">📖</div>
          <p className="font-cairo text-[#8B7355] text-lg mb-2">
            الصفحة {pageNumber} غير متوفرة
          </p>
          <p className="font-cairo text-[#A0917B] text-sm">
            تأكد من وجود صور المصحف في مجلد /public/mushaf/
          </p>
        </div>
      </div>
    );
  }

  // عرض الصفحة
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#FBF8F1] overflow-hidden">
      <img
        ref={imgRef}
        src={imageSrc}
        alt={`صفحة ${pageNumber} من المصحف الشريف`}
        className="max-w-full max-h-full object-contain select-none"
        draggable={false}
        loading="lazy"
        style={{
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
        }}
      />
    </div>
  );
}

export default MushafPage;
