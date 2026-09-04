import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import BottomControls from './src/components/BottomControls';
import CameraPreview from './src/components/CameraPreview';
import SkyOverlay from './src/components/SkyOverlay';
import StatusPanel from './src/components/StatusPanel';
import useAppState from './src/hooks/useAppState';
import useCameraAccess from './src/hooks/useCameraAccess';
import useCelestialBodies from './src/hooks/useCelestialBodies';
import useDeviceTracking from './src/hooks/useDeviceTracking';
import useProjectionProfiles from './src/hooks/useProjectionProfiles';
import styles from './src/styles';

export default function App() {
  const { width, height } = useWindowDimensions();
  const appState = useAppState();
  const camera = useCameraAccess();
  const tracking = useDeviceTracking({
    enabled: camera.requestSettled,
    retryKey: camera.retryKey,
    width,
    height,
  });
  const celestial = useCelestialBodies(appState, tracking.location);
  const projection = useProjectionProfiles(tracking.orientation);
  const cameraGranted = camera.permission?.granted;
  const sun = celestial.bodies.find((body) => body.id === 'Sun');
  const showRetry =
    !camera.permission ||
    hasBlockingServiceError(
      camera.permission,
      camera.status,
      tracking.locationStatus,
      tracking.sensorStatus
    );

  return (
    <View style={styles.container}>
      {cameraGranted ? (
        <CameraPreview
          retryKey={camera.retryKey}
          onReady={camera.handleReady}
          onError={camera.handleError}
        />
      ) : (
        <CameraPlaceholder
          appState={appState}
          permission={camera.permission}
        />
      )}

      <SkyOverlay
        appState={appState}
        width={width}
        height={height}
        gravityRef={tracking.gravityRef}
        magneticRef={tracking.magneticRef}
        headingRef={tracking.headingRef}
        frameRef={tracking.frameRef}
        orientationRef={tracking.orientationRef}
        bodiesRef={celestial.bodiesRef}
        profilesRef={projection.profilesRef}
        onOrientationReady={tracking.setOrientationReady}
      />

      <StatusPanel
        location={tracking.location}
        locationStatus={tracking.locationStatus}
        locationUpdated={tracking.locationUpdated}
        heading={tracking.heading}
        orientation={tracking.orientation}
        orientationReady={tracking.orientationReady}
        sensorStatus={tracking.sensorStatus}
        ephemerisUpdated={celestial.updatedAt}
        ephemerisError={celestial.error}
        cameraStatus={camera.status}
        cameraGranted={cameraGranted}
        calibrationHint={tracking.calibrationHint}
        calibrationMessage={tracking.calibrationMessage}
        sun={sun}
        showRetry={showRetry}
        onRetry={camera.retry}
      />

      <BottomControls
        profileName={projection.profileName}
        profile={projection.profile}
        celestialBodies={celestial.bodies}
        onChangeProfile={projection.changeProfile}
        onRecalibrate={tracking.recalibrate}
      />

      <StatusBar style="light" />
    </View>
  );
}

function CameraPlaceholder({ appState, permission }) {
  const message =
    appState === 'background'
      ? 'Cámara en pausa'
      : getCameraPermissionMessage(permission);

  return (
    <View style={[StyleSheet.absoluteFill, styles.cameraPlaceholder]}>
      <Text style={styles.cameraPlaceholderText}>{message}</Text>
    </View>
  );
}

function getCameraPermissionMessage(permission) {
  if (!permission) return 'Comprobando permiso de cámara…';
  if (!permission.granted) {
    return 'Se necesita permiso para usar la cámara trasera.';
  }
  return 'Iniciando cámara…';
}

function hasBlockingServiceError(
  cameraPermission,
  cameraStatus,
  locationStatus,
  sensorStatus
) {
  const sensorErrors = ['no disponible', 'denegado', 'error'];
  const hasSensorError = Object.values(sensorStatus).some((status) =>
    sensorErrors.some((error) => status.includes(error))
  );

  return (
    cameraPermission?.granted === false ||
    cameraStatus.state === 'error' ||
    locationStatus.includes('denegado') ||
    locationStatus.startsWith('Error') ||
    hasSensorError
  );
}
