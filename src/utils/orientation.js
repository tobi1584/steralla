import { DEG } from '../constants';
import {
  cross,
  dot,
  isFiniteVector,
  normalize,
  scale,
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
