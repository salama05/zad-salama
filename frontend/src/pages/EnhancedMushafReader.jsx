import React, { useState, useEffect } from 'react';
import EnhancedMushafPage from '../components/EnhancedMushafPage';

/**
 * صفحة عرض المصحف برسم عثماني محسّن
 * مع واجهة مستخدم جميلة
 */
function EnhancedMushafReader() {
  const [pageNumber, setPageNumber] = useState(1);
  const [verses, setVerses] = useState([]);
  const [surahName, setSurahName] = useState('الفاتحة');
  const [loading, setLoading] = useState(false);
  const [quranData, setQuranData] = useState(null);

  // تحميل بيانات القرآن
  useEffect(() => {
    const loadQuranData = async () => {
      try {
        const response = await fetch('/quran-hafs.json');
        const data = await response.json();
        setQuranData(data);
      } catch (error) {
        console.error('خطأ في تحميل بيانات القرآن:', error);
      }
    };
    
    loadQuranData();
  }, []);

  // الحصول على آيات الصفحة الحالية
  useEffect(() => {
    if (!quranData) return;

    setLoading(true);
    
    try {
      const pageVerses = [];
      let currentSurahNumber = null;
      let surahFound = false;

      for (const surah of quranData.data.surahs) {
        for (const ayah of surah.ayahs) {
          if (ayah.page === pageNumber) {
            // إذا بدأت سورة جديدة
            if (surah.number !== currentSurahNumber) {
              if (ayah.numberInSurah === 1) {
                pageVerses.push({
                  type: 'surah-header',
                  surahNumber: surah.number,
                  surahName: surah.name,
                  revelationType: surah.revelationType,
                });
              }
              currentSurahNumber = surah.number;
            }

            pageVerses.push({
              type: 'ayah',
              text: ayah.text,
              numberInSurah: ayah.numberInSurah,
              surahNumber: surah.number,
              page: ayah.page,
            });

            if (!surahFound) {
              setSurahName(surah.name);
              surahFound = true;
            }
          }
        }
      }

      setVerses(pageVerses);
    } catch (error) {
      console.error('خطأ:', error);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, quranData]);

  const goToNextPage = () => {
    if (pageNumber < 604) {
      setPageNumber(pageNumber + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowRight' && pageNumber < 604) {
      goToNextPage();
    } else if (e.key === 'ArrowLeft' && pageNumber > 1) {
      goToPreviousPage();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pageNumber]);

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh', 
      padding: '2rem 0',
      direction: 'rtl',
    }}>
      {/* Navigation Top */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #ddd',
      }}>
        <button
          onClick={goToPreviousPage}
          disabled={pageNumber === 1}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: pageNumber === 1 ? '#ccc' : '#D4AF37',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: pageNumber === 1 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
          }}
        >
          ← الصفحة السابقة
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <label style={{ fontWeight: 'bold', color: '#333' }}>
            رقم الصفحة:
          </label>
          <input
            type="number"
            value={pageNumber}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= 604) {
                setPageNumber(value);
              }
            }}
            min={1}
            max={604}
            style={{
              width: '80px',
              padding: '0.5rem',
              border: '2px solid #D4AF37',
              borderRadius: '0.5rem',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          />
          <span style={{ color: '#666', fontWeight: 'bold' }}>
            / 604
          </span>
        </div>

        <button
          onClick={goToNextPage}
          disabled={pageNumber === 604}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: pageNumber === 604 ? '#ccc' : '#D4AF37',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: pageNumber === 604 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
          }}
        >
          الصفحة التالية →
        </button>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            fontSize: '1.2rem',
            color: '#666',
          }}>
            جارِ تحميل الصفحة...
          </div>
        ) : (
          <EnhancedMushafPage 
            pageNumber={pageNumber}
            surahName={surahName}
            verses={verses}
          />
        )}
      </div>

      {/* Info Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '2px solid #ddd',
        color: '#666',
        fontSize: '0.875rem',
      }}>
        <p>
          📖 استخدم أسهم لوحة المفاتيح (← →) للانتقال بين الصفحات
        </p>
      </div>
    </div>
  );
}

export default EnhancedMushafReader;
