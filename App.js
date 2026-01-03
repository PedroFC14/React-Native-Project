import { NavigationContainer } from '@react-navigation/native';
import BottomTabs from './src/navigation/BottomTabs';
import { AppProvider } from './src/context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    </AppProvider>
  );
}
