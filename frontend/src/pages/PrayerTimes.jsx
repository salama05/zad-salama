import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowRight, FaPlay, FaStop, FaVolumeUp, FaCompass, FaLocationArrow } from 'react-icons/fa';
import { Geolocation } from '@capacitor/geolocation';
import { Country, State } from 'country-state-city';

import ARAB_REGIONS from '../data/arab_regions.json';

import { registerPlugin } from '@capacitor/core';
const BatteryAlarm = registerPlugin('BatteryAlarm');

const ADHANS = [
  { id: 'makkah', name: 'أذان مكة المكرمة', url: '/audio/makkah.mp3.mp3', soundFile: 'makkah.mp3.mp3' },
  { id: 'madinah', name: 'أذان المدينة المنورة', url: '/audio/madinah.mp3.mp3', soundFile: 'madinah.mp3.mp3' },
  { id: 'al-aqsa', name: 'أذان المسجد الأقصى', url: '/audio/al-aqsa.mp3.mp3', soundFile: 'al-aqsa.mp3.mp3' },
  { id: 'failakawi', name: 'أذان ياسر الفيلكاوي', url: '/audio/failakawi.mp3.m4a', soundFile: 'failakawi.mp3.m4a' },
  { id: 'qatami', name: 'أذان ناصر القطامي', url: '/audio/qatami.mp3.mp3', soundFile: 'qatami.mp3.mp3' }
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
  const [coords, setCoords] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [requestHeadingPerm, setRequestHeadingPerm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New states for location mode
  const [isAuto, setIsAuto] = useState(() => {
    const saved = localStorage.getItem('isAutoLocation');
    return saved === null ? true : saved === 'true';
  });
  const [city, setCity] = useState(localStorage.getItem('savedCity') || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const searchTimeoutRef = useRef(null);

  // States for Adhan feature
  const [adhanEnabled, setAdhanEnabled] = useState(() => {
    return localStorage.getItem('adhanEnabled') === 'true';
  });
  const [selectedAdhan, setSelectedAdhan] = useState(() => {
    return localStorage.getItem('selectedAdhanUrl') || ADHANS[0].url;
  });
  const [adhanVolume, setAdhanVolume] = useState(() => {
    const savedVol = localStorage.getItem('adhanVolume');
    return savedVol !== null ? parseFloat(savedVol) : 1.0;
  });
  const [playedPrayers, setPlayedPrayers] = useState([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [activeAdhanPrayer, setActiveAdhanPrayer] = useState(null); // للصلاة الحالية
  const audioRef = useRef(null);

  // Persistence for Adhan Settings
  useEffect(() => {
    localStorage.setItem('adhanEnabled', adhanEnabled);
    window.dispatchEvent(new Event('storage'));
  }, [adhanEnabled]);

  useEffect(() => {
    localStorage.setItem('selectedAdhanUrl', selectedAdhan);
    window.dispatchEvent(new Event('storage'));
  }, [selectedAdhan]);

  useEffect(() => {
    localStorage.setItem('adhanVolume', adhanVolume.toString());
    if (audioRef.current) {
      audioRef.current.volume = adhanVolume;
    }
  }, [adhanVolume]);

  const fetchTimesByCoords = (lat, lng) => {
    setLoading(true);
    setError('');
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    axios.get(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}`)
      .then(res => {
        const dayData = res.data.data[date.getDate() - 1];
        setTimes(dayData.timings);
        setCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
        setLoading(false);
      })
      .catch(err => {
        setError('تعذر جلب المواقيت. تحقق من اتصالك.');
        setLoading(false);
      });
  };

  const handleCitySearch = (query) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingCity(false);
      return;
    }
    
    setIsSearchingCity(true);
    searchTimeoutRef.current = setTimeout(() => {
      axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=ar&limit=5&addressdetails=1`)
        .then(res => {
          setSearchResults(res.data);
          setIsSearchingCity(false);
        })
        .catch(err => {
          console.error('City search failed', err);
          setIsSearchingCity(false);
        });
    }, 600);
  };

  const selectCity = (location) => {
    const addr = location.address || {};
    const cityLabel = addr.city || addr.town || addr.village || location.name;
    const countryLabel = addr.country || location.display_name.split(',').pop().trim();
    const finalName = cityLabel ? `${cityLabel}، ${countryLabel}` : location.name || location.display_name.split(',')[0];
    
    setCity(finalName);
    setSearchQuery('');
    setSearchResults([]);
    setIsAuto(false);
    
    localStorage.setItem('savedCity', finalName);
    localStorage.setItem('savedLat', location.lat);
    localStorage.setItem('savedLng', location.lon);
    localStorage.setItem('isAutoLocation', 'false');
    window.dispatchEvent(new Event('storage'));
    
    fetchTimesByCoords(location.lat, location.lon);
  };

  const fetchTimesByCity = () => {
    if (!city) return;
    
    setLoading(true);
    setError('');
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    axios.get(`https://api.aladhan.com/v1/calendarByAddress/${year}/${month}?address=${encodeURIComponent(city)}`)
      .then(res => {
        const dayData = res.data.data[date.getDate() - 1];
        setTimes(dayData.timings);
        if (dayData.meta) {
          setCoords({ lat: parseFloat(dayData.meta.latitude), lng: parseFloat(dayData.meta.longitude) });
        }
        setLoading(false);
        if (city) {
          localStorage.setItem('savedCity', city);
          localStorage.setItem('isAutoLocation', 'false');
          window.dispatchEvent(new Event('storage'));
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
    window.dispatchEvent(new Event('storage'));
    setLoading(true);
    setError('');
    
    try {
      // 1. طلب الصلاحيات
      let permStatus = await Geolocation.checkPermissions();
      if (permStatus.location === 'prompt' || permStatus.location === 'prompt-with-rationale' || permStatus.location === 'denied') {
        permStatus = await Geolocation.requestPermissions();
      }
      
      // 2. محاولة جلب الموقع مع السماح ببيانات مكيشة قادرة على الإسراع من العملية
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,     // انتظار حتى 20 ثانية للحصول على اشارة GPS
        maximumAge: 300000  // الاعتماد على موقع مر عليه حتى 5 دقائق لتقليل تأخير البحث
      });
      fetchTimesByCoords(position.coords.latitude, position.coords.longitude);
    } catch (err) {
      console.warn('Native geolocation failed, attempting IP fallback', err);
      // 3. Fallback: الاعتماد على خدمة IP مجانية أخرى في حال فشل الخدمة الأولى
      try {
        const ipRes = await axios.get('https://ipinfo.io/json');
        if (ipRes.data && ipRes.data.loc) {
          const [lat, lng] = ipRes.data.loc.split(',');
          fetchTimesByCoords(parseFloat(lat), parseFloat(lng));
        } else {
          throw new Error('IPINFO failed');
        }
      } catch (ipErr) {
        try {
          // الخيار الاحتياطي الثاني
          const ipInfo = await axios.get('https://api.ipify.org?format=json');
          if (ipInfo.data && ipInfo.data.ip) {
            // ipify only gives IP, if we reach here we might just fail gracefully or use default
            setError('فشل تحديد الموقع التلقائي. يرجى استخدام البحث اليدوي.');
            setLoading(false);
          } else {
            throw new Error('Fallback failed');
          }
        } catch (ipInfoErr) {
          setError('لم نتمكن من تحديد موقعك. يرجى تفعيل مفتاح الـ GPS في الهاتف والمحاولة، أو استخدم البحث اليدوي.');
          setLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    if (isAuto) {
      handleAutoLocation();
    } else {
      const savedLat = localStorage.getItem('savedLat');
      const savedLng = localStorage.getItem('savedLng');
      if (savedLat && savedLng) {
        fetchTimesByCoords(parseFloat(savedLat), parseFloat(savedLng));
      } else if (city) {
        fetchTimesByCity();
      }
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

  // Adhan Check logic
  useEffect(() => {
    if (!times || !adhanEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      // Format as "HH:MM" (e.g., "04:05" or "15:30")
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentFormattedTime = `${currentHours}:${currentMinutes}`;
      
      prayers.forEach(prayer => {
        if (!prayer.isPrayer) return; // Skip Sunrise
        
        let prayerTimeStr = times[prayer.key];
        if (!prayerTimeStr) return;
        
        prayerTimeStr = prayerTimeStr.split(' ')[0]; // Gets e.g., "15:30"
        
        if (currentFormattedTime === prayerTimeStr && !playedPrayers.includes(prayer.key)) {
          setPlayedPrayers(prev => [...prev, prayer.key]);
          setActiveAdhanPrayer(prayer.label);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Adhan play failed: ", e));
          }
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('زاد السلامة', {
              body: `حان الآن موعد أذان ${prayer.label}`,
              icon: '/icons/icon-192x192.png'
            });
          }
        }
      });
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [times, adhanEnabled, playedPrayers, prayers]);

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

  // Adhan Permissions
  useEffect(() => {
    if (!adhanEnabled) return;

    // Request Notification permission when adhan is enabled
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, [adhanEnabled]);

  // Compass feature
  const requestCompassPermission = () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            setRequestHeadingPerm(true);
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      setRequestHeadingPerm(true);
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  const handleOrientation = (event) => {
    let heading = 0;
    if (event.webkitCompassHeading) {
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      heading = 360 - event.alpha;
    }
    setDeviceHeading(heading);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const calculateQibla = (lat, lng) => {
    const latMakkah = 21.422487;
    const lngMakkah = 39.826206;
    
    const phi1 = lat * Math.PI / 180;
    const lambda1 = lng * Math.PI / 180;
    const phi2 = latMakkah * Math.PI / 180;
    const lambda2 = lngMakkah * Math.PI / 180;
    
    const y = Math.sin(lambda2 - lambda1);
    const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(lambda2 - lambda1);
    
    let qibla = Math.atan2(y, x) * 180 / Math.PI;
    return qibla >= 0 ? qibla : qibla + 360;
  };

  return (
    <div className="page-enter-active">
      {/* On-screen Adhan Alert Modal */}
      {activeAdhanPrayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100 animate-fade-in flex flex-col items-center">
            <div className="w-20 h-20 bg-zad-border/10 rounded-full flex items-center justify-center mb-6">
              <FaVolumeUp className="text-4xl text-zad-border animate-pulse" />
            </div>
            
            <h2 className="font-amiri font-bold text-3xl text-zad-border mb-2">حـان الآن</h2>
            <p className="font-cairo text-2xl text-gray-800 mb-6">
              موعد أذان <span className="font-bold text-zad-border">{activeAdhanPrayer}</span>
            </p>
            
            <p className="font-cairo text-sm text-gray-500 mb-8 px-4 leading-relaxed">
              إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا
            </p>
            
            <button 
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                setActiveAdhanPrayer(null);
                setIsPreviewing(false);
              }}
              className="w-full bg-zad-border text-white font-cairo font-bold py-3 px-6 rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <FaStop size={14} /> إيقاف الأذان
            </button>
          </div>
        </div>
      )}

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
            className={`px-4 py-2 font-cairo rounded-lg transition-colors flex-1 ${isAuto ? 'bg-zad-border text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            تلقائي (عبر الموقع)
          </button>
          <button 
            onClick={() => setIsAuto(false)}
            className={`px-4 py-2 font-cairo rounded-lg transition-colors flex-1 ${!isAuto ? 'bg-zad-border text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            بحث يدوي
          </button>
        </div>

        {!isAuto && (
          <div className="flex flex-col gap-2 mt-4 relative">
            <div className="relative">
              <input 
                type="text"
                placeholder="اكتب اسم مدينتك (مثال: مكة، القدس، غزة)..."
                value={searchQuery} 
                onChange={(e) => handleCitySearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-zad-border bg-white font-cairo text-right placeholder-gray-400"
                dir="rtl"
              />
              {isSearchingCity && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#D4AF37] border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* دروب داون الاقتراحات */}
            {searchResults.length > 0 && (
              <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((loc, idx) => {
                  const addr = loc.address || {};
                  const cityLabel = addr.city || addr.town || addr.village || loc.name;
                  const stateLabel = addr.state || addr.region || addr.county;
                  const countryLabel = addr.country;
                  
                  // تكوين الاسم بدون تكرار
                  const parts = [];
                  if (cityLabel) parts.push(cityLabel);
                  if (stateLabel && stateLabel !== cityLabel) parts.push(stateLabel);
                  if (countryLabel && countryLabel !== stateLabel) parts.push(countryLabel);
                  
                  const cleanName = parts.length > 0 ? parts.join('، ') : loc.display_name;

                  return (
                    <button
                      key={idx}
                      onClick={() => selectCity(loc)}
                      className="w-full text-right px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors font-cairo text-sm text-gray-700 last:border-b-0"
                      dir="rtl"
                    >
                      {cleanName}
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* عرض اسم المدينة المختارة حالياً */}
            {(city && !searchQuery) && (
              <div className="text-center mt-2 px-3 py-2 bg-green-50 text-green-700 rounded-md font-cairo text-sm border border-green-100">
                المدينة الحالية: {city}
              </div>
            )}
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
                onChange={async () => {
                  const newVal = !adhanEnabled;
                  setAdhanEnabled(!adhanEnabled);
                  if (newVal) {
                    try {
                      if (BatteryAlarm.requestExactAlarm) {
                        await BatteryAlarm.requestExactAlarm();
                      }
                      if (BatteryAlarm.requestBatteryOptimization) {
                        await BatteryAlarm.requestBatteryOptimization();
                      }
                    } catch (e) {
                      console.warn('Failed to ask battery/alarm permission', e);
                    }
                  }
                }}
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
                
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-2 h-[42px] flex-shrink-0" style={{ width: '100px' }}>
                  <FaVolumeUp className="text-gray-500 text-sm flex-shrink-0" />
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={adhanVolume}
                    onChange={(e) => setAdhanVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-zad-border"
                    dir="ltr"
                    title="مستوى الصوت"
                  />
                </div>

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
      <audio         key={selectedAdhan}        ref={audioRef} 
        src={selectedAdhan} 
        preload="auto"
        onEnded={() => setIsPreviewing(false)}
        onCanPlay={(e) => { e.target.volume = adhanVolume; }}
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

      {/* Qibla Direction */}
      {times && coords && (
        <div className="max-w-md mx-auto mt-6 bg-white/70 p-6 rounded-xl shadow-sm border border-zad-border/30 text-center">
          <h3 className="font-amiri font-bold text-2xl text-zad-border mb-4 flex items-center justify-center gap-2">
            <FaCompass className="text-gray-600" /> اتجاه القبلة
          </h3>
          
          <div className="relative w-48 h-48 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center border-4 border-zad-border shadow-inner">
            {/* North Indicator */}
            <div className="absolute top-2 text-sm font-bold text-red-500 font-sans">N</div>
            
            {requestHeadingPerm ? (
              <>
                {/* Compass Dial tracking N (rotates whole dial based on device heading) */}
                <div 
                  className="absolute inset-0 transition-transform duration-300"
                  style={{ transform: `rotate(${-deviceHeading}deg)` }}
                >
                  <div className="w-full h-full flex items-center justify-center relative">
                    {/* Qibla Direction Pointer relative to North */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
                      style={{ transform: `rotate(${calculateQibla(coords.lat, coords.lng)}deg)` }}
                    >
                      <div className="w-1 h-24 bg-zad-border transform -translate-y-12 shadow-sm relative">
                        <div className="absolute -top-3 -left-2 w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-zad-border"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Kaaba Icon inside compass center */}
                  <div className="w-8 h-8 bg-black rounded shadow-md border-2 border-[#D4AF37] z-10 flex items-center justify-center">
                    <div className="w-full h-1/3 bg-[#D4AF37] opacity-80" style={{position: 'absolute', top: '15%'}}></div>
                  </div>
                </div>
              </>
            ) : (
             <div className="flex flex-col items-center gap-3 w-full h-full justify-center opacity-80 cursor-pointer" onClick={requestCompassPermission}>
                <FaLocationArrow className="text-4xl text-zad-border/50 animate-pulse" />
                <span className="font-cairo text-sm text-gray-500 text-center px-4">
                  اضغط هنا لتشغيل البوصلة وتحديد الاتجاه
                </span>
             </div>
            )}
          </div>
          
          {requestHeadingPerm ? (
            <p className="font-cairo text-gray-600 text-sm mb-2">
              قم بتدوير الهاتف بشكل مستوي حتى يتطابق السهم مع شكل الكعبة المشرفة. 
            </p>
          ) : (
            <p className="font-cairo text-gray-600 text-sm mb-2">
              اتجاه القبلة الزاوي من الشمال: <span className="font-bold text-zad-border">{Math.round(calculateQibla(coords.lat, coords.lng))}°</span>
            </p>
          )}

          <p className="font-cairo text-xs text-gray-400 mt-2">
            ملاحظة: دقة البوصلة تعتمد على مستشعرات جهازك. ابتعد عن الأجهزة المغناطيسية والحديدية.
          </p>
        </div>
      )}
    </div>
  );
}

export default PrayerTimes;
