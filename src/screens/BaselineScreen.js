import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

const PRIMARY = '#1a73e8';
const ACCENT = '#34a853';
const ERROR = '#ea4335';
const BG = '#f8f9fa';
const CARD = '#ffffff';
const TEXT = '#202124';
const TEXT2 = '#5f6368';

const COMPARISON_DATA = [
  {
    icon: '🗣️',
    title: 'Language Support',
    traditional: 'English only. No support for local languages or regional phrasings.',
    aiSystem: 'Urdu, Roman Urdu, English, and Mixed ("Minglish") conversational voice & text inputs.',
  },
  {
    icon: '🧮',
    title: 'Provider Matching',
    traditional: 'Rigid filters. Simple alphabetical sorting or basic star-rating lists.',
    aiSystem: 'Advanced 8-Factor Weighted Scoring Matrix (Star Rating, Distance, Punctuality, Specialization, Availability, Risk, etc.).',
  },
  {
    icon: '💰',
    title: 'Pricing Model',
    traditional: 'Opaque flat-rates or random offline quotes with high bargaining friction.',
    aiSystem: 'Transparent, algorithm-driven billing sheets adjusted for Urgency, Complexity, and Travel distances.',
  },
  {
    icon: '✏️',
    title: 'User Booking Flow',
    traditional: 'Tedious, multi-step structured forms with rigid dropdown boxes.',
    aiSystem: 'Natural voice/text prompts. Intuitively clarifies missing pieces conversationally.',
  },
  {
    icon: '⚠️',
    title: 'Dispute Resolution',
    traditional: 'Manual call centers. Slow response times and no structured guarantees.',
    aiSystem: 'Automated 5-category resolution workflows matching issues to refunds or reschedules instantly.',
  },
];

export default function BaselineScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📈 Why AI Orchestration?</Text>
      <Text style={styles.subtitle}>
        See how KaamAsan AI compares directly against traditional keyword-based directory apps.
      </Text>

      {COMPARISON_DATA.map((item, idx) => (
        <Card key={idx} style={styles.comparisonCard} mode="elevated">
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.headerIcon}>{item.icon}</Text>
            <Text style={styles.headerTitle}>{item.title}</Text>
          </View>

          {/* Grid Blocks */}
          <View style={styles.comparisonGrid}>
            {/* Traditional Block */}
            <View style={[styles.columnBlock, styles.traditionalBlock]}>
              <View style={styles.rowLabel}>
                <Text style={styles.badgeDotRed}>●</Text>
                <Text style={styles.columnTitle}>Traditional Apps</Text>
              </View>
              <Text style={styles.blockText}>{item.traditional}</Text>
            </View>

            {/* Our AI Block */}
            <View style={[styles.columnBlock, styles.aiBlock]}>
              <View style={styles.rowLabel}>
                <Text style={styles.badgeDotGreen}>●</Text>
                <Text style={[styles.columnTitle, { color: PRIMARY }]}>KaamAsan AI</Text>
              </View>
              <Text style={[styles.blockText, { color: TEXT }]}>{item.aiSystem}</Text>
            </View>
          </View>
        </Card>
      ))}

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.backBtnText}>← Return to App</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: TEXT2,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  comparisonCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  headerIcon: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: TEXT },
  
  comparisonGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  columnBlock: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  traditionalBlock: {
    backgroundColor: '#f1f3f4',
    borderColor: '#e8eaed',
  },
  aiBlock: {
    backgroundColor: '#e8f0fe',
    borderColor: '#d2e3fc',
    borderWidth: 1.5,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badgeDotRed: { color: ERROR, fontSize: 14 },
  badgeDotGreen: { color: ACCENT, fontSize: 14 },
  columnTitle: { fontSize: 12, fontWeight: '800', color: TEXT2, textTransform: 'uppercase', letterSpacing: 0.5 },
  blockText: { fontSize: 13, color: TEXT2, lineHeight: 18 },

  backBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
