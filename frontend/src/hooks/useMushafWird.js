import { useState, useEffect, useCallback } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

const WIRD_SETTINGS_KEY = 'zad_mushaf_wird_settings';
const WIRD_PROGRESS_KEY = 'zad_mushaf_wird_progress';

export function useMushafWird() {
  const [wirdSettings, setWirdSettings] = useState({
    enabled: false,
    targetPages: 5,
    reminderTime: '20:00'
  });

  const [wirdProgress, setWirdProgress] = useState({
    date: new Date().toISOString().split('T')[0],
    pagesRead: []
  });

  // Load from local storage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(WIRD_SETTINGS_KEY);
    if (savedSettings) {
      setWirdSettings(JSON.parse(savedSettings));
    }

    const savedProgress = localStorage.getItem(WIRD_PROGRESS_KEY);
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      const today = new Date().toISOString().split('T')[0];
      
      // If it's a new day, reset progress
      if (parsed.date !== today) {
        const resetProgress = { date: today, pagesRead: [] };
        setWirdProgress(resetProgress);
        localStorage.setItem(WIRD_PROGRESS_KEY, JSON.stringify(resetProgress));
      } else {
        setWirdProgress(parsed);
      }
    }
  }, []);

  // Set and save settings
  const updateSettings = async (newSettings) => {
    const updated = { ...wirdSettings, ...newSettings };
    setWirdSettings(updated);
    localStorage.setItem(WIRD_SETTINGS_KEY, JSON.stringify(updated));

    if (updated.enabled) {
      await scheduleNotification(updated.reminderTime);
    } else {
      await cancelNotification();
    }
  };

  // Track page read today
  const trackPageRead = useCallback((pageNumber) => {
    setWirdProgress(prev => {
      const today = new Date().toISOString().split('T')[0];
      
      // Reset if it's a new day
      if (prev.date !== today) {
        const newProgress = { date: today, pagesRead: [pageNumber] };
        localStorage.setItem(WIRD_PROGRESS_KEY, JSON.stringify(newProgress));
        return newProgress;
      }
      
      // Add page if not already read today
      if (!prev.pagesRead.includes(pageNumber)) {
        const newProgress = { ...prev, pagesRead: [...prev.pagesRead, pageNumber] };
        localStorage.setItem(WIRD_PROGRESS_KEY, JSON.stringify(newProgress));
        return newProgress;
      }
      
      return prev;
    });
  }, []);

  // Schedule capacitor local notification
  const scheduleNotification = async (timeString) => {
    try {
      // Clean up previous
      await cancelNotification();
      
      const [hours, minutes] = timeString.split(':').map(Number);
      
      // Create a date object for today at the specified time
      const scheduleDate = new Date();
      scheduleDate.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (scheduleDate <= new Date()) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      await LocalNotifications.requestPermissions();
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'وردك اليومي',
            body: 'حان وقت قراءة الورد اليومي من المصحف الشريف. زادك الله نوراً وتوفيقاً.',
            id: 114, // arbitrary ID for Wird
            schedule: { 
              allowWhileIdle: true,
              on: { hour: hours, minute: minutes }
            }
          }
        ]
      });
    } catch (e) {
      console.error('Failed to schedule notification:', e);
    }
  };

  const cancelNotification = async () => {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: 114 }]
      });
    } catch (e) {
      console.error('Failed to cancel notification:', e);
    }
  };

  return {
    wirdSettings,
    wirdProgress,
    updateSettings,
    trackPageRead
  };
}