import { DEG } from '../constants';
import {
  cross,
  dot,
  isFiniteVector,
  normalize,
  scale,
  smoothVectorAdaptive,
  subtract,
} from './vector';

export function buildOrientationFrame(
  gravity,
  magneticField,
  trueNorthCorrection
) {
  if (!isFiniteVector(gravity) || !isFiniteVector(magneticField)) {
    return null;
  }

  const up = normalize(scale(gravity, -1));
  const magnetic = normalize(magneticField);
  if (!up || !magnetic) return null;

  const magneticNorth = normalize(
    subtract(magnetic, scale(up, dot(magnetic, up)))
  );
  if (!magneticNorth) return null;

  // Ejes del dispositivo: X derecha, Y parte superior, Z hacia el usuario.
  const magneticEast = normalize(cross(magneticNorth, up));
  if (!magneticEast) return null;

  return applyTrueNorthCorrection(
    magneticEast,
    magneticNorth,
    up,
    trueNorthCorrection
  );
}

// En Android, DeviceMotion.rotation procede del vector de rotacion nativo, que
// ya fusiona giroscopio, acelerometro y magnetometro. Reconstruimos aqui la
// matriz usada por SensorManager.getOrientation para obtener los ejes del mundo
// expresados en coordenadas del telefono.
export function buildOrientationFrameFromRotation(
  rotation,
  trueNorthCorrection
) {
  if (
    !rotation ||
    !Number.isFinite(rotation.alpha) ||
    !Number.isFinite(rotation.beta) ||
    !Number.isFinite(rotation.gamma)
  ) {
    return null;
  }

  const azimuth = -rotation.alpha;
  const pitch = -rotation.beta;
  const roll = rotation.gamma;
  const sinX = Math.sin(pitch);
  const cosX = Math.cos(pitch);
  const sinY = Math.sin(roll);
  const cosY = Math.cos(roll);
  const sinZ = Math.sin(azimuth);
  const cosZ = Math.cos(azimuth);

  // getOrientation pierde informacion cuando el telefono esta casi vertical
  // (pitch de +/-90 grados). En esa zona se usa el marco magnetico tradicional.
  if (Math.abs(cosX) < 0.15) return null;

  const magneticEast = normalize([
    cosZ * cosY - sinZ * sinX * sinY,
    sinZ * cosX,
    cosZ * sinY + sinZ * sinX * cosY,
  ]);
  const magneticNorth = normalize([
    -sinZ * cosY - cosZ * sinX * sinY,
    cosZ * cosX,
    -sinZ * sinY + cosZ * sinX * cosY,
  ]);
  const up = normalize([-cosX * sinY, -sinX, cosX * cosY]);

  if (!magneticEast || !magneticNorth || !up) return null;

  return applyTrueNorthCorrection(
    magneticEast,
    magneticNorth,
    up,
    trueNorthCorrection
  );
}

export function smoothOrientationFrame(previous, sample, smoothing) {
  if (!sample) return previous;
  if (!previous) return sample;

  const up = normalize(
    smoothVectorAdaptive(previous.up, sample.up, smoothing)
  );
  const northSample = smoothVectorAdaptive(
    previous.north,
    sample.north,
    smoothing
  );
  if (!up || !northSample) return sample;

  // El filtrado de cada eje por separado introduce un pequeno error. Se vuelve
  // a ortogonalizar el marco para que la proyeccion no se deforme.
  const north = normalize(
    subtract(northSample, scale(up, dot(northSample, up)))
  );
  if (!north) return sample;

  const east = normalize(cross(north, up));
  return east ? { east, north, up } : sample;
}

function applyTrueNorthCorrection(
  magneticEast,
  magneticNorth,
  up,
  trueNorthCorrection
) {
  const correction = Number.isFinite(trueNorthCorrection)
    ? trueNorthCorrection * DEG
    : 0;

  const north = normalize(
    subtract(
      scale(magneticNorth, Math.cos(correction)),
      scale(magneticEast, Math.sin(correction))
    )
  );
  if (!north) return null;

  const east = normalize(cross(north, up));
  return east ? { east, north, up } : null;
}

export function getScreenOrientation(
  sensorOrientation,
  width,
  height,
  previous
) {
  const viewportIsLandscape = width > height;
  const previousMatchesViewport =
    previous &&
    previous.startsWith('landscape') === viewportIsLandscape;

  // La orientacion del sensor no siempre equivale a la de la interfaz. En
  // particular, iOS devuelve 0 cuando el dispositivo esta boca arriba, y
  // durante un giro el sensor puede adelantarse al cambio de dimensiones.
  // Las dimensiones mandan; el sensor solo distingue el sentido del giro.
  if (viewportIsLandscape) {
    if (sensorOrientation === 90) return 'landscapeRight';
    if (sensorOrientation === -90 || sensorOrientation === 270) {
      return 'landscapeLeft';
    }

    return previousMatchesViewport ? previous : 'landscapeLeft';
  }

  if (sensorOrientation === 0) return 'portrait';
  if (sensorOrientation === 180) return 'portraitUpsideDown';

  return previousMatchesViewport ? previous : 'portrait';
}

export function getCameraAxes(orientation) {
  const axesByOrientation = {
    portraitUpsideDown: {
      right: [-1, 0, 0],
      up: [0, -1, 0],
      forward: [0, 0, -1],
    },
    landscapeRight: {
      right: [0, 1, 0],
      up: [-1, 0, 0],
      forward: [0, 0, -1],
    },
    landscapeLeft: {
      right: [0, -1, 0],
      up: [1, 0, 0],
      forward: [0, 0, -1],
    },
  };

  return (
    axesByOrientation[orientation] || {
      right: [1, 0, 0],
      up: [0, 1, 0],
      forward: [0, 0, -1],
    }
  );
}
