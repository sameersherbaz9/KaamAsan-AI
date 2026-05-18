// Fallback parser — used when Gemini API is unavailable (offline/demo mode)
// Primary parsing is handled by Gemini 2.5 Flash in UnderstandingScreen.js

export function parseServiceRequest(text) {
  const lower = text.toLowerCase();
  let service_type = 'General Service';
  let location = 'Unknown';
  let urgency = 'medium';
  let preferred_time = 'Flexible';
  let budget_sensitivity = 'medium';
  let job_complexity = 'basic';
  let confidence = 85;

  // SERVICE DETECTION (Urdu + Roman Urdu + English)
  if (lower.includes('ac') || lower.includes('air condition') ||
      lower.includes('cooling') || lower.includes('thanda') ||
      lower.includes('a.c') || lower.includes('aircondition')) {
    service_type = 'AC Repair'; job_complexity = 'intermediate';
  } else if (lower.includes('plumb') || lower.includes('pipe') ||
             lower.includes('paani') || lower.includes('nala') ||
             lower.includes('pani') || lower.includes('leak')) {
    service_type = 'Plumbing'; job_complexity = 'basic';
  } else if (lower.includes('electric') || lower.includes('bijli') ||
             lower.includes('wiring') || lower.includes('light') ||
             lower.includes('bijlee') || lower.includes('current')) {
    service_type = 'Electrical'; job_complexity = 'intermediate';
  } else if (lower.includes('clean') || lower.includes('safai') ||
             lower.includes('sweep') || lower.includes('dust') ||
             lower.includes('saaf') || lower.includes('jharu')) {
    service_type = 'Cleaning'; job_complexity = 'basic';
  } else if (lower.includes('tutor') || lower.includes('teach') ||
             lower.includes('parhai') || lower.includes('maths') ||
             lower.includes('math') || lower.includes('parhna') ||
             lower.includes('student') || lower.includes('padhai')) {
    service_type = 'Tutoring'; job_complexity = 'basic';
  } else if (lower.includes('beauty') || lower.includes('salon') ||
             lower.includes('makeup') || lower.includes('hair') ||
             lower.includes('mehendi') || lower.includes('parlor')) {
    service_type = 'Beautician'; job_complexity = 'basic';
  } else if (lower.includes('mechanic') || lower.includes('car') ||
             lower.includes('gaari') || lower.includes('engine') ||
             lower.includes('auto') || lower.includes('vehicle') ||
             lower.includes('gari') || lower.includes('motor')) {
    service_type = 'Mechanic'; job_complexity = 'complex';
  } else {
    confidence -= 20;
  }

  // LOCATION DETECTION
  const areaMap = {
    'g-13': 'G-13', 'g13': 'G-13',
    'g-11': 'G-11', 'g11': 'G-11',
    'g-10': 'G-10', 'g10': 'G-10',
    'f-7': 'F-7',  'f7': 'F-7',
    'f-10': 'F-10', 'f10': 'F-10',
    'i-8': 'I-8',  'i8': 'I-8',
    'i-10': 'I-10', 'i10': 'I-10',
    'e-11': 'E-11', 'e11': 'E-11',
  };
  for (const [key, val] of Object.entries(areaMap)) {
    if (lower.includes(key)) {
      location = val;
      break;
    }
  }
  if (location === 'Unknown') confidence -= 15;

  // URGENCY DETECTION
  if (lower.includes('abhi') || lower.includes('now') ||
      lower.includes('urgent') || lower.includes('emergency') ||
      lower.includes('jaldi') || lower.includes('foran') ||
      lower.includes('asap') || lower.includes('today')) {
    urgency = 'high';
  } else if (lower.includes('kal') || lower.includes('tomorrow') ||
             lower.includes('next week')) {
    urgency = 'low';
    preferred_time = 'Tomorrow';
  } else if (lower.includes('subah') || lower.includes('morning')) {
    preferred_time = 'Morning (9AM-12PM)';
  } else if (lower.includes('sham') || lower.includes('evening') || lower.includes('shaam')) {
    preferred_time = 'Evening (4PM-8PM)';
  } else if (lower.includes('dopahar') || lower.includes('afternoon')) {
    preferred_time = 'Afternoon (12PM-4PM)';
  }

  // BUDGET DETECTION
  if (lower.includes('sasta') || lower.includes('budget') ||
      lower.includes('cheap') || lower.includes('zyada nahi') ||
      lower.includes('affordable') || lower.includes('kam') ||
      lower.includes('mehenga nahi') || lower.includes('low budget')) {
    budget_sensitivity = 'high';
  } else if (lower.includes('accha') || lower.includes('best') ||
             lower.includes('quality') || lower.includes('premium')) {
    budget_sensitivity = 'low';
  }

  // NOISE/MISSPELLING DETECTION
  const words = text.split(' ').length;
  const noisy = /[0-9]{3,}|(..)\1{2,}/.test(text);
  if (noisy) confidence -= 10;
  if (words < 3) confidence -= 15;
  confidence = Math.max(0, Math.min(100, confidence));

  return { service_type, location, urgency, preferred_time,
           budget_sensitivity, job_complexity, confidence };
}

export function detectLanguage(text) {
  const urduRegex = /[\u0600-\u06FF]/;
  const romanUrduWords = ['hai', 'karo', 'mein', 'ka', 'ki', 'ko', 'se', 'ne',
    'par', 'aur', 'chahiye', 'theek', 'nahi', 'bilkul', 'kal', 'subah', 'sham',
    'abhi', 'jaldi', 'sasta', 'accha', 'gaari', 'paani', 'bijli', 'safai',
    'kaam', 'technician', 'wala', 'karna'];

  if (urduRegex.test(text)) return 'Urdu';
  const lower = text.toLowerCase();
  const romanMatches = romanUrduWords.filter(w => lower.includes(w));
  const totalWords = lower.split(' ').length;
  if (romanMatches.length > 0 && totalWords > romanMatches.length) return 'Mixed';
  if (romanMatches.length >= 2) return 'Roman Urdu';
  return 'English';
}
