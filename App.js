import { NavigationContainer } from '@react-navigation/native'; // allows app to move between screens
import { AppProvider } from './src/context/AppContext'; //global data to the whole app
import BottomTabs from './src/navigation/BottomTabs';  // main  navigation layour, shows the bottom tab bar

export default function App() { // Root component of the app
  return (
    // AppProvider wraps the entire app and makes global state available everywhere
    <AppProvider>  
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    </AppProvider>
  );
}

// Is the main entry point of the app, it is the first file that runs when the app starts
// it connects navigation global state and the main screens