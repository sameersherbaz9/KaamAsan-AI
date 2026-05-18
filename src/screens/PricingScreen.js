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

const PRIMARY = '#1a73e8';
const ACCENT = '#34a853';
const WARN = '#fbbc04';
const ERROR = '#ea4335';
const BG = '#f8f9fa';
const CARD = '#ffffff';
const TEXT = '#202124';
const TEXT2 = '#5f6368';

function computePricing(provider, parsed) {
  const baseRate = provider.base_rate;
  const dist = provider.distance || 3;

  // Distance fee: PKR 80/km
  const distanceFee = Math.round(dist * 80);

  // Urgency surcharge
  const urgencySurcharge =
    parsed?.urgency === 'high' ? Math.round(baseRate * 0.15) :
    parsed?.urgency === 'medium' ? Math.round(baseRate * 0.05) : 0;

  // Complexity fee
  const complexityFee =
    parsed?.complexity === 'complex' ? Math.round(baseRate * 0.20) :
    parsed?.complexity === 'intermediate' ? Math.round(baseRate * 0.10) : 0;

  // Loyalty discount (mock: 5% if reviews > 150)
  const loyaltyDiscount = provider.reviews_count > 150 ? Math.round(baseRate * 0.05) : 0;

  // Platform fee: 8% of base
  const platformFee = Math.round(baseRate * 0.08);

  const subtotal = baseRate + distanceFee + urgencySurcharge + complexityFee - loyaltyDiscount + platformFee;
  const total = subtotal;

  // Budget alternative
  const budgetTotal = Math.round(total * 0.75);

  // Provider earnings (platform takes 20%)
  const providerEarnings = Math.round((baseRate + distanceFee + urgencySurcharge + complexityFee) * 0.80);

  return {
    baseRate,
    distanceFee,
    urgencySurcharge,
    complexityFee,
    loyaltyDiscount,
    platformFee,
    total,
    budgetTotal,
    providerEarnings,
    providerEarningsPercent: Math.round(providerEarnings / total * 100),
  };
}

function LineItem({ icon, label, value, isDiscount, isPrimary, isBold }) {
  return (
    <View style={[styles.lineItem, isPrimary && styles.lineItemTotal]}>
      <Text style={styles.lineIcon}>{icon}</Text>
      <Text style={[styles.lineLabel, isPrimary && styles.lineLabelTotal, isBold && { fontWeight: '700' }]}>
        {label}
      </Text>
      <Text style={[
        styles.lineValue,
        isDiscount && { color: ACCENT },
        isPrimary && styles.lineValueTotal,
      ]}>
        {isDiscount ? '−' : ''}PKR {Math.abs(value).toLocaleString()}
      </Text>
    </View>
  );
}

export default function PricingScreen({ route, navigation }) {
  const { provider, parsed, requestText, scenario } = route.params || {};
  const [phase, setPhase] = useState('loading');
  const [showBudget, setShowBudget] = useState(parsed?.priceSensitivity === 'budget');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pricing = computePricing(provider, parsed);

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('result');
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  if (phase === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Calculating transparent pricing...</Text>
        <Text style={styles.loadingSub}>Base rate + distance + urgency + complexity</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Provider Summary */}
      <Animated.View style={[styles.providerSummary, { opacity: fadeAnim }]}>
        <View style={styles.providerSummaryLeft}>
          <Text style={styles.providerSummaryName}>{provider.name}</Text>
          <Text style={styles.providerSummaryService}>{provider.service[0]} · {provider.location.area}</Text>
        </View>
        <View style={styles.matchPill}>
          <Text style={styles.matchPillText}>{provider.matchScore}% Match</Text>
        </View>
      </Animated.View>

      {/* Price Breakdown */}
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.cardTitle}>💰 Full Price Breakdown</Text>

        <LineItem icon="🔧" label="Base Service Rate" value={pricing.baseRate} />
        <LineItem icon="📍" label={`Distance Fee (${provider.distance?.toFixed(1) || 3} km × PKR 80)`} value={pricing.distanceFee} />
        {pricing.urgencySurcharge > 0 && (
          <LineItem
            icon="🚨"
            label={`Urgency Surcharge (${parsed?.urgency === 'high' ? '15%' : '5%'})`}
            value={pricing.urgencySurcharge}
          />
        )}
        {pricing.complexityFee > 0 && (
          <LineItem
            icon="⚙️"
            label={`Complexity Fee (${parsed?.complexity})`}
            value={pricing.complexityFee}
          />
        )}
        {pricing.loyaltyDiscount > 0 && (
          <LineItem icon="🎁" label="Loyalty Discount (5%)" value={pricing.loyaltyDiscount} isDiscount />
        )}
        <LineItem icon="🏢" label="Platform Fee (8%)" value={pricing.platformFee} />

        {/* Divider */}
        <View style={styles.divider} />

        <LineItem icon="💳" label="TOTAL" value={pricing.total} isPrimary isBold />
      </Animated.View>

      {/* Budget Alternative */}
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.budgetHeader}
          onPress={() => setShowBudget(!showBudget)}
          activeOpacity={0.8}
        >
          <Text style={styles.budgetTitle}>💸 Budget-Sensitive Alternative {showBudget ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showBudget && (
          <View style={styles.budgetContent}>
            <Text style={styles.budgetText}>
              Switch to a basic service plan with a partner provider. Same service, adjusted scope.
            </Text>
            <View style={styles.budgetPriceRow}>
              <View>
                <Text style={styles.budgetOld}>PKR {pricing.total.toLocaleString()}</Text>
                <Text style={styles.budgetNew}>PKR {pricing.budgetTotal.toLocaleString()}</Text>
              </View>
              <View style={styles.savingBadge}>
                <Text style={styles.savingText}>Save 25%</Text>
              </View>
            </View>
            <Text style={styles.budgetCaveats}>
              ⚠️ Budget plan: Parts not included · No warranty · Basic job scope only
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Fairness Note */}
      <Animated.View style={[styles.fairnessCard, { opacity: fadeAnim }]}>
        <Text style={styles.fairnessTitle}>⚖️ Provider Fairness Note</Text>
        <View style={styles.earningsBar}>
          <View style={[styles.earningsFill, { width: `${pricing.providerEarningsPercent}%` }]} />
        </View>
        <Text style={styles.fairnessText}>
          <Text style={{ fontWeight: '700', color: ACCENT }}>
            PKR {pricing.providerEarnings.toLocaleString()} ({pricing.providerEarningsPercent}%)
          </Text>
          {' '}goes directly to the provider.{'\n'}
          Platform retains 20% to cover insurance, quality checks, and dispute resolution.
        </Text>
      </Animated.View>

      {/* Price Dispute Scenario */}
      {scenario === 'price_dispute' && (
        <Animated.View style={[styles.disputeWarn, { opacity: fadeAnim }]}>
          <Text style={styles.disputeWarnTitle}>⚠️ Budget Mismatch Alert</Text>
          <Text style={styles.disputeWarnText}>
            Your requested budget (PKR 500) is significantly below the minimum service rate (PKR {pricing.baseRate.toLocaleString()}).{'\n\n'}
            Proceeding may lead to price disputes. We recommend the budget-alternative plan above or a different provider.
          </Text>
        </Animated.View>
      )}

      {/* CTA */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('Booking', { provider, parsed, pricing, requestText, scenario })}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>✅ Confirm & Book for PKR {pricing.total.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>← Choose Different Provider</Text>
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
    flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  loadingText: { fontSize: 18, fontWeight: '700', color: PRIMARY, marginTop: 16 },
  loadingSub: { color: TEXT2, fontSize: 13, marginTop: 6 },

  providerSummary: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  providerSummaryLeft: {},
  providerSummaryName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  providerSummaryService: { color: '#e8f0fe', fontSize: 12, marginTop: 2 },
  matchPill: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  matchPillText: { color: PRIMARY, fontWeight: '800', fontSize: 13 },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 12 },

  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  lineItemTotal: {
    backgroundColor: '#e8f0fe',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 4,
    borderBottomWidth: 0,
  },
  lineIcon: { fontSize: 16, marginRight: 10, width: 24 },
  lineLabel: { flex: 1, color: TEXT2, fontSize: 13 },
  lineLabelTotal: { color: TEXT, fontWeight: '700', fontSize: 15 },
  lineValue: { color: TEXT, fontSize: 14, fontWeight: '600' },
  lineValueTotal: { color: PRIMARY, fontSize: 18, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#dadce0', marginVertical: 8 },

  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetTitle: { fontWeight: '700', color: '#e65100', fontSize: 14 },
  budgetContent: { marginTop: 12 },
  budgetText: { color: TEXT2, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  budgetPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  budgetOld: { fontSize: 13, color: TEXT2, textDecorationLine: 'line-through' },
  budgetNew: { fontSize: 22, fontWeight: '800', color: ACCENT },
  savingBadge: { backgroundColor: '#e6f4ea', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  savingText: { color: ACCENT, fontWeight: '700', fontSize: 13 },
  budgetCaveats: { color: '#bf360c', fontSize: 11, lineHeight: 18 },

  fairnessCard: {
    backgroundColor: '#e6f4ea',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#a8d5b5',
  },
  fairnessTitle: { fontWeight: '700', color: '#137333', fontSize: 14, marginBottom: 8 },
  earningsBar: {
    height: 8,
    backgroundColor: '#c8e6c9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  earningsFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 4 },
  fairnessText: { color: '#2d6a4f', fontSize: 13, lineHeight: 20 },

  disputeWarn: {
    backgroundColor: '#fff3e0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  disputeWarnTitle: { color: '#e65100', fontWeight: '700', fontSize: 14, marginBottom: 6 },
  disputeWarnText: { color: '#bf360c', fontSize: 13, lineHeight: 20 },

  continueBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: ACCENT,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backBtn: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD,
  },
  backBtnText: { color: TEXT2, fontSize: 14, fontWeight: '600' },
});
