import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const PRIMARY = '#1a73e8';
const ACCENT = '#34a853';
const ERROR = '#ea4335';
const WARN = '#fbbc04';
const BG = '#f8f9fa';
const CARD = '#ffffff';
const TEXT = '#202124';
const TEXT2 = '#5f6368';

const ISSUE_TYPES = [
  { key: 'no_show', label: '🚫 No-Show (Provider didn\'t arrive)', severity: 'high' },
  { key: 'quality', label: '🔧 Quality Issue (Work unsatisfactory)', severity: 'medium' },
  { key: 'price', label: '💸 Price Dispute (Charged more than agreed)', severity: 'high' },
  { key: 'overrun', label: '⏱️ Time Overrun (Took much longer)', severity: 'low' },
  { key: 'cancel', label: '❌ Cancellation (Provider cancelled last minute)', severity: 'medium' },
];

const RESOLUTIONS = {
  no_show: [
    { key: 'refund', label: '💰 Full Refund', desc: 'Get 100% money back within 24 hours' },
    { key: 'reschedule', label: '📅 Reschedule Free', desc: 'Book again with priority at no cost' },
    { key: 'escalate', label: '👤 Talk to Human Agent', desc: 'Connect with our support team now' },
    { key: 'blacklist', label: '🚫 Blacklist Provider', desc: 'Remove provider from platform' },
  ],
  quality: [
    { key: 'partial_refund', label: '💰 Partial Refund (50%)', desc: 'Get half your money back' },
    { key: 'redo', label: '🔄 Free Redo Service', desc: 'Provider comes back to fix the issue' },
    { key: 'escalate', label: '👤 Talk to Human Agent', desc: 'Connect with our support team now' },
  ],
  price: [
    { key: 'refund_diff', label: '💰 Refund Difference', desc: 'Get refunded the overcharged amount' },
    { key: 'escalate', label: '👤 Talk to Human Agent', desc: 'Connect with our support team now' },
    { key: 'blacklist', label: '🚫 Flag Provider', desc: 'Flag for price manipulation review' },
  ],
  overrun: [
    { key: 'compensation', label: '🎁 PKR 200 Compensation', desc: 'Goodwill credit to your account' },
    { key: 'escalate', label: '👤 Talk to Human Agent', desc: 'Connect with our support team now' },
  ],
  cancel: [
    { key: 'reschedule', label: '📅 Auto-Reschedule', desc: 'Instantly find next best provider' },
    { key: 'refund', label: '💰 Full Refund', desc: 'Get 100% money back within 24 hours' },
    { key: 'blacklist', label: '🚫 Blacklist Provider', desc: 'Remove provider from platform' },
  ],
};

const OUTCOMES = {
  refund: {
    title: '✅ Refund Initiated',
    text: 'A full refund of PKR {amount} has been initiated to your original payment method. You will receive it within 24-48 hours.\n\nCase Reference: DSP-{case}',
    color: ACCENT,
  },
  partial_refund: {
    title: '✅ Partial Refund Initiated',
    text: 'A 50% refund of PKR {amount2} has been initiated. Expect it within 24-48 hours.\n\nCase Reference: DSP-{case}',
    color: ACCENT,
  },
  reschedule: {
    title: '📅 Auto-Rescheduled',
    text: 'Your service has been rescheduled with the next available qualified provider at the same price. You will receive a confirmation SMS shortly.\n\nNew Booking: BK-RESC-{case}',
    color: PRIMARY,
  },
  escalate: {
    title: '👤 Agent Connecting...',
    text: 'A human support agent will contact you within 15 minutes via WhatsApp (+92-51-XXX-XXXX). Average resolution time: 2 hours.\n\nCase Reference: DSP-{case}',
    color: WARN,
  },
  blacklist: {
    title: '🚫 Provider Flagged',
    text: 'This provider has been suspended pending investigation. All their current bookings have been reassigned. Thank you for protecting the community.\n\nCase Reference: DSP-{case}',
    color: ERROR,
  },
  redo: {
    title: '🔄 Redo Service Scheduled',
    text: 'The provider has been instructed to return and redo the work at no cost within 48 hours. They have been warned that poor quality will result in removal.\n\nCase Reference: DSP-{case}',
    color: PRIMARY,
  },
  refund_diff: {
    title: '💰 Overcharge Refunded',
    text: 'The difference between agreed and charged amount has been refunded. Provider has received a warning for price manipulation.\n\nCase Reference: DSP-{case}',
    color: ACCENT,
  },
  compensation: {
    title: '🎁 Compensation Credited',
    text: 'PKR 200 has been credited to your KaamAsan AI wallet as goodwill compensation for the inconvenience.\n\nCase Reference: DSP-{case}',
    color: ACCENT,
  },
  flag: {
    title: '🚩 Provider Flagged',
    text: 'The provider has been flagged for pricing review. This is the {flag_count} complaint against them this month.\n\nCase Reference: DSP-{case}',
    color: ERROR,
  },
};

export default function DisputeScreen({ route, navigation }) {
  const { provider, bookingId, pricing } = route.params || {};
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const handleResolve = () => {
    if (!selectedIssue || !selectedResolution) return;
    const caseNum = Math.floor(Math.random() * 90000) + 10000;
    const outcomeTemplate = OUTCOMES[selectedResolution] || OUTCOMES.escalate;
    const outcomeText = outcomeTemplate.text
      .replace('{amount}', pricing?.total?.toLocaleString() || '0')
      .replace('{amount2}', Math.round((pricing?.total || 0) / 2).toLocaleString())
      .replace(/{case}/g, caseNum.toString())
      .replace('{flag_count}', '3rd');
    setOutcome({ ...outcomeTemplate, text: outcomeText });
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();
  };

  if (outcome) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Animated.View style={[
          styles.outcomeCard,
          { borderColor: outcome.color, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}>
          <Text style={styles.outcomeTitle}>{outcome.title}</Text>
          <Text style={styles.outcomeText}>{outcome.text}</Text>
        </Animated.View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Dispute Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Booking ID</Text>
            <Text style={styles.summaryValue}>{bookingId || 'N/A'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Provider</Text>
            <Text style={styles.summaryValue}>{provider?.name || 'N/A'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Issue Type</Text>
            <Text style={styles.summaryValue}>
              {ISSUE_TYPES.find(i => i.key === selectedIssue)?.label.split('(')[0].trim() || ''}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Resolution</Text>
            <Text style={[styles.summaryValue, { color: outcome.color }]}>
              {outcome.title}
            </Text>
          </View>
          {description ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Your Note</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>{description}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <Text style={styles.homeBtnText}>🏠 Back to Home</Text>
        </TouchableOpacity>
        <View style={{ height: 32 }} />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Provider Banner */}
        {provider && (
          <View style={styles.providerBanner}>
            <Text style={styles.providerBannerName}>⚠️ Report issue with {provider.name}</Text>
            <Text style={styles.providerBannerSub}>Booking: {bookingId}</Text>
          </View>
        )}

        {/* Step 1: Issue Type */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Step 1: What went wrong?</Text>
          {ISSUE_TYPES.map(issue => (
            <TouchableOpacity
              key={issue.key}
              style={[styles.issueOption, selectedIssue === issue.key && styles.issueOptionSelected]}
              onPress={() => { setSelectedIssue(issue.key); setSelectedResolution(null); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.issueLabel, selectedIssue === issue.key && styles.issueLabelSelected]}>
                {issue.label}
              </Text>
              <View style={[
                styles.severityBadge,
                { backgroundColor: issue.severity === 'high' ? '#ffebee' : issue.severity === 'medium' ? '#fff3e0' : '#e6f4ea' }
              ]}>
                <Text style={[
                  styles.severityText,
                  { color: issue.severity === 'high' ? ERROR : issue.severity === 'medium' ? '#e65100' : ACCENT }
                ]}>
                  {issue.severity.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step 2: Description */}
        {selectedIssue && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 2: Describe the issue</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="Please describe what happened in detail..."
              placeholderTextColor="#9aa0a6"
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Step 3: Resolution */}
        {selectedIssue && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Step 3: How would you like this resolved?</Text>
            {(RESOLUTIONS[selectedIssue] || []).map(res => (
              <TouchableOpacity
                key={res.key}
                style={[styles.resOption, selectedResolution === res.key && styles.resOptionSelected]}
                onPress={() => setSelectedResolution(res.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.resLabel, selectedResolution === res.key && { color: PRIMARY }]}>
                  {res.label}
                </Text>
                <Text style={styles.resDesc}>{res.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Submit */}
        {selectedResolution && (
          <TouchableOpacity
            style={styles.resolveBtn}
            onPress={handleResolve}
            activeOpacity={0.85}
          >
            <Text style={styles.resolveBtnText}>⚡ Submit Dispute & Resolve</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16 },

  providerBanner: {
    backgroundColor: '#ffebee',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ef9a9a',
  },
  providerBannerName: { color: ERROR, fontWeight: '700', fontSize: 14 },
  providerBannerSub: { color: '#c62828', fontSize: 12, marginTop: 2 },

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
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 12 },

  issueOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#dadce0',
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  issueOptionSelected: { borderColor: ERROR, backgroundColor: '#fff5f5' },
  issueLabel: { flex: 1, color: TEXT2, fontSize: 13, lineHeight: 20 },
  issueLabelSelected: { color: ERROR, fontWeight: '600' },
  severityBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  severityText: { fontSize: 10, fontWeight: '700' },

  textArea: {
    borderWidth: 1.5,
    borderColor: '#dadce0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: TEXT,
    minHeight: 100,
    lineHeight: 22,
    backgroundColor: '#fafafa',
  },

  resOption: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#dadce0',
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  resOptionSelected: { borderColor: PRIMARY, backgroundColor: '#e8f0fe' },
  resLabel: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 4 },
  resDesc: { fontSize: 12, color: TEXT2 },

  resolveBtn: {
    backgroundColor: ERROR,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: ERROR,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resolveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Outcome
  outcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  outcomeTitle: { fontSize: 20, fontWeight: '800', color: TEXT, marginBottom: 12 },
  outcomeText: { fontSize: 14, color: TEXT2, lineHeight: 24 },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  summaryLabel: { color: TEXT2, fontSize: 13 },
  summaryValue: { color: TEXT, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },

  homeBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14, padding: 16, alignItems: 'center',
    shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  homeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
