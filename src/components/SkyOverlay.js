import { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OVERLAY_FRAME_INTERVAL } from '../constants';
import styles from '../styles';
import { buildOrientationFrame } from '../utils/orientation';
import { projectBody, projectHorizon } from '../utils/projection';

function SkyOverlay({
  appState,
  width,
  height,
  gravityRef,
  magneticRef,
  headingRef,
  frameRef,
  orientationRef,
  bodiesRef,
  profilesRef,
  onOrientationReady,
}) {
  const [overlay, setOverlay] = useState({
    bodies: [],
    horizon: null,
  });

  useEffect(() => {
    if (appState !== 'active') {
      setOverlay({ bodies: [], horizon: null });
      onOrientationReady(false);
      return undefined;
    }

    let animationFrame = null;
    let lastFrameTime = -Infinity;
    let lastReadiness = null;
    let hadProjection = false;

    const publishReadiness = (ready) => {
      if (ready !== lastReadiness) {
        lastReadiness = ready;
        onOrientationReady(ready);
      }
    };

    const updateProjection = (time) => {
      animationFrame = requestAnimationFrame(updateProjection);

      if (time - lastFrameTime < OVERLAY_FRAME_INTERVAL) return;
      lastFrameTime = time;

      const candidate = buildOrientationFrame(
        gravityRef.current,
        magneticRef.current,
        headingRef.current.correction
      );

      if (candidate) frameRef.current = candidate;

      const frame = frameRef.current;
      publishReadiness(Boolean(frame));

      if (!frame) {
        if (hadProjection) {
          hadProjection = false;
          setOverlay({ bodies: [], horizon: null });
        }
        return;
      }

      hadProjection = true;

      const orientation = orientationRef.current;
      const profileName = orientation.startsWith('landscape')
        ? 'landscape'
        : 'portrait';
      const profile = profilesRef.current[profileName];
      const bodies = bodiesRef.current
        .map((body) =>
          projectBody(body, frame, orientation, profile, width, height)
        )
        .filter(Boolean);

      setOverlay({
        bodies,
        horizon: projectHorizon(
          frame,
          orientation,
          profile,
          width,
          height
        ),
      });
    };

    animationFrame = requestAnimationFrame(updateProjection);

    return () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    };
  }, [
    appState,
    bodiesRef,
    frameRef,
    gravityRef,
    headingRef,
    height,
    magneticRef,
    onOrientationReady,
    orientationRef,
    profilesRef,
    width,
  ]);

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.skyOverlay]}
    >
      <Horizon horizon={overlay.horizon} />

      {overlay.bodies.map((body) => (
        <BodyMarker key={body.id} body={body} />
      ))}

      <View
        style={[
          styles.crosshairHorizontal,
          { left: width / 2 - 13, top: height / 2 },
        ]}
      />
      <View
        style={[
          styles.crosshairVertical,
          { left: width / 2, top: height / 2 - 13 },
        ]}
      />
    </View>
  );
}

function Horizon({ horizon }) {
  if (!horizon) return null;

  if (!horizon.visible) {
    return (
      <View style={[styles.horizonIndicator, horizon.indicatorStyle]}>
        <Text style={styles.horizonLabelText}>{horizon.indicator}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.horizonLine, horizon.lineStyle]} />
      <View style={[styles.horizonLabel, horizon.labelStyle]}>
        <Text style={styles.horizonLabelText}>HORIZONTE · 0°</Text>
      </View>
    </>
  );
}

function BodyMarker({ body }) {
  return (
    <View
      style={[
        styles.bodyMarker,
        { left: body.x - 38, top: body.y - 16 },
      ]}
    >
      <View style={[styles.bodyDot, { backgroundColor: body.color }]} />
      <Text style={styles.bodyName}>{body.name}</Text>
      <Text style={styles.bodyAltitude}>{body.altitude.toFixed(1)}°</Text>
    </View>
  );
}

export default memo(SkyOverlay);
