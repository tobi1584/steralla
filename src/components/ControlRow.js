import { Pressable, Text, View } from 'react-native';

import styles from '../styles';

export default function ControlRow({
  label,
  value,
  suffix,
  onDecrease,
  onIncrease,
}) {
  return (
    <View style={styles.controlRow}>
      <Text style={styles.controlLabel}>{label}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={onDecrease}
        style={styles.adjustButton}
      >
        <Text style={styles.adjustButtonText}>−</Text>
      </Pressable>

      <Text style={styles.controlValue}>
        {value.toFixed(1)}
        {suffix}
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={onIncrease}
        style={styles.adjustButton}
      >
        <Text style={styles.adjustButtonText}>+</Text>
      </Pressable>
    </View>
  );
}
