import * as Contacts from 'expo-contacts';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Immediate notifications (Expo Go compatible)
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
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Emergency contact',
          body: 'You have selected an emergency contact!',
        },
        trigger: null,
      });
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
    <View style={styles.container}>
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

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={customData[selectedContact?.id]?.description || ''}
              onChangeText={(text) =>
                setCustomData(prev => ({
                  ...prev,
                  [selectedContact.id]: {
                    ...prev[selectedContact.id],
                    description: text,
                  },
                }))
              }
            />

            <Button
              title={
                customData[selectedContact?.id]?.isEmergency
                  ? 'Remove emergency contact'
                  : 'Mark as emergency contact'
              }
              color="red"
              onPress={toggleEmergency}
            />

            <View style={{ marginTop: 15 }}>
              <Button title="Close" onPress={() => setModalVisible(false)} />
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
    marginTop: 30,
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
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
});
