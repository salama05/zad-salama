import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowRight, FaPlay, FaStop } from 'react-icons/fa';
import { Geolocation } from '@capacitor/geolocation';
import { Country, State } from 'country-state-city';

import ARAB_REGIONS from '../data/arab_regions.json';

const ADHANS = [
  { id: 'makkah', name: 'أذان مكة المكرمة', url: '/audio/makkah.mp3.mp3' },
  { id: 'madinah', name: 'أذان المدينة المنورة', url: '/audio/madinah.mp3.mp3' },
  { id: 'al-aqsa', name: 'أذان المسجد الأقصى', url: '/audio/al-aqsa.mp3.mp3' },
  { id: 'failakawi', name: 'أذان ياسر الفيلكاوي', url: '/audio/failakawi.mp3.m4a' },
  { id: 'qatami', name: 'أذان ناصر القطامي', url: '/audio/qatami.mp3.mp3' }
];

  const getArabicCountryName = (code, fallbackName) => {
    try {
      return new Intl.DisplayNames(['ar'], { type: 'region' }).of(code) || fallbackName;
    } catch (e) {
      return fallbackName;
    }
  };

  
  function PrayerTimes() {
  const navigate = useNavigate();
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New states for location mode
  const [isAuto, setIsAuto] = useState(() => {
    const saved = localStorage.getItem('isAutoLocation');
    return saved === null ? true : saved === 'true';
  });
  const [city, setCity] = useState(localStorage.getItem('savedCity') || '');
  const [country, setCountry] = useState(localStorage.getItem('savedCountry') || '');
  const [countryCode, setCountryCode] = useState(localStorage.getItem('savedCountryCode') || '');

  // States for Adhan feature
  const [adhanEnabled, setAdhanEnabled] = useState(() => {
    return localStorage.getItem('adhanEnabled') === 'true';
  });
  const [selectedAdhan, setSelectedAdhan] = useState(() => {
    return localStorage.getItem('selectedAdhanUrl') || ADHANS[0].url;
  });
  const [playedPrayers, setPlayedPrayers] = useState([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const audioRef = useRef(null);

  // Persistence for Adhan Settings
  useEffect(() => {
    localStorage.setItem('adhanEnabled', adhanEnabled);
  }, [adhanEnabled]);

  useEffect(() => {
    localStorage.setItem('selectedAdhanUrl', selectedAdhan);
  }, [selectedAdhan]);

  const fetchTimesByCoords = (lat, lng) => {
    setLoading(true);
    setError('');
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    axios.get(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=4`)
      .then(res => {
        const dayData = res.data.data[date.getDate() - 1];
        setTimes(dayData.timings);
        setLoading(false);
      })
      .catch(err => {
        setError('تعذر جلب المواقيت. تحقق من اتصالك.');
        setLoading(false);
      });
  };

  const fetchTimesByCity = () => {
    if (!city || !country) {
      setError('يرجى إدخال المدينة والبلد');
      return;
    }
    setLoading(true);
    setError('');
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    axios.get(`https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${city}&country=${country}&method=4`)
      .then(res => {
        const dayData = res.data.data[date.getDate() - 1];
        setTimes(dayData.timings);
        setLoading(false);
        // Save to localStorage
        if (city && country) {
          localStorage.setItem('savedCity', city);
          localStorage.setItem('savedCountry', country);
          localStorage.setItem('savedCountryCode', countryCode);
          localStorage.setItem('isAutoLocation', 'false');
        }
      })
      .catch(err => {
        setError('تعذر العثور على المدينة. تأكد من صحة الاسم.');
        setLoading(false);
      });
  };

  const handleAutoLocation = async () => {
    setIsAuto(true);
    localStorage.setItem('isAutoLocation', 'true');
    setLoading(true);
    setError('');
    
    try {
      // 1. طلب الصلاحيات إذا كنا على نظام التشغيل الأساسي
      const permStatus = await Geolocation.checkPermissions();
      if (permStatus.location === 'prompt' || permStatus.location === 'prompt-with-rationale') {
        await Geolocation.requestPermissions();
      }
      
      // 2. محاولة جلب الموقع بدقة عالية
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      fetchTimesByCoords(position.coords.latitude, position.coords.longitude);
    } catch (err) {
      console.warn('Native geolocation failed, attempting IP fallback', err);
      // 3. Fallback: الاعتماد على خدمة IP في حال رفض الوصول للموقع أو انطفاء GPS
      try {
        const ipRes = await axios.get('https://ipapi.co/json/');
        if (ipRes.data && ipRes.data.latitude && ipRes.data.longitude) {
          fetchTimesByCoords(ipRes.data.latitude, ipRes.data.longitude);
        } else {
          throw new Error('IP Data invalid');
        }
      } catch (ipErr) {
        setError('يرجى تفعيل الموقع والمحاولة مجدداً، أو قم بإدخال المدينة يدوياً لحساب مواقيت الصلاة');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isAuto) {
      handleAutoLocation();
    } else if (city && country) {
      fetchTimesByCity();
    }
  }, []);

  const togglePreview = () => {
    if (audioRef.current) {
      if (isPreviewing) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPreviewing(false);
      } else {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        setIsPreviewing(true);
      }
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.split(' ')[0];
  };

  const prayers = [
    { key: 'Fajr', label: 'الفجر', isPrayer: true },
    { key: 'Sunrise', label: 'الشروق', isPrayer: false },
    { key: 'Dhuhr', label: 'الظهر', isPrayer: true },
    { key: 'Asr', label: 'العصر', isPrayer: true },
    { key: 'Maghrib', label: 'المغرب', isPrayer: true },
    { key: 'Isha', label: 'العشاء', isPrayer: true }
  ];

  // Sorted Countries (Arab countries first)
  const arabCountriesCodes = ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'SY', 'LB', 'IQ', 'PS', 'YE', 'SD', 'LY', 'TN', 'DZ', 'MA', 'MR', 'SO', 'DJ'];
  const allCountries = Country.getAllCountries().map(c => ({
    ...c,
    arabicName: getArabicCountryName(c.isoCode, c.name)
  })).sort((a, b) => {
    const aIsArab = arabCountriesCodes.includes(a.isoCode);
    const bIsArab = arabCountriesCodes.includes(b.isoCode);
    if (aIsArab && !bIsArab) return -1;
    if (!aIsArab && bIsArab) return 1;
    return a.arabicName.localeCompare(b.arabicName, 'ar');
  });

  // Adhan Check Effect
  useEffect(() => {
    if (!adhanEnabled || !times) return;

    // Request Notification permission when adhan is enabled
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      prayers.forEach(prayer => {
        if (!prayer.isPrayer) return; // Skip Sunrise

        const prayerTimeFull = times[prayer.key];
        if (!prayerTimeFull) return;
        
        const prayerTimeClean = formatTime(prayerTimeFull);
        
        // If current time matches prayer time, and we haven't played it today
        const prayerId = `${prayer.key}-${now.toDateString()}`;
        if (currentTimeStr === prayerTimeClean && !playedPrayers.includes(prayerId)) {
          // Fire Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('زاد السلامة', {
              body: `حان الآن موعد أذان ${prayer.label}`,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              vibrate: [200, 100, 200]
            });
          }

          // Play Adhan
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play blocked or failed:', e));
            setPlayedPrayers(prev => [...prev, prayerId]);
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [times, adhanEnabled, playedPrayers, prayers]);

  return (
    <div className="page-enter-active">
      <div className="w-full flex items-center mb-12 relative max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute right-4 text-zad-border hover:text-[#C5A028] transition-colors p-2 z-10 cursor-pointer bg-transparent border-none"
          title="عودة للخلف"
        >
          <FaArrowRight size={24} />
        </button>
        <h2 className="text-3xl font-amiri font-bold text-center w-full text-zad-border drop-shadow-sm">مواقيت الصلاة</h2>
      </div>
      
      {/* Location Controls */}
      <div className="max-w-md mx-auto mb-6 bg-white/70 p-4 rounded-xl shadow-sm border border-zad-border/30">
        <div className="flex justify-center gap-4 mb-4">
          <button 
            onClick={handleAutoLocation}
            className={`px-4 py-2 font-cairo rounded-lg transition-colors ${isAuto ? 'bg-zad-border text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            تلقائي (عبر الموقع)
          </button>
          <button 
            onClick={() => setIsAuto(false)}
            className={`px-4 py-2 font-cairo rounded-lg transition-colors ${!isAuto ? 'bg-zad-border text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            يدوي (المدينة والبلد)
          </button>
        </div>

        {!isAuto && (
          <div className="flex flex-col gap-3 mt-4">
            <select 
              value={countryCode} 
              onChange={(e) => {
                const code = e.target.value;
                setCountryCode(code);
                const countr = Country.getCountryByCode(code);
                setCountry(countr ? countr.name : '');
                setCity('');
              }}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-zad-border bg-white rtl font-cairo pr-8"
              dir="rtl"
            >
              <option value="">اختر البلد...</option>
              {allCountries.map(c => (
                <option key={c.isoCode} value={c.isoCode}>{c.arabicName}</option>
              ))}
            </select>
            
            <select 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className={`px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-zad-border bg-white rtl font-cairo pr-8 ${!countryCode ? 'opacity-50 cursor-not-allowed' : ''}`}
              dir="rtl"
              disabled={!countryCode}
            >
              <option value="">اختر الولاية / المحافظة...</option>
                {countryCode && (ARAB_REGIONS[countryCode] ? ARAB_REGIONS[countryCode] : State.getStatesOfCountry(countryCode).map(st => ({ name: st.name, arName: st.name }))).map((st, idx) => (
                  <option key={`${st.name}-${idx}`} value={st.name}>{st.arName}</option>
                ))}
              </select>

            <button 
              onClick={fetchTimesByCity}
              className="px-4 py-2 bg-zad-border text-white rounded font-cairo hover:bg-opacity-90 mt-2"
              disabled={!country || !city}
            >
              بحث
            </button>
          </div>
        )}
      </div>

      {/* Adhan Controls */}
      <div className="max-w-md mx-auto mb-6 bg-white/70 p-4 rounded-xl shadow-sm border border-zad-border/30">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label htmlFor="adhanToggle" className="font-cairo text-lg text-gray-800">
              تفعيل التنبيه بالأذان وقت الصلاة
            </label>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                id="adhanToggle" 
                checked={adhanEnabled}
                onChange={() => setAdhanEnabled(!adhanEnabled)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                style={{ 
                  right: adhanEnabled ? '1.5rem' : '0', 
                  borderColor: adhanEnabled ? '#0f766e' : '#cbd5e1', // zad-border or gray
                  transition: 'right 0.2s',
                  zIndex: '10'
                }}
              />
              <label 
                htmlFor="adhanToggle" 
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${adhanEnabled ? 'bg-zad-border' : 'bg-gray-300'}`}
              ></label>
            </div>
          </div>
          
          {adhanEnabled && (
            <div className="flex flex-col gap-2 transition-all">
              <label className="font-cairo text-gray-700 text-sm">اختر نوع الأذان:</label>
              <div className="flex items-center gap-2">
                <select 
                  value={selectedAdhan}
                  onChange={(e) => {
                    setSelectedAdhan(e.target.value);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.src = e.target.value;
                      audioRef.current.load();
                      if (isPreviewing) {
                        const playPromise = audioRef.current.play();
                        if (playPromise !== undefined) {
                          playPromise.catch(err => console.log('Audio play failed:', err));
                        }
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-zad-border font-cairo bg-white"
                >
                  {ADHANS.map(adhan => (
                    <option key={adhan.id} value={adhan.url}>{adhan.name}</option>
                  ))}
                </select>
                <button
                  onClick={togglePreview}
                  className="p-3 bg-zad-border text-white rounded-lg hover:bg-opacity-90 flex-shrink-0 transition-colors flex items-center justify-center"
                  style={{ width: '42px', height: '42px' }}
                  title={isPreviewing ? "إيقاف" : "استماع"}
                >
                  {isPreviewing ? <FaStop size={12} /> : <FaPlay size={12} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={selectedAdhan} 
        preload="auto"
        onEnded={() => setIsPreviewing(false)}
      ></audio>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zad-border"></div>
        </div>
      ) : error ? (
        <div className="text-center p-6 bg-red-100/50 text-red-700 rounded-lg font-cairo shadow-sm max-w-lg mx-auto border border-red-200">
          {error}
        </div>
      ) : times ? (
        <div className="bg-white/60 p-6 rounded-2xl shadow-md border border-zad-border/40 max-w-md mx-auto relative overflow-hidden">
           <div className="absolute inset-0 islamic-bg opacity-10 pointer-events-none"></div>
          
           <div className="space-y-4 relative z-10">
            {prayers.map((prayer, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 border-b border-zad-border/20 last:border-0 hover:bg-zad-border/5 px-4 rounded transition-colors">
                <span className="font-cairo text-xl opacity-90">{prayer.label}</span>
                <span className="font-amiri font-bold text-2xl text-zad-border">{formatTime(times[prayer.key])}</span>
              </div>
            ))}
           </div>
        </div>
      ) : null}
    </div>
  );
}

export default PrayerTimes;
