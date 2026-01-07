import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

export const AppContext = createContext();

const STORAGE_KEY = 'qr_history';
const REMINDERS_KEY = 'reminders_history';

export function AppProvider({ children }) {
  const [qrHistory, setQrHistory] = useState([]);
  const [reminders, setReminders] = useState([]);

  // Load history when initiating the app
  useEffect(() => {
    loadHistory();
    loadReminders();
  }, []);

  // Save history each time it changes
  useEffect(() => {
    saveHistory();
  }, [qrHistory]);

  // Save reminders each time it changes
  useEffect(() => {
    saveReminders();
  }, [reminders]);

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

  // for reminders (contact/calls/notifications module)
  const loadReminders = async () => {
    try {
      const storedReminders = await AsyncStorage.getItem(REMINDERS_KEY);
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
    } catch (error) {
      console.log('Error loading reminders', error);
    }
  };

  const saveReminders = async () => {
    try {
      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.log('Error saving reminders', error);
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
