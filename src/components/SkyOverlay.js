import { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OVERLAY_FRAME_INTERVAL } from '../constants';
import styles from '../styles';
import { buildOrientationFrame } from '../utils/orientation';
import {
  projectBody,
  projectBodyGuidance,
  projectHorizon,
} from '../utils/projection';

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
  selectedBodyId,
  onOrientationReady,
}) {
  const [overlay, setOverlay] = useState({
    bodies: [],
    horizon: null,
    guidance: null,
    selectedVisible: null,
  });
  const selectedBodyIdRef = useRef(selectedBodyId);

  useEffect(() => {
    selectedBodyIdRef.current = selectedBodyId;
  }, [selectedBodyId]);

  useEffect(() => {
    if (appState !== 'active') {
      setOverlay({
        bodies: [],
        horizon: null,
        guidance: null,
        selectedVisible: null,
      });
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
          setOverlay({
            bodies: [],
            horizon: null,
            guidance: null,
            selectedVisible: null,
          });
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
      const activeBodyId = selectedBodyIdRef.current;
      const selectedBody = activeBodyId
        ? bodiesRef.current.find((body) => body.id === activeBodyId)
        : null;
      const selectedVisible = selectedBody
        ? bodies.find(
            (body) =>
              body.id === selectedBody.id &&
              body.x >= 0 &&
              body.x <= width &&
              body.y >= 0 &&
              body.y <= height
          ) || null
        : null;

      setOverlay({
        bodies,
        selectedVisible,
        guidance:
          selectedBody && !selectedVisible
            ? projectBodyGuidance(
                selectedBody,
                frame,
                orientation,
                profile,
                width,
                height
              )
            : null,
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
        <BodyMarker
          key={body.id}
          body={body}
          selected={body.id === selectedBodyId}
        />
      ))}

      {overlay.guidance && <TargetGuide guidance={overlay.guidance} />}
      {overlay.selectedVisible && (
        <View style={styles.targetVisibleBadge}>
          <View
            style={[
              styles.targetVisibleDot,
              { backgroundColor: overlay.selectedVisible.color },
            ]}
          />
          <Text style={styles.targetVisibleText}>
            {overlay.selectedVisible.name} está en pantalla
          </Text>
        </View>
      )}

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

function BodyMarker({ body, selected }) {
  return (
    <View
      style={[
        styles.bodyMarker,
        {
          transform: [
            { translateX: body.x - 38 },
            { translateY: body.y - 16 },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.bodyDot,
          { backgroundColor: body.color },
          selected && styles.bodyDotSelected,
        ]}
      />
      <Text style={styles.bodyName}>{body.name}</Text>
      <Text style={styles.bodyAltitude}>{body.altitude.toFixed(1)}°</Text>
    </View>
  );
}

function TargetGuide({ guidance }) {
  return (
    <View
      style={[
        styles.targetGuide,
        {
          left: guidance.x - 54,
          top: guidance.y - 34,
        },
      ]}
    >
      <Text
        style={[
          styles.targetArrow,
          { transform: [{ rotate: `${guidance.angle}deg` }] },
        ]}
      >
        ➤
      </Text>
      <Text style={styles.targetGuideName}>{guidance.name}</Text>
    </View>
  );
}

export default memo(SkyOverlay);
