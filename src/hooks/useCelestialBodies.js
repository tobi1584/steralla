import * as Astronomy from 'astronomy-engine';
import { useEffect, useRef, useState } from 'react';

import {
  CELESTIAL_BODIES,
  EPHEMERIS_INTERVAL,
  INITIAL_CELESTIAL,
} from '../constants';

export default function useCelestialBodies(appState, location) {
  const [bodies, setBodies] = useState(INITIAL_CELESTIAL);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState(null);
  const bodiesRef = useRef(bodies);

  useEffect(() => {
    bodiesRef.current = bodies;
  }, [bodies]);

  useEffect(() => {
    if (appState !== 'active' || !location) return undefined;

    const calculate = () => {
      try {
        const observer = createObserver(location.coords);
        const now = new Date();
        const nextBodies = CELESTIAL_BODIES.map((body) =>
          calculateHorizontalPosition(body, observer, now)
        );

        bodiesRef.current = nextBodies;
        setBodies(nextBodies);
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

  return { bodies, bodiesRef, updatedAt, error };
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
