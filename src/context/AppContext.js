import { createContext, useState } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [qrHistory, setQrHistory] = useState([]);
  const [reminders, setReminders] = useState([]);

  return (
    <AppContext.Provider value={{
      qrHistory,
      setQrHistory,
      reminders,
      setReminders
    }}>
      {children}
    </AppContext.Provider>
  );
}

