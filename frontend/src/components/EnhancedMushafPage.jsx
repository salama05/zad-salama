import React, { useState, useEffect } from 'react';

/**
 * مكون عرض صفحة المصحف برسم عثماني احترافي
 * مع تصميم كلاسيكي جميل مثل المصحف الشريف
 */
function EnhancedMushafPage({ pageNumber = 1, surahName = '', verses = [] }) {
  const colors = {
    bg: '#FBF8F1',           // خلفية البيج الدافئ
    pageBg: '#F5F0E6',       // خلفية الصفحة
    darkBrown: '#2C1810',    // بني غامق للنص
    gold: '#D4AF37',         // ذهبي للزخرفة
    lightGold: '#C5A028',    // ذهبي فاتح
    border: '#8B7355',       // بني للحدود
    divider: '#E8DCC4',      // فاصل خفيف
  };

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
      {/* الصفحة الرئيسية */}
      <div 
        className="w-full max-w-2xl aspect-[9/14] overflow-y-auto overflow-x-hidden shadow-2xl rounded-lg"
        style={{
          backgroundColor: colors.pageBg,
          fontFamily: '"Traditional Arabic", "Arial", sans-serif',
          direction: 'rtl',
        }}
      >
        {/* === TOP HEADER === */}
        <div 
          className="sticky top-0 z-20 py-4 px-6 border-b-4 flex items-center justify-between"
          style={{
            borderColor: colors.gold,
            backgroundColor: colors.pageBg,
            direction: 'rtl',
          }}
        >
          {/* سورة على اليسار */}
          <div className="flex-1 text-right">
            <div style={{ color: colors.border }} className="text-sm font-bold">
              سورة {surahName}
            </div>
          </div>

          {/* رقم الجزء في المنتصف */}
          <div className="flex-1 text-center">
            <div 
              style={{ color: colors.gold }}
              className="text-xs font-bold"
            >
              ﴿ ﴾
            </div>
          </div>

          {/* الجزء على اليمين */}
          <div className="flex-1 text-left">
            <div style={{ color: colors.border }} className="text-sm font-bold">
              الجزء الأول
            </div>
          </div>
        </div>

        {/* === CONTENT AREA === */}
        <div 
          className="px-8 py-10 space-y-6 min-h-full"
          style={{
            color: colors.darkBrown,
            direction: 'rtl',
            textAlign: 'right',
          }}
        >
          {/* === DECORATIVE TOP BORDER === */}
          <div className="flex items-center justify-center gap-3 opacity-50 mb-8">
            <div className="text-2xl" style={{ color: colors.gold }}>✦</div>
            <div 
              className="flex-1 border-t-2"
              style={{ borderColor: colors.gold }}
            ></div>
            <div className="text-2xl" style={{ color: colors.gold }}>✦</div>
            <div 
              className="flex-1 border-t-2"
              style={{ borderColor: colors.gold }}
            ></div>
            <div className="text-2xl" style={{ color: colors.gold }}>✦</div>
          </div>

          {/* === SURAH HEADER === */}
          <div className="text-center py-6 mb-4">
            {/* Decorative Box */}
            <div 
              className="inline-block px-8 py-3 border-2 rounded-full mb-3"
              style={{
                borderColor: colors.border,
                backgroundColor: 'rgba(212, 175, 55, 0.05)',
              }}
            >
              <div style={{ color: colors.border }} className="text-xs font-bold tracking-widest">
                الحمد لله رب العالمين
              </div>
            </div>

            {/* Surah Name */}
            <div 
              className="text-2xl font-bold my-3"
              style={{ color: colors.border }}
            >
              سورة {surahName}
            </div>

            {/* Decorative Elements */}
            <div className="flex items-center justify-center gap-3 my-3">
              <div 
                className="flex-1 border-t-2"
                style={{ borderColor: colors.gold, maxWidth: '50px' }}
              ></div>
              <div className="text-lg" style={{ color: colors.gold }}>✦</div>
              <div 
                className="flex-1 border-t-2"
                style={{ borderColor: colors.gold, maxWidth: '50px' }}
              ></div>
            </div>
          </div>

          {/* === PAGE DIVIDER === */}
          <div 
            className="my-6 border-b-2"
            style={{ borderColor: colors.divider, opacity: '0.5' }}
          ></div>

          {/* === VERSES === */}
          <div className="space-y-6 leading-relaxed text-lg">
            {verses && verses.length > 0 ? (
              verses.map((verse, idx) => (
                <div key={idx} className="space-y-3">
                  {/* Surah Header */}
                  {verse.type === 'surah-header' && (
                    <div 
                      className="text-center py-4 my-4 border-y-2"
                      style={{
                        borderColor: colors.gold,
                      }}
                    >
                      <div className="text-base font-bold" style={{ color: colors.border }}>
                        ﴾ سورة {verse.surahName} ﴿
                      </div>
                      <div className="text-xs opacity-70 mt-1" style={{ color: colors.border }}>
                        {verse.revelationType === 'Meccan' ? '(مكية)' : '(مدنية)'}
                      </div>
                    </div>
                  )}

                  {/* Ayah */}
                  {verse.type === 'ayah' && (
                    <div className="flex items-start gap-3 justify-end">
                      {/* Verse Number */}
                      <span 
                        className="text-xs font-bold flex-shrink-0 ml-1 rounded-full w-6 h-6 flex items-center justify-center"
                        style={{
                          backgroundColor: colors.gold,
                          color: 'white',
                        }}
                      >
                        {verse.numberInSurah}
                      </span>

                      {/* Verse Text */}
                      <p 
                        className="text-right leading-relaxed"
                        style={{
                          color: colors.darkBrown,
                          letterSpacing: '0.02em',
                          lineHeight: '1.8',
                        }}
                      >
                        {verse.text}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center opacity-50">
                لا توجد آيات لهذه الصفحة
              </div>
            )}
          </div>

          {/* === DECORATIVE BOTTOM BORDER === */}
          <div className="flex items-center justify-center gap-3 opacity-50 mt-12">
            <div className="text-2xl" style={{ color: colors.gold }}>✦</div>
            <div 
              className="flex-1 border-t-2"
              style={{ borderColor: colors.gold }}
            ></div>
            <div className="text-2xl" style={{ color: colors.gold }}>✦</div>
            <div 
              className="flex-1 border-t-2"
              style={{ borderColor: colors.gold }}
            ></div>
            <div className="text-2xl" style={{ color: colors.gold }}>✦</div>
          </div>

          {/* Page Number */}
          <div 
            className="text-center text-sm font-bold mt-8 pt-6 border-t-2"
            style={{
              color: colors.gold,
              borderColor: colors.divider,
            }}
          >
            ص {pageNumber}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedMushafPage;
