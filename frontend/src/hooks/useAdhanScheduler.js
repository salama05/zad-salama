import { useEffect } from 'react';
import axios from 'axios';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { CalculationMethod, Coordinates, PrayerTimes, Madhab } from 'adhan';

const ADHANS = [
  { id: 'makkah', name: 'أذان مكة المكرمة', url: '/audio/makkah.mp3.mp3', soundFile: 'makkah.mp3' },
  { id: 'madinah', name: 'أذان المدينة المنورة', url: '/audio/madinah.mp3.mp3', soundFile: 'madinah.mp3' },
  { id: 'al-aqsa', name: 'أذان المسجد الأقصى', url: '/audio/al-aqsa.mp3.mp3', soundFile: 'al_aqsa.mp3' },
  { id: 'failakawi', name: 'أذان ياسر الفيلكاوي', url: '/audio/failakawi.mp3.m4a', soundFile: 'failakawi.m4a' },
  { id: 'qatami', name: 'أذان ناصر القطامي', url: '/audio/qatami.mp3.mp3', soundFile: 'qatami.mp3' }
];

export function useAdhanScheduler() {
  const ADHAN_ID_MIN = 100;
  const ADHAN_ID_MAX = 4999;
  const MULK_ID_MIN = 5000;
  const MULK_ID_MAX = 6999;
  const KAHF_ID_MIN = 7000;
  const KAHF_ID_MAX = 8999;

  // Background notifications schedular
  const scheduleAdhanNotifications = async (lat, lng) => {
    const adhanEnabled = localStorage.getItem('adhanEnabled') === 'true';
    const mulkReminderEnabled = localStorage.getItem('mulkReminderEnabled') !== 'false';
    const kahfReminderEnabled = localStorage.getItem('kahfReminderEnabled') !== 'false';

    const selectedUrl = localStorage.getItem('selectedAdhanUrl') || ADHANS[0].url;
    const selectedAdhan = ADHANS.find(a => a.url === selectedUrl) || ADHANS[0];
    
    if (!lat || !lng) return; 

    try {
      if (LocalNotifications.requestPermissions) {
        await LocalNotifications.requestPermissions();
      }
      
      const pending = await LocalNotifications.getPending();
      if (pending && pending.notifications && pending.notifications.length > 0) {
        const appNotifications = pending.notifications.filter((n) =>
          (n.id >= ADHAN_ID_MIN && n.id <= ADHAN_ID_MAX) ||
          (n.id >= MULK_ID_MIN && n.id <= MULK_ID_MAX) ||
          (n.id >= KAHF_ID_MIN && n.id <= KAHF_ID_MAX)
        );

        if (appNotifications.length > 0) {
          await LocalNotifications.cancel({ notifications: appNotifications });
        }
      }

      const params = CalculationMethod.UmmAlQura(); 
      params.madhab = Madhab.Shafi;
      
      const coordinates = new Coordinates(lat, lng);
      const notifications = [];
      let adhanNotifId = ADHAN_ID_MIN;
      let mulkNotifId = MULK_ID_MIN;
      let kahfNotifId = KAHF_ID_MIN;
      const now = new Date();

      const dynamicChannelId = `adhan_channel_${selectedAdhan.id}_v2`;
      try {
        await LocalNotifications.createChannel({
          id: dynamicChannelId,
          name: `مواقيت الصلاة - ${selectedAdhan.name}`,
          description: 'تنبيهات الاذان',
          importance: 5,
          sound: selectedAdhan.soundFile,
          visibility: 1
        });
      } catch (err) {
        console.warn('Could not create notification channel', err);
      }

      const quranReminderChannelId = 'quran_reading_reminders_v1';
      try {
        await LocalNotifications.createChannel({
          id: quranReminderChannelId,
          name: 'تذكير قراءة القرآن',
          description: 'تنبيهات سورة الملك وسورة الكهف',
          importance: 4,
          visibility: 1
        });
      } catch (err) {
        console.warn('Could not create quran reminder channel', err);
      }

      const daysCount = 30;
      for (let i = 0; i < daysCount; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const prayerTimes = new PrayerTimes(coordinates, date, params);
        
        const prayers = [
          { name: 'الفجر', dateObj: prayerTimes.fajr },
          { name: 'الظهر', dateObj: prayerTimes.dhuhr },
          { name: 'العصر', dateObj: prayerTimes.asr },
          { name: 'المغرب', dateObj: prayerTimes.maghrib },
          { name: 'العشاء', dateObj: prayerTimes.isha },
        ];

        if (adhanEnabled) {
          for (const prayer of prayers) {
            if (prayer.dateObj > now) { 
              notifications.push({
                id: adhanNotifId++,
                title: 'زاد السلامة',
                body: `حان الآن موعد أذان ${prayer.name}`,
                schedule: { at: prayer.dateObj, allowWhileIdle: true },
                sound: selectedAdhan.soundFile,
                channelId: dynamicChannelId,
                smallIcon: 'ic_stat_icon_config_sample' 
              });
            }
          }
        }

        if (mulkReminderEnabled) {
          const mulkReminderTime = new Date(prayerTimes.isha.getTime() + (90 * 60 * 1000));
          if (mulkReminderTime > now) {
            notifications.push({
              id: mulkNotifId++,
              title: 'زاد السلامة',
              body: 'حان وقت قراءة سورة الملك لهذه الليلة.',
              schedule: { at: mulkReminderTime, allowWhileIdle: true },
              channelId: quranReminderChannelId,
              smallIcon: 'ic_stat_icon_config_sample'
            });
          }
        }

        if (kahfReminderEnabled && date.getDay() === 5) {
          const kahfReminderTime = prayerTimes.dhuhr;
          if (kahfReminderTime > now) {
            notifications.push({
              id: kahfNotifId++,
              title: 'زاد السلامة',
              body: 'اليوم الجمعة، لا تنس قراءة سورة الكهف.',
              schedule: { at: kahfReminderTime, allowWhileIdle: true },
              channelId: quranReminderChannelId,
              smallIcon: 'ic_stat_icon_config_sample'
            });
          }
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }
      console.log(`Successfully scheduled ${notifications.length} notifications for the next ${daysCount} days!`);

    } catch (e) {
      console.error('Failed to schedule offline adhans:', e);
    }
  };

  const fetchTimesSilently = async () => {
    let lat = parseFloat(localStorage.getItem('savedLat'));
    let lng = parseFloat(localStorage.getItem('savedLng'));

    try {
      const isAuto = localStorage.getItem('isAutoLocation') !== 'false';
      if (isAuto) {
        if (!lat || isNaN(lat) || !lng || isNaN(lng)) {
          try {
             const res = await axios.get('https://ipinfo.io/json').catch(() => axios.get('https://api.ipify.org?format=json'));
             if (res.data) {
               if (res.data.loc) {
                 const [l1, l2] = res.data.loc.split(',');
                 lat = parseFloat(l1);
                 lng = parseFloat(l2);
               }
               if (lat && lng) {
                 localStorage.setItem('savedLat', lat);
                 localStorage.setItem('savedLng', lng);
               }
             }
          } catch(err) {
             console.warn('Silent IP location failed');
          }
        }
      } else {
        const city = localStorage.getItem('savedCity');
        const countryCode = localStorage.getItem('savedCountryCode');
        if (city && countryCode) {
          const date = new Date();
          const res = await axios.get(`https://api.aladhan.com/v1/calendarByCity/${date.getFullYear()}/${date.getMonth()+1}?city=${city}&country=${countryCode}&method=4`);
          if (res.data && res.data.data[0] && res.data.data[0].meta) {
            lat = parseFloat(res.data.data[0].meta.latitude);
            lng = parseFloat(res.data.data[0].meta.longitude);
            localStorage.setItem('savedLat', lat);
            localStorage.setItem('savedLng', lng);
          }
        }
      }
    } catch (e) {
      console.warn("Offline fallback triggered. Using last known coordinates.", e);
    }

    if (lat && !isNaN(lat) && lng && !isNaN(lng)) {
      scheduleAdhanNotifications(lat, lng);
    }
  };

  useEffect(() => {
    fetchTimesSilently();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (!e || !e.key || ['isAutoLocation', 'savedCity', 'adhanEnabled', 'selectedAdhanUrl', 'mulkReminderEnabled', 'kahfReminderEnabled'].includes(e.key)) {
        fetchTimesSilently();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const dailyTimer = setInterval(fetchTimesSilently, 24 * 60 * 60 * 1000);
    return () => {
      clearInterval(dailyTimer);
      window.removeEventListener('storage', handleStorageChange);
    }
  }, []);
}