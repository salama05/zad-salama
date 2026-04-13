import React, { useState, useEffect } from 'react';

/**
 * مكون متقدم لعرض صفحات المصحف بتصميم احترافي
 * يدعم الصور والنصوص معاً
 */
function MushafPageDisplay({ 
  pageNumber = 1, 
  displayMode = 'image', // 'image' أو 'text'
  surahName = '',
  verses = [],
  showPageInfo = true,
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const colors = {
    bg: '#FBF8F1',
    text: '#2C1810',
    gold: '#D4AF37',
    border: '#8B7355',
    light: '#E8DCC4',
  };

  // صيغة رقم الصفحة: 001، 002، إلخ
  const formattedPage = String(pageNumber).padStart(3, '0');
  const imagePath = `/mushaf/${formattedPage}.png`;

  // النمط الكلاسيكي للمصحف
  const classicStyle = {
    container: {
      backgroundColor: colors.bg,
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      maxWidth: '48rem',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '1rem',
      borderBottom: `2px solid ${colors.gold}`,
      marginBottom: '2rem',
      direction: 'rtl',
      textAlign: 'right',
    },
    headerText: {
      color: colors.border,
      fontSize: '0.875rem',
      fontWeight: 'bold',
    },
    content: {
      direction: 'rtl',
      textAlign: 'right',
      minHeight: '500px',
    },
    surahHeader: {
      textAlign: 'center',
      padding: '1.5rem 0',
      marginBottom: '2rem',
      borderTop: `2px solid ${colors.gold}`,
      borderBottom: `2px solid ${colors.gold}`,
    },
    surahName: {
      color: colors.border,
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    verse: {
      marginBottom: '1.5rem',
      lineHeight: '1.8',
      color: colors.text,
    },
    verseNumber: {
      display: 'inline-block',
      color: colors.gold,
      fontWeight: 'bold',
      marginLeft: '0.5rem',
    },
    decorative: {
      textAlign: 'center',
      margin: '1.5rem 0',
      color: colors.gold,
      fontSize: '1.5rem',
      opacity: 0.6,
    },
  };

  return (
    <div style={classicStyle.container}>
      {/* === HEADER === */}
      {showPageInfo && (
        <div style={classicStyle.header}>
          <div style={classicStyle.headerText}>سورة {surahName}</div>
          <div style={{ color: colors.gold, fontSize: '0.75rem', fontWeight: 'bold' }}>
            {pageNumber}
          </div>
          <div style={classicStyle.headerText}>الحزب الأول</div>
        </div>
      )}

      {/* === CONTENT === */}
      <div style={classicStyle.content}>
        {displayMode === 'image' ? (
          // عرض الصورة
          <div style={{ textAlign: 'center' }}>
            <img
              src={imagePath}
              alt={`صفحة ${pageNumber}`}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '0.5rem',
                border: `2px solid ${colors.border}`,
                opacity: isImageLoaded ? 1 : 0.5,
                transition: 'opacity 0.3s ease-in-out',
              }}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(false)}
            />
            {!isImageLoaded && (
              <div style={{ padding: '2rem', color: colors.border, opacity: 0.7 }}>
                جارِ تحميل الصفحة...
              </div>
            )}
          </div>
        ) : (
          // عرض النصوص
          <div>
            {/* Decorative Top */}
            <div style={classicStyle.decorative}>✦ ✦ ✦</div>

            {/* Surah Header */}
            {surahName && (
              <div style={classicStyle.surahHeader}>
                <div style={classicStyle.surahName}>سورة {surahName}</div>
              </div>
            )}

            {/* Decorative Middle */}
            <div style={classicStyle.decorative}>❖</div>

            {/* Verses */}
            {verses && verses.length > 0 ? (
              verses.map((verse, idx) => (
                <div key={idx}>
                  {verse.type === 'surah-header' ? (
                    <div style={classicStyle.surahHeader}>
                      <div style={classicStyle.surahName}>
                        سورة {verse.surahName}
                      </div>
                      <div style={{ color: colors.border, fontSize: '0.75rem', opacity: 0.7 }}>
                        {verse.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </div>
                    </div>
                  ) : verse.type === 'ayah' ? (
                    <div style={classicStyle.verse}>
                      <span style={classicStyle.verseNumber}>
                        ۞{verse.numberInSurah}۞
                      </span>
                      {verse.text}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: colors.border, opacity: 0.5 }}>
                لا توجد آيات
              </div>
            )}

            {/* Decorative Bottom */}
            <div style={classicStyle.decorative}>✦ ✦ ✦</div>
          </div>
        )}
      </div>

      {/* === FOOTER === */}
      {showPageInfo && (
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: `2px solid ${colors.light}`,
          color: colors.gold,
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}>
          الصفحة {pageNumber}
        </div>
      )}
    </div>
  );
}

export default MushafPageDisplay;
