import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useTheme } from './context/ThemeContext';
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
import { useAdhanScheduler } from './hooks/useAdhanScheduler';

function App() {
  const { theme } = useTheme();
  useAdhanScheduler(); // Background scheduler hook instead of rendering a component
  const location = useLocation();
  const navigate = useNavigate();
  const locationRef = useRef(location.pathname);
  let lastTimeBackPress = useRef(0);

  // Update ref when location changes
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  // Handle hardware back button
  useEffect(() => {
    const timePeriodToExit = 2000;
    let listenerHandle = null;
    
    const showToast = (message) => {
      const existingToast = document.getElementById('custom-toast');
      if (existingToast) return;

      const toast = document.createElement('div');
      toast.id = 'custom-toast';
      toast.innerText = message;
      toast.style.position = 'fixed';
      toast.style.bottom = '80px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      toast.style.color = '#fff';
      toast.style.padding = '10px 20px';
      toast.style.borderRadius = '25px';
      toast.style.zIndex = '10000';
      toast.style.fontSize = '14px';
      toast.style.transition = 'opacity 0.3s ease-in-out';
      toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, 2000);
    };

    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      const currentPath = locationRef.current;
      
      // Skip global handling only for pages that already register their own back handler
      const hasCustomBackHandler = [
        /^\/quran(\/|$)/,
        /^\/mushaf-reader(\/|$)/,
        /^\/adhkar(\/|$)/,
      ].some((pattern) => pattern.test(currentPath));

      if (hasCustomBackHandler) {
        return;
      }

      if (currentPath === '/home' || currentPath === '/onboarding' || currentPath === '/') {
        const currentTime = new Date().getTime();
        
        if (currentTime - lastTimeBackPress.current < timePeriodToExit) {
          CapacitorApp.exitApp();
        } else {
          lastTimeBackPress.current = currentTime;
          showToast('اضغط مرة أخرى للخروج من التطبيق');
        }
      } else {
        // Not on home, navigate back
        if (window.history.length > 1 || canGoBack) {
          navigate(-1);
        } else {
          navigate('/home', { replace: true });
        }
      }
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [navigate]);

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
