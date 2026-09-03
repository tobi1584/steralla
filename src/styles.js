import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030713',
  },

  cameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#080d1a',
  },

  cameraPlaceholderText: {
    color: '#cbd5e1',
    fontSize: 15,
    paddingHorizontal: 30,
    textAlign: 'center',
  },

  statusCard: {
    position: 'absolute',
    top: 42,
    left: 12,
    right: 12,
    maxWidth: 430,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(3, 8, 20, 0.76)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },

  statusTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },

  statusText: {
    color: '#eef2ff',
    fontSize: 12,
    lineHeight: 17,
  },

  diagnosticText: {
    color: '#fde68a',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },

  statusTime: {
    color: '#a5b4c8',
    fontSize: 11,
    marginTop: 2,
  },

  errorText: {
    color: '#fecaca',
    fontSize: 12,
    marginTop: 5,
  },

  hintText: {
    color: '#fde68a',
    fontSize: 12,
    marginTop: 6,
  },

  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#334155',
    borderRadius: 7,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  skyOverlay: {
    overflow: 'hidden',
  },

  horizonLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(103, 232, 249, 0.95)',
    shadowColor: '#083344',
    shadowOpacity: 0.9,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 5,
  },

  horizonLabel: {
    position: 'absolute',
    width: 104,
    alignItems: 'center',
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: 'rgba(8, 51, 68, 0.82)',
    borderColor: 'rgba(165, 243, 252, 0.8)',
    borderWidth: StyleSheet.hairlineWidth,
  },

  horizonIndicator: {
    position: 'absolute',
    width: 110,
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(8, 51, 68, 0.88)',
    borderColor: 'rgba(165, 243, 252, 0.85)',
    borderWidth: 1,
  },

  horizonLabelText: {
    color: '#cffafe',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  bodyMarker: {
    position: 'absolute',
    width: 76,
    alignItems: 'center',
  },

  bodyDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#fff',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 7,
  },

  bodyName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: '#000',
    textShadowRadius: 3,
  },

  bodyAltitude: {
    color: '#e2e8f0',
    fontSize: 10,
    textShadowColor: '#000',
    textShadowRadius: 3,
  },

  crosshairHorizontal: {
    position: 'absolute',
    width: 26,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  bottomArea: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 22,
  },

  toolbar: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },

  toolbarButton: {
    minWidth: 128,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  toolbarButtonActive: {
    backgroundColor: 'rgba(30, 64, 175, 0.92)',
  },

  toolbarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  objectsPanel: {
    maxHeight: 310,
    backgroundColor: 'rgba(3, 8, 20, 0.92)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    padding: 11,
  },

  objectsScroll: {
    maxHeight: 265,
  },

  panelHeading: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
  },

  objectRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },

  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  objectName: {
    width: 70,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  objectData: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 11,
  },

  calibrationPanel: {
    backgroundColor: 'rgba(3, 8, 20, 0.92)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    padding: 11,
  },

  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
  },

  controlLabel: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 12,
  },

  controlValue: {
    width: 55,
    color: '#fff',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },

  adjustButton: {
    width: 34,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    borderRadius: 7,
  },

  adjustButtonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 22,
  },

  recalibrateButton: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    marginTop: 7,
    paddingVertical: 9,
  },

  recalibrateText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default styles;
