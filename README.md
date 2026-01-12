# Native Manager Suite

Proyecto desarrollado en React Native con Expo.

Aplicación Todo-en-Uno que demuestra el uso de:
- Cámara (QR Scanner)
- Contactos
- Notificaciones
- Estado global y persistencia



que decir de contacts:
- FlatList (contactos)
- expo-contacts y expo-notifications
- useEffect


1. acceso a API's nativas, con expo-contacts leemos la agenda de contactos del telefono y 
   con expo-notifications nos conectamos con las notificaciones del movil para poder lanzarlas.

2. interaccionamos con la app del telefono con Linking.openURL, para salir de mi app y abrir la aplicación nativa de Teléfono.

3. Hemos usado flatList en vez de scrollView simple, consiguiendo la virtualizacion tal y como hemos explicado antes.
   Basicamente con flaList se renderizan solo los contactos que caben en la pantalla para ahorrar memoria, reciclando las vistas a medida que hacemos scroll. En vez de tener todos los contactos de la lista renderizados como pasaria con scrollView y ocupando espacio.

4. Uso the safeAreaView, esto garantiza que la app se vea bien en un iPhone 15 con "Isla Dinámica" o en un Android antiguo

5. El registro de llamada no se guarda solo en la pantalla. Al hacer una llamada, se actualiza el historial (setReminders) que luego se ve en el Dashboard, como veremos ahora.   