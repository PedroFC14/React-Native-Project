//Introduction:
// In that program we handle the contacts screen

// Import native libraries
import * as Contacts from 'expo-contacts';
import * as Notifications from 'expo-notifications';
import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';


// We configure notifications so that if they appear while the app is open,
// they are shown (with sound and visual alert). Without this, the operating system
// would silence them by default when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ContactsScreen() {

  // Stores the mobile contact list
  const [contacts, setContacts] = useState([]);
  // What the user types in the search bar
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [customData, setCustomData] = useState({});

  // Here we connect the contacts screen with the history managed by AppContext
  const { reminders, setReminders } = useContext(AppContext);


  // It will run only at startup, since the last argument is empty, so it does not
  // depend on any variable.
  // With this useEffect, we ask for permission first (important due to the Sandbox model of the
  // mobile we saw previously); and then we access and save all
  // contacts with name and phone number.
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Access to contacts is needed');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      const validContacts = data.filter(
        c => c.name && c.phoneNumbers && c.phoneNumbers.length > 0
      );

      setContacts(validContacts);
    })();
  }, []);  

  // When we press a contact, we activate the modal
  // If is an emergency contact, we send a notification
  const handleContactPress = async (contact) => {
    setSelectedContact(contact);
    setModalVisible(true);

    if (customData[contact.id]?.isEmergency) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Emergency Contact Selected',
          body: `You selected ${contact.name}`,
        },
        trigger: null,
      });
    }
  };

  // 1. First we call the selected contact
  // 2. We register the call in the history
  const handleCall = () => {
    if (selectedContact?.phoneNumbers?.[0]?.number) {
      const phoneNumber = selectedContact.phoneNumbers[0].number;

      //1
      Linking.openURL(`tel:${phoneNumber}`);
      
      //2
      const newCallLog = {
        id: Date.now().toString(),
        contactName: selectedContact.name,
        phoneNumber: phoneNumber,
        scheduledTime: new Date().toLocaleString(),
        type: 'history',
      };

      setReminders([...reminders, newCallLog]);

    } else {
      Alert.alert("Error", "This contact has no valid number.");
    }
  };

  //mark/desmark a contact as emergency
  const toggleEmergency = () => {
    setCustomData(prev => ({
      ...prev,
      [selectedContact.id]: {
        ...prev[selectedContact.id],
        isEmergency: !prev[selectedContact.id]?.isEmergency,
      },
    }));
  };

  // It runs every time we write in the search bar, comparing the input
  // with the name and the phone number
  const filteredContacts = contacts.filter(contact => {
    const name = contact.name.toLowerCase();
    const phone = contact.phoneNumbers[0]?.number || '';
    return (
      name.includes(searchText.toLowerCase()) ||
      phone.includes(searchText)
    );
  });

  // The interface, the rendering.
  // Here we have the header, the search bar, the contact list managed
  // with FlatList, and the Modal, which is the native popup window activated when
  // we press a contact and deactivated when pressing the "Close" button.
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My contacts</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or phone"
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isEmergency = customData[item.id]?.isEmergency;
          return (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContactPress(item)}
            >
              <View style={[
                styles.avatar,
                isEmergency && { backgroundColor: '#FF3B30' }
              ]}>
                <Text style={styles.avatarText}>
                  {isEmergency ? '🚨' : item.name[0]}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>
                  {item.phoneNumbers[0]?.number}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{selectedContact?.name}</Text>
            
            {/*Show Name and phone number*/}
            <Text style={{textAlign: 'center', marginBottom: 20, color: '#666', fontSize: 16}}>
              {selectedContact?.phoneNumbers?.[0]?.number}
            </Text>

            {/* --- ACTION BUTTONS --- */}
            
            {/* 1. Emergency Button */}
            <View style={{ width: '100%', marginBottom: 10 }}>
                <Button
                title={
                    customData[selectedContact?.id]?.isEmergency
                    ? 'Remove Emergency'
                    : 'Mark as Emergency'
                }
                color={customData[selectedContact?.id]?.isEmergency ? "#FF3B30" : "#FF9500"}
                onPress={toggleEmergency}
                />
            </View>

            {/* 2. Call Button */}
            <View style={{ width: '100%', marginBottom: 10 }}>
              <Button 
                title={`Call ${selectedContact?.name}`} 
                onPress={handleCall} 
              />
            </View>

            {/* 3. Close Button */}
            <View style={{ width: '100%', marginTop: 5 }}>
              <Button title="Close" color="#666" onPress={() => setModalVisible(false)} />
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// We set the styles with the native API: StyleSheet.create()
// We can see that no css file is needed.
// We also see that to set the size of elements, we use a number,
// which as we explained before will adjust equally to pixels
// to look the same size on any device.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#e7e7e7ff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  searchInput: {
    height: 45,
    backgroundColor: '#6db0f8ff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '80%',
    alignItems: 'center', // Center all content
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
});