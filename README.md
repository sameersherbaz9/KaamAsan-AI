# 🤖 KaamAsan AI (कामआसान)

> **Hackathon Submission — Challenge 2: AI Service Orchestrator for Pakistan's Informal Economy**  
> *Empowering local service providers and households across Pakistan through modern, localized, AI-powered service routing.*

---

## 🌟 Executive Summary & Social Impact

In Pakistan, the informal economy accounts for over **70% of non-agricultural employment**. Handymen, electricians, plumbers, and local tutors struggle to find consistent work, while households face severe friction due to language barriers, pricing opacity, and trust deficits. 

**KaamAsan AI** completely re-engineers this ecosystem by introducing a **multilingual conversational service booking platform**. Customers can describe their issues in their natural speaking voice—whether in **Urdu, Roman Urdu, English, or a mix ("Minglish")**—and our AI engine automatically parses, categorizes, matches, bills, tracks, and protects the entire transaction end-to-end.

---

## 🛠️ Key Technological Pillars

### 1. 🧠 Multilingual Intent Extraction (Powered by Gemini 2.5 Flash)
KaamAsan AI is directly integrated with the **Google Gemini 2.5 Flash API** to handle highly complex, mixed-language user requests. 
* **Conversational Parsing:** Detects intent from mixed phrases like *"Mera split AC cooling nahi kar raha, aaj hi G-13 mein technician bhejain."*
* **Entity Extraction:** Extracts core fields: Service Type, Specialization, Location (Islamabad sectors), Urgency, Complexity, and Price Sensitivity.
* **Low-Confidence Clarification (Threshold < 70%):** If the model is unsure of the request or location, it dynamically prompts the user in friendly Roman Urdu to clarify.
* **Graceful Offline Fallback:** If network limits or API key constraints occur, the app seamlessly falls back to a highly optimized regex-based parsing engine to ensure a crash-free user experience during the live demo.

### 2. 🧮 8-Factor Weighted Provider Matching Algorithm
Instead of standard static matching, KaamAsan AI scores and ranks local professionals using a sophisticated, multi-dimensional matrix matching the customer's exact context:

$$\text{Match Score} = (\text{Rating} \times 0.25) + (\text{On-Time} \times 0.20) + (\text{Distance} \times 0.15) + (\text{Avail.} \times 0.15) + (\text{Spec.} \times 0.10) + (\text{Cancel} \times 0.10) + (\text{Price} \times 0.05) + (\text{Risk} \times 0.05)$$

| Factor | Weight | Description |
| :--- | :---: | :--- |
| **Star Rating** | **25%** | Overall historic rating, with Elite status awarded to providers over 4.8. |
| **On-Time Arrival** | **20%** | Punctuality percentage tracked over all past bookings. |
| **Geographic Proximity** | **15%** | Calculated in kilometers using Islamabad area mapping. |
| **Availability Slots** | **15%** | Matching preferred customer time window with active slot counts. |
| **Specialization Match** | **10%** | Extra weight matching exact tools/qualifications (e.g. Inverter AC vs general AC). |
| **Cancellation Rate** | **10%** | Hard penalty score for historic cancellations. |
| **Price Sensitivity** | **5%** | Higher preference for lower base rates if the customer requests a budget repair. |
| **Risk Score** | **5%** | Security risk mapping (low/medium/high) based on background checks. |

---

## 📱 Product Architecture & Screen Navigation

The app is built using **Expo SDK 54**, **React Navigation**, and **React Native Paper** with a cohesive, accessible "Google Blue" theme (#1a73e8) and micro-interactions:

```
[Home Screen] ➔ [Understanding Screen] ➔ [Matched Providers] ➔ [Pricing Sheet]
                                                                      │
[Feedback Screen] 🔀 [Dispute Center] 🗲 [Live Stepper Tracking] 🔀 [Booking Screen]
```

1. **Home Screen (Hero):** Beautiful large text field supporting Pakistani mixed languages. Features quick examples and a dedicated **Stress Test Scenario** panel.
2. **Understanding Screen:** Shows the bouncing dots "AI thinking" state. Renders real-time parsed parameters, a confidence slider, a "Powered by Gemini" badge, and clarification cards.
3. **Matched Providers Screen:** Shows the top 6 matching providers. Highlights the **#1 Top Pick** with a glowing primary border and provides transparent "Why this ranking?" score breakdowns.
4. **Pricing Screen:** Itemized transparent breakdown (Base, Distance at PKR 80/km, Urgency, Complexity). Features a **Budget Alternative Toggle** and a **Fairness Note** illustrating provider earnings.
5. **Booking Screen:** Confirms details with a unique Booking ID and shows beautiful simulated receipt message cards sent to **WhatsApp, SMS, and Calendar**.
6. **Live Tracking Screen:** A vertical 5-stage stepper showing active progress (Booked ➔ En Route ➔ Arrived ➔ In Progress ➔ Completed) with a pulsing status dot and a final job completion checklist.
7. **Feedback Screen:** Star aspect scoring (Punctuality, Quality, Cleanliness) and comment boxes that recalculate the provider's overall reputation out of 100 on submit.
8. **Dispute Center:** Context-aware resolution matrix matching 5 major issue categories (No-Show, Quality, Pricing, Overrun, Cancel) to instant refund, reschedule, human support, or blacklisting.

---

## 🧪 Hackathon Evaluation: Live Stress Test Scenarios

To help judges evaluate KaamAsan AI's robust error-handling and fail-safe mechanics, we built a dedicated **Stress Test Scenario Panel** directly onto the Home Screen. Tap any scenario to watch the app seamlessly execute these edge-cases:

| Scenario Title | User Input Example | System Handling & Dynamic Behavior |
| :--- | :--- | :--- |
| **🚫 No Provider Available** | *"bijli ka kaam... aaj raat 2 baje F-20 mein"* | Detects zero matches for F-20 at 2 AM. Automatically routes to a **Premium Waitlist Screen** providing a waitlist reference number. |
| **❌ Provider Cancels** | *"AC repair G-13 kal 9 baje"* | Simulates provider cancellation 3 seconds after confirmation. Automatically triggers an **Instant Reassignment Sequence** to the next best match. |
| **👁️ Misspelled Input** | *"mujhe plasticer chahiye G-11 maen..."* | Confidence falls below 70%. Renders a beautiful custom **Urdu Clarification Prompt** while keeping the flow accessible. |
| **⚡ Booking Conflict** | *"Usman AC Specialist G-13"* | Detects booking slot overlaps. Triggers a warning banner in matched providers and automatically recommends the next best open slots. |
| **💸 Price Dispute** | *"electrician F-7, budget 500 rupees"* | Detects budget mismatch. Triggers **Pricing Warnings** in the checkout view and opens up budget-friendly helper alternatives. |

---

## 🚀 Installation & Running Locally

Ensure you have **Node.js** installed on your system.

### 1. Clone & Install Dependencies
Navigate to the project folder and run:
```bash
npm install
```

### 2. Enter your Gemini API Key (Optional)
To use live AI parsing instead of offline mock parsing:
1. Open the file: [UnderstandingScreen.js](file:///c:/Users/SCM/Desktop/AI%20Sekho/Challenge%202/KaamAsan%20AI/src/screens/UnderstandingScreen.js)
2. Locate line 21:
   ```javascript
   const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```
3. Replace the placeholder with your actual Google Gemini API key. If left as is, the app gracefully falls back to the robust regex parser.

### 3. Start Expo Bundler
Run the following command in your terminal:
```bash
npx expo start --clear
```

* **To scan on your Phone:** Download the **Expo Go** app from Play Store/App Store and scan the QR code printed in the terminal.
* **To open on Android Emulator:** Press the **`a`** key.
* **To open in Web Browser:** Press the **`w`** key.

---

## 📦 Building your APK

To compile and package KaamAsan AI into a shareable Android APK, run:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log into your Expo account:
   ```bash
   eas login
   ```
3. Initialize and link the project:
   ```bash
   eas project:init
   ```
4. Build the APK:
   ```bash
   eas build --platform android --profile preview
   ```
Once the cloud compilation completes, download and install the `.apk` file directly on your Android phone!

---

*Developed with ❤️ for the Google Antigravity Hackathon.*
