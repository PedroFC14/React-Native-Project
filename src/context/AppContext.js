import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

const STORAGE_KEY = 'qr_history';

export function AppProvider({ children }) {
  const [qrHistory, setQrHistory] = useState([]);
  const [reminders, setReminders] = useState([]);

  // Load history when initiating the app
  useEffect(() => {
    loadHistory();
  }, []);

  // Save history each time it changes
  useEffect(() => {
    saveHistory();
  }, [qrHistory]);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        setQrHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.log('Error loading QR history', error);
    }
  };

  const saveHistory = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(qrHistory));
    } catch (error) {
      console.log('Error saving QR history', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        qrHistory,
        setQrHistory,
        reminders,
        setReminders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
