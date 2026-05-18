import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const PRIMARY = '#1a73e8';
const ACCENT = '#34a853';
const BG = '#f8f9fa';
const CARD = '#ffffff';
const TEXT = '#202124';
const TEXT2 = '#5f6368';
const BORDER = '#dadce0';

const STRESS_SCENARIOS = [
  {
    label: '🚫 No Provider Available',
    text: 'bijli ka kaam chahiye aaj raat 2 baje F-20 mein',
    scenario: 'no_provider',
  },
  {
    label: '❌ Provider Cancels',
    text: 'AC repair G-13 kal 9 baje',
    scenario: 'provider_cancels',
  },
  {
    label: '✏️ Misspelled Input',
    text: 'mujhe plasticer chahiye G-11 maen pani ka masla hai',
    scenario: 'misspelled',
  },
  {
    label: '⚡ Provider Conflict',
    text: 'Usman AC Specialist abhi chahiye G-13',
    scenario: 'conflict',
  },
  {
    label: '💸 Price Dispute',
    text: 'electrician F-7 kal, budget 500 rupees',
    scenario: 'price_dispute',
  },
];

export default function HomeScreen({ navigation }) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStressTests, setShowStressTests] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.96, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const handleSubmit = (text = inputText, scenario = null) => {
    if (!text.trim()) return;
    setLoading(true);
    startPulse();
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Understanding', { requestText: text, scenario });
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Hero Header */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim }]}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>🤖</Text>
          </View>
          <Text style={styles.heroTitle}>KaamAsan AI</Text>
          <Text style={styles.heroSub}>
            Pakistan's smartest informal economy assistant — supporting Urdu, Roman Urdu & English
          </Text>
        </Animated.View>

        {/* Input Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cardLabel}>📝 Apni zaroorat likhein</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={5}
            placeholder={
              'AC bilkul kaam nahi kar raha, kal subah G-13 mein\ntechnician chahiye...\n\n(Urdu, Roman Urdu, or English)'
            }
            placeholderTextColor="#9aa0a6"
            value={inputText}
            onChangeText={setInputText}
            textAlignVertical="top"
          />
          <View style={styles.langRow}>
            {['اردو', 'Roman Urdu', 'English'].map((l) => (
              <View key={l} style={styles.langBadge}>
                <Text style={styles.langText}>{l}</Text>
              </View>
            ))}
          </View>

          {loading ? (
            <Animated.View style={[styles.loadingBtn, { transform: [{ scale: pulseAnim }] }]}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText}>  AI is analyzing...</Text>
            </Animated.View>
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, !inputText.trim() && styles.submitBtnDisabled]}
              onPress={() => handleSubmit()}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>🔍 Find Best Providers</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Quick Examples */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cardLabel}>💡 Quick Examples</Text>
          {[
            'AC bilkul kaam nahi, kal subah G-13 mein chahiye',
            'Plumber chahiye aaj, pipe leak ho rahi hai G-10',
            'English teacher 9th class ke liye F-7 mein',
            'Gaari ki oil change karwani hai I-10 mein',
          ].map((ex, i) => (
            <TouchableOpacity
              key={i}
              style={styles.exampleRow}
              onPress={() => setInputText(ex)}
              activeOpacity={0.7}
            >
              <Text style={styles.exampleArrow}>→</Text>
              <Text style={styles.exampleText}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Stress Test Panel */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.stressHeader}
            onPress={() => setShowStressTests(!showStressTests)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardLabel}>🧪 Stress Test Scenarios</Text>
            <Text style={styles.stressChevron}>{showStressTests ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showStressTests && (
            <View>
              <Text style={styles.stressDesc}>
                Tap any scenario to demo edge-case handling by KaamAsan AI.
              </Text>
              {STRESS_SCENARIOS.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.stressBtn}
                  onPress={() => handleSubmit(s.text, s.scenario)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stressBtnText}>{s.label}</Text>
                  <Text style={styles.stressBtnSub} numberOfLines={1}>
                    "{s.text}"
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>

        {/* How It Works */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cardLabel}>⚙️ How It Works</Text>
          {[
            ['1️⃣', 'You describe your need in any language'],
            ['2️⃣', 'AI extracts service, location, urgency & complexity'],
            ['3️⃣', 'We rank the 6 best providers using 8-factor scoring'],
            ['4️⃣', 'Book, track, and pay transparently'],
          ].map(([icon, text], i) => (
            <View key={i} style={styles.howRow}>
              <Text style={styles.howIcon}>{icon}</Text>
              <Text style={styles.howText}>{text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Baseline Comparison Screen Button */}
        <TouchableOpacity
          style={styles.baselineBtn}
          onPress={() => navigation.navigate('Baseline')}
          activeOpacity={0.8}
        >
          <Text style={styles.baselineBtnText}>📊 Why AI? See the Comparison</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16 },

  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  heroEmoji: { fontSize: 40 },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: TEXT2,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },

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
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  input: {
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: TEXT,
    minHeight: 120,
    lineHeight: 22,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  langRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  langBadge: {
    backgroundColor: '#e8f0fe',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  langText: { fontSize: 11, color: PRIMARY, fontWeight: '600' },

  submitBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { backgroundColor: '#9aa0a6' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loadingBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  exampleArrow: { color: PRIMARY, fontWeight: '700', marginRight: 8, marginTop: 1 },
  exampleText: { color: TEXT, fontSize: 13, flex: 1, lineHeight: 20 },

  stressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stressChevron: { color: TEXT2, fontSize: 12 },
  stressDesc: { color: TEXT2, fontSize: 12, marginBottom: 10, lineHeight: 18 },
  stressBtn: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  stressBtnText: { color: '#e65100', fontWeight: '700', fontSize: 13 },
  stressBtnSub: { color: '#bf360c', fontSize: 11, marginTop: 3 },

  howRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  howIcon: { fontSize: 20, marginRight: 10 },
  howText: { color: TEXT2, fontSize: 13, flex: 1, lineHeight: 20 },
  baselineBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: PRIMARY,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  baselineBtnText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '700',
  },
});
