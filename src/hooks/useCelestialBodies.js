import * as Astronomy from 'astronomy-engine';
import { useEffect, useRef, useState } from 'react';

import {
  CELESTIAL_BODIES,
  CONSTELLATIONS,
  CONSTELLATION_STARS,
  DEEP_SKY_OBJECTS,
  EPHEMERIS_INTERVAL,
  INITIAL_CELESTIAL,
  INITIAL_CONSTELLATIONS,
  INITIAL_DEEP_SKY,
} from '../constants';

const J2000 = new Astronomy.AstroTime(0);

export default function useCelestialBodies(appState, location) {
  const [bodies, setBodies] = useState(INITIAL_CELESTIAL);
  const [constellations, setConstellations] = useState(
    INITIAL_CONSTELLATIONS
  );
  const [deepSkyObjects, setDeepSkyObjects] = useState(INITIAL_DEEP_SKY);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState(null);
  const bodiesRef = useRef(bodies);
  const constellationsRef = useRef(constellations);
  const deepSkyObjectsRef = useRef(deepSkyObjects);

  useEffect(() => {
    bodiesRef.current = bodies;
  }, [bodies]);

  useEffect(() => {
    constellationsRef.current = constellations;
  }, [constellations]);

  useEffect(() => {
    deepSkyObjectsRef.current = deepSkyObjects;
  }, [deepSkyObjects]);

  useEffect(() => {
    if (appState !== 'active' || !location) return undefined;

    const calculate = () => {
      try {
        const observer = createObserver(location.coords);
        const now = new Date();
        const nextBodies = CELESTIAL_BODIES.map((body) =>
          calculateHorizontalPosition(body, observer, now)
        );
        const starRotation = Astronomy.Rotation_EQJ_EQD(now);
        const starPositions = Object.fromEntries(
          CONSTELLATION_STARS.map((star) => [
            star.id,
            calculateStarPosition(star, observer, now, starRotation),
          ])
        );
        const nextConstellations = CONSTELLATIONS.map((constellation) =>
          calculateConstellation(constellation, starPositions)
        );
        const nextDeepSkyObjects = DEEP_SKY_OBJECTS.map((object) =>
          calculateStarPosition(object, observer, now, starRotation)
        );

        bodiesRef.current = nextBodies;
        constellationsRef.current = nextConstellations;
        deepSkyObjectsRef.current = nextDeepSkyObjects;
        setBodies(nextBodies);
        setConstellations(nextConstellations);
        setDeepSkyObjects(nextDeepSkyObjects);
        setUpdatedAt(now);
        setError(null);
      } catch (calculationError) {
        setError(
          calculationError.message ||
            'No se pudieron calcular las efemérides'
        );
      }
    };

    calculate();
    const interval = setInterval(calculate, EPHEMERIS_INTERVAL);
    return () => clearInterval(interval);
  }, [
    appState,
    location?.coords.altitude,
    location?.coords.latitude,
    location?.coords.longitude,
  ]);

  const constellationTargets = constellations.map((constellation) => ({
    id: constellation.id,
    name: constellation.name,
    color: constellation.color,
    azimuth: constellation.azimuth,
    altitude: constellation.altitude,
    kind: 'constellation',
    group: constellation.group,
  }));
  const polaris = constellations
    .find((constellation) => constellation.id === 'UrsaMinor')
    ?.stars.find((star) => star.id === 'polaris');
  const skyTargets = [
    ...constellationTargets,
    {
      id: 'Polaris',
      name: 'Estrella Polar',
      color: '#f8fafc',
      azimuth: polaris?.azimuth ?? null,
      altitude: polaris?.altitude ?? null,
      kind: 'star',
      starId: 'polaris',
      group: 'featured',
    },
    ...deepSkyObjects,
  ];

  return {
    bodies,
    bodiesRef,
    constellations,
    constellationsRef,
    deepSkyObjects,
    deepSkyObjectsRef,
    skyTargets,
    updatedAt,
    error,
  };
}

function calculateStarPosition(star, observer, date, starRotation) {
  const sphere = new Astronomy.Spherical(star.dec, star.ra, 1);
  const j2000Vector = Astronomy.VectorFromSphere(sphere, J2000);
  const ofDateVector = Astronomy.RotateVector(
    starRotation,
    j2000Vector
  );
  const equatorial = Astronomy.EquatorFromVector(ofDateVector);
  const horizontal = Astronomy.Horizon(
    date,
    observer,
    equatorial.ra,
    equatorial.dec,
    'normal'
  );

  return {
    ...star,
    azimuth: horizontal.azimuth,
    altitude: horizontal.altitude,
  };
}

function calculateConstellation(constellation, starPositions) {
  const stars = constellation.starIds.map((id) => starPositions[id]);
  const center = calculateHorizontalCenter(stars);

  return {
    ...constellation,
    stars,
    azimuth: center.azimuth,
    altitude: center.altitude,
  };
}

function calculateHorizontalCenter(stars) {
  const sum = stars.reduce(
    (vector, star) => {
      const azimuth = (star.azimuth * Math.PI) / 180;
      const altitude = (star.altitude * Math.PI) / 180;
      const horizontal = Math.cos(altitude);

      return [
        vector[0] + horizontal * Math.sin(azimuth),
        vector[1] + horizontal * Math.cos(azimuth),
        vector[2] + Math.sin(altitude),
      ];
    },
    [0, 0, 0]
  );
  const length = Math.hypot(...sum) || 1;
  const [east, north, up] = sum.map((value) => value / length);
  const azimuth = ((Math.atan2(east, north) * 180) / Math.PI + 360) % 360;

  return {
    azimuth,
    altitude: (Math.asin(up) * 180) / Math.PI,
  };
}

function createObserver({ latitude, longitude, altitude }) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('coordenadas GPS no válidas');
  }

  return new Astronomy.Observer(
    latitude,
    longitude,
    Number.isFinite(altitude) ? altitude : 0
  );
}

function calculateHorizontalPosition(body, observer, date) {
  // Esta llamada es topocéntrica e incluye el paralaje de la Luna.
  const equatorial = Astronomy.Equator(
    body.id,
    date,
    observer,
    true,
    true
  );
  const horizontal = Astronomy.Horizon(
    date,
    observer,
    equatorial.ra,
    equatorial.dec,
    'normal'
  );

  return {
    ...body,
    azimuth: Number.isFinite(horizontal.azimuth)
      ? horizontal.azimuth
      : null,
    altitude: Number.isFinite(horizontal.altitude)
      ? horizontal.altitude
      : null,
  };
}
