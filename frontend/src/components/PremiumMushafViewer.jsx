import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaMoon, FaSun } from 'react-icons/fa';

/**
 * عارض مصحف احترافي مع صور عالية الجودة
 * يحاكي تطبيق المصحف الشريف على الهواتف الذكية
 */
function PremiumMushafViewer({ 
  initialPage = 1,
  showHeader = true,
  showFooter = true,
  enableDarkMode = true,
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [darkMode, setDarkMode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [surahInfo, setSurahInfo] = useState(null);
  const touchStartX = useRef(0);

  // بيانات السور
  const surahList = [
    { id: 1, name: 'الفاتحة', startPage: 1, endPage: 1 },
    { id: 2, name: 'البقرة', startPage: 2, endPage: 49 },
    { id: 3, name: 'آل عمران', startPage: 50, endPage: 76 },
    { id: 4, name: 'النساء', startPage: 77, endPage: 105 },
    { id: 5, name: 'المائدة', startPage: 106, endPage: 127 },
    // ... باقي السور
  ];

  // الحصول على معلومات السورة للصفحة الحالية
  useEffect(() => {
    const surah = surahList.find(s => 
      currentPage >= s.startPage && currentPage <= s.endPage
    );
    setSurahInfo(surah || surahList[0]);
  }, [currentPage]);

  const pageFormatted = String(currentPage).padStart(3, '0');
  const imagePath = `/mushaf/${pageFormatted}.png`;

  const colors = {
    light: {
      bg: '#FBF8F1',
      card: '#FFFFFF',
      text: '#2C1810',
      border: '#D4AF37',
      secondary: '#8B7355',
      overlay: 'rgba(0, 0, 0, 0.05)',
    },
    dark: {
      bg: '#1A1410',
      card: '#2C2420',
      text: '#E8DCC4',
      border: '#D4AF37',
      secondary: '#A0917B',
      overlay: 'rgba(255, 255, 255, 0.05)',
    }
  };

  const current = darkMode ? colors.dark : colors.light;

  const handleNextPage = () => {
    if (currentPage < 604) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX || 0;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches?.[0]?.clientX || 0;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNextPage();
      else handlePrevPage();
    }
  };

  return (
    <div style={{
      backgroundColor: current.bg,
      color: current.text,
      minHeight: '100vh',
      transition: 'background-color 0.3s ease',
      direction: 'rtl',
    }}>
      {/* === HEADER === */}
      {showHeader && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: `2px solid ${current.border}`,
          backgroundColor: current.overlay,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: current.border,
                fontSize: '1.5rem',
              }}
              title="تبديل الوضع الليلي"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              سورة {surahInfo?.name}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
              الصفحة {currentPage} من 604
            </div>
          </div>

          <button
            onClick={() => setTextMode(!textMode)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: current.border,
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
            }}
          >
            {textMode ? 'الصورة' : 'النص'}
          </button>
        </div>
      )}

      {/* === MAIN CONTENT === */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '1.5rem',
        minHeight: 'calc(100vh - 200px)',
      }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: current.card,
          borderRadius: '0.75rem',
          boxShadow: darkMode 
            ? '0 10px 40px rgba(0, 0, 0, 0.3)' 
            : '0 10px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}>
          {/* === PAGE HEADER === */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderBottom: `2px solid ${current.border}`,
            backgroundColor: current.overlay,
            direction: 'rtl',
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
              سورة {surahInfo?.name}
            </span>
            <span style={{ 
              fontSize: '0.75rem', 
              color: current.border,
              fontWeight: 'bold'
            }}>
              {currentPage}
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
              الحزب الأول
            </span>
          </div>

          {/* === PAGE CONTENT === */}
          <div style={{
            padding: '1.5rem',
            minHeight: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {textMode ? (
              // نمط النص
              <div style={{
                textAlign: 'right',
                direction: 'rtl',
                lineHeight: '1.8',
                fontSize: '1.1rem',
              }}>
                <div style={{
                  color: current.border,
                  textAlign: 'center',
                  marginBottom: '2rem',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}>
                  سورة {surahInfo?.name}
                </div>
                <div style={{
                  display: 'grid',
                  gap: '1rem',
                  direction: 'rtl',
                }}>
                  <p>الحمد لله رب العالمين</p>
                  <p style={{ color: current.secondary, fontSize: '0.9rem' }}>
                    ۞۱۞
                  </p>
                  <p>الرحمن الرحيم</p>
                  <p style={{ color: current.secondary, fontSize: '0.9rem' }}>
                    ۞۲۞
                  </p>
                  <p>مالك يوم الدين</p>
                  <p style={{ color: current.secondary, fontSize: '0.9rem' }}>
                    ۞۳۞
                  </p>
                </div>
              </div>
            ) : (
              // نمط الصورة
              <img
                src={imagePath}
                alt={`صفحة ${currentPage}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '600px',
                  objectFit: 'contain',
                  opacity: imageLoaded ? 1 : 0.3,
                  transition: 'opacity 0.3s ease',
                  borderRadius: '0.25rem',
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
              />
            )}
          </div>

          {/* === PAGE FOOTER === */}
          {showFooter && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderTop: `2px solid ${current.border}`,
              backgroundColor: current.overlay,
            }}>
              <button
                onClick={handleNextPage}
                disabled={currentPage === 604}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: currentPage === 604 ? current.secondary : current.border,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: currentPage === 604 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s ease',
                  opacity: currentPage === 604 ? 0.5 : 1,
                }}
              >
                <FaChevronLeft /> التالي
              </button>

              <input
                type="number"
                value={currentPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 604) {
                    setCurrentPage(value);
                  }
                }}
                style={{
                  width: '80px',
                  padding: '0.5rem',
                  textAlign: 'center',
                  border: `2px solid ${current.border}`,
                  borderRadius: '0.5rem',
                  backgroundColor: current.bg,
                  color: current.text,
                  fontWeight: 'bold',
                }}
                min={1}
                max={604}
              />

              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: currentPage === 1 ? current.secondary : current.border,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s ease',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                السابق <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PremiumMushafViewer;
