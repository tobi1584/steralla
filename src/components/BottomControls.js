import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import styles from '../styles';
import ControlRow from './ControlRow';

export default function BottomControls({
  profileName,
  profile,
  celestialBodies,
  onChangeProfile,
  onRecalibrate,
}) {
  const [objectsOpen, setObjectsOpen] = useState(false);
  const [calibrationOpen, setCalibrationOpen] = useState(false);

  return (
    <View style={styles.bottomArea}>
      {calibrationOpen && (
        <CalibrationPanel
          profileName={profileName}
          profile={profile}
          onChange={onChangeProfile}
          onRecalibrate={onRecalibrate}
        />
      )}
      {objectsOpen && <CelestialObjectsPanel bodies={celestialBodies} />}

      <View style={styles.toolbar}>
        <ToolbarButton
          active={objectsOpen}
          label={objectsOpen ? 'Ocultar objetos' : 'Ver 9 objetos'}
          onPress={() => setObjectsOpen((open) => !open)}
        />
        <ToolbarButton
          active={calibrationOpen}
          label={calibrationOpen ? 'Cerrar ajuste' : 'Calibrar'}
          onPress={() => setCalibrationOpen((open) => !open)}
        />
      </View>
    </View>
  );
}

function CalibrationPanel({
  profileName,
  profile,
  onChange,
  onRecalibrate,
}) {
  const controls = [
    ['FOV horizontal', 'horizontalFov', 1],
    ['FOV vertical', 'verticalFov', 1],
    ['Desfase horizontal', 'horizontalOffset', 0.5],
    ['Desfase vertical', 'verticalOffset', 0.5],
  ];

  return (
    <View style={styles.calibrationPanel}>
      <Text style={styles.panelHeading}>
        Calibración · {profileName === 'portrait' ? 'retrato' : 'paisaje'}
      </Text>

      {controls.map(([label, field, step]) => (
        <ControlRow
          key={field}
          label={label}
          value={profile[field]}
          suffix="°"
          onDecrease={() => onChange(field, -step)}
          onIncrease={() => onChange(field, step)}
        />
      ))}

      <Pressable
        accessibilityRole="button"
        onPress={onRecalibrate}
        style={styles.recalibrateButton}
      >
        <Text style={styles.recalibrateText}>Recalibrar brújula</Text>
      </Pressable>
    </View>
  );
}

function CelestialObjectsPanel({ bodies }) {
  return (
    <View style={styles.objectsPanel}>
      <Text style={styles.panelHeading}>Objetos celestes</Text>
      <ScrollView style={styles.objectsScroll} nestedScrollEnabled>
        {bodies.map((body) => (
          <View key={body.id} style={styles.objectRow}>
            <View
              style={[styles.listDot, { backgroundColor: body.color }]}
            />
            <Text style={styles.objectName}>{body.name}</Text>
            <Text style={styles.objectData}>{formatBodyPosition(body)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function formatBodyPosition(body) {
  if (!Number.isFinite(body.azimuth) || !Number.isFinite(body.altitude)) {
    return 'Esperando efemérides…';
  }

  const visibility = body.altitude >= 0 ? 'sobre' : 'bajo';
  return `Az ${body.azimuth.toFixed(1)}° · Alt ${body.altitude.toFixed(
    1
  )}° · ${visibility} el horizonte`;
}

function ToolbarButton({ active, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.toolbarButton, active && styles.toolbarButtonActive]}
    >
      <Text style={styles.toolbarText}>{label}</Text>
    </Pressable>
  );
}
