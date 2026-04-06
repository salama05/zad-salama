import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import { App as CapacitorApp } from '@capacitor/app';

// Pages
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import SurahReader from './pages/SurahReader';
import SurahDetail from './pages/SurahDetail';
import Adhkar from './pages/Adhkar';
import PrayerTimes from './pages/PrayerTimes';
import Recitations from './pages/Recitations';
import Videos from './pages/Videos';
import MushafIndex from './pages/MushafIndex';
import MushafReader from './pages/MushafReader';

function App() {
  const { theme } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let activeListener = null;

    const setupBackButton = async () => {
      activeListener = await CapacitorApp.addListener('backButton', () => {
        const path = location.pathname;
        if (path === '/home' || path === '/onboarding') {
          CapacitorApp.exitApp();
        } else {
          navigate(-1);
        }
      });
    };

    setupBackButton();

    return () => {
      if (activeListener) {
        activeListener.remove();
      }
    };
  }, [location.pathname, navigate]);

  // Helper to resolve CSS classes for theme
  const getThemeClasses = () => {
    switch(theme) {
      case 'Dark': return 'bg-zad-darkBg text-zad-darkText border-zad-darkBorder';
      case 'Golden': return 'bg-zad-goldBg text-zad-goldText border-zad-goldBorder';
      case 'Blue': return 'bg-zad-blueBg text-zad-blueText border-zad-blueBorder';
      case 'Classic':
      default: return 'bg-zad-bg text-zad-text border-zad-border';
    }
  };

  return (
    <div className={`min-h-screen w-full font-cairo transition-colors duration-300 ${getThemeClasses()}`}>
      {/* Decorative top border can be injected here for global layout, or in individual pages */}
      
      <main className="max-w-4xl mx-auto px-4 py-8 h-full">
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/quran" element={<SurahReader />} />
          <Route path="/quran/:surahId" element={<SurahDetail />} />

          {/* المصحف - تصفح صفحات المصحف */}
          <Route path="/mushaf-index" element={<MushafIndex />} />
          <Route path="/mushaf-reader" element={<MushafReader />} />

          <Route path="/adhkar" element={<Adhkar />} />
          <Route path="/prayer-times" element={<PrayerTimes />} />
          <Route path="/recitations" element={<Recitations />} />
          <Route path="/videos" element={<Videos />} />
          {/* Missing routes for Setup... */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      
      {/* AudioPlayer component can be mounted here globally */}
    </div>
  );
}

export default App;
