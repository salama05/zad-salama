import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState('');
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('Classic'); // Classic, Dark, Golden, Blue
  
  // Audio state
  const [currentSurah, setCurrentSurah] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Check local storage for sessionId
    const storedSession = localStorage.getItem('zadSessionId');
    if (storedSession) {
      setSessionId(storedSession);
    } else {
      const newSession = uuidv4();
      setSessionId(newSession);
      localStorage.setItem('zadSessionId', newSession);
    }
    
    // Theme setup from local storage
    const storedTheme = localStorage.getItem('zadTheme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    // Update body theme class based on state (in addition to tailwind arbitrary variants if needed)
    // We can handle the specific theme colors in index.css or via tailwind parent class injected here:
    // This is simple since we use the App wrapper for it.
    localStorage.setItem('zadTheme', theme);
  }, [theme]);

  return (
    <AppContext.Provider 
      value={{ 
        sessionId, user, setUser, 
        theme, setTheme,
        currentSurah, setCurrentSurah,
        isPlaying, setIsPlaying
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
