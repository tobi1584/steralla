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
    top: 48,
    left: 78,
    right: 16,
    maxWidth: 290,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(4, 10, 25, 0.82)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },

  statusTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  statusText: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 15,
  },

  statusSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusCopy: {
    flexShrink: 1,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 9,
    backgroundColor: '#fbbf24',
  },

  statusDotReady: {
    backgroundColor: '#34d399',
  },

  statusDotError: {
    backgroundColor: '#fb7185',
  },

  statusDetail: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 5,
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
    left: 0,
    top: 0,
    width: 76,
    alignItems: 'center',
  },

  bodyDotSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
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

  constellationLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(219, 234, 254, 0.34)',
  },

  constellationLineSelected: {
    height: 1.5,
    backgroundColor: 'rgba(224, 242, 254, 0.62)',
    shadowColor: '#bae6fd',
    shadowOpacity: 0.45,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },

  constellationStar: {
    position: 'absolute',
    backgroundColor: 'rgba(241, 245, 249, 0.72)',
    shadowColor: '#fff',
    shadowOpacity: 0.5,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },

  constellationStarSelected: {
    backgroundColor: '#fff',
    shadowOpacity: 0.95,
    shadowRadius: 7,
    elevation: 5,
  },

  constellationLabel: {
    position: 'absolute',
    width: 120,
    alignItems: 'center',
  },

  constellationName: {
    color: 'rgba(226, 232, 240, 0.58)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowRadius: 3,
  },

  constellationNameSelected: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontWeight: '700',
  },

  deepSkyMarker: {
    position: 'absolute',
    width: 68,
    alignItems: 'center',
  },

  deepSkyGlow: {
    width: 25,
    height: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(221, 214, 254, 0.48)',
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
    transform: [{ rotate: '-25deg' }],
    shadowColor: '#c4b5fd',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  deepSkyGlowSelected: {
    borderColor: 'rgba(237, 233, 254, 0.9)',
    backgroundColor: 'rgba(196, 181, 253, 0.28)',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },

  deepSkyName: {
    color: 'rgba(221, 214, 254, 0.62)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowRadius: 3,
  },

  deepSkyNameSelected: {
    color: '#ede9fe',
    fontWeight: '700',
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

  targetGuide: {
    position: 'absolute',
    width: 108,
    alignItems: 'center',
  },

  targetArrow: {
    color: '#fff',
    fontSize: 34,
    lineHeight: 38,
    textShadowColor: 'rgba(56, 189, 248, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  targetGuideName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginTop: -2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(3, 8, 20, 0.86)',
  },

  targetVisibleBadge: {
    position: 'absolute',
    left: '50%',
    bottom: 42,
    flexDirection: 'row',
    alignItems: 'center',
    width: 210,
    marginLeft: -105,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: 'rgba(3, 8, 20, 0.86)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  targetVisibleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  targetVisibleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  menuArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
    alignItems: 'flex-start',
  },

  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },

  menuBackdropPressable: {
    flex: 1,
  },

  menuButton: {
    position: 'absolute',
    top: 46,
    left: 16,
    zIndex: 102,
    elevation: 102,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: 'rgba(4, 10, 25, 0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  menuButtonOpen: {
    backgroundColor: '#2563eb',
  },

  menuButtonIcon: {
    color: '#fff',
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '500',
  },

  menuPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 101,
    elevation: 101,
    bottom: 0,
    width: 320,
    maxWidth: '88%',
    paddingTop: 110,
    paddingHorizontal: 18,
    paddingBottom: 24,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: 'rgba(3, 8, 20, 0.99)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 6, height: 0 },
  },

  drawerHeader: {
    marginBottom: 20,
  },

  drawerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 3,
  },

  drawerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },

  menuSectionHeader: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: 'rgba(30, 64, 175, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.8)',
  },

  menuSectionHeaderSecondary: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: 'rgba(30, 41, 59, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },

  menuSectionTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  menuSectionChevron: {
    color: '#dbeafe',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '700',
  },

  menuTabs: {
    flexDirection: 'row',
    padding: 3,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },

  menuTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },

  menuTabActive: {
    backgroundColor: '#2563eb',
  },

  menuTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },

  menuTabTextActive: {
    color: '#fff',
  },

  menuEyebrow: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  menuTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 3,
    marginBottom: 12,
  },

  menuScroll: {
    flex: 1,
  },

  menuScrollContent: {
    paddingBottom: 14,
  },

  bodyList: {
    gap: 6,
    marginTop: 8,
  },

  targetGroup: {
    gap: 6,
    marginBottom: 8,
  },

  targetGroupLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 2,
    textTransform: 'uppercase',
  },

  bodyGroup: {
    marginBottom: 13,
  },

  bodyGroupTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 7,
    textTransform: 'uppercase',
  },

  bodyGrid: {
    gap: 6,
  },

  bodyChoice: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    borderRadius: 13,
    backgroundColor: 'rgba(30, 41, 59, 0.72)',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  bodyChoiceSelected: {
    backgroundColor: 'rgba(30, 64, 175, 0.72)',
    borderColor: '#60a5fa',
  },

  bodyChoiceDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    marginRight: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#fff',
  },

  bodyChoiceName: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  bodyChoiceAction: {
    color: '#bae6fd',
    fontSize: 11,
    fontWeight: '700',
  },

  stopGuideButton: {
    alignItems: 'center',
    paddingVertical: 9,
    marginTop: 4,
  },

  calibrationDisclosure: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },

  calibrationDisclosureText: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },

  calibrationDisclosureChevron: {
    color: '#94a3b8',
    fontSize: 18,
  },

  stopGuideText: {
    color: '#fda4af',
    fontSize: 12,
    fontWeight: '700',
  },

  calibrateMenuButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },

  calibrateMenuButtonDisabled: {
    opacity: 0.6,
  },

  calibrateMenuText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },

  calibrationMenuContent: {
    paddingTop: 12,
    paddingBottom: 8,
  },

  calibrationProfileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },

  calibrationDescription: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17,
    marginTop: -5,
    marginBottom: 10,
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
