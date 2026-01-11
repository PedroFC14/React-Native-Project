import { Camera, CameraView } from 'expo-camera';
import * as Haptics from 'expo-haptics'; // <--- 1. IMPORTAR ESTO
import { useContext, useEffect, useState } from 'react';
import { Button, Linking, StyleSheet, Text, View } from 'react-native';
import { AppContext } from '../context/AppContext';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [lastQR, setLastQR] = useState(null);

  const { qrHistory, setQrHistory } = useContext(AppContext);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;

    // <--- 2. AÑADIR VIBRACIÓN AQUÍ
    // 'NotificationFeedbackType.Success' da dos toques cortos y nítidos (muy satisfactorio).
    // Si prefieres solo UN golpe seco, cambia .Success por .Heavy o .Medium
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setScanned(true);
    setLastQR(data);
    const now = new Date();

    const qrItem = {
      value: data,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    };

    setQrHistory([...qrHistory, qrItem]);


    if (data.startsWith('http://') || data.startsWith('https://')) {
      Linking.openURL(data);
    }
  };


  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No permission to use the camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {lastQR && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>scanned QR:</Text>
          <Text style={styles.resultText}>{lastQR}</Text>
        </View>
      )}

      {scanned && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  resultBox: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  resultTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    color: '#fff',
  },
});