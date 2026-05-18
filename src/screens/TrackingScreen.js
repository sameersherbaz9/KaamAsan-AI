import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

const PRIMARY = '#1a73e8';
const ACCENT = '#34a853';
const WARN = '#fbbc04';
const BG = '#f8f9fa';
const CARD = '#ffffff';
const TEXT = '#202124';
const TEXT2 = '#5f6368';

const STAGES = [
  { key: 'booked', label: 'Booked', icon: '✅', desc: 'Your booking is confirmed and provider notified.' },
  { key: 'enroute', label: 'Provider En Route', icon: '🚗', desc: 'Provider is on the way to your location.' },
  { key: 'arrived', label: 'Arrived', icon: '📍', desc: 'Provider has arrived at your address.' },
  { key: 'inprogress', label: 'In Progress', icon: '🔧', desc: 'Service is currently being performed.' },
  { key: 'completed', label: 'Completed', icon: '🎉', desc: 'Service completed successfully!' },
];

const COMPLETION_CHECKLIST = [
  'Issue diagnosed and explained to customer',
  'Required parts installed / work completed',
  'Area cleaned up after work',
  'Customer satisfaction confirmed',
  'Digital receipt generated',
  'Warranty / service guarantee issued',
];

export default function TrackingScreen({ route, navigation }) {
  const { provider, parsed, bookingId, pricing, scenario } = route.params || {};
  const [currentStage, setCurrentStage] = useState(0);
  const [checklist, setChecklist] = useState(COMPLETION_CHECKLIST.map(() => false));
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Auto advance through stages every 3s (demo mode)
    let stage = 0;
    const interval = setInterval(() => {
      if (stage < STAGES.length - 1) {
        stage++;
        setCurrentStage(stage);
        Animated.timing(progressAnim, {
          toValue: stage / (STAGES.length - 1),
          duration: 500,
          useNativeDriver: false,
        }).start();
      } else {
        clearInterval(interval);
        // Auto-check items when completed
        COMPLETION_CHECKLIST.forEach((_, i) => {
          setTimeout(() => {
            setChecklist(prev => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }, i * 400);
        });
      }
    }, 3000);

    // Pulse animation for current stage indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const isCompleted = currentStage === STAGES.length - 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <Text style={styles.headerSub}>{bookingId}</Text>
      </View>

      {/* Provider Info */}
      <View style={styles.providerCard}>
        <Text style={styles.providerEmoji}>👷</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.providerName}>{provider?.name}</Text>
          <Text style={styles.providerService}>{provider?.service?.[0]} · {provider?.location?.area}</Text>
        </View>
        {!isCompleted && (
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.liveDotInner} />
            <Text style={styles.liveText}>LIVE</Text>
          </Animated.View>
        )}
        {isCompleted && (
          <View style={styles.doneBadge}>
            <Text style={styles.doneBadgeText}>DONE ✓</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
      </View>

      {/* Stage Steps */}
      <View style={styles.stagesCard}>
        {STAGES.map((stage, index) => {
          const isDone = index < currentStage;
          const isActive = index === currentStage;
          return (
            <View key={stage.key} style={styles.stageRow}>
              {/* Connector line */}
              {index > 0 && (
                <View style={[styles.connector, isDone && styles.connectorDone]} />
              )}
              {/* Circle */}
              <View style={[
                styles.stageDot,
                isDone && styles.stageDotDone,
                isActive && styles.stageDotActive,
              ]}>
                <Text style={styles.stageDotText}>
                  {isDone ? '✓' : isActive ? stage.icon : '○'}
                </Text>
              </View>
              {/* Label */}
              <View style={styles.stageInfo}>
                <Text style={[
                  styles.stageLabel,
                  isDone && { color: ACCENT },
                  isActive && { color: PRIMARY, fontWeight: '800' },
                ]}>
                  {stage.label}
                </Text>
                {(isDone || isActive) && (
                  <Text style={styles.stageDesc}>{stage.desc}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* ETA info */}
      {!isCompleted && (
        <View style={styles.etaCard}>
          <Text style={styles.etaIcon}>⏱️</Text>
          <View>
            <Text style={styles.etaTitle}>Estimated Time</Text>
            <Text style={styles.etaValue}>
              {currentStage === 0 ? '~25 minutes to arrive' :
               currentStage === 1 ? '~12 minutes away' :
               currentStage === 2 ? 'Provider has arrived!' :
               'Service in progress...'}
            </Text>
          </View>
        </View>
      )}

      {/* Completion Checklist */}
      {isCompleted && (
        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>✅ Service Completion Checklist</Text>
          {COMPLETION_CHECKLIST.map((item, i) => (
            <View key={i} style={styles.checklistRow}>
              <Text style={[styles.checkIcon, checklist[i] && { color: ACCENT }]}>
                {checklist[i] ? '✓' : '○'}
              </Text>
              <Text style={[styles.checkItem, checklist[i] && { color: TEXT }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      {isCompleted && (
        <View>
          <TouchableOpacity
            style={styles.feedbackBtn}
            onPress={() => navigation.navigate('Feedback', { provider, bookingId, pricing })}
            activeOpacity={0.85}
          >
            <Text style={styles.feedbackBtnText}>⭐ Rate This Service</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.disputeBtn}
            onPress={() => navigation.navigate('Dispute', { provider, bookingId, pricing })}
            activeOpacity={0.8}
          >
            <Text style={styles.disputeBtnText}>⚠️ Report an Issue</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16 },

  header: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: '#e8f0fe', fontSize: 12, marginTop: 4, letterSpacing: 1 },

  providerCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  providerEmoji: { fontSize: 32, marginRight: 12 },
  providerName: { fontSize: 15, fontWeight: '700', color: TEXT },
  providerService: { fontSize: 12, color: TEXT2, marginTop: 2 },
  liveDot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6f4ea',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 4,
  },
  liveDotInner: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT,
  },
  liveText: { color: ACCENT, fontSize: 11, fontWeight: '800' },
  doneBadge: {
    backgroundColor: ACCENT, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  doneBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: { height: '100%', backgroundColor: PRIMARY, borderRadius: 4 },

  stagesCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  stageRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  connector: {
    position: 'absolute',
    left: 17,
    top: -20,
    width: 2,
    height: 24,
    backgroundColor: '#e0e0e0',
  },
  connectorDone: { backgroundColor: ACCENT },
  stageDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f1f3f4',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, marginBottom: 16,
    borderWidth: 2, borderColor: '#e0e0e0',
  },
  stageDotDone: { backgroundColor: ACCENT, borderColor: ACCENT },
  stageDotActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  stageDotText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  stageInfo: { flex: 1, paddingTop: 6 },
  stageLabel: { fontSize: 14, fontWeight: '600', color: TEXT2, marginBottom: 2 },
  stageDesc: { fontSize: 12, color: TEXT2, lineHeight: 18 },

  etaCard: {
    backgroundColor: '#e8f0fe',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  etaIcon: { fontSize: 28 },
  etaTitle: { fontSize: 11, color: TEXT2, fontWeight: '600', marginBottom: 2 },
  etaValue: { fontSize: 15, color: PRIMARY, fontWeight: '700' },

  checklistCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  checklistTitle: { fontWeight: '700', fontSize: 14, color: TEXT, marginBottom: 12 },
  checklistRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 10 },
  checkIcon: { fontSize: 18, color: '#e0e0e0', fontWeight: '700' },
  checkItem: { fontSize: 13, color: TEXT2, flex: 1, lineHeight: 20 },

  feedbackBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10,
    shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  feedbackBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  disputeBtn: {
    backgroundColor: '#fff3e0',
    borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#ffe0b2',
  },
  disputeBtnText: { color: '#e65100', fontWeight: '700', fontSize: 14 },
});
