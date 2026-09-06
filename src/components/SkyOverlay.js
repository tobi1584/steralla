import { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OVERLAY_FRAME_INTERVAL } from '../constants';
import styles from '../styles';
import { buildOrientationFrame } from '../utils/orientation';
import {
  projectBody,
  projectBodyGuidance,
  projectConstellation,
  projectHorizon,
  isProjectedPointVisible,
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
  constellationsRef,
  deepSkyObjectsRef,
  profilesRef,
  selectedBodyId,
  onOrientationReady,
}) {
  const [overlay, setOverlay] = useState({
    bodies: [],
    constellations: [],
    deepSkyObjects: [],
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
        constellations: [],
        deepSkyObjects: [],
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
            constellations: [],
            deepSkyObjects: [],
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
      const constellations = constellationsRef.current
        .map((constellation) =>
          projectConstellation(
            constellation,
            frame,
            orientation,
            profile,
            width,
            height
          )
        )
        .filter((constellation) => constellation.visible);
      const deepSkyObjects = deepSkyObjectsRef.current
        .map((object) =>
          projectBody(object, frame, orientation, profile, width, height)
        )
        .filter(Boolean);
      const activeBodyId = selectedBodyIdRef.current;
      const selectedBody = findSkyTarget(
        activeBodyId,
        bodiesRef.current,
        constellationsRef.current,
        deepSkyObjectsRef.current
      );
      const selectedProjection = selectedBody
        ? projectBody(
            selectedBody,
            frame,
            orientation,
            profile,
            width,
            height
          )
        : null;
      const selectedVisible = isProjectedPointVisible(
        selectedProjection,
        width,
        height
      )
        ? selectedBody
        : null;

      setOverlay({
        bodies,
        constellations,
        deepSkyObjects,
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
    constellationsRef,
    deepSkyObjectsRef,
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

      {overlay.constellations.map((constellation) => (
        <Constellation
          constellation={constellation}
          key={constellation.id}
          selectedBodyId={selectedBodyId}
        />
      ))}

      {overlay.deepSkyObjects.map((object) => (
        <DeepSkyMarker
          key={object.id}
          object={object}
          selected={object.id === selectedBodyId}
        />
      ))}

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

function Constellation({ constellation, selectedBodyId }) {
  const selected = constellation.id === selectedBodyId;
  const polarisSelected = selectedBodyId === 'Polaris';

  return (
    <>
      {constellation.segments.map((segment) => (
        <View
          key={segment.id}
          style={[
            styles.constellationLine,
            selected && styles.constellationLineSelected,
            segment.lineStyle,
          ]}
        />
      ))}

      {constellation.stars.map((star) => {
        const size = Math.max(3, Math.min(6, 7 - star.magnitude * 0.7));
        const starSelected = polarisSelected && star.id === 'polaris';

        return (
          <View
            key={`${constellation.id}-${star.id}`}
            style={[
              styles.constellationStar,
              (selected || starSelected) && styles.constellationStarSelected,
              {
                left: star.x - size / 2,
                top: star.y - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          />
        );
      })}

      {constellation.centerVisible && (
        <View
          style={[
            styles.constellationLabel,
            {
              left: constellation.center.x - 60,
              top: constellation.center.y - 8,
            },
          ]}
        >
          <Text
            style={[
              styles.constellationName,
              selected && styles.constellationNameSelected,
            ]}
          >
            {constellation.name}
          </Text>
        </View>
      )}
    </>
  );
}

function DeepSkyMarker({ object, selected }) {
  return (
    <View
      style={[
        styles.deepSkyMarker,
        {
          left: object.x - 34,
          top: object.y - 18,
        },
      ]}
    >
      <View
        style={[
          styles.deepSkyGlow,
          selected && styles.deepSkyGlowSelected,
        ]}
      />
      <Text
        style={[
          styles.deepSkyName,
          selected && styles.deepSkyNameSelected,
        ]}
      >
        Andrómeda
      </Text>
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

function findSkyTarget(targetId, bodies, constellations, deepSkyObjects) {
  if (!targetId) return null;

  const body = bodies.find((candidate) => candidate.id === targetId);
  if (body) return body;

  const constellation = constellations.find(
    (candidate) => candidate.id === targetId
  );
  if (constellation) return constellation;

  const deepSkyObject = deepSkyObjects.find(
    (candidate) => candidate.id === targetId
  );
  if (deepSkyObject) return deepSkyObject;

  if (targetId === 'Polaris') {
    const polaris = constellations
      .find((candidate) => candidate.id === 'UrsaMinor')
      ?.stars.find((star) => star.id === 'polaris');

    return polaris
      ? {
          ...polaris,
          id: 'Polaris',
          name: 'Estrella Polar',
          color: '#f8fafc',
        }
      : null;
  }

  return null;
}

export default memo(SkyOverlay);
