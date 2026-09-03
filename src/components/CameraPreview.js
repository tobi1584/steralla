import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';

function CameraPreview({ retryKey, onReady, onError }) {
  return (
    <CameraView
      key={`camera-${retryKey}`}
      style={StyleSheet.absoluteFill}
      facing="back"
      onCameraReady={onReady}
      onMountError={onError}
    />
  );
}

export default memo(CameraPreview);
