import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import styles from '../styles';
import ControlRow from './ControlRow';

const CLOSED_DRAWER_OFFSET = -360;

export default function CelestialMenu({
  bodies,
  selectedBodyId,
  onSelectBody,
  profileName,
  profile,
  onChangeProfile,
  onRecalibrate,
  calibrationActive,
}) {
  const [open, setOpen] = useState(false);
  const [planetsOpen, setPlanetsOpen] = useState(false);
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const drawerProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(drawerProgress, {
      toValue: open ? 1 : 0,
      duration: open ? 260 : 210,
      useNativeDriver: true,
    }).start();
  }, [drawerProgress, open]);

  const selectBody = (bodyId) => {
    onSelectBody(bodyId);
    setOpen(false);
  };

  const drawerTranslateX = drawerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CLOSED_DRAWER_OFFSET, 0],
  });

  return (
    <View pointerEvents="box-none" style={styles.menuArea}>
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.menuBackdrop, { opacity: drawerProgress }]}
      >
        <Pressable
          accessibilityLabel="Cerrar menú"
          onPress={() => setOpen(false)}
          style={styles.menuBackdropPressable}
        />
      </Animated.View>

      <Animated.View
        accessibilityElementsHidden={!open}
        accessibilityViewIsModal
        importantForAccessibility={open ? 'yes' : 'no-hide-descendants'}
        pointerEvents={open ? 'auto' : 'none'}
        style={[
          styles.menuPanel,
          { transform: [{ translateX: drawerTranslateX }] },
        ]}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.menuEyebrow}>EXPLORAR</Text>
          <Text style={styles.drawerTitle}>Mapa celeste</Text>
          <Text style={styles.drawerSubtitle}>
            Elige un objeto y te guiaremos hasta él.
          </Text>
        </View>

        <ScrollView
          style={styles.menuScroll}
          contentContainerStyle={styles.menuScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: planetsOpen }}
            onPress={() => setPlanetsOpen((current) => !current)}
            style={styles.menuSectionHeader}
          >
            <Text style={styles.menuSectionTitle}>Planetas</Text>
            <Text style={styles.menuSectionChevron}>
              {planetsOpen ? '⌃' : '⌄'}
            </Text>
          </Pressable>

          {planetsOpen && (
            <View style={styles.bodyList}>
              {bodies.map((body) => (
                <BodyChoice
                  body={body}
                  key={body.id}
                  selected={body.id === selectedBodyId}
                  onPress={() => selectBody(body.id)}
                />
              ))}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: calibrationOpen }}
            onPress={() => setCalibrationOpen((current) => !current)}
            style={styles.calibrationDisclosure}
          >
            <Text style={styles.calibrationDisclosureText}>
              Ajustar calibración
            </Text>
            <Text style={styles.calibrationDisclosureChevron}>
              {calibrationOpen ? '−' : '+'}
            </Text>
          </Pressable>

          {calibrationOpen && (
            <CalibrationSection
              profileName={profileName}
              profile={profile}
              onChangeProfile={onChangeProfile}
              onRecalibrate={onRecalibrate}
              calibrationActive={calibrationActive}
            />
          )}
        </ScrollView>

        {selectedBodyId && (
          <Pressable
            accessibilityRole="button"
            onPress={() => selectBody(null)}
            style={styles.stopGuideButton}
          >
            <Text style={styles.stopGuideText}>Detener búsqueda</Text>
          </Pressable>
        )}
      </Animated.View>

      <Pressable
        accessibilityLabel={open ? 'Cerrar menú' : 'Abrir menú'}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        style={[styles.menuButton, open && styles.menuButtonOpen]}
      >
        <Text style={styles.menuButtonIcon}>{open ? '×' : '☰'}</Text>
      </Pressable>
    </View>
  );
}

function BodyChoice({ body, selected, onPress }) {
  return (
    <Pressable
      accessibilityLabel={`Buscar ${body.name}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.bodyChoice, selected && styles.bodyChoiceSelected]}
    >
      <View
        style={[styles.bodyChoiceDot, { backgroundColor: body.color }]}
      />
      <Text style={styles.bodyChoiceName}>{body.name}</Text>
      <Text style={styles.bodyChoiceAction}>
        {selected ? 'Guiando' : 'Buscar'}
      </Text>
    </Pressable>
  );
}

function CalibrationSection({
  profileName,
  profile,
  onChangeProfile,
  onRecalibrate,
  calibrationActive,
}) {
  const controls = [
    ['Campo horizontal', 'horizontalFov', 1],
    ['Campo vertical', 'verticalFov', 1],
    ['Mover horizontal', 'horizontalOffset', 0.5],
    ['Mover vertical', 'verticalOffset', 0.5],
  ];

  return (
    <View style={styles.calibrationMenuContent}>
      <Text style={styles.calibrationProfileName}>
        Vista {profileName === 'portrait' ? 'vertical' : 'horizontal'}
      </Text>
      <Text style={styles.calibrationDescription}>
        Ajusta los marcadores hasta que coincidan con el cielo.
      </Text>

      {controls.map(([label, field, step]) => (
        <ControlRow
          key={field}
          label={label}
          value={profile[field]}
          suffix="°"
          onDecrease={() => onChangeProfile(field, -step)}
          onIncrease={() => onChangeProfile(field, step)}
        />
      ))}

      <Pressable
        accessibilityRole="button"
        disabled={calibrationActive}
        onPress={onRecalibrate}
        style={[
          styles.calibrateMenuButton,
          calibrationActive && styles.calibrateMenuButtonDisabled,
        ]}
      >
        <Text style={styles.calibrateMenuText}>
          {calibrationActive ? 'Calibrando brújula…' : 'Recalibrar brújula'}
        </Text>
      </Pressable>
    </View>
  );
}
