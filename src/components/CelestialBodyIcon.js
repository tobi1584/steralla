import { StyleSheet, View } from 'react-native';

const DARK_MOON = '#1b2230';
const LIGHT_MOON = '#f2f4ff';

export default function CelestialBodyIcon({
  body,
  selected = false,
  size = 18,
}) {
  const frameSize = size * 2.15;
  const sphereStyle = [
    iconStyles.sphere,
    {
      backgroundColor: body.color,
      borderRadius: size / 2,
      height: size,
      left: (frameSize - size) / 2,
      top: (frameSize - size) / 2,
      width: size,
    },
    selected && iconStyles.sphereSelected,
  ];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height: frameSize, width: frameSize }}
    >
      {body.id === 'Saturn' && (
        <PlanetRing color={body.color} frameSize={frameSize} size={size} />
      )}
      {body.id === 'Uranus' && (
        <PlanetRing
          color={body.color}
          frameSize={frameSize}
          size={size}
          vertical
        />
      )}

      {body.id === 'Moon' ? (
        <MoonDisc
          body={body}
          frameSize={frameSize}
          selected={selected}
          size={size}
        />
      ) : (
        <View style={sphereStyle}>
          <PlanetDetails bodyId={body.id} size={size} />
        </View>
      )}

      {(body.id === 'Saturn' || body.id === 'Uranus') && (
        <PlanetRing
          color={body.color}
          frameSize={frameSize}
          front
          size={size}
          vertical={body.id === 'Uranus'}
        />
      )}
    </View>
  );
}

function PlanetRing({ color, frameSize, front = false, size, vertical = false }) {
  const width = size * 1.85;
  const height = Math.max(5, size * 0.52);
  const ringStyle = {
    borderBottomColor: color,
    borderColor: front ? 'transparent' : color,
    borderRadius: height / 2,
    borderWidth: front ? 0 : Math.max(1, size / 16),
    borderBottomWidth: Math.max(1, size / 13),
    height,
    left: (frameSize - width) / 2,
    opacity: front ? 0.95 : 0.65,
    top: (frameSize - height) / 2,
    transform: vertical ? [{ rotate: '90deg' }] : [{ rotate: '-8deg' }],
    width,
    zIndex: front ? 3 : 0,
  };

  return <View style={[iconStyles.ring, ringStyle]} />;
}

function PlanetDetails({ bodyId, size }) {
  if (bodyId === 'Jupiter') {
    return (
      <>
        <View style={[iconStyles.jupiterBand, { top: size * 0.3 }]} />
        <View style={[iconStyles.jupiterBand, { top: size * 0.62 }]} />
        <View
          style={[
            iconStyles.jupiterSpot,
            {
              height: Math.max(2.5, size * 0.2),
              left: size * 0.58,
              top: size * 0.51,
              width: Math.max(3.5, size * 0.27),
            },
          ]}
        />
      </>
    );
  }

  if (bodyId === 'Mars' || bodyId === 'Mercury' || bodyId === 'Neptune') {
    return (
      <View
        style={[
          iconStyles.planetSpot,
          {
            height: Math.max(2, size * 0.17),
            left: size * 0.24,
            top: size * 0.25,
            width: Math.max(2, size * 0.17),
          },
        ]}
      />
    );
  }

  if (bodyId === 'Venus') {
    return <View style={iconStyles.venusShade} />;
  }

  return null;
}

function MoonDisc({ body, frameSize, selected, size }) {
  const angle = body.moonPhase?.angle ?? 180;
  const waxing = angle < 180;
  const southernHemisphere = body.moonPhase?.hemisphere === 'south';
  const lightOnRight = southernHemisphere ? !waxing : waxing;
  const ellipseIsLight = angle > 90 && angle < 270;
  const ellipseScale = Math.abs(Math.cos((angle * Math.PI) / 180));
  const discPosition = {
    borderRadius: size / 2,
    height: size,
    left: (frameSize - size) / 2,
    top: (frameSize - size) / 2,
    width: size,
  };

  return (
    <View
      style={[
        iconStyles.moonDisc,
        discPosition,
        selected && iconStyles.sphereSelected,
      ]}
    >
      <View
        style={[
          iconStyles.moonHalf,
          {
            backgroundColor: LIGHT_MOON,
            height: size,
            left: lightOnRight ? size / 2 : 0,
            width: size / 2,
          },
        ]}
      />
      <View
        style={[
          iconStyles.moonTerminator,
          {
            backgroundColor: ellipseIsLight ? LIGHT_MOON : DARK_MOON,
            borderRadius: size / 2,
            height: size,
            transform: [{ scaleX: ellipseScale }],
            width: size,
          },
        ]}
      />
      <MoonCrater left={0.24} size={size} top={0.25} scale={0.16} />
      <MoonCrater left={0.59} size={size} top={0.2} scale={0.11} />
      <MoonCrater left={0.5} size={size} top={0.58} scale={0.19} />
      <MoonCrater left={0.2} size={size} top={0.67} scale={0.09} />
    </View>
  );
}

function MoonCrater({ left, size, top, scale }) {
  const craterSize = Math.max(1.5, size * scale);

  return (
    <View
      style={[
        iconStyles.moonCrater,
        {
          borderRadius: craterSize / 2,
          height: craterSize,
          left: size * left,
          top: size * top,
          width: craterSize,
        },
      ]}
    />
  );
}

const iconStyles = StyleSheet.create({
  sphere: {
    position: 'absolute',
    borderColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    elevation: 7,
    overflow: 'hidden',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 7,
    zIndex: 2,
  },
  sphereSelected: {
    borderColor: '#fff',
    borderWidth: 2.5,
    shadowOpacity: 1,
    shadowRadius: 11,
  },
  ring: {
    position: 'absolute',
  },
  jupiterBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(116, 72, 43, 0.4)',
  },
  jupiterSpot: {
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: '#b83f32',
  },
  planetSpot: {
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: 'rgba(21, 28, 45, 0.42)',
  },
  venusShade: {
    position: 'absolute',
    left: '-32%',
    top: '-8%',
    width: '88%',
    height: '116%',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  moonDisc: {
    position: 'absolute',
    backgroundColor: DARK_MOON,
    borderColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    elevation: 7,
    overflow: 'hidden',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
    zIndex: 2,
  },
  moonHalf: {
    position: 'absolute',
    top: 0,
  },
  moonTerminator: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  moonCrater: {
    position: 'absolute',
    backgroundColor: 'rgba(69, 78, 96, 0.42)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
