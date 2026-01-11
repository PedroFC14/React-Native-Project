import * as Contacts from 'expo-contacts';
import * as Notifications from 'expo-notifications';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';
// Settings to display notifications even when the app is open
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
      // 1. Request permissions from Contacts
      const { status: contactStatus } = await Contacts.requestPermissionsAsync();

      // 2. Request Notification permissions
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (contactStatus === 'granted') {
        // 3. Get contacts (Only those with a phone number)
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        if (data.length > 0) {
          // We filtered a little to make sure they had a name and phone number.
          const validContacts = data.filter(
            c => c.name && c.phoneNumbers && c.phoneNumbers.length > 0
          );
          setContacts(validContacts);
        }
      } else {
        Alert.alert('Permission denied', 'Access to contacts is needed');
      }
    })();
  }, []);

  const handleContactPress = (contact) => {
    setSelectedContact(contact);
    setMinutes(''); // Reset input
    setModalVisible(true);
  };

  const scheduleNotification = async () => {
    const min = parseInt(minutes);
    // Validate that is a positive number
    if (isNaN(min) || min <= 0) {
      Alert.alert('Error', 'Please enter a valid number of minutes');
      return;
    }

    const timeInSeconds = min * 60; // Convert minutes to seconds
    console.log(`Trying to schedule a notification in ${timeInSeconds} seconds...`);
    // Program the notification
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Call reminder",
        body: `Is time to call ${selectedContact.name}`,
        data: { contactId: selectedContact.id, phone: selectedContact.phoneNumbers[0].number },
      },
      trigger: {
        seconds: timeInSeconds,
        channelId: 'default', // <--- Importante for Android
      },
    });
    console.log("Scheduled notification with ID:", id);
    // store the history
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
    Alert.alert('Succes', `Reminder created. Wait ${min} minute(s) to recieve it.`);

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
      {/* Modal to program the call */}
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
    marginTop: 30, // A little bit of space up
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
  // Modal styles
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