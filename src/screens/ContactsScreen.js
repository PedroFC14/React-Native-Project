import * as Contacts from 'expo-contacts';
import * as Notifications from 'expo-notifications';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
// Configuración para que las notificaciones se muestren incluso con la app abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [minutes, setMinutes] = useState('');

  const { reminders, setReminders } = useContext(AppContext);

  useEffect(() => {
    (async () => {
      // 1. Pedir permisos de Contactos
      const { status: contactStatus } = await Contacts.requestPermissionsAsync();

      // 2. Pedir permisos de Notificaciones
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (contactStatus === 'granted') {
        // 3. Obtener contactos (Solo los que tienen número de teléfono)
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        if (data.length > 0) {
          // Filtramos un poco para asegurar que tengan nombre y teléfono
          const validContacts = data.filter(
            c => c.name && c.phoneNumbers && c.phoneNumbers.length > 0
          );
          setContacts(validContacts);
        }
      } else {
        Alert.alert('Permiso denegado', 'Se necesita acceso a contactos');
      }
    })();
  }, []);

  const handleContactPress = (contact) => {
    setSelectedContact(contact);
    setMinutes(''); // Resetear input
    setModalVisible(true);
  };

  const scheduleNotification = async () => {
    const min = parseInt(minutes);
    // Validamos que sea un número positivo. 
    // Nota: Para probar rápido, puedes quitar la validación de >0 y poner segundos directos si quieres, 
    // pero para producción min > 0 está bien.
    if (isNaN(min) || min <= 0) {
      Alert.alert('Error', 'Por favor ingresa un número válido de minutos');
      return;
    }

    const timeInSeconds = min * 60; // Convertimos minutos a segundos
    console.log(`Intentando programar notificación en ${timeInSeconds} segundos...`);
    // Programar la notificación
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Recordatorio de llamada 📞",
        body: `Es hora de llamar a ${selectedContact.name}`,
        data: { contactId: selectedContact.id, phone: selectedContact.phoneNumbers[0].number },
      },
      trigger: {
        seconds: timeInSeconds,
        channelId: 'default', // <--- Importante para Android
      },
    });
    console.log("Notificación programada con ID:", id);
    // Guardar en el historial
    const newReminder = {
      id: id || Date.now().toString(),
      contactName: selectedContact.name,
      phoneNumber: selectedContact.phoneNumbers[0].number,
      scheduledTime: new Date(Date.now() + timeInSeconds * 1000).toLocaleString(),
      status: 'pending'
    };
    setReminders([...reminders, newReminder]);
    setModalVisible(false);
    setSelectedContact(null);
    Alert.alert('Éxito', `Recordatorio creado. Espera ${min} minuto(s) para recibirlo.`);

  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My contacts</Text>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContactPress(item)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>
                {item.phoneNumbers && item.phoneNumbers[0]?.number}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* Modal para programar la llamada */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Program call to {selectedContact?.name}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Minutes to call (ej. 10)"
              keyboardType="numeric"
              value={minutes}
              onChangeText={setMinutes}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
              <View style={{ width: 20 }} />
              <Button title="Program" onPress={scheduleNotification} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e7e7e7ff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 30, // Un poco de espacio arriba
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaeaff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  // Estilos del Modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});