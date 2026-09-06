import { Pressable, Text, View } from 'react-native';

import styles from '../styles';

export default function StatusPanel({
  locationStatus,
  orientationReady,
  ephemerisError,
  cameraStatus,
  cameraGranted,
  calibrationHint,
  calibrationMessage,
  showRetry,
  onRetry,
}) {
  const locationReady = locationStatus === 'Ubicación activa';
  const hasError =
    showRetry || cameraStatus.state === 'error' || Boolean(ephemerisError);

  return (
    <View style={styles.statusCard}>
      <View style={styles.statusSummary}>
        <View
          style={[
            styles.statusDot,
            locationReady && orientationReady && styles.statusDotReady,
            hasError && styles.statusDotError,
          ]}
        />
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>Explora el cielo</Text>
          <Text style={styles.statusText} numberOfLines={1}>
            {getFriendlyStatus(locationStatus, orientationReady)}
          </Text>
        </View>
      </View>

      {cameraStatus.state === 'loading' && cameraGranted && (
        <Text style={styles.statusDetail}>Iniciando cámara…</Text>
      )}
      {cameraStatus.state === 'error' && (
        <Text style={styles.errorText}>
          Error de cámara: {cameraStatus.message || 'desconocido'}
        </Text>
      )}
      {ephemerisError && (
        <Text style={styles.errorText}>{ephemerisError}</Text>
      )}
      {calibrationHint && (
        <Text style={styles.hintText}>
          Mueve el móvil haciendo ochos para calibrarlo.
        </Text>
      )}
      {calibrationMessage && (
        <Text style={styles.hintText}>{calibrationMessage}</Text>
      )}

      {showRetry && (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            Reintentar permisos y sensores
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function getFriendlyStatus(locationStatus, orientationReady) {
  if (locationStatus === 'Ubicación activa') {
    return orientationReady ? 'Listo para buscar' : 'Preparando orientación…';
  }

  if (locationStatus.includes('denegado')) return 'Ubicación no disponible';
  if (locationStatus.startsWith('Error')) return 'No encontramos tu ubicación';
  return 'Buscando tu ubicación…';
}
