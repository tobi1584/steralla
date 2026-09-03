import { VECTOR_EPSILON } from '../constants';

export function isFiniteVector(vector) {
  return vector && vector.length === 3 && vector.every(Number.isFinite);
}

export function normalize(vector) {
  if (!isFiniteVector(vector)) return null;

  const magnitude = Math.hypot(vector[0], vector[1], vector[2]);
  if (magnitude < VECTOR_EPSILON) return null;

  return vector.map((component) => component / magnitude);
}

export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function scale(vector, factor) {
  return vector.map((component) => component * factor);
}

export function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function smoothVector(previous, sample, factor = 0.16) {
  if (!isFiniteVector(sample)) return previous;
  if (!previous) return [...sample];

  return previous.map(
    (component, index) => component + factor * (sample[index] - component)
  );
}

export function vectorFromMeasurement(measurement) {
  if (!measurement) return null;

  const vector = [measurement.x, measurement.y, measurement.z];
  return isFiniteVector(vector) ? vector : null;
}
