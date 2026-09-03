import { DEG, VECTOR_EPSILON } from '../constants';
import { getCameraAxes } from './orientation';
import { add, dot, scale } from './vector';

function horizontalToWorld(azimuth, altitude) {
  const azimuthRadians = azimuth * DEG;
  const altitudeRadians = altitude * DEG;
  const horizontal = Math.cos(altitudeRadians);

  return [
    horizontal * Math.sin(azimuthRadians),
    horizontal * Math.cos(azimuthRadians),
    Math.sin(altitudeRadians),
  ];
}

export function projectBody(body, frame, orientation, profile, width, height) {
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
    add(scale(frame.east, world[0]), scale(frame.north, world[1])),
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
    Math.atan2(xCamera, zCamera) - profile.horizontalOffset * DEG;
  const verticalAngle =
    Math.atan2(yCamera, zCamera) - profile.verticalOffset * DEG;
  const horizontalScale = Math.tan((profile.horizontalFov * DEG) / 2);
  const verticalScale = Math.tan((profile.verticalFov * DEG) / 2);

  if (
    Math.abs(horizontalScale) < VECTOR_EPSILON ||
    Math.abs(verticalScale) < VECTOR_EPSILON
  ) {
    return null;
  }

  const x =
    width / 2 +
    (Math.tan(horizontalAngle) / horizontalScale) * (width / 2);
  const y =
    height / 2 -
    (Math.tan(verticalAngle) / verticalScale) * (height / 2);
  const margin = 48;

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    x < -margin ||
    x > width + margin ||
    y < -margin ||
    y > height + margin
  ) {
    return null;
  }

  return { ...body, x, y };
}

function createLineStyle(pointA, pointB) {
  const deltaX = pointB.x - pointA.x;
  const deltaY = pointB.y - pointA.y;
  const length = Math.hypot(deltaX, deltaY);

  return {
    left: (pointA.x + pointB.x - length) / 2,
    top: (pointA.y + pointB.y) / 2 - 1,
    width: length,
    transform: [{ rotate: `${Math.atan2(deltaY, deltaX)}rad` }],
  };
}

function clipLineToViewport(yLeft, yRight, width, height) {
  const points = [];

  if (yLeft >= 0 && yLeft <= height) points.push({ x: 0, y: yLeft });
  if (yRight >= 0 && yRight <= height) {
    points.push({ x: width, y: yRight });
  }

  if (Math.abs(yRight - yLeft) > VECTOR_EPSILON) {
    [0, height].forEach((y) => {
      const ratio = (y - yLeft) / (yRight - yLeft);
      if (ratio < 0 || ratio > 1) return;

      const x = ratio * width;
      if (!points.some((point) => Math.abs(point.x - x) < 0.5)) {
        points.push({ x, y });
      }
    });
  }

  return points.length >= 2 ? [points[0], points[1]] : null;
}

function createHorizonIndicator(direction, width, height) {
  const labels = {
    above: '↑ HORIZONTE',
    below: '↓ HORIZONTE',
    left: '← HORIZONTE',
    right: 'HORIZONTE →',
  };
  const positions = {
    above: { left: width / 2 - 55, top: 8 },
    below: { left: width / 2 - 55, top: height - 108 },
    left: { left: 8, top: height / 2 - 14 },
    right: { left: width - 118, top: height / 2 - 14 },
  };

  return {
    visible: false,
    indicator: labels[direction],
    indicatorStyle: positions[direction],
  };
}

export function projectHorizon(frame, orientation, profile, width, height) {
  if (!frame || width <= 0 || height <= 0) return null;

  const camera = getCameraAxes(orientation);
  const normalRight = dot(frame.up, camera.right);
  const normalUp = dot(frame.up, camera.up);
  const normalForward = dot(frame.up, camera.forward);
  const horizontalScale = Math.tan((profile.horizontalFov * DEG) / 2);
  const verticalScale = Math.tan((profile.verticalFov * DEG) / 2);
  const horizontalOffset = Math.tan(profile.horizontalOffset * DEG);
  const verticalOffset = Math.tan(profile.verticalOffset * DEG);

  if (
    Math.abs(horizontalScale) < VECTOR_EPSILON ||
    Math.abs(verticalScale) < VECTOR_EPSILON
  ) {
    return null;
  }

  if (Math.abs(normalUp) < 0.015) {
    if (Math.abs(normalRight) < 0.015) {
      return createHorizonIndicator(
        normalForward >= 0 ? 'below' : 'above',
        width,
        height
      );
    }

    const cameraX = -normalForward / normalRight;
    const denominator = 1 + cameraX * horizontalOffset;

    if (Math.abs(denominator) < VECTOR_EPSILON) {
      return createHorizonIndicator(
        normalRight >= 0 ? 'left' : 'right',
        width,
        height
      );
    }

    const projectedX =
      width / 2 +
      ((cameraX - horizontalOffset) / denominator / horizontalScale) *
        (width / 2);

    if (projectedX < 0 || projectedX > width) {
      return createHorizonIndicator(
        projectedX < 0 ? 'left' : 'right',
        width,
        height
      );
    }

    const pointA = { x: projectedX, y: 0 };
    const pointB = { x: projectedX, y: height };

    return {
      visible: true,
      lineStyle: createLineStyle(pointA, pointB),
      labelStyle: {
        left: Math.min(width - 116, projectedX + 7),
        top: height / 2 - 24,
      },
    };
  }

  const screenXToCameraX = (x) => {
    const projected = ((x - width / 2) / (width / 2)) * horizontalScale;
    const denominator = 1 - projected * horizontalOffset;

    return Math.abs(denominator) < VECTOR_EPSILON
      ? null
      : (projected + horizontalOffset) / denominator;
  };

  const horizonYAt = (x) => {
    const cameraX = screenXToCameraX(x);
    if (!Number.isFinite(cameraX)) return null;

    const cameraY =
      -(normalRight * cameraX + normalForward) / normalUp;
    const denominator = 1 + cameraY * verticalOffset;
    if (Math.abs(denominator) < VECTOR_EPSILON) return null;

    const projectedY = (cameraY - verticalOffset) / denominator;
    return height / 2 - (projectedY / verticalScale) * (height / 2);
  };

  const yLeft = horizonYAt(0);
  const yRight = horizonYAt(width);
  if (!Number.isFinite(yLeft) || !Number.isFinite(yRight)) return null;

  const clipped = clipLineToViewport(yLeft, yRight, width, height);
  if (!clipped) {
    return createHorizonIndicator(
      (yLeft + yRight) / 2 < 0 ? 'above' : 'below',
      width,
      height
    );
  }

  const [pointA, pointB] = clipped;
  const labelX = (pointA.x + pointB.x) / 2 - 52;
  const labelY = (pointA.y + pointB.y) / 2 - 25;

  return {
    visible: true,
    lineStyle: createLineStyle(pointA, pointB),
    labelStyle: {
      left: Math.max(8, Math.min(width - 112, labelX)),
      top: Math.max(8, Math.min(height - 34, labelY)),
    },
  };
}
