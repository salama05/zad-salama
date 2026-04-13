import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapacitorApp } from '@capacitor/app';
import { CalculationMethod, Coordinates, PrayerTimes, CalculationParameters, Madhab } from 'adhan';

const ADHANS = [
  { id: 'makkah', name: 'أذان مكة المكرمة', url: '/audio/makkah.mp3', soundFile: 'makkah.mp3' },
  { id: 'madinah', name: 'أذان المدينة المنورة', url: '/audio/madinah.mp3', soundFile: 'madinah.mp3' },
  { id: 'al-aqsa', name: 'أذان المسجد الأقصى', url: '/audio/al-aqsa.mp3', soundFile: 'al_aqsa.mp3' },
  { id: 'failakawi', name: 'أذان ياسر الفيلكاوي', url: '/audio/failakawi.m4a', soundFile: 'failakawi.m4a' },
  { id: 'qatami', name: 'أذان ناصر القطامي', url: '/audio/qatami.mp3', soundFile: 'qatami.mp3' }
];

export default function AdhanPlayer() {
  const audioRef = useRef(null);

  // Background notifications schedular
  const scheduleAdhanNotifications = async (lat, lng) => {
    const adhanEnabled = localStorage.getItem('adhanEnabled') === 'true';
    if (!adhanEnabled) {
      if (LocalNotifications.getPending) {
        const pendingObj = await LocalNotifications.getPending();
        if (pendingObj && pendingObj.notifications && pendingObj.notifications.length > 0) {
          await LocalNotifications.cancel(pendingObj);
        }
      }
      return;
    }

    const selectedUrl = localStorage.getItem('selectedAdhanUrl') || ADHANS[0].url;
    const selectedAdhan = ADHANS.find(a => a.url === selectedUrl) || ADHANS[0];
    
    if (!lat || !lng) return; 

    try {
      if (LocalNotifications.requestPermissions) {
        await LocalNotifications.requestPermissions();
      }
      
      // Cancel previous adhans
      const pending = await LocalNotifications.getPending();
      if (pending && pending.notifications && pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      // Offline calculation parameters (Umm al-Qura common in Arab world)
      const params = CalculationMethod.UmmAlQura(); 
      params.madhab = Madhab.Shafi; // Standard
      
      const coordinates = new Coordinates(lat, lng);
      const notifications = [];
      let notifId = 100; // start ID from 100

      // Create notification channel for android custom sound
      try {
        await LocalNotifications.createChannel({
          id: 'adhan_channel',
          name: 'مواقيت الصلاة',
          description: 'تنبيهات الاذان',
          importance: 5,
          sound: selectedAdhan.soundFile,
          visibility: 1
        });
      } catch (err) {
        console.warn('Could not create notification channel', err);
      }

      // Schedule for the next 14 days
      const daysCount = 14;
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

        for (const prayer of prayers) {
           if (prayer.dateObj > new Date()) { // Only schedule future prayers
             notifications.push({
               id: notifId++,
               title: 'زاد السلامة',
               body: `حان الآن موعد أذان ${prayer.name}`,
               schedule: { at: prayer.dateObj },
               sound: selectedAdhan.soundFile,
               channelId: 'adhan_channel',
               smallIcon: 'ic_stat_icon_config_sample' // fallback
             });
           }
        }
      }

      await LocalNotifications.schedule({ notifications });
      console.log(`Successfully scheduled ${notifications.length} adhan notifications for the next ${daysCount} days!`);

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
        // Only fetch location automatically if we don't already have it
        if (!lat || isNaN(lat) || !lng || isNaN(lng)) {
          // DO NOT ask for location on app startup, wait for PrayerTimes page.
          // Just gracefully return or use IP if absolutely strictly needed, but let's avoid prompt.
          /*
          try {
            const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            localStorage.setItem('savedLat', lat);
            localStorage.setItem('savedLng', lng);
          } catch {
            const res = await axios.get('https://ipapi.co/json/');
            if (res.data && res.data.latitude) {
              lat = res.data.latitude;
              lng = res.data.longitude;
              localStorage.setItem('savedLat', lat);
              localStorage.setItem('savedLng', lng);
            }
          }
          */
          
          // Use IP as a silent fallback without prompting GPS on startup
          try {
             const res = await axios.get('https://ipapi.co/json/');
             if (res.data && res.data.latitude) {
               lat = res.data.latitude;
               lng = res.data.longitude;
               localStorage.setItem('savedLat', lat);
               localStorage.setItem('savedLng', lng);
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

    // Schedule the notifications locally
    if (lat && !isNaN(lat) && lng && !isNaN(lng)) {
      scheduleAdhanNotifications(lat, lng);
    }
  };

  // 1. First initial run
  useEffect(() => {
    fetchTimesSilently();
  }, []);

  // 2. React continuously to any user settings changes (like turning adhan on/off or changing location)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // For cross-tab storage events or our custom storage events
      if (!e || !e.key || ['isAutoLocation', 'savedCity', 'adhanEnabled', 'selectedAdhanUrl'].includes(e.key)) {
        fetchTimesSilently();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // As a solid fallback, re-calculate once a day just so we load the next 14 days
    const dailyTimer = setInterval(fetchTimesSilently, 24 * 60 * 60 * 1000);
    return () => {
      clearInterval(dailyTimer);
      window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  return (
    <audio ref={audioRef} preload="auto" style={{ display: 'none' }}></audio>
  );
}
