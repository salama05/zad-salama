import React, { useState, useEffect } from 'react';

/**
 * مكون عرض صفحة القرآن برسم عثماني جميل
 * يحاكي تصميم المصحف الشريف الكلاسيكي
 */
function QuranPageRenderer({ pageNumber, surahName, verses, reciterName = '' }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // الألوان التراثية
  const colors = {
    bg: '#FBF8F1',          // خلفية البيج
    text: '#2C1810',        // نص بني غامق
    gold: '#D4AF37',        // ذهبي
    border: '#8B7355',      // بني
    light: '#E8DCC4',       // بيج فاتح
    accent: '#C5A028',      // ذهبي فاتح
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: colors.bg }}
    >
      <div 
        className="w-full max-w-2xl aspect-[9/14] overflow-auto shadow-2xl"
        style={{
          backgroundColor: colors.bg,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* عنوان الصفحة - الترقيم والسورة */}
        <div 
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b-2"
          style={{
            borderColor: colors.gold,
            backgroundColor: colors.bg,
            direction: 'rtl',
          }}
        >
          {/* اسم السورة اليسار */}
          <div style={{ color: colors.border }} className="font-bold text-sm">
            سورة {surahName}
          </div>

          {/* رقم الصفحة الوسط */}
          <div 
            style={{ color: colors.gold }}
            className="text-xs font-bold"
          >
            ٦{pageNumber}
          </div>

          {/* الجزء اليمين */}
          <div style={{ color: colors.border }} className="font-bold text-sm">
            الحزب الأول
          </div>
        </div>

        {/* محتوى الصفحة */}
        <div 
          className="p-8 min-h-full"
          style={{
            direction: 'rtl',
            textAlign: 'right',
          }}
        >
          {/* فاصل الصورة العلوي */}
          <div className="flex items-center justify-center mb-8 opacity-60">
            <div 
              className="flex-1 border-t-2"
              style={{ borderColor: colors.gold }}
            ></div>
            <div className="px-4 text-2xl" style={{ color: colors.gold }}>
              ✦
            </div>
            <div 
              className="flex-1 border-t-2"
              style={{ borderColor: colors.gold }}
            ></div>
          </div>

          {/* اسم السورة في المنتصف */}
          {surahName && (
            <div className="text-center mb-8">
              <div 
                className="inline-block px-6 py-3 border-2 rounded-full"
                style={{
                  borderColor: colors.border,
                  color: colors.border,
                }}
              >
                <span className="font-bold text-lg">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
              </div>
              <div className="mt-4 text-xl font-bold" style={{ color: colors.border }}>
                سورة {surahName}
              </div>
            </div>
          )}

          {/* فاصل الزخرفة */}
          <div className="flex items-center justify-center my-8 opacity-40">
            <div className="text-3xl" style={{ color: colors.gold }}>
              ❖ ❖ ❖
            </div>
          </div>

          {/* الآيات */}
          <div className="space-y-4 text-lg leading-relaxed font-cairo">
            {verses && verses.length > 0 ? (
              verses.map((verse, idx) => (
                <div key={idx}>
                  {verse.type === 'surah-header' ? (
                    // رأس السورة
                    <div 
                      className="text-center py-4 my-6 border-y-2"
                      style={{
                        borderColor: colors.gold,
                        color: colors.border,
                      }}
                    >
                      <div className="text-base font-bold">
                        سورة {verse.surahName}
                      </div>
                      <div className="text-xs opacity-70">
                        {verse.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </div>
                    </div>
                  ) : verse.type === 'ayah' ? (
                    // الآية
                    <div className="flex items-start gap-3 justify-end">
                      <span 
                        className="text-sm font-bold flex-shrink-0 ml-2"
                        style={{ color: colors.gold }}
                      >
                        ۞{verse.numberInSurah}۞
                      </span>
                      <span 
                        className="text-right leading-loose"
                        style={{ 
                          color: colors.text,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {verse.text}
                      </span>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400">
                لا توجد آيات لهذه الصفحة
              </div>
            )}
          </div>

          {/* فاصل الصفحة السفلي */}
          <div className="flex items-center justify-center mt-8 opacity-60">
            <div 
              className="flex-1 border-t-2"
              style={{ borderColor: colors.gold }}
            ></div>
            <div className="px-4 text-2xl" style={{ color: colors.gold }}>
              ✦
            </div>
            <div 
              className="flex-1 border-t-2"
              style={{ borderColor: colors.gold }}
            ></div>
          </div>

          {/* معلومات الصفحة السفلى */}
          {reciterName && (
            <div 
              className="text-center text-xs mt-8 opacity-70"
              style={{ color: colors.border }}
            >
              {reciterName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuranPageRenderer;
