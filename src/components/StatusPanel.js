import { Pressable, Text, View } from 'react-native';

import styles from '../styles';
import {
  compassQuality,
  formatTime,
  orientationLabel,
} from '../utils/formatters';

export default function StatusPanel({
  location,
  locationStatus,
  locationUpdated,
  heading,
  orientation,
  orientationReady,
  sensorStatus,
  ephemerisUpdated,
  ephemerisError,
  cameraStatus,
  cameraGranted,
  calibrationHint,
  calibrationMessage,
  sun,
  showRetry,
  onRetry,
}) {
  return (
    <View style={styles.statusCard}>
      <Text style={styles.statusTitle}>Mapa celeste 3D</Text>
      <Text style={styles.statusText} numberOfLines={1}>
        {locationStatus}
      </Text>

      {location && <LocationCoordinates location={location} />}

      <Text style={styles.statusText}>
        Norte {heading.mode}:{' '}
        {Number.isFinite(heading.degrees)
          ? `${heading.degrees.toFixed(1)}°`
          : '—'}
        {' · calidad '}
        {compassQuality(heading.accuracy)}
      </Text>

      {sun && Number.isFinite(sun.azimuth) && (
        <Text style={styles.diagnosticText}>
          ☀️ Sol → Az {sun.azimuth.toFixed(1)}° · Alt{' '}
          {sun.altitude.toFixed(1)}°
        </Text>
      )}

      {heading.error && (
        <Text style={styles.errorText}>
          Brújula del sistema: {heading.error}
        </Text>
      )}

      <Text style={styles.statusText}>
        Orientación: {orientationLabel(orientation)} ·{' '}
        {orientationReady ? 'seguimiento activo' : 'esperando sensores'}
      </Text>
      <Text style={styles.statusText}>
        Sensores: movimiento {sensorStatus.motion} · campo{' '}
        {sensorStatus.magnetometer}
      </Text>
      <Text style={styles.statusTime}>
        GPS {formatTime(locationUpdated)} · cielo{' '}
        {formatTime(ephemerisUpdated)}
      </Text>

      {cameraStatus.state === 'loading' && cameraGranted && (
        <Text style={styles.statusTime}>Iniciando cámara…</Text>
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
          ♾️ Mueve el móvil haciendo ochos y gíralo en varias direcciones.
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

function LocationCoordinates({ location }) {
  const { latitude, longitude, altitude } = location.coords;

  return (
    <Text style={styles.statusText}>
      {latitude.toFixed(4)}, {longitude.toFixed(4)} ·{' '}
      {Number.isFinite(altitude) ? `${altitude.toFixed(0)} m` : 'altitud —'}
    </Text>
  );
}
