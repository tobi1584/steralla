export function formatTime(date) {
  return date
    ? date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';
}

export function compassQuality(accuracy) {
  if (!Number.isFinite(accuracy)) return 'desconocida';
  if (accuracy >= 3) return 'alta';
  if (accuracy === 2) return 'media';
  if (accuracy === 1) return 'baja';
  return 'sin calibrar';
}

export function orientationLabel(orientation) {
  const labels = {
    portrait: 'retrato',
    portraitUpsideDown: 'retrato invertido',
    landscapeLeft: 'paisaje izquierdo',
    landscapeRight: 'paisaje derecho',
  };

  return labels[orientation] || 'desconocida';
}
