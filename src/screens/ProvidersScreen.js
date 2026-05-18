import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import providers from '../data/providers.json';
import { rankProviders } from '../utils/rankingAlgorithm';

const PRIMARY = '#1a73e8';
const ACCENT = '#34a853';
const GOLD = '#fbbc04';
const ERROR = '#ea4335';
const BG = '#f8f9fa';
const CARD = '#ffffff';
const TEXT = '#202124';
const TEXT2 = '#5f6368';

// ─── Star Rating Component ────────────────────────────────────────────────────
function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <Text style={{ color: GOLD, fontSize: 13 }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      <Text style={{ color: TEXT2, fontSize: 11 }}> {rating.toFixed(1)}</Text>
    </Text>
  );
}

// ─── Provider Card ────────────────────────────────────────────────────────────
function ProviderCard({ provider, rank, onSelect, isTop }) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: rank * 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacAnim, {
        toValue: 1,
        duration: 400,
        delay: rank * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: opacAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.providerCard, isTop && styles.topCard]}
        onPress={() => onSelect(provider)}
        activeOpacity={0.88}
      >
        {/* Rank & Top Badge */}
        <View style={styles.rankRow}>
          <View style={[styles.rankBadge, isTop && styles.rankBadgeTop]}>
            <Text style={[styles.rankText, isTop && styles.rankTextTop]}>
              {isTop ? '🏆 #1' : `#${rank}`}
            </Text>
          </View>
          <View style={[styles.matchBadge, { backgroundColor: isTop ? PRIMARY : '#e8f0fe' }]}>
            <Text style={[styles.matchText, { color: isTop ? '#fff' : PRIMARY }]}>
              {provider.matchScore}% Match
            </Text>
          </View>
          {isTop && (
            <View style={styles.topRecommendedBadge}>
              <Text style={styles.topRecommendedText}>⭐ TOP PICK</Text>
            </View>
          )}
        </View>

        {/* Name & Service */}
        <Text style={[styles.providerName, isTop && { color: PRIMARY }]}>{provider.name}</Text>
        <Text style={styles.providerService}>{provider.service.join(' · ')}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Stars rating={provider.rating} />
            <Text style={styles.statLabel}>{provider.reviews_count} reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⏰ {provider.on_time_score}%</Text>
            <Text style={styles.statLabel}>On Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>📍 {provider.distance.toFixed(1)} km</Text>
            <Text style={styles.statLabel}>{provider.location.area}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>❌ {provider.cancellation_rate}%</Text>
            <Text style={styles.statLabel}>Cancel Rate</Text>
          </View>
        </View>

        {/* Specialization Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
          {provider.specializations.map((s, i) => (
            <View key={i} style={styles.specTag}>
              <Text style={styles.specTagText}>{s}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Price & Availability */}
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>PKR {provider.base_rate.toLocaleString()} / visit</Text>
          <Text style={styles.expText}>🏅 {provider.experience_years} yrs exp</Text>
        </View>

        {/* Availability Slots */}
        <View style={styles.slotsRow}>
          <Text style={styles.slotsLabel}>🕐 Available: </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {provider.availability.map((slot, i) => (
              <View key={i} style={styles.slot}>
                <Text style={styles.slotText}>{slot}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Score Breakdown */}
        <View style={styles.breakdownRow}>
          {[
            ['Rating', provider.scoreBreakdown.rating],
            ['On-Time', provider.scoreBreakdown.onTime],
            ['Distance', provider.scoreBreakdown.distance],
            ['Avail.', provider.scoreBreakdown.availability],
          ].map(([label, score]) => (
            <View key={label} style={styles.breakdownItem}>
              <Text style={styles.breakdownScore}>{score}</Text>
              <Text style={styles.breakdownLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Reasoning */}
        <View style={styles.reasoningBox}>
          <Text style={styles.reasoningTitle}>💡 Why ranked #{rank}?</Text>
          <Text style={styles.reasoningText}>{provider.reasoning}</Text>
        </View>

        <TouchableOpacity style={[styles.selectBtn, isTop && styles.selectBtnTop]} onPress={() => onSelect(provider)}>
          <Text style={[styles.selectBtnText, isTop && { color: '#fff' }]}>{isTop ? '✅ Book Top Recommendation' : '→ Select This Provider'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProvidersScreen({ route, navigation }) {
  const { parsed, requestText, scenario } = route.params || {};
  const [phase, setPhase] = useState('loading');
  const [ranked, setRanked] = useState([]);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      let results = rankProviders(parsed, providers);
      
      // Filter availability slots to be strictly after 10:00 AM if user did not specify a time
      const isTimeFlexible = !parsed?.preferredTime || parsed.preferredTime === 'Flexible' || parsed.preferredTime.toLowerCase().includes('flexible');
      if (isTimeFlexible) {
        results = results.map(p => {
          const filteredAvail = p.availability.filter(slot => {
            const isPM = slot.toUpperCase().includes('PM');
            if (isPM) return true;
            const hour = parseInt(slot.split(':')[0], 10);
            return hour >= 10 && hour < 12; // 10:00 AM or 11:00 AM
          });
          return { ...p, availability: filteredAvail };
        });
      }
      
      setRanked(results);
      setPhase(results.length === 0 || scenario === 'no_provider' ? 'no_result' : 'result');
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (phase === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Ranking providers using{'\n'}8-factor AI scoring...</Text>
        <View style={styles.factorsBox}>
          {[
            'Rating × 0.25',
            'On-Time × 0.20',
            'Distance × 0.15',
            'Availability × 0.15',
            'Specialization × 0.10',
            'Cancellation × 0.10',
            'Price × 0.05',
            'Risk × 0.05',
          ].map((f, i) => (
            <Text key={i} style={styles.factorText}>⚙️ {f}</Text>
          ))}
        </View>
      </View>
    );
  }

  if (phase === 'no_result') {
    return (
      <View style={styles.noResultContainer}>
        <Text style={styles.noResultEmoji}>😔</Text>
        <Text style={styles.noResultTitle}>No Providers Available</Text>
        <Text style={styles.noResultSub}>
          No verified providers found in {parsed?.location || 'your area'} for "{parsed?.service}".
        </Text>
        <View style={styles.waitlistBox}>
          <Text style={styles.waitlistTitle}>📋 You've been added to the waitlist!</Text>
          <Text style={styles.waitlistSub}>
            We'll notify you via SMS when a provider becomes available in your area.{'\n\n'}
            Estimated wait: 2-4 hours{'\n'}
            Reference: WL-{Date.now().toString().slice(-6)}
          </Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backBtnText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const top6 = ranked.slice(0, 6);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <Text style={styles.headerTitle}>
          {top6.length} Providers Found
        </Text>
        <Text style={styles.headerSub}>
          For "{parsed?.service}" in {parsed?.location} · Sorted by AI Match Score
        </Text>
      </View>

      {/* Why This Ranking */}
      <TouchableOpacity
        style={styles.whyCard}
        onPress={() => setShowBreakdown(!showBreakdown)}
        activeOpacity={0.8}
      >
        <Text style={styles.whyTitle}>📊 Why This Ranking? {showBreakdown ? '▲' : '▼'}</Text>
        {showBreakdown && (
          <Text style={styles.whyText}>
            Providers are ranked using 8 weighted factors:{'\n'}
            Rating (25%), On-Time (20%), Distance (15%), Availability (15%),{'\n'}
            Specialization (10%), Cancellation Rate (10%), Price (5%), Risk Score (5%).{'\n\n'}
            {parsed?.priceSensitivity === 'budget' && '💡 Budget mode: Price factor weighted higher.\n'}
            {parsed?.urgency === 'high' && '⚡ High urgency: Availability weighted higher.\n'}
            Top-ranked providers best balance all 8 factors for your specific request.
          </Text>
        )}
      </TouchableOpacity>

      {/* Scenario warnings */}
      {scenario === 'conflict' && (
        <View style={styles.conflictBox}>
          <Text style={styles.conflictTitle}>⚡ Provider Conflict Detected</Text>
          <Text style={styles.conflictSub}>
            Usman AC Specialist has a booking conflict at your requested time. We've auto-selected the next best available slot and shown alternative providers below.
          </Text>
        </View>
      )}

      {/* Provider Cards */}
      {top6.map((p, i) => (
        <ProviderCard
          key={p.id}
          provider={p}
          rank={i + 1}
          isTop={i === 0}
          onSelect={(prov) =>
            navigation.navigate('Pricing', { provider: prov, parsed, requestText, scenario })
          }
        />
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 12 },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 26,
  },
  factorsBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    gap: 6,
    width: '100%',
  },
  factorText: { color: TEXT2, fontSize: 12 },

  noResultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  noResultEmoji: { fontSize: 64, marginBottom: 16 },
  noResultTitle: { fontSize: 22, fontWeight: '700', color: TEXT, marginBottom: 8 },
  noResultSub: { color: TEXT2, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  waitlistBox: {
    backgroundColor: '#e8f0fe',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  waitlistTitle: { color: PRIMARY, fontWeight: '700', fontSize: 14, marginBottom: 8 },
  waitlistSub: { color: TEXT2, fontSize: 13, lineHeight: 22 },
  backBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    padding: 14,
    width: '100%',
    alignItems: 'center',
  },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  headerBanner: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: '#e8f0fe', fontSize: 12, marginTop: 4 },

  whyCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  whyTitle: { fontWeight: '700', color: PRIMARY, fontSize: 14 },
  whyText: { color: TEXT2, fontSize: 12, lineHeight: 20, marginTop: 8 },

  conflictBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  conflictTitle: { color: '#e65100', fontWeight: '700', fontSize: 13, marginBottom: 4 },
  conflictSub: { color: '#bf360c', fontSize: 12, lineHeight: 18 },

  providerCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: CARD,
  },
  topCard: {
    borderColor: PRIMARY,
    borderWidth: 2,
    shadowColor: PRIMARY,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  rankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8, flexWrap: 'wrap' },
  rankBadge: {
    backgroundColor: '#f1f3f4',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  rankBadgeTop: { backgroundColor: PRIMARY },
  rankText: { color: TEXT2, fontWeight: '700', fontSize: 12 },
  rankTextTop: { color: '#fff' },
  matchBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  matchText: { fontWeight: '800', fontSize: 12 },
  topRecommendedBadge: {
    backgroundColor: GOLD,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  topRecommendedText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  providerName: { fontSize: 17, fontWeight: '800', color: TEXT, marginBottom: 2 },
  providerService: { fontSize: 12, color: TEXT2, marginBottom: 10 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
    marginBottom: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: CARD },
  statValue: { fontSize: 12, fontWeight: '700', color: TEXT },
  statLabel: { fontSize: 10, color: TEXT2, marginTop: 2 },

  specTag: {
    backgroundColor: '#e8f0fe',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  specTagText: { color: PRIMARY, fontSize: 11, fontWeight: '600' },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  priceText: { fontSize: 15, fontWeight: '700', color: TEXT },
  expText: { fontSize: 12, color: TEXT2 },

  slotsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  slotsLabel: { fontSize: 11, color: TEXT2 },
  slot: {
    backgroundColor: '#e6f4ea',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 5,
  },
  slotText: { color: ACCENT, fontSize: 11, fontWeight: '600' },

  breakdownRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    justifyContent: 'space-around',
  },
  breakdownItem: { alignItems: 'center' },
  breakdownScore: { fontSize: 16, fontWeight: '800', color: PRIMARY },
  breakdownLabel: { fontSize: 10, color: TEXT2 },

  reasoningBox: {
    backgroundColor: '#e8f0fe',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  reasoningTitle: { fontSize: 11, fontWeight: '700', color: PRIMARY, marginBottom: 4 },
  reasoningText: { fontSize: 12, color: TEXT, lineHeight: 18 },

  selectBtn: {
    backgroundColor: '#e8f0fe',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  selectBtnTop: { backgroundColor: PRIMARY },
  selectBtnText: { fontWeight: '700', fontSize: 14, color: PRIMARY },
});
