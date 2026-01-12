import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

export const AppContext = createContext();

const STORAGE_KEY = 'qr_history';
const REMINDERS_KEY = 'reminders_history';

// Introdution:
// This file is the brain of the app's memory. It's responsible for ensuring that 
// if you close the app and open it again tomorrow, your data is still there, 
// we do it thorough AsyncStorage

export function AppProvider({ children }) {
  //variables to sabe the qrs and the calls
  const [qrHistory, setQrHistory] = useState([]);
  const [reminders, setReminders] = useState([]);

  // Load history when initiating the app
  useEffect(() => {
    loadHistory();
    loadReminders();
  }, []);

  // Save history each time it changes (a qr has been scanned)
  useEffect(() => {
    saveHistory();
  }, [qrHistory]);

  // Save reminders each time it changes (a call has been made)
  useEffect(() => {
    saveReminders();
  }, [reminders]);

  //load the historial -> read the JSON where is saved the text with the history information
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

  //with JSON.stringify we change the variable to text, to enable to save it.
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

  // here with the "provider" we can access to that program by useContext(AppContext)
  // and access to all the histories
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
