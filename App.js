import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { DeviceMotion, Magnetometer } from 'expo-sensors';
import * as Astronomy from 'astronomy-engine';
import { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const DEG = Math.PI / 180;
const SENSOR_INTERVAL = 50;
const VECTOR_EPSILON = 1e-6;
const CALIBRATION_DURATION = 8000;

const BODIES = [
  { id: 'Mercury', name: 'Mercurio', color: '#c9c3b7' },
  { id: 'Venus', name: 'Venus', color: '#ffe1a1' },
  { id: 'Mars', name: 'Marte', color: '#ff765e' },
  { id: 'Jupiter', name: 'Júpiter', color: '#e7c39f' },
  { id: 'Saturn', name: 'Saturno', color: '#f4dc87' },
  { id: 'Uranus', name: 'Urano', color: '#9ce5e8' },
  { id: 'Neptune', name: 'Neptuno', color: '#719cff' },
  { id: 'Sun', name: 'Sol', color: '#ffd43b' },
  { id: 'Moon', name: 'Luna', color: '#f2f4ff' },
];

const DEFAULT_PROFILES = {
  portrait: { horizontalFov: 50, verticalFov: 65, horizontalOffset: 0, verticalOffset: 0 },
  landscape: { horizontalFov: 65, verticalFov: 50, horizontalOffset: 0, verticalOffset: 0 },
};

const INITIAL_CELESTIAL = BODIES.map((body) => ({
  ...body,
  azimuth: null,
  altitude: null,
}));

function isFiniteVector(vector) {
  return vector && vector.length === 3 && vector.every(Number.isFinite);
}

function normalize(vector) {
  if (!isFiniteVector(vector)) return null;
  const magnitude = Math.hypot(vector[0], vector[1], vector[2]);
  if (magnitude < VECTOR_EPSILON) return null;
  return vector.map((component) => component / magnitude);
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function scale(vector, factor) {
  return vector.map((component) => component * factor);
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function smoothVector(previous, sample, factor = 0.16) {
  if (!isFiniteVector(sample)) return previous;
  if (!previous) return [...sample];
  return previous.map(
    (component, index) => component + factor * (sample[index] - component)
  );
}

function buildOrientationFrame(gravity, magneticField, trueNorthCorrection) {
  if (!isFiniteVector(gravity) || !isFiniteVector(magneticField)) {
    return null;
  }

  // La gravedad apunta hacia abajo, por eso la invertimos para obtener UP.
  const up = normalize(scale(gravity, -1));
  const magnetic = normalize(magneticField);

  if (!up || !magnetic) return null;

  // Quitamos la componente vertical del campo magnético.
  const magneticNorth = normalize(
    subtract(magnetic, scale(up, dot(magnetic, up)))
  );

  if (!magneticNorth) return null;

  // EAST = UP × NORTH
  const magneticEast = normalize(cross(up, magneticNorth));
  if (!magneticEast) return null;

  // Corrección de norte magnético a norte verdadero.
  const correction = Number.isFinite(trueNorthCorrection)
    ? trueNorthCorrection * DEG
    : 0;

  const north = normalize(
    add(
      scale(magneticNorth, Math.cos(correction)),
      scale(magneticEast, Math.sin(correction))
    )
  );

  if (!north) return null;

  const east = normalize(cross(up, north));
  if (!east) return null;

  return { east, north, up };
}

function getScreenOrientation(sensorOrientation, width, height, previous) {
  if (sensorOrientation === 90) return 'landscapeRight';
  if (sensorOrientation === -90 || sensorOrientation === 270) return 'landscapeLeft';
  if (sensorOrientation === 180) return 'portraitUpsideDown';
  if (sensorOrientation === 0) return 'portrait';
  if (previous) return previous;
  return width > height ? 'landscapeLeft' : 'portrait';
}

function getCameraAxes(orientation) {
  switch (orientation) {
    case 'portraitUpsideDown':
      return {
        right: [-1, 0, 0],
        up: [0, -1, 0],
        forward: [0, 0, -1],
      };

    case 'landscapeRight':
      return {
        right: [0, 1, 0],
        up: [-1, 0, 0],
        forward: [0, 0, -1],
      };

    case 'landscapeLeft':
      return {
        right: [0, -1, 0],
        up: [1, 0, 0],
        forward: [0, 0, -1],
      };

    default:
      return {
        right: [1, 0, 0],
        up: [0, 1, 0],
        forward: [0, 0, -1],
      };
  }
}

function horizontalToWorld(azimuth, altitude) {
  const az = azimuth * DEG;
  const alt = altitude * DEG;
  const horizontal = Math.cos(alt);

  return [
    horizontal * Math.sin(az),
    horizontal * Math.cos(az),
    Math.sin(alt),
  ];
}

function projectBody(body, frame, orientation, profile, width, height) {
  if (
    !frame ||
    !Number.isFinite(body.azimuth) ||
    !Number.isFinite(body.altitude) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  const world = horizontalToWorld(body.azimuth, body.altitude);

  const device = add(
    add(
      scale(frame.east, world[0]),
      scale(frame.north, world[1])
    ),
    scale(frame.up, world[2])
  );

  const camera = getCameraAxes(orientation);

  const xCamera = dot(device, camera.right);
  const yCamera = dot(device, camera.up);
  const zCamera = dot(device, camera.forward);

  if (!Number.isFinite(zCamera) || zCamera <= VECTOR_EPSILON) {
    return null;
  }

  const horizontalAngle =
    Math.atan2(xCamera, zCamera) -
    profile.horizontalOffset * DEG;

  const verticalAngle =
    Math.atan2(yCamera, zCamera) -
    profile.verticalOffset * DEG;

  const horizontalScale = Math.tan(
    (profile.horizontalFov * DEG) / 2
  );

  const verticalScale = Math.tan(
    (profile.verticalFov * DEG) / 2
  );

  if (
    Math.abs(horizontalScale) < VECTOR_EPSILON ||
    Math.abs(verticalScale) < VECTOR_EPSILON
  ) {
    return null;
  }

  const x =
    width / 2 +
    (Math.tan(horizontalAngle) / horizontalScale) *
    (width / 2);

  const y =
    height / 2 -
    (Math.tan(verticalAngle) / verticalScale) *
    (height / 2);

  const margin = 48;

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  if (
    x < -margin ||
    x > width + margin ||
    y < -margin ||
    y > height + margin
  ) {
    return null;
  }

  return {
    ...body,
    x,
    y,
  };
}

function formatTime(date) {
  return date
    ? date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';
}

function compassQuality(accuracy) {
  if (!Number.isFinite(accuracy)) return 'desconocida';
  if (accuracy >= 3) return 'alta';
  if (accuracy === 2) return 'media';
  if (accuracy === 1) return 'baja';
  return 'sin calibrar';
}

function orientationLabel(orientation) {
  const labels = {
    portrait: 'retrato',
    portraitUpsideDown: 'retrato invertido',
    landscapeLeft: 'paisaje izquierdo',
    landscapeRight: 'paisaje derecho',
  };

  return labels[orientation] || 'desconocida';
}

function ControlRow({
  label,
  value,
  suffix,
  onDecrease,
  onIncrease,
}) {
  return (
    <View style={styles.controlRow}>
      <Text style={styles.controlLabel}>{label}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={onDecrease}
        style={styles.adjustButton}
      >
        <Text style={styles.adjustButtonText}>−</Text>
      </Pressable>

      <Text style={styles.controlValue}>
        {value.toFixed(1)}{suffix}
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={onIncrease}
        style={styles.adjustButton}
      >
        <Text style={styles.adjustButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  const { width, height } = useWindowDimensions();

  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  const [cameraStatus, setCameraStatus] = useState({
    state: 'loading',
    message: null,
  });

  const [cameraRequestSettled, setCameraRequestSettled] =
    useState(false);

  const [appState, setAppState] =
    useState(AppState.currentState);

  const [retryKey, setRetryKey] =
    useState(0);

  const [location, setLocation] =
    useState(null);

  const [locationStatus, setLocationStatus] =
    useState('Solicitando permiso…');

  const [locationUpdated, setLocationUpdated] =
    useState(null);

  const [heading, setHeading] = useState({
    degrees: null,
    accuracy: null,
    mode: 'magnético',
    error: null,
  });

  const [sensorStatus, setSensorStatus] = useState({
    motion: 'comprobando',
    magnetometer: 'comprobando',
  });

  const [celestial, setCelestial] =
    useState(INITIAL_CELESTIAL);

  const [ephemerisUpdated, setEphemerisUpdated] =
    useState(null);

  const [ephemerisError, setEphemerisError] =
    useState(null);

  const [screenOrientation, setScreenOrientation] =
    useState(width > height ? 'landscapeLeft' : 'portrait');

  const [projectedBodies, setProjectedBodies] =
    useState([]);

  const [orientationReady, setOrientationReady] =
    useState(false);

  const [panelOpen, setPanelOpen] =
    useState(false);

  const [calibrationOpen, setCalibrationOpen] =
    useState(false);

  const [calibrationHint, setCalibrationHint] =
    useState(false);

  const [calibrationMessage, setCalibrationMessage] =
    useState(null);

  const [profiles, setProfiles] =
    useState(DEFAULT_PROFILES);

  const gravityRef = useRef(null);
  const magneticRef = useRef(null);

  const headingRef = useRef({
    correction: 0,
    mode: 'magnético',
  });

  const frameRef = useRef(null);

  const orientationRef =
    useRef(screenOrientation);

  const bodiesRef =
    useRef(celestial);

  const profilesRef =
    useRef(profiles);

  const dimensionsRef = useRef({
    width,
    height,
  });

  const calibrationTimerRef =
    useRef(null);

  const cameraAttemptRef =
    useRef(-1);

  // Datos para calibración real del magnetómetro.
  const calibrationSamplesRef =
    useRef([]);

  const magnetometerOffsetRef =
    useRef([0, 0, 0]);

  const calibratingRef =
    useRef(false);

  const profileName =
    screenOrientation.startsWith('landscape')
      ? 'landscape'
      : 'portrait';

  const activeProfile =
    profiles[profileName];

  const sun =
    celestial.find((body) => body.id === 'Sun');

  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        'change',
        setAppState
      );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    dimensionsRef.current = {
      width,
      height,
    };

    if (
      (width > height) !==
      orientationRef.current.startsWith('landscape')
    ) {
      const next =
        width > height
          ? 'landscapeLeft'
          : 'portrait';

      orientationRef.current = next;
      setScreenOrientation(next);
    }
  }, [width, height]);

  useEffect(() => {
    bodiesRef.current = celestial;
  }, [celestial]);

  useEffect(() => {
    profilesRef.current = profiles;
  }, [profiles]);

  useEffect(() => {
    return () => {
      if (calibrationTimerRef.current) {
        clearTimeout(calibrationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      !cameraPermission ||
      cameraAttemptRef.current === retryKey
    ) {
      return;
    }

    if (
      cameraPermission.granted ||
      cameraPermission.canAskAgain === false
    ) {
      cameraAttemptRef.current = retryKey;
      setCameraRequestSettled(true);
      return;
    }

    cameraAttemptRef.current = retryKey;

    requestCameraPermission()
      .catch((error) => {
        setCameraStatus({
          state: 'error',
          message: error.message || 'permiso',
        });
      })
      .finally(() => {
        setCameraRequestSettled(true);
      });
  }, [
    cameraPermission,
    requestCameraPermission,
    retryKey,
  ]);

  useEffect(() => {
    if (
      appState !== 'active' ||
      !cameraRequestSettled
    ) {
      return undefined;
    }

    let disposed = false;
    const subscriptions = [];

    async function startLocation() {
      try {
        setLocationStatus('Solicitando permiso…');

        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (disposed) return;

        if (permission.status !== 'granted') {
          setLocationStatus(
            'Permiso de ubicación denegado'
          );
          return;
        }

        setLocationStatus(
          'Buscando ubicación GPS…'
        );

        const current =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        if (!disposed) {
          setLocation(current);

          setLocationUpdated(
            new Date(
              current.timestamp || Date.now()
            )
          );

          setLocationStatus(
            'Ubicación activa'
          );
        }

        const positionSubscription =
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 5,
            },
            (nextLocation) => {
              if (disposed) return;

              setLocation(nextLocation);

              setLocationUpdated(
                new Date(
                  nextLocation.timestamp || Date.now()
                )
              );

              setLocationStatus(
                'Ubicación activa'
              );
            }
          );

        if (disposed) {
          positionSubscription.remove();
        } else {
          subscriptions.push(
            positionSubscription
          );
        }

        const headingSubscription =
          await Location.watchHeadingAsync(
            (data) => {
              if (disposed) return;

              const hasTrueNorth =
                Number.isFinite(data.trueHeading) &&
                data.trueHeading >= 0;

              const hasMagneticNorth =
                Number.isFinite(data.magHeading) &&
                data.magHeading >= 0;

              const degrees =
                hasTrueNorth
                  ? data.trueHeading
                  : hasMagneticNorth
                    ? data.magHeading
                    : null;

              headingRef.current = {
                correction:
                  hasTrueNorth &&
                  hasMagneticNorth
                    ? data.trueHeading - data.magHeading
                    : 0,

                mode:
                  hasTrueNorth
                    ? 'verdadero'
                    : 'magnético',
              };

              setHeading({
                degrees,

                accuracy:
                  Number.isFinite(data.accuracy)
                    ? data.accuracy
                    : null,

                mode:
                  hasTrueNorth
                    ? 'verdadero'
                    : 'magnético',

                error: null,
              });
            },
            (message) => {
              if (disposed) return;

              headingRef.current = {
                correction: 0,
                mode: 'magnético',
              };

              setHeading((current) => ({
                ...current,
                mode: 'magnético',
                error: message,
              }));
            }
          );

        if (disposed) {
          headingSubscription.remove();
        } else {
          subscriptions.push(
            headingSubscription
          );
        }
      } catch (error) {
        if (!disposed) {
          setLocationStatus(
            `Error de ubicación: ${
              error.message || 'desconocido'
            }`
          );
        }
      }
    }

    async function startSensors() {
      try {
        const [
          motionAvailable,
          magnetometerAvailable,
        ] = await Promise.all([
          DeviceMotion.isAvailableAsync(),
          Magnetometer.isAvailableAsync(),
        ]);

        if (disposed) return;

        // SENSOR DE MOVIMIENTO
        if (!motionAvailable) {
          setSensorStatus((current) => ({
            ...current,
            motion: 'no disponible',
          }));
        } else {
          let granted = true;

          if (
            Platform.OS === 'ios' &&
            typeof DeviceMotion.requestPermissionsAsync ===
              'function'
          ) {
            const permission =
              await DeviceMotion.requestPermissionsAsync();

            granted =
              permission.status === 'granted';
          }

          if (granted && !disposed) {
            DeviceMotion.setUpdateInterval(
              SENSOR_INTERVAL
            );

            const subscription =
              DeviceMotion.addListener(
                (measurement) => {
                  const gravity =
                    measurement.accelerationIncludingGravity;

                  if (gravity) {
                    gravityRef.current =
                      smoothVector(
                        gravityRef.current,
                        [
                          gravity.x,
                          gravity.y,
                          gravity.z,
                        ]
                      );
                  }

                  const nextOrientation =
                    getScreenOrientation(
                      measurement.orientation,
                      dimensionsRef.current.width,
                      dimensionsRef.current.height,
                      orientationRef.current
                    );

                  if (
                    nextOrientation !==
                    orientationRef.current
                  ) {
                    orientationRef.current =
                      nextOrientation;

                    setScreenOrientation(
                      nextOrientation
                    );
                  }

                  setSensorStatus((current) =>
                    current.motion === 'activo'
                      ? current
                      : {
                          ...current,
                          motion: 'activo',
                        }
                  );
                }
              );

            subscriptions.push(subscription);
          } else if (!disposed) {
            setSensorStatus((current) => ({
              ...current,
              motion: 'permiso denegado',
            }));
          }
        }

        // MAGNETÓMETRO
        if (!magnetometerAvailable) {
          setSensorStatus((current) => ({
            ...current,
            magnetometer: 'no disponible',
          }));
        } else {
          let granted = true;

          if (
            typeof Magnetometer.requestPermissionsAsync ===
            'function'
          ) {
            const permission =
              await Magnetometer.requestPermissionsAsync();

            granted =
              permission.status === 'granted';
          }

          if (granted && !disposed) {
            Magnetometer.setUpdateInterval(
              SENSOR_INTERVAL
            );

            const subscription =
              Magnetometer.addListener(
                (measurement) => {
                  const raw = [
                    measurement.x,
                    measurement.y,
                    measurement.z,
                  ];

                  // Durante la calibración guardamos muestras.
                  if (calibratingRef.current) {
                    calibrationSamplesRef.current.push(
                      raw
                    );
                  }

                  // Aplicamos el offset calculado.
                  const offset =
                    magnetometerOffsetRef.current;

                  const corrected = [
                    raw[0] - offset[0],
                    raw[1] - offset[1],
                    raw[2] - offset[2],
                  ];

                  magneticRef.current =
                    smoothVector(
                      magneticRef.current,
                      corrected
                    );

                  setSensorStatus((current) =>
                    current.magnetometer === 'activo'
                      ? current
                      : {
                          ...current,
                          magnetometer: 'activo',
                        }
                  );
                }
              );

            subscriptions.push(subscription);
          } else if (!disposed) {
            setSensorStatus((current) => ({
              ...current,
              magnetometer: 'permiso denegado',
            }));
          }
        }
      } catch (error) {
        if (!disposed) {
          const message =
            `error: ${
              error.message || 'sensor'
            }`;

          setSensorStatus((current) => ({
            motion:
              current.motion === 'activo'
                ? 'activo'
                : message,

            magnetometer:
              current.magnetometer === 'activo'
                ? 'activo'
                : message,
          }));
        }
      }
    }

    async function startServices() {
      await startLocation();

      if (!disposed) {
        await startSensors();
      }
    }

    startServices();

    return () => {
      disposed = true;

      subscriptions.forEach(
        (subscription) =>
          subscription.remove()
      );
    };
  }, [
    appState,
    cameraRequestSettled,
    retryKey,
  ]);

  // CÁLCULO DE PLANETAS Y OBJETOS CELESTES
  useEffect(() => {
    if (
      appState !== 'active' ||
      !location
    ) {
      return undefined;
    }

    const calculateBodies = () => {
      try {
        const {
          latitude,
          longitude,
          altitude,
        } = location.coords;

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          throw new Error(
            'coordenadas GPS no válidas'
          );
        }

        const observer =
          new Astronomy.Observer(
            latitude,
            longitude,
            Number.isFinite(altitude)
              ? altitude
              : 0
          );

        const now = new Date();

        const result =
          BODIES.map((body) => {
            const equator =
              Astronomy.Equator(
                body.id,
                now,
                observer,
                true,
                true
              );

            const horizontal =
              Astronomy.Horizon(
                now,
                observer,
                equator.ra,
                equator.dec,
                'normal'
              );

            return {
              ...body,

              azimuth:
                Number.isFinite(horizontal.azimuth)
                  ? horizontal.azimuth
                  : null,

              altitude:
                Number.isFinite(horizontal.altitude)
                  ? horizontal.altitude
                  : null,
            };
          });

        bodiesRef.current = result;

        setCelestial(result);

        setEphemerisUpdated(now);

        setEphemerisError(null);
      } catch (error) {
        setEphemerisError(
          error.message ||
            'No se pudieron calcular las efemérides'
        );
      }
    };

    calculateBodies();

    const interval =
      setInterval(
        calculateBodies,
        1000
      );

    return () =>
      clearInterval(interval);
  }, [
    appState,
    location?.coords.latitude,
    location?.coords.longitude,
    location?.coords.altitude,
  ]);

  // PROYECCIÓN DE LOS OBJETOS EN LA CÁMARA
  useEffect(() => {
    if (appState !== 'active') {
      setProjectedBodies([]);
      return undefined;
    }

    const updateProjection = () => {
      const candidate =
        buildOrientationFrame(
          gravityRef.current,
          magneticRef.current,
          headingRef.current.correction
        );

      if (candidate) {
        frameRef.current = candidate;
      }

      const frame = frameRef.current;

      setOrientationReady(
        Boolean(frame)
      );

      if (!frame) {
        setProjectedBodies([]);
        return;
      }

      const currentOrientation =
        orientationRef.current;

      const currentProfileName =
        currentOrientation.startsWith('landscape')
          ? 'landscape'
          : 'portrait';

      const dimensions =
        dimensionsRef.current;

      const projected =
        bodiesRef.current
          .map((body) =>
            projectBody(
              body,
              frame,
              currentOrientation,
              profilesRef.current[
                currentProfileName
              ],
              dimensions.width,
              dimensions.height
            )
          )
          .filter(Boolean);

      setProjectedBodies(projected);
    };

    updateProjection();

    const interval =
      setInterval(
        updateProjection,
        SENSOR_INTERVAL
      );

    return () =>
      clearInterval(interval);
  }, [appState]);

  const changeProfile =
    (field, delta) => {
      setProfiles((current) => {
        const currentProfile =
          current[profileName];

        const isFov =
          field === 'horizontalFov' ||
          field === 'verticalFov';

        const minimum =
          isFov ? 30 : -20;

        const maximum =
          isFov ? 100 : 20;

        const nextValue =
          Math.max(
            minimum,
            Math.min(
              maximum,
              currentProfile[field] + delta
            )
          );

        return {
          ...current,

          [profileName]: {
            ...currentProfile,
            [field]: nextValue,
          },
        };
      });
    };

  // CALIBRACIÓN REAL DEL MAGNETÓMETRO
  const recalibrate = () => {
    if (calibratingRef.current) {
      return;
    }

    calibrationSamplesRef.current = [];

    calibratingRef.current = true;

    setCalibrationHint(true);

    setCalibrationMessage(
      'Calibrando durante 8 segundos...'
    );

    magneticRef.current = null;
    frameRef.current = null;

    setOrientationReady(false);

    setProjectedBodies([]);

    if (calibrationTimerRef.current) {
      clearTimeout(
        calibrationTimerRef.current
      );
    }

    calibrationTimerRef.current =
      setTimeout(() => {
        calibratingRef.current = false;

        const samples =
          calibrationSamplesRef.current;

        if (samples.length < 30) {
          setCalibrationHint(false);

          setCalibrationMessage(
            'No se recogieron suficientes datos.'
          );

          return;
        }

        const xs =
          samples.map(
            (sample) => sample[0]
          );

        const ys =
          samples.map(
            (sample) => sample[1]
          );

        const zs =
          samples.map(
            (sample) => sample[2]
          );

        // Calculamos el offset de cada eje.
        const offsetX =
          (Math.max(...xs) + Math.min(...xs)) / 2;

        const offsetY =
          (Math.max(...ys) + Math.min(...ys)) / 2;

        const offsetZ =
          (Math.max(...zs) + Math.min(...zs)) / 2;

        magnetometerOffsetRef.current = [
          offsetX,
          offsetY,
          offsetZ,
        ];

        // Reiniciamos las mediciones usando
        // la nueva calibración.
        magneticRef.current = null;
        frameRef.current = null;

        setCalibrationHint(false);

        setCalibrationMessage(
          `Calibración completada con ${samples.length} muestras.`
        );

        setTimeout(() => {
          setCalibrationMessage(null);
        }, 4000);
      }, CALIBRATION_DURATION);
  };

  const retry = () => {
    setLocationStatus('Reintentando…');

    setSensorStatus({
      motion: 'comprobando',
      magnetometer: 'comprobando',
    });

    setCameraStatus({
      state: 'loading',
      message: null,
    });

    setCameraRequestSettled(false);

    cameraAttemptRef.current = -1;

    setRetryKey(
      (current) => current + 1
    );
  };

  const cameraGranted =
    cameraPermission?.granted;

  const cameraMessage =
    !cameraPermission
      ? 'Comprobando permiso de cámara…'
      : cameraPermission.granted
        ? null
        : 'Se necesita permiso para usar la cámara trasera.';

  const hasBlockingError =
    cameraPermission?.granted === false ||
    locationStatus.includes('denegado') ||
    locationStatus.startsWith('Error') ||
    sensorStatus.motion.includes('no disponible') ||
    sensorStatus.motion.includes('denegado') ||
    sensorStatus.magnetometer.includes('no disponible') ||
    sensorStatus.magnetometer.includes('denegado') ||
    sensorStatus.motion.startsWith('error') ||
    sensorStatus.magnetometer.startsWith('error') ||
    cameraStatus.state === 'error';

  return (
    <View style={styles.container}>
      {cameraGranted && appState === 'active' ? (
        <CameraView
          key={`camera-${retryKey}`}
          style={StyleSheet.absoluteFill}
          facing="back"
          onCameraReady={() =>
            setCameraStatus({
              state: 'ready',
              message: null,
            })
          }
          onMountError={(event) =>
            setCameraStatus({
              state: 'error',
              message: event.message,
            })
          }
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.cameraPlaceholder,
          ]}
        >
          <Text
            style={
              styles.cameraPlaceholderText
            }
          >
            {appState !== 'active'
              ? 'Cámara en pausa'
              : cameraMessage ||
                'Iniciando cámara…'}
          </Text>
        </View>
      )}

      {/* OBJETOS CELESTES */}
      <View
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        {projectedBodies.map((body) => (
          <View
            key={body.id}
            style={[
              styles.bodyMarker,
              {
                left: body.x - 38,
                top: body.y - 16,
              },
            ]}
          >
            <View
              style={[
                styles.bodyDot,
                {
                  backgroundColor:
                    body.color,
                },
              ]}
            />

            <Text
              style={styles.bodyName}
            >
              {body.name}
            </Text>

            <Text
              style={styles.bodyAltitude}
            >
              {body.altitude.toFixed(1)}°
            </Text>
          </View>
        ))}

        <View
          style={[
            styles.crosshairHorizontal,
            {
              left: width / 2 - 13,
              top: height / 2,
            },
          ]}
        />

        <View
          style={[
            styles.crosshairVertical,
            {
              left: width / 2,
              top: height / 2 - 13,
            },
          ]}
        />
      </View>

      {/* PANEL SUPERIOR */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>
          Mapa celeste 3D
        </Text>

        <Text
          style={styles.statusText}
          numberOfLines={1}
        >
          {locationStatus}
        </Text>

        {location && (
          <Text
            style={styles.statusText}
          >
            {location.coords.latitude.toFixed(4)},
            {' '}
            {location.coords.longitude.toFixed(4)}
            {' · '}
            {Number.isFinite(
              location.coords.altitude
            )
              ? `${location.coords.altitude.toFixed(0)} m`
              : 'altitud —'}
          </Text>
        )}

        <Text
          style={styles.statusText}
        >
          Norte {heading.mode}:{' '}
          {Number.isFinite(heading.degrees)
            ? `${heading.degrees.toFixed(1)}°`
            : '—'}
          {' · calidad '}
          {compassQuality(
            heading.accuracy
          )}
        </Text>

        {/* DIAGNÓSTICO DEL SOL */}
        {sun &&
          Number.isFinite(sun.azimuth) && (
            <Text
              style={styles.diagnosticText}
            >
              ☀️ Sol → Az{' '}
              {sun.azimuth.toFixed(1)}°
              {' · Alt '}
              {sun.altitude.toFixed(1)}°
            </Text>
          )}

        {heading.error && (
          <Text
            style={styles.errorText}
          >
            Brújula del sistema:{' '}
            {heading.error}
          </Text>
        )}

        <Text
          style={styles.statusText}
        >
          Orientación:{' '}
          {orientationLabel(
            screenOrientation
          )}
          {' · '}
          {orientationReady
            ? 'seguimiento activo'
            : 'esperando sensores'}
        </Text>

        <Text
          style={styles.statusText}
        >
          Sensores: movimiento{' '}
          {sensorStatus.motion}
          {' · campo '}
          {sensorStatus.magnetometer}
        </Text>

        <Text
          style={styles.statusTime}
        >
          GPS {formatTime(locationUpdated)}
          {' · cielo '}
          {formatTime(ephemerisUpdated)}
        </Text>

        {cameraStatus.state === 'loading' &&
          cameraGranted && (
            <Text
              style={styles.statusTime}
            >
              Iniciando cámara…
            </Text>
          )}

        {cameraStatus.state === 'error' && (
          <Text
            style={styles.errorText}
          >
            Error de cámara:{' '}
            {cameraStatus.message ||
              'desconocido'}
          </Text>
        )}

        {ephemerisError && (
          <Text
            style={styles.errorText}
          >
            {ephemerisError}
          </Text>
        )}

        {calibrationHint && (
          <Text
            style={styles.hintText}
          >
            ♾️ Mueve el móvil haciendo
            ochos y gíralo en varias
            direcciones.
          </Text>
        )}

        {calibrationMessage && (
          <Text
            style={styles.hintText}
          >
            {calibrationMessage}
          </Text>
        )}

        {(hasBlockingError ||
          !cameraPermission) && (
          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={styles.retryButton}
          >
            <Text
              style={styles.retryButtonText}
            >
              Reintentar permisos y sensores
            </Text>
          </Pressable>
        )}
      </View>

      {/* PARTE INFERIOR */}
      <View style={styles.bottomArea}>
        {calibrationOpen && (
          <View
            style={styles.calibrationPanel}
          >
            <Text
              style={styles.panelHeading}
            >
              Calibración ·{' '}
              {profileName === 'portrait'
                ? 'retrato'
                : 'paisaje'}
            </Text>

            <ControlRow
              label="FOV horizontal"
              value={
                activeProfile.horizontalFov
              }
              suffix="°"
              onDecrease={() =>
                changeProfile(
                  'horizontalFov',
                  -1
                )
              }
              onIncrease={() =>
                changeProfile(
                  'horizontalFov',
                  1
                )
              }
            />

            <ControlRow
              label="FOV vertical"
              value={
                activeProfile.verticalFov
              }
              suffix="°"
              onDecrease={() =>
                changeProfile(
                  'verticalFov',
                  -1
                )
              }
              onIncrease={() =>
                changeProfile(
                  'verticalFov',
                  1
                )
              }
            />

            <ControlRow
              label="Desfase horizontal"
              value={
                activeProfile.horizontalOffset
              }
              suffix="°"
              onDecrease={() =>
                changeProfile(
                  'horizontalOffset',
                  -0.5
                )
              }
              onIncrease={() =>
                changeProfile(
                  'horizontalOffset',
                  0.5
                )
              }
            />

            <ControlRow
              label="Desfase vertical"
              value={
                activeProfile.verticalOffset
              }
              suffix="°"
              onDecrease={() =>
                changeProfile(
                  'verticalOffset',
                  -0.5
                )
              }
              onIncrease={() =>
                changeProfile(
                  'verticalOffset',
                  0.5
                )
              }
            />

            <Pressable
              accessibilityRole="button"
              onPress={recalibrate}
              style={
                styles.recalibrateButton
              }
            >
              <Text
                style={
                  styles.recalibrateText
                }
              >
                Recalibrar brújula
              </Text>
            </Pressable>
          </View>
        )}

        {panelOpen && (
          <View
            style={styles.objectsPanel}
          >
            <Text
              style={styles.panelHeading}
            >
              Objetos celestes
            </Text>

            <ScrollView
              style={styles.objectsScroll}
              nestedScrollEnabled
            >
              {celestial.map((body) => (
                <View
                  key={body.id}
                  style={styles.objectRow}
                >
                  <View
                    style={[
                      styles.listDot,
                      {
                        backgroundColor:
                          body.color,
                      },
                    ]}
                  />

                  <Text
                    style={styles.objectName}
                  >
                    {body.name}
                  </Text>

                  <Text
                    style={styles.objectData}
                  >
                    {Number.isFinite(
                      body.azimuth
                    ) &&
                    Number.isFinite(
                      body.altitude
                    )
                      ? `Az ${body.azimuth.toFixed(1)}° · Alt ${body.altitude.toFixed(1)}° · ${
                          body.altitude >= 0
                            ? 'sobre'
                            : 'bajo'
                        } el horizonte`
                      : 'Esperando efemérides…'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.toolbar}>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              setPanelOpen(
                (open) => !open
              )
            }
            style={[
              styles.toolbarButton,
              panelOpen &&
                styles.toolbarButtonActive,
            ]}
          >
            <Text
              style={styles.toolbarText}
            >
              {panelOpen
                ? 'Ocultar objetos'
                : 'Ver 9 objetos'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              setCalibrationOpen(
                (open) => !open
              )
            }
            style={[
              styles.toolbarButton,
              calibrationOpen &&
                styles.toolbarButtonActive,
            ]}
          >
            <Text
              style={styles.toolbarText}
            >
              {calibrationOpen
                ? 'Cerrar ajuste'
                : 'Calibrar'}
            </Text>
          </Pressable>
        </View>
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030713',
  },

  cameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#080d1a',
  },

  cameraPlaceholderText: {
    color: '#cbd5e1',
    fontSize: 15,
    paddingHorizontal: 30,
    textAlign: 'center',
  },

  statusCard: {
    position: 'absolute',
    top: 42,
    left: 12,
    right: 12,
    maxWidth: 430,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(3, 8, 20, 0.76)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },

  statusTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },

  statusText: {
    color: '#eef2ff',
    fontSize: 12,
    lineHeight: 17,
  },

  diagnosticText: {
    color: '#fde68a',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },

  statusTime: {
    color: '#a5b4c8',
    fontSize: 11,
    marginTop: 2,
  },

  errorText: {
    color: '#fecaca',
    fontSize: 12,
    marginTop: 5,
  },

  hintText: {
    color: '#fde68a',
    fontSize: 12,
    marginTop: 6,
  },

  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#334155',
    borderRadius: 7,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  bodyMarker: {
    position: 'absolute',
    width: 76,
    alignItems: 'center',
  },

  bodyDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#fff',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 7,
  },

  bodyName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: '#000',
    textShadowRadius: 3,
  },

  bodyAltitude: {
    color: '#e2e8f0',
    fontSize: 10,
    textShadowColor: '#000',
    textShadowRadius: 3,
  },

  crosshairHorizontal: {
    position: 'absolute',
    width: 26,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  bottomArea: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 22,
  },

  toolbar: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },

  toolbarButton: {
    minWidth: 128,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  toolbarButtonActive: {
    backgroundColor: 'rgba(30, 64, 175, 0.92)',
  },

  toolbarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  objectsPanel: {
    maxHeight: 310,
    backgroundColor: 'rgba(3, 8, 20, 0.92)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    padding: 11,
  },

  objectsScroll: {
    maxHeight: 265,
  },

  panelHeading: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
  },

  objectRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },

  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  objectName: {
    width: 70,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  objectData: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 11,
  },

  calibrationPanel: {
    backgroundColor: 'rgba(3, 8, 20, 0.92)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    padding: 11,
  },

  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
  },

  controlLabel: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 12,
  },

  controlValue: {
    width: 55,
    color: '#fff',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },

  adjustButton: {
    width: 34,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    borderRadius: 7,
  },

  adjustButtonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 22,
  },

  recalibrateButton: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    marginTop: 7,
    paddingVertical: 9,
  },

  recalibrateText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});