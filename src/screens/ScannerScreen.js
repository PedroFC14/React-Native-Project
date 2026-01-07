import { View, Text, StyleSheet, Button } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Linking } from 'react-native';

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
  
    setScanned(true);
    setLastQR(data);
    setQrHistory([...qrHistory, data]);
  
    if (data.startsWith('http://') || data.startsWith('https://')) {
      Linking.openURL(data);
    }
  };
  

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No hay permiso para usar la cámara</Text>;
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
          <Text style={styles.resultTitle}>QR escaneado:</Text>
          <Text style={styles.resultText}>{lastQR}</Text>
        </View>
      )}

      {scanned && (
        <View style={styles.button}>
          <Button title="Escanear otro QR" onPress={() => {
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
