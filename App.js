import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import BottomTabs from './src/navigation/BottomTabs';

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    </AppProvider>
  );
}
