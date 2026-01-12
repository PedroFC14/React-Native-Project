import { Camera, CameraView } from 'expo-camera'; // We import the camera tools from Expo
import * as Haptics from 'expo-haptics'; // This is used to make the phone vibrate 
// This are react hooks. useState (save data), useEffect(to run code when the screen loads), useContext(to use global data from the app)
import { useContext, useEffect, useState } from 'react'; 
import { Button, Linking, StyleSheet, Text, View } from 'react-native'; // react components
import { AppContext } from '../context/AppContext'; // imports our global context

// Component
// This is the Scanner screen of the app
export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null); //Save if user accepted camera permission
  const [scanned, setScanned] = useState(false); //Check QR has already been scanned
  const [lastQR, setLastQR] = useState(null); //Stores last scanned QR

  // Global context. qrHistory: list of scanned QR codes
  // setQRHistory: function to add new QR coded
  const { qrHistory, setQrHistory } = useContext(AppContext);

  // Camera permission
  useEffect(() => { // this runs when the screen loads
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();  //permission to acces to the camera
      setHasPermission(status === 'granted'); // Saves if permission is granted or not
    })();
  }, []);

  // Function that runs when a QR code is detected
  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return; // If we already scanned a QR, do nothing (avoid duplicates)

    //vibration that confirms the scan
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Marks QR as scanned ans saces its value
    setScanned(true);
    setLastQR(data);
    const now = new Date(); // Get current date and time

    // Creates object with QR value, data, time
    const qrItem = {
      value: data,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    };

    setQrHistory([...qrHistory, qrItem]); // Adds the new QR to the history list

    // If the QR is a web link, it opens it in the browser
    if (data.startsWith('http://') || data.startsWith('https://')) {
      Linking.openURL(data);
    }
  };

  // Messages while waiting for permission and if it is denied:
  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No permission to use the camera</Text>;
  }

  return (
    //Main container of the screen
    <View style={styles.container}> 
      <CameraView
        style={StyleSheet.absoluteFillObject} //Show in full screen
        facing="back"                         // the back of the camera
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} // If already scanned, stop scanning, if not scan.
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }} // only scan qr, not barcodes
      />

      {lastQR && ( // If there is a scanned QR, show it, and display QR content on the screen
        <View style={styles.resultBox}> 
          <Text style={styles.resultTitle}>scanned QR:</Text> 
          <Text style={styles.resultText}>{lastQR}</Text> 
        </View>
      )}

      {scanned && ( // Scan again button (only after scanning)
        <View style={styles.button}>
          <Button title="Scan another QR" onPress={() => {
            setScanned(false);
            setLastQR(null);
          }} />
        </View>
      )}
    </View>
  );
}

// Dwfines the styles of the screen
const styles = StyleSheet.create({
  container: { //full screen
    flex: 1,
  },
  button: {  // fixed at the bottom
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  resultBox: {  // black box with QR text
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  resultTitle: { // white bold text
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: { // WHite normal text
    color: '#fff',
  },
});