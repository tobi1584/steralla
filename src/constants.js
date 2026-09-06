import {
  ADDITIONAL_CONSTELLATIONS,
  ADDITIONAL_CONSTELLATION_STARS,
} from './data/additionalConstellations';

export const DEG = Math.PI / 180;
export const OVERLAY_FRAME_INTERVAL = 1000 / 30;
export const SENSOR_INTERVAL = OVERLAY_FRAME_INTERVAL;
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

// Posiciones ICRS J2000 y magnitudes visuales del catálogo SIMBAD.
const PRIMARY_CONSTELLATION_STARS = [
  { id: 'dubhe', ra: 165.9319646738, dec: 61.7510346878, magnitude: 1.79 },
  { id: 'merak', ra: 165.460332298, dec: 56.3824336495, magnitude: 2.37 },
  { id: 'phecda', ra: 178.4576971525, dec: 53.6947597292, magnitude: 2.44 },
  { id: 'megrez', ra: 183.8564993613, dec: 57.0326169777, magnitude: 3.32 },
  { id: 'alioth', ra: 193.5072899675, dec: 55.9598229569, magnitude: 1.77 },
  { id: 'mizar', ra: 200.9814186667, dec: 54.9253519722, magnitude: 2.23 },
  { id: 'alkaid', ra: 206.8851573421, dec: 49.3132667294, magnitude: 1.86 },
  { id: 'polaris', ra: 37.9545606702, dec: 89.2641089699, magnitude: 2.02 },
  { id: 'yildun', ra: 263.0541592214, dec: 86.5864596056, magnitude: 4.34 },
  { id: 'epsilon-umi', ra: 251.4926816844, dec: 82.0372582843, magnitude: 4.21 },
  { id: 'zeta-umi', ra: 236.0146607058, dec: 77.7944931248, magnitude: 4.27 },
  { id: 'eta-umi', ra: 244.3761260457, dec: 75.7553430784, magnitude: 4.95 },
  { id: 'pherkad', ra: 230.1820980485, dec: 71.8340254549, magnitude: 3.0 },
  { id: 'kochab', ra: 222.676357498, dec: 74.1555039368, magnitude: 2.08 },
  { id: 'meissa', ra: 83.784490021, dec: 9.9341558742, magnitude: 3.66 },
  { id: 'betelgeuse', ra: 88.7929389908, dec: 7.4070639953, magnitude: 0.42 },
  { id: 'bellatrix', ra: 81.2827635565, dec: 6.3497032644, magnitude: 1.64 },
  { id: 'mintaka', ra: 83.0016670556, dec: -0.2990951071, magnitude: 2.41 },
  { id: 'alnilam', ra: 84.0533889408, dec: -1.2019191358, magnitude: 1.69 },
  { id: 'alnitak', ra: 85.1896944279, dec: -1.942573586, magnitude: 1.77 },
  { id: 'saiph', ra: 86.9391201683, dec: -9.6696049186, magnitude: 2.06 },
  { id: 'rigel', ra: 78.6344670669, dec: -8.2016383647, magnitude: 0.13 },
];

export const CONSTELLATION_STARS = [
  ...PRIMARY_CONSTELLATION_STARS,
  ...ADDITIONAL_CONSTELLATION_STARS,
];

const PRIMARY_CONSTELLATIONS = [
  {
    id: 'UrsaMajor',
    name: 'Osa Mayor',
    group: 'featured',
    color: '#dbeafe',
    starIds: ['dubhe', 'merak', 'phecda', 'megrez', 'alioth', 'mizar', 'alkaid'],
    segments: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid'],
    ],
  },
  {
    id: 'UrsaMinor',
    name: 'Osa Menor',
    group: 'featured',
    color: '#e0e7ff',
    starIds: [
      'polaris',
      'yildun',
      'epsilon-umi',
      'zeta-umi',
      'eta-umi',
      'pherkad',
      'kochab',
    ],
    segments: [
      ['polaris', 'yildun'],
      ['yildun', 'epsilon-umi'],
      ['epsilon-umi', 'zeta-umi'],
      ['zeta-umi', 'eta-umi'],
      ['eta-umi', 'pherkad'],
      ['pherkad', 'kochab'],
      ['kochab', 'zeta-umi'],
    ],
  },
  {
    id: 'Orion',
    name: 'Orión',
    group: 'featured',
    color: '#dbeafe',
    starIds: [
      'meissa',
      'betelgeuse',
      'bellatrix',
      'mintaka',
      'alnilam',
      'alnitak',
      'saiph',
      'rigel',
    ],
    segments: [
      ['meissa', 'betelgeuse'],
      ['meissa', 'bellatrix'],
      ['betelgeuse', 'bellatrix'],
      ['betelgeuse', 'alnitak'],
      ['bellatrix', 'mintaka'],
      ['mintaka', 'alnilam'],
      ['alnilam', 'alnitak'],
      ['alnitak', 'saiph'],
      ['mintaka', 'rigel'],
      ['saiph', 'rigel'],
    ],
  },
];

export const CONSTELLATIONS = [
  ...PRIMARY_CONSTELLATIONS,
  ...ADDITIONAL_CONSTELLATIONS,
];

export const DEEP_SKY_OBJECTS = [
  {
    id: 'M31',
    name: 'Galaxia de Andrómeda',
    color: '#c4b5fd',
    ra: 10.6847083333,
    dec: 41.26875,
    magnitude: 3.44,
    kind: 'deepSky',
  },
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

export const INITIAL_CONSTELLATIONS = CONSTELLATIONS.map((constellation) => ({
  ...constellation,
  azimuth: null,
  altitude: null,
  stars: [],
}));

export const INITIAL_DEEP_SKY = DEEP_SKY_OBJECTS.map((object) => ({
  ...object,
  azimuth: null,
  altitude: null,
}));
