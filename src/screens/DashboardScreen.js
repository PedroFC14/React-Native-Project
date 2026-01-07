import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';


export default function DashboardScreen() {
  const { qrHistory, setQrHistory } = useContext(AppContext);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.subtitle}>
        Total scanned QRs: {qrHistory.length}
      </Text>

      {qrHistory.length > 0 && (
        <View style={styles.clearButton}>
          <Button
            title="Delete history"
            color="#d9534f"
            onPress={() => setQrHistory([])}
          />
        </View>
      )}


      {qrHistory.length === 0 ? (
        <Text style={styles.emptyText}>No scanned QRs for the moment</Text>
      ) : (
        <FlatList
          data={qrHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.qrItem}>
              <Text style={styles.qrValue}>{item.value}</Text>
              <Text style={styles.qrDate}>
                {item.date} · {item.time}
              </Text>
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
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 15,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
  },
  qrItem: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 10,
  },
  qrText: {
    fontSize: 14,
  },
  qrValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  qrDate: {
    fontSize: 12,
    color: '#666',
  },

  clearButton: {
    marginBottom: 15,
  },
  
});
