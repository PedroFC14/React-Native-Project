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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [customData, setCustomData] = useState({});

  const { reminders, setReminders } = useContext(AppContext);

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

  const handleContactPress = async (contact) => {
    setSelectedContact(contact);
    setModalVisible(true);

    if (customData[contact.id]?.isEmergency) {
      // Simulation of a quick alert if you touch an emergency contact
      // (Optional: you can remove this if you want)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Emergency Contact Selected',
          body: `You selected ${contact.name}`,
        },
        trigger: null,
      });
    }
  };

  const handleCall = () => {
    if (selectedContact?.phoneNumbers?.[0]?.number) {
      const phoneNumber = selectedContact.phoneNumbers[0].number;
      
      // Open phone dialer
      Linking.openURL(`tel:${phoneNumber}`);

      // SAVE TO HISTORY
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

  const toggleEmergency = () => {
    setCustomData(prev => ({
      ...prev,
      [selectedContact.id]: {
        ...prev[selectedContact.id],
        isEmergency: !prev[selectedContact.id]?.isEmergency,
      },
    }));
  };

  const filteredContacts = contacts.filter(contact => {
    const name = contact.name.toLowerCase();
    const phone = contact.phoneNumbers[0]?.number || '';
    return (
      name.includes(searchText.toLowerCase()) ||
      phone.includes(searchText)
    );
  });

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
    backgroundColor: '#fff',
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