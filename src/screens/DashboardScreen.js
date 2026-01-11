// import { useContext, useState } from 'react';
// import { Alert, Button, FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
// import { AppContext } from '../context/AppContext';


// export default function DashboardScreen() {
//   const { qrHistory, setQrHistory } = useContext(AppContext);

//   const confirmClearHistory = () => {
//     Alert.alert(
//       'Delete history',
//       'Are you sure you want to delete all scanned QR codes?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: () => setQrHistory([]),
//         },
//       ]
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Dashboard</Text>

//       <Text style={styles.subtitle}>
//         Total scanned QRs: {qrHistory.length}
//       </Text>

//       {qrHistory.length > 0 && (
//         <View style={styles.clearButton}>
//           <Button
//             title="Clear history"
//             color="#d9534f"
//             onPress={confirmClearHistory}
//           />
//         </View>
//       )}


//       {qrHistory.length === 0 ? (
//         <Text style={styles.emptyText}>No scanned QRs for the moment</Text>
//       ) : (
//         <FlatList
//           data={qrHistory}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={({ item }) => (
//             <View style={styles.qrItem}>
//               <Text style={styles.qrValue}>{item.value}</Text>
//               <Text style={styles.qrDate}>
//                 {item.date} · {item.time}
//               </Text>
//             </View>
//           )}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   subtitle: {
//     marginBottom: 15,
//   },
//   emptyText: {
//     fontStyle: 'italic',
//     color: '#666',
//   },
//   qrItem: {
//     padding: 12,
//     backgroundColor: '#f2f2f2',
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   qrText: {
//     fontSize: 14,
//   },
//   qrValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//   },

//   qrDate: {
//     fontSize: 12,
//     color: '#666',
//   },

//   clearButton: {
//     marginBottom: 15,
//   },

// });


import { useContext, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function DashboardScreen() {
  const { qrHistory, setQrHistory, reminders, setReminders } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'calls'

  //We select which list to display based on the active tab.
  const data = activeTab === 'qr' ? qrHistory : reminders;

  const confirmClearHistory = () => {
    const isQr = activeTab === 'qr';
    Alert.alert(
      isQr ? 'Delete QR History' : 'Delete Calls History',
      isQr ? 'Are you sure you want to delete all scanned QR codes?' : 'Are you sure you want to delete all scheduled calls?',
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

      {/* Tabs to change view */}
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
          {activeTab === 'qr' ? 'No scanned QRs yet' : 'No scheduled calls yet'}
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
                  <Text style={styles.itemValue}>📞 {item.contactName}</Text>
                  <Text style={styles.itemSub}>{item.phoneNumber}</Text>
                  <Text style={styles.itemDate}>Scheduled: {item.scheduledTime}</Text>
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
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
