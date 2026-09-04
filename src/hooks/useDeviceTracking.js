import * as Location from 'expo-location';
import { DeviceMotion, Magnetometer } from 'expo-sensors';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import {
  CALIBRATION_DURATION,
  GRAVITY_SMOOTHING,
  MAGNETIC_SMOOTHING,
  SENSOR_INTERVAL,
} from '../constants';
import { getScreenOrientation } from '../utils/orientation';
import {
  smoothVector,
  subtract,
  vectorFromMeasurement,
} from '../utils/vector';

const INITIAL_HEADING = {
  degrees: null,
  accuracy: null,
  mode: 'magnético',
  error: null,
};

const INITIAL_SENSOR_STATUS = {
  motion: 'comprobando',
  magnetometer: 'comprobando',
};

export default function useDeviceTracking({
  enabled,
  retryKey,
  width,
  height,
}) {
  const initialOrientation = width > height ? 'landscapeLeft' : 'portrait';
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(
    'Solicitando permiso…'
  );
  const [locationUpdated, setLocationUpdated] = useState(null);
  const [heading, setHeading] = useState(INITIAL_HEADING);
  const [sensorStatus, setSensorStatus] = useState(INITIAL_SENSOR_STATUS);
  const [orientation, setOrientation] = useState(initialOrientation);
  const [orientationReady, setOrientationReady] = useState(false);
  const [calibrationHint, setCalibrationHint] = useState(false);
  const [calibrationMessage, setCalibrationMessage] = useState(null);

  const gravityRef = useRef(null);
  const magneticRef = useRef(null);
  const frameRef = useRef(null);
  const orientationRef = useRef(initialOrientation);
  const sensorOrientationRef = useRef(null);
  const dimensionsRef = useRef({ width, height });
  const headingRef = useRef({ correction: 0, mode: 'magnético' });
  const calibrationSamplesRef = useRef([]);
  const magnetometerOffsetRef = useRef([0, 0, 0]);
  const calibratingRef = useRef(false);
  const calibrationTimerRef = useRef(null);
  const messageTimerRef = useRef(null);

  useEffect(() => {
    dimensionsRef.current = { width, height };

    const nextOrientation = getScreenOrientation(
      sensorOrientationRef.current,
      width,
      height,
      orientationRef.current
    );

    if (nextOrientation !== orientationRef.current) {
      orientationRef.current = nextOrientation;
      setOrientation(nextOrientation);
    }
  }, [height, width]);

  useEffect(
    () => () => {
      if (calibrationTimerRef.current) {
        clearTimeout(calibrationTimerRef.current);
      }
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (!enabled) return undefined;

    let disposed = false;
    let motionActive = false;
    let magnetometerActive = false;
    const subscriptions = [];

    setLocationStatus('Solicitando permiso…');
    setSensorStatus(INITIAL_SENSOR_STATUS);

    const registerSubscription = (subscription) => {
      if (disposed) subscription.remove();
      else subscriptions.push(subscription);
    };

    const startLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (disposed) return;

        if (permission.status !== 'granted') {
          setLocationStatus('Permiso de ubicación denegado');
          return;
        }

        setLocationStatus('Buscando ubicación GPS…');
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (disposed) return;

        publishLocation(current, setLocation, setLocationUpdated);
        setLocationStatus('Ubicación activa');

        const positionSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 5,
          },
          (nextLocation) => {
            if (disposed) return;
            publishLocation(nextLocation, setLocation, setLocationUpdated);
            setLocationStatus('Ubicación activa');
          }
        );
        registerSubscription(positionSubscription);

        const headingSubscription = await Location.watchHeadingAsync(
          (data) => {
            if (!disposed) publishHeading(data, headingRef, setHeading);
          },
          (message) => {
            if (!disposed) publishHeadingError(message, headingRef, setHeading);
          }
        );
        registerSubscription(headingSubscription);
      } catch (error) {
        if (!disposed) {
          setLocationStatus(
            `Error de ubicación: ${error.message || 'desconocido'}`
          );
        }
      }
    };

    const startMotion = async (available) => {
      if (!available) {
        updateSensorStatus(setSensorStatus, 'motion', 'no disponible');
        return;
      }

      const granted = await requestMotionPermission();
      if (disposed) return;
      if (!granted) {
        updateSensorStatus(setSensorStatus, 'motion', 'permiso denegado');
        return;
      }

      DeviceMotion.setUpdateInterval(SENSOR_INTERVAL);
      const subscription = DeviceMotion.addListener((measurement) => {
        const accelerationWithGravity = vectorFromMeasurement(
          measurement.accelerationIncludingGravity
        );
        const userAcceleration = vectorFromMeasurement(
          measurement.acceleration
        );

        if (accelerationWithGravity) {
          const gravity = userAcceleration
            ? subtract(accelerationWithGravity, userAcceleration)
            : accelerationWithGravity;
          gravityRef.current = smoothVector(
            gravityRef.current,
            gravity,
            GRAVITY_SMOOTHING
          );
        }

        sensorOrientationRef.current = measurement.orientation;
        const nextOrientation = getScreenOrientation(
          sensorOrientationRef.current,
          dimensionsRef.current.width,
          dimensionsRef.current.height,
          orientationRef.current
        );

        if (nextOrientation !== orientationRef.current) {
          orientationRef.current = nextOrientation;
          setOrientation(nextOrientation);
        }

        if (!motionActive) {
          motionActive = true;
          updateSensorStatus(setSensorStatus, 'motion', 'activo');
        }
      });
      registerSubscription(subscription);
    };

    const startMagnetometer = async (available) => {
      if (!available) {
        updateSensorStatus(setSensorStatus, 'magnetometer', 'no disponible');
        return;
      }

      const granted = await requestMagnetometerPermission();
      if (disposed) return;
      if (!granted) {
        updateSensorStatus(
          setSensorStatus,
          'magnetometer',
          'permiso denegado'
        );
        return;
      }

      Magnetometer.setUpdateInterval(SENSOR_INTERVAL);
      const subscription = Magnetometer.addListener((measurement) => {
        const raw = vectorFromMeasurement(measurement);
        if (!raw) return;

        if (calibratingRef.current) calibrationSamplesRef.current.push(raw);

        const offset = magnetometerOffsetRef.current;
        const corrected = subtract(raw, offset);
        magneticRef.current = smoothVector(
          magneticRef.current,
          corrected,
          MAGNETIC_SMOOTHING
        );
        if (!magnetometerActive) {
          magnetometerActive = true;
          updateSensorStatus(setSensorStatus, 'magnetometer', 'activo');
        }
      });
      registerSubscription(subscription);
    };

    const startSensors = async () => {
      try {
        const [motionAvailable, magnetometerAvailable] = await Promise.all([
          DeviceMotion.isAvailableAsync(),
          Magnetometer.isAvailableAsync(),
        ]);
        if (disposed) return;

        await startMotion(motionAvailable);
        if (!disposed) await startMagnetometer(magnetometerAvailable);
      } catch (error) {
        if (!disposed) {
          const message = `error: ${error.message || 'sensor'}`;
          setSensorStatus((current) => ({
            motion: current.motion === 'activo' ? 'activo' : message,
            magnetometer:
              current.magnetometer === 'activo' ? 'activo' : message,
          }));
        }
      }
    };

    const startServices = async () => {
      if (Platform.OS === 'ios') {
        // En iOS, DeviceMotion puede mostrar su propio diálogo. Los permisos se
        // solicitan en secuencia para evitar que dos diálogos nativos coincidan.
        await startLocation();
        if (!disposed) await startSensors();
        return;
      }

      // En Android los sensores no requieren un diálogo propio. No deben quedar
      // bloqueados por getCurrentPositionAsync, que puede tardar mucho si el GPS
      // todavía no tiene una posición válida en una compilación independiente.
      await Promise.all([startLocation(), startSensors()]);
    };

    void startServices();

    return () => {
      disposed = true;
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [enabled, retryKey]);

  const recalibrate = useCallback(() => {
    if (calibratingRef.current) return;

    calibrationSamplesRef.current = [];
    calibratingRef.current = true;
    setCalibrationHint(true);
    setCalibrationMessage('Calibrando durante 8 segundos…');
    magneticRef.current = null;
    frameRef.current = null;
    setOrientationReady(false);

    if (calibrationTimerRef.current) {
      clearTimeout(calibrationTimerRef.current);
    }
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);

    calibrationTimerRef.current = setTimeout(() => {
      calibratingRef.current = false;
      const samples = calibrationSamplesRef.current;
      setCalibrationHint(false);

      if (samples.length < 30) {
        setCalibrationMessage('No se recogieron suficientes datos.');
        return;
      }

      magnetometerOffsetRef.current = calculateOffset(samples);
      magneticRef.current = null;
      frameRef.current = null;
      setCalibrationMessage(
        `Calibración completada con ${samples.length} muestras.`
      );
      messageTimerRef.current = setTimeout(
        () => setCalibrationMessage(null),
        4000
      );
    }, CALIBRATION_DURATION);
  }, []);

  return {
    location,
    locationStatus,
    locationUpdated,
    heading,
    sensorStatus,
    orientation,
    orientationReady,
    setOrientationReady,
    calibrationHint,
    calibrationMessage,
    recalibrate,
    gravityRef,
    magneticRef,
    headingRef,
    frameRef,
    orientationRef,
  };
}

function publishLocation(position, setLocation, setUpdatedAt) {
  setLocation(position);
  setUpdatedAt(new Date(position.timestamp || Date.now()));
}

function publishHeading(data, headingRef, setHeading) {
  const hasTrueNorth =
    Number.isFinite(data.trueHeading) && data.trueHeading >= 0;
  const hasMagneticNorth =
    Number.isFinite(data.magHeading) && data.magHeading >= 0;
  const mode = hasTrueNorth ? 'verdadero' : 'magnético';

  headingRef.current = {
    correction:
      hasTrueNorth && hasMagneticNorth
        ? data.trueHeading - data.magHeading
        : 0,
    mode,
  };
  setHeading({
    degrees: hasTrueNorth
      ? data.trueHeading
      : hasMagneticNorth
        ? data.magHeading
        : null,
    accuracy: Number.isFinite(data.accuracy) ? data.accuracy : null,
    mode,
    error: null,
  });
}

function publishHeadingError(message, headingRef, setHeading) {
  headingRef.current = { correction: 0, mode: 'magnético' };
  setHeading((current) => ({
    ...current,
    mode: 'magnético',
    error: message,
  }));
}

function updateSensorStatus(setStatus, sensor, value) {
  setStatus((current) =>
    current[sensor] === value ? current : { ...current, [sensor]: value }
  );
}

async function requestMotionPermission() {
  if (
    Platform.OS !== 'ios' ||
    typeof DeviceMotion.requestPermissionsAsync !== 'function'
  ) {
    return true;
  }

  const permission = await DeviceMotion.requestPermissionsAsync();
  return permission.status === 'granted';
}

async function requestMagnetometerPermission() {
  if (typeof Magnetometer.requestPermissionsAsync !== 'function') return true;

  const permission = await Magnetometer.requestPermissionsAsync();
  return permission.status === 'granted';
}

function calculateOffset(samples) {
  return [0, 1, 2].map((axis) => {
    const values = samples.map((sample) => sample[axis]);
    return (Math.max(...values) + Math.min(...values)) / 2;
  });
}
