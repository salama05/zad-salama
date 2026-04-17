import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedSession = localStorage.getItem('zadSessionId');
    if (storedSession) {
      setSessionId(storedSession);
    } else {
      const newSession = uuidv4();
      setSessionId(newSession);
      localStorage.setItem('zadSessionId', newSession);
    }
  }, []);

  return (
    <UserContext.Provider 
      value={{ 
        sessionId, user, setUser 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
