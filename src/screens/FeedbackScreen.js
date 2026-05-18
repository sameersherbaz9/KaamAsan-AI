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
const GOLD = '#fbbc04';
const BG = '#f8f9fa';
const CARD = '#ffffff';
const TEXT = '#202124';
const TEXT2 = '#5f6368';

function StarInput({ rating, onRate }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onRate(i)} activeOpacity={0.7}>
          <Text style={[styles.star, i <= rating && styles.starFilled]}>
            {i <= rating ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Separate component so useState is called at the component top level (not inside .map)
function CategoryRow({ label, icon }) {
  const [val, setVal] = useState(0);
  return (
    <View style={styles.catRow}>
      <Text style={styles.catIcon}>{icon}</Text>
      <Text style={styles.catLabel}>{label}</Text>
      <View style={styles.miniStars}>
        {[1, 2, 3, 4, 5].map(i => (
          <TouchableOpacity key={i} onPress={() => setVal(i)}>
            <Text style={[styles.miniStar, i <= val && styles.miniStarFilled]}>
              {i <= val ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const RATING_LABELS = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent!'];
const CATEGORIES = [
  { label: 'Punctuality', icon: '⏰' },
  { label: 'Work Quality', icon: '🔧' },
  { label: 'Communication', icon: '💬' },
  { label: 'Cleanliness', icon: '✨' },
];

export default function FeedbackScreen({ route, navigation }) {
  const { provider, bookingId, pricing } = route.params || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newReputation, setNewReputation] = useState(null);
  const reputationAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const handleSubmit = () => {
    if (rating === 0) return;
    // Simulate updated reputation score
    const oldScore = (provider?.rating || 4.5) * 20; // Convert to 0-100
    const newScore = Math.min(100, Math.round(oldScore * 0.85 + rating * 20 * 0.15));
    setNewReputation(newScore);
    setSubmitted(true);

    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(reputationAnim, { toValue: newScore / 100, useNativeDriver: false, friction: 6 }),
    ]).start();
  };

  if (submitted) {
    const repWidth = reputationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Animated.View style={[styles.successCard, { opacity: successAnim }]}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successSub}>Your feedback helps improve the informal economy ecosystem in Pakistan.</Text>
        </Animated.View>

        {/* Rating Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Your Rating</Text>
          <View style={styles.ratingResultRow}>
            <Text style={styles.ratingBig}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</Text>
            <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
          </View>
          {comment ? (
            <View style={styles.commentBubble}>
              <Text style={styles.commentText}>"{comment}"</Text>
            </View>
          ) : null}
        </View>

        {/* Updated Reputation Score */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏅 {provider?.name} Updated Reputation</Text>
          <Text style={styles.repOld}>
            Previous Score: {Math.round((provider?.rating || 4.5) * 20)}/100
          </Text>
          <Text style={styles.repNew}>New Score: {newReputation}/100</Text>
          <View style={styles.repBarBg}>
            <Animated.View style={[styles.repBarFill, { width: repWidth }]} />
          </View>
          <Text style={styles.repNote}>
            ✅ This review will be published after platform verification.{'\n'}
            Providers with sustained high scores earn "Elite" status and priority placement.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <Text style={styles.homeBtnText}>🏠 Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.disputeBtn}
          onPress={() => navigation.navigate('Dispute', { provider, bookingId, pricing })}
          activeOpacity={0.8}
        >
          <Text style={styles.disputeBtnText}>⚠️ Report an Issue Instead</Text>
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
        {/* Provider Info */}
        <View style={styles.providerCard}>
          <Text style={styles.providerEmoji}>👷</Text>
          <View>
            <Text style={styles.providerName}>{provider?.name}</Text>
            <Text style={styles.providerSub}>{provider?.service?.[0]} · Booking {bookingId}</Text>
          </View>
        </View>

        {/* Star Rating */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⭐ How was your experience?</Text>
          <StarInput rating={rating} onRate={setRating} />
          {rating > 0 && (
            <Text style={styles.ratingLabelText}>{RATING_LABELS[rating]}</Text>
          )}
        </View>

        {/* Category Ratings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Rate Specific Aspects</Text>
          {CATEGORIES.map(({ label, icon }) => (
            <CategoryRow key={label} label={label} icon={icon} />
          ))}
        </View>

        {/* Comment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💬 Written Comment (optional)</Text>
          <TextInput
            style={styles.commentInput}
            multiline
            numberOfLines={4}
            placeholder="Kaam acha tha, time par aaye, recommend karunga..."
            placeholderTextColor="#9aa0a6"
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={rating === 0}
        >
          <Text style={styles.submitBtnText}>
            {rating === 0 ? '⭐ Select a star rating first' : '✅ Submit Feedback'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16 },

  providerCard: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  providerEmoji: { fontSize: 32 },
  providerName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  providerSub: { color: '#e8f0fe', fontSize: 12, marginTop: 2 },

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

  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  star: { fontSize: 44, color: '#e0e0e0' },
  starFilled: { color: GOLD },
  ratingLabelText: { textAlign: 'center', fontSize: 18, fontWeight: '700', color: GOLD },

  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  catIcon: { fontSize: 18, marginRight: 10 },
  catLabel: { flex: 1, fontSize: 13, color: TEXT },
  miniStars: { flexDirection: 'row', gap: 2 },
  miniStar: { fontSize: 22, color: '#e0e0e0' },
  miniStarFilled: { color: GOLD },

  commentInput: {
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

  submitBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { backgroundColor: '#9aa0a6' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Success state
  successCard: {
    backgroundColor: '#e6f4ea',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
  },
  successEmoji: { fontSize: 56, marginBottom: 12 },
  successTitle: { fontSize: 24, fontWeight: '800', color: ACCENT, marginBottom: 6 },
  successSub: { color: '#2d6a4f', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  ratingResultRow: { alignItems: 'center', marginBottom: 8 },
  ratingBig: { fontSize: 36, color: GOLD, marginBottom: 4 },
  ratingLabel: { fontSize: 18, fontWeight: '700', color: TEXT },
  commentBubble: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY,
  },
  commentText: { color: TEXT2, fontSize: 13, fontStyle: 'italic', lineHeight: 20 },

  repOld: { color: TEXT2, fontSize: 13, marginBottom: 4 },
  repNew: { fontSize: 22, fontWeight: '800', color: PRIMARY, marginBottom: 10 },
  repBarBg: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden', marginBottom: 12 },
  repBarFill: { height: '100%', backgroundColor: PRIMARY, borderRadius: 5 },
  repNote: { color: TEXT2, fontSize: 12, lineHeight: 20 },

  homeBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10,
    shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  homeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  disputeBtn: {
    backgroundColor: '#fff3e0',
    borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#ffe0b2',
  },
  disputeBtnText: { color: '#e65100', fontWeight: '700', fontSize: 14 },
});
