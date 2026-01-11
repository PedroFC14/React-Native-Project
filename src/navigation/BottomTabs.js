import { Ionicons } from '@expo/vector-icons'; // Librería de iconos
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importa tus pantallas (Ajusta la ruta si es necesario)
import ContactsScreen from '../screens/ContactsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ScannerScreen from '../screens/ScannerScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Lógica para elegir el icono según la pantalla
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Scanner') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'list' : 'list-outline';
          }

          // Devolver el componente Icono
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF', // Color azul al estar activo
        tabBarInactiveTintColor: 'gray',  // Color gris al estar inactivo
        headerShown: true,               // Ocultamos la cabecera (header) por defecto
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Scanner" component={ScannerScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
    </Tab.Navigator>
  );
}