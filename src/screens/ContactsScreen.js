import * as Contacts from 'expo-contacts';
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

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    (async () => {
      // Request permissions from Contacts
      const { status: contactStatus } =
        await Contacts.requestPermissionsAsync();

      if (contactStatus === 'granted') {
        // Get contacts (Only those with a phone number)
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          // Filter contacts with name and phone number
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
    setModalVisible(true);
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

      {/* Modal to show contact info */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              {selectedContact?.name}
            </Text>

            <Text style={{ marginBottom: 20 }}>
              {selectedContact?.phoneNumbers?.[0]?.number}
            </Text>

            <Button
              title="Close"
              onPress={() => setModalVisible(false)}
            />
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
});
