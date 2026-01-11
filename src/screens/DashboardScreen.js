import { useContext, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function DashboardScreen() {
  const { qrHistory, setQrHistory, reminders, setReminders } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'calls'

  const data = activeTab === 'qr' ? qrHistory : reminders;

  const confirmClearHistory = () => {
    const isQr = activeTab === 'qr';
    Alert.alert(
      isQr ? 'Delete QR History' : 'Delete Calls History',
      isQr ? 'Are you sure you want to delete all scanned QR codes?' : 'Are you sure you want to delete all calls history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (isQr) setQrHistory([]);
            else setReminders([]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'qr' && styles.activeTab]}
          onPress={() => setActiveTab('qr')}
        >
          <Text style={[styles.tabText, activeTab === 'qr' && styles.activeTabText]}>QR Codes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'calls' && styles.activeTab]}
          onPress={() => setActiveTab('calls')}
        >
          <Text style={[styles.tabText, activeTab === 'calls' && styles.activeTabText]}>Calls</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Total: {data.length}
      </Text>

      {data.length > 0 && (
        <View style={styles.clearButton}>
          <Button
            title="Clear history"
            color="#d9534f"
            onPress={confirmClearHistory}
          />
        </View>
      )}

      {data.length === 0 ? (
        <Text style={styles.emptyText}>
          {activeTab === 'qr' ? 'No scanned QRs yet' : 'No calls yet'}
        </Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              {activeTab === 'qr' ? (
                // QR Rendering
                <>
                  <Text style={styles.itemValue}>{item.value}</Text>
                  <Text style={styles.itemDate}>{item.date} · {item.time}</Text>
                </>
              ) : (
                // Call Rendering
                <>
                  <Text style={styles.itemValue}>
                    {'📞 Call Made' }
                  </Text>
                  <Text style={{fontSize: 15, fontWeight: 'bold', marginBottom: 2}}>
                    {item.contactName}
                  </Text>
                  <Text style={styles.itemSub}>{item.phoneNumber}</Text>
                  <Text style={styles.itemDate}>
                    {'Date:'} {item.scheduledTime}
                  </Text>
                </>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#000',
  },
  subtitle: {
    marginBottom: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
  itemCard: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  itemValue: {
    fontSize: 12, 
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 2,
    textTransform: 'uppercase'
  },
  itemSub: {
    fontSize: 14,
    color: '#444',
  },
  itemDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  clearButton: {
    marginBottom: 15,
  },
});