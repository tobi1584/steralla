export const DEG = Math.PI / 180;
export const SENSOR_INTERVAL = 20;
export const OVERLAY_FRAME_INTERVAL = 1000 / 30;
export const EPHEMERIS_INTERVAL = 15000;
export const GRAVITY_SMOOTHING = 0.2;
export const MAGNETIC_SMOOTHING = 0.18;
export const VECTOR_EPSILON = 1e-6;
export const CALIBRATION_DURATION = 8000;

export const CELESTIAL_BODIES = [
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

export const DEFAULT_PROFILES = {
  portrait: {
    horizontalFov: 50,
    verticalFov: 65,
    horizontalOffset: 0,
    verticalOffset: 0,
  },
  landscape: {
    horizontalFov: 65,
    verticalFov: 50,
    horizontalOffset: 0,
    verticalOffset: 0,
  },
};

export const INITIAL_CELESTIAL = CELESTIAL_BODIES.map((body) => ({
  ...body,
  azimuth: null,
  altitude: null,
}));
