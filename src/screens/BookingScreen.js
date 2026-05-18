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
const ERROR = '#ea4335';
const BG = '#f8f9fa';
const CARD = '#ffffff';
const TEXT = '#202124';
const TEXT2 = '#5f6368';

function generateBookingId() {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `BK-${date}-${seq}`;
}

function NotifCard({ icon, title, message, delay, color }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(opacAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.notifCard, { borderLeftColor: color, opacity: opacAnim, transform: [{ translateX: slideAnim }] }]}>
      <Text style={styles.notifIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.notifTitle, { color }]}>{title}</Text>
        <Text style={styles.notifMessage}>{message}</Text>
      </View>
    </Animated.View>
  );
}

export default function BookingScreen({ route, navigation }) {
  const { provider, parsed, pricing, requestText, scenario } = route.params || {};
  const [bookingId] = useState(generateBookingId);
  const [phase, setPhase] = useState('confirming');
  const [cancelledAndRescheduled, setCancelledAndRescheduled] = useState(false);
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const confirmedSlot = parsed?.preferredTime && parsed.preferredTime !== 'Flexible' ? parsed.preferredTime : (provider?.availability?.[0] || '09:00 AM');
  const bookingDate = new Date();
  bookingDate.setDate(bookingDate.getDate() + (parsed?.urgency === 'high' ? 0 : 1));
  
  // Cross-platform custom date string logic (extremely stable on JSC/Hermes)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayName = days[bookingDate.getDay()];
  const monthName = months[bookingDate.getMonth()];
  const dateStr = `${dayName}, ${monthName} ${bookingDate.getDate()}, ${bookingDate.getFullYear()}`;

  useEffect(() => {
    setTimeout(() => {
      setPhase('confirmed');
      Animated.spring(checkmarkScale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 100 }).start();
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

      // Provider cancels scenario: auto-reschedule after 3s
      if (scenario === 'provider_cancels') {
        setTimeout(() => setCancelledAndRescheduled(true), 3000);
      }
    }, 2000);
  }, []);

  if (phase === 'confirming') {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <Text style={styles.loadingEmoji}>⏳</Text>
        </View>
        <Text style={styles.loadingTitle}>Confirming your booking...</Text>
        {['Notifying provider...', 'Locking time slot...', 'Generating booking ID...', 'Sending confirmations...'].map((s, i) => (
          <Text key={i} style={styles.loadingStep}>{s}</Text>
        ))}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Provider Cancels Alert */}
      {cancelledAndRescheduled && (
        <View style={styles.cancelAlert}>
          <Text style={styles.cancelAlertTitle}>❌ Provider Cancelled!</Text>
          <Text style={styles.cancelAlertText}>
            {provider?.name} cancelled your booking due to an emergency.{'\n\n'}
            ✅ Auto-Rescheduled: Your booking has been automatically reassigned to the next best available provider with the same time slot.{'\n\n'}
            New Provider: Alternative Provider · Same rate · Same time
          </Text>
        </View>
      )}

      {/* Checkmark */}
      <Animated.View style={[styles.checkmarkContainer, { transform: [{ scale: checkmarkScale }] }]}>
        <View style={styles.checkmarkCircle}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
        <Text style={styles.confirmedTitle}>Booking Confirmed!</Text>
        <Text style={styles.bookingId}>{bookingId}</Text>
      </Animated.View>

      {/* Booking Details */}
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.cardTitle}>📋 Booking Details</Text>
        {[
          ['👷', 'Provider', provider?.name],
          ['🔧', 'Service', provider?.service?.[0]],
          ['📍', 'Location', parsed?.location || provider?.location?.area],
          ['📅', 'Date', dateStr],
          ['⏰', 'Time', confirmedSlot],
          ['⚙️', 'Complexity', parsed?.complexity?.toUpperCase() || 'BASIC'],
          ['💳', 'Total Amount', `PKR ${pricing?.total?.toLocaleString() || 'N/A'}`],
        ].map(([icon, label, value]) => (
          <View key={label} style={styles.detailRow}>
            <Text style={styles.detailIcon}>{icon}</Text>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Notifications */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.sectionTitle}>📬 Notifications Sent</Text>

        <NotifCard
          icon="💬"
          title="SMS Confirmation Sent"
          message={`Booking confirmed! ${provider?.name} will arrive at ${confirmedSlot} on ${dateStr}. Booking ID: ${bookingId}. Total: PKR ${pricing?.total?.toLocaleString()}. Reply CANCEL to cancel.`}
          delay={200}
          color="#25d366"
        />
        <NotifCard
          icon="🟢"
          title="WhatsApp Message Sent"
          message={`✅ *KaamAsan AI Booking*\n👷 ${provider?.name}\n📅 ${dateStr} at ${confirmedSlot}\n📍 ${parsed?.location}\n💰 PKR ${pricing?.total?.toLocaleString()}\n🔖 ID: ${bookingId}`}
          delay={600}
          color="#25d366"
        />
        <NotifCard
          icon="📅"
          title="Calendar Event Added"
          message={`"${provider?.service?.[0]} - ${provider?.name}" added to your calendar for ${dateStr} at ${confirmedSlot}.`}
          delay={1000}
          color={PRIMARY}
        />
        <NotifCard
          icon="⏰"
          title="Reminder Scheduled"
          message={`You'll receive a reminder 2 hours before the appointment (${confirmedSlot}). Provider will share live location 30 minutes before arrival.`}
          delay={1400}
          color={WARN}
        />
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('Tracking', { provider, parsed, bookingId, pricing, scenario })}
          activeOpacity={0.85}
        >
          <Text style={styles.trackBtnText}>📍 Track Service Live</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.disputeBtn}
          onPress={() => navigation.navigate('Dispute', { provider, bookingId, pricing })}
          activeOpacity={0.8}
        >
          <Text style={styles.disputeBtnText}>⚠️ Report Issue</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16 },

  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', padding: 32,
  },
  loadingEmoji: { fontSize: 48 },
  loadingTitle: { fontSize: 20, fontWeight: '700', color: PRIMARY, marginTop: 16, marginBottom: 20 },
  loadingStep: { color: TEXT2, fontSize: 13, marginBottom: 6 },

  cancelAlert: {
    backgroundColor: '#ffebee',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ef9a9a',
  },
  cancelAlertTitle: { color: ERROR, fontWeight: '800', fontSize: 15, marginBottom: 6 },
  cancelAlertText: { color: '#b71c1c', fontSize: 13, lineHeight: 22 },

  checkmarkContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  checkmarkCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: ACCENT, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  checkmarkText: { color: '#fff', fontSize: 40, lineHeight: 48 },
  confirmedTitle: { fontSize: 22, fontWeight: '800', color: TEXT, marginBottom: 6 },
  bookingId: {
    fontSize: 18, fontWeight: '700', color: PRIMARY,
    letterSpacing: 1, backgroundColor: '#e8f0fe',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 10 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  detailIcon: { fontSize: 16, marginRight: 10, width: 24 },
  detailLabel: { color: TEXT2, fontSize: 13, width: 90 },
  detailValue: { color: TEXT, fontSize: 13, fontWeight: '600', flex: 1, textAlign: 'right' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 10 },

  notifCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  notifIcon: { fontSize: 24, marginRight: 12 },
  notifTitle: { fontWeight: '700', fontSize: 13, marginBottom: 4 },
  notifMessage: { color: TEXT2, fontSize: 12, lineHeight: 18 },

  actions: { marginTop: 8 },
  trackBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10,
    shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  trackBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  disputeBtn: {
    backgroundColor: '#fff3e0',
    borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#ffe0b2',
  },
  disputeBtnText: { color: '#e65100', fontWeight: '700', fontSize: 14 },
});
