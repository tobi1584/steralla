import { memo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';

function CameraPreview({ retryKey, onReady, onError }) {
  return (
    // La app solo necesita el preview. En Android, el modo foto de
    // expo-camera tambien enlaza captura y analisis a maxima resolucion.
    // pictureSize se reutiliza como selector del preview nativo y evita que
    // CameraX elija la resolucion maxima del sensor (4032x3024 en el A52).
    <CameraView
      key={`camera-${retryKey}`}
      style={StyleSheet.absoluteFill}
      facing="back"
      mode="video"
      mute
      pictureSize={Platform.OS === 'android' ? '1280x720' : undefined}
      videoQuality="720p"
      onCameraReady={onReady}
      onMountError={onError}
    />
  );
}

export default memo(CameraPreview);
