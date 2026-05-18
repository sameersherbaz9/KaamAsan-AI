// ─── Area distance matrix (mock km from G-13 base) ──────────────────────────
const AREA_DISTANCES = {
  'G-13': 0, 'G-11': 2.5, 'G-10': 3.8, 'F-10': 5.1,
  'F-7': 7.2, 'E-11': 8.4, 'I-8': 6.9, 'I-10': 8.3, 'F-20': 22.0,
};

function getDistance(fromArea, toArea) {
  const d1 = AREA_DISTANCES[fromArea] || 5;
  const d2 = AREA_DISTANCES[toArea] || 5;
  return Math.abs(d1 - d2) + 1.5;
}

/**
 * Renders an 8-factor matching matrix for Pakistani local service providers.
 * 
 * Weights:
 * - Rating (25%)
 * - On-time score (20%)
 * - Distance (15%)
 * - Availability (15%)
 * - Specialization match (10%)
 * - Cancellation penalty (10%)
 * - Price sensitivity (5%)
 * - Risk assessment (5%)
 */
export function rankProviders(parsed, allProviders) {
  const requestArea = parsed.location;
  const budgetSensitive = parsed.priceSensitivity === 'budget';

  return allProviders
    .filter(p => {
      const services = p.service.map(s => s.toLowerCase());
      return services.some(s =>
        s.includes(parsed.service.toLowerCase().split(' ')[0]) ||
        parsed.service.toLowerCase().includes(s.split(' ')[0])
      );
    })
    .map(p => {
      const dist = getDistance(requestArea, p.location.area);

      // Factor 1: Rating (0.25)
      const ratingScore = (p.rating / 5) * 100;
      const f1 = ratingScore * 0.25;

      // Factor 2: On-time score (0.20)
      const f2 = p.on_time_score * 0.20;

      // Factor 3: Distance score (0.15) — closer is better
      const distScore = Math.max(0, 100 - (dist * 8));
      const f3 = distScore * 0.15;

      // Factor 4: Availability (0.15)
      const avail = Math.min(p.availability.length * 20, 100);
      const f4 = avail * 0.15;

      // Factor 5: Specialization match (0.10)
      const specMatch = p.specializations.some(s =>
        s.toLowerCase().includes(parsed.specialization?.toLowerCase() || '') ||
        parsed.service.toLowerCase().includes(s.toLowerCase().split(' ')[0])
      ) ? 100 : 40;
      const f5 = specMatch * 0.10;

      // Factor 6: Cancellation rate penalty (0.10)
      const cancelScore = Math.max(0, 100 - p.cancellation_rate * 3);
      const f6 = cancelScore * 0.10;

      // Factor 7: Price score (0.05) — lower price is better if budget sensitive
      const priceScore = budgetSensitive ? Math.max(0, 100 - (p.base_rate / 60)) : 70;
      const f7 = priceScore * 0.05;

      // Factor 8: Risk score (0.05)
      const riskMap = { low: 100, medium: 60, high: 20 };
      const f8 = (riskMap[p.risk_score] || 60) * 0.05;

      const total = f1 + f2 + f3 + f4 + f5 + f6 + f7 + f8;

      // Generate reasoning
      const reasons = [];
      if (ratingScore >= 90) reasons.push(`⭐ Top rated ${p.rating}/5 stars`);
      if (p.on_time_score >= 90) reasons.push(`⏰ ${p.on_time_score}% on-time record`);
      if (dist <= 3) reasons.push(`📍 Only ${dist.toFixed(1)} km away`);
      if (specMatch === 100) reasons.push(`🎯 Specializes in ${parsed.specialization || parsed.service}`);
      if (p.cancellation_rate <= 3) reasons.push(`✅ Very low ${p.cancellation_rate}% cancellation rate`);
      if (budgetSensitive && p.base_rate <= 2000) reasons.push(`💸 Budget-friendly at PKR ${p.base_rate}`);
      if (p.risk_score === 'low') reasons.push(`🛡️ Verified low-risk provider`);

      return {
        ...p,
        distance: dist,
        matchScore: Math.min(99, Math.round(total)),
        scoreBreakdown: {
          rating: Math.round(f1),
          onTime: Math.round(f2),
          distance: Math.round(f3),
          availability: Math.round(f4),
          specialization: Math.round(f5),
          cancellation: Math.round(f6),
          price: Math.round(f7),
          risk: Math.round(f8),
        },
        reasoning: reasons.slice(0, 3).join(' · ') || 'Good all-round match for your request',
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
