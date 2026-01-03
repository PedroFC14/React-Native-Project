import { View, Text, StyleSheet, Button } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
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
    setQrHistory([...qrHistory, data]);
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
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {scanned && (
        <View style={styles.button}>
          <Button title="Escanear otro QR" onPress={() => setScanned(false)} />
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
    bottom: 40,
    alignSelf: 'center',
  },
});
