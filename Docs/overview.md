# NutriGuard — Engineering Overview

> Single source of truth for anyone (human or AI agent) building NutriGuard. Read this top-to-bottom before writing code. Every architectural decision below is final unless explicitly revisited.

**Status:** v1 spec · iOS only · May 2026
**Companion docs:** [`Docs/NutriGuard-MVP.pdf`](../Docs/NutriGuard-MVP.pdf) (product), [`Docs/NutriGuard-Screens.html`](../Docs/NutriGuard-Screens.html) (UI mocks)

---

## 1. Project Overview

**Name:** NutriGuard
**Tagline:** *Your food. Your conditions. Your answer.*
**Platform:** iOS only (iPhone), built with React Native + Expo (Dev Client)

**Elevator pitch:** Hundreds of millions of people live with chronic conditions like diabetes, gastritis, GERD, hypertension, high cholesterol, and gout. Every meal is a guess: *can I eat this?* Calorie apps were built for gym-goers. NutriGuard is built for patients. Snap a meal, scan a label, or type a description — get an honest, condition-aware verdict in 10 seconds, plus practical "damage control" advice when you eat something flagged.

**Target audience:** Adults 25–65 managing one or more of: diabetes, gastritis, hypertension, GERD, high cholesterol, gout, celiac, lactose intolerance, plus user-defined custom conditions.

**Differentiator:** Multi-condition awareness with personalised verdicts (none of Cal AI / MyFitnessPal / Yuka / Fig / GoCoCo / SNAQ does this), honest "Eat Anyway" + Damage Control flow, dish safety percentage, plain-English chips with no jargon.

---

## 2. MVP Scope

### In scope (v1)

All 13 screens from [`Docs/NutriGuard-Screens.html`](../Docs/NutriGuard-Screens.html):

- Auth: sign-up, log-in (email + Apple Sign-In)
- Onboarding: pick conditions, body details, disclaimer acknowledgement
- 3 main tabs: Home, Last Scan, Profile
- 4 scan types: meal photo, ingredients label, type-it-in (text), unrecognised fallback
- Loading/analysing screen with progressive status
- Verdict system with 5 chips: All Good!, Mostly Fine, Eat Less, Not Ideal, Skip It
- Dish safety % (0–100) and meal-level insight
- Damage control screen with Eat Anyway / See Damage Control flow
- Scan streak counter + 8pm risk notification + 7/14/30-day milestone notifications + first-scan nudge
- Share result card via iOS share sheet
- Free vs Pro gating: 3 lifetime photo+label scans for Free, unlimited Type It In for everyone
- Paywall with monthly ($9.99) + annual ($49.99) plans via RevenueCat
- Profile editing (weight, height, birthday, conditions including custom free-text)
- Account deletion path

### Out of scope (v1)

- Scan history / diary (only the most recent `currentScan` is kept — by design)
- Android, iPad-optimised, web, watchOS
- Dark mode (light theme only — exact match to mocks)
- Multi-language (English only)
- HealthKit, CGM, Apple Health sync
- Social / community features
- Cloud backup of photos (photos never persisted server-side)
- Doctor/clinician dashboard

---

## 3. User Roles & Permissions

| Role | Description | Capabilities |
| --- | --- | --- |
| **Anonymous** | Pre-auth visitor | Sign up, log in. Nothing else. |
| **Free (authenticated)** | Default after sign-up | 3 lifetime photo + ingredients-label scans (combined counter), unlimited Type It In, full results/damage-control/streak/share. Paywall on photo/label scan #4. |
| **Pro (authenticated)** | RevenueCat `pro` entitlement active | Unlimited everything. Identical UI; paywall never appears. |

No admin role. No multi-user accounts. No role hierarchy.

---

## 4. Screen Map

Every mock in [`Docs/NutriGuard-Screens.html`](../Docs/NutriGuard-Screens.html) maps to exactly one route.

| # | Mock | Route name | Navigator | Purpose |
| --- | --- | --- | --- | --- |
| 01 | Pre-auth onboarding flow (27 screens) | `OnboardingFlowStack` | Root | Conversion-focused funnel: Welcome → Problem → Solution → Name → Birthday → Conditions → Duration → Bombshell → Bridge → Q1–Q4 + Mirror → Cuisine → Cooking → Demo (Intro / Analysing / Result) → Streak Day 1 → Personalising → Plan summary → Body details → Disclaimer → Notifications → Commitment → existing `SignUpScreen` / `LoginScreen` (auth is the final step). See `Docs/onboarding/onboarding_screens_draft.md` for full screen-by-screen content. |
| 02 | Pick conditions (edit) | `PickConditionsScreen` | `ProfileStack` & `HomeStack` | Edit-mode condition + body-details screen, reachable only from Profile and the Home empty state. Never appears post-auth as part of onboarding — the new flow collects everything pre-auth. |
| 04 | Home | `HomeScreen` | `MainTabs → HomeStack` | Streak, scan-launch buttons (Photo / Gallery / Type It In), last-scan summary card |
| 05 | Camera | `CameraScreen` | `ScanStack` (modal over Home) | `expo-camera` capture, shutter button, alignment frame |
| 06 | Type it in | `TypeItInScreen` | `ScanStack` (modal over Home) | Multi-line text input, examples, Submit |
| 07 | Analysing | `AnalysingScreen` | `ScanStack` (modal over Home) | Progress steps: read photo → identify items → check conditions → write verdict |
| 08 | Meal result | `LastScanScreen` (variant: meal) | `MainTabs → LastScanStack` | Header "Here's what's on your plate 🍽️", dish safety %, insight, items list |
| 09 | Ingredients label result | `LastScanScreen` (variant: ingredients) | `MainTabs → LastScanStack` | Header "Let's see what's inside 🍽️", overall verdict card, ingredient breakdown |
| 10 | Unrecognised | `LastScanScreen` (variant: unrecognised) | `MainTabs → LastScanStack` | Header "Hmm, we couldn't quite make that out 🍽️", retry tips, gallery/retry CTAs |
| 11 | Damage control | `DamageControlScreen` | `LastScanStack` | Per-item advice, Back / Next, "See Damage Control" relabel after visit |
| 12 | Profile | `ProfileScreen` | `MainTabs → ProfileStack` | Avatar, body stats, conditions chips, subscription, settings list, sign out |
| 13 | Paywall | `PaywallScreen` | `RootStack` (modal over anything) | Annual highlighted with "SAVE 58%", subscribe CTA |

**Type It In** result re-uses `LastScanScreen` with header copy `"Here's the breakdown 🍽️"` — no separate mock needed.

---

## 5. User Flows

### A. First-launch onboarding (auth-at-the-end)

The flow is inspired by Mau Baron's Prayer Lock breakdown — every screen
before auth is a deliberate piece of a conversion funnel (Introduction →
Climax → Conclusion). Auth is the last step, *after* the user has invested
6–9 minutes building their plan.

1. App opens → `AuthGate` sees no Firebase user → renders `OnboardingFlowStack` (initialRoute = `Welcome`)
2. User progresses through the 27-screen funnel. Each screen patches `useOnboardingStore` (Zustand + AsyncStorage persist).
3. Climax: `DemoIntro → DemoAnalysing → DemoResult` shows a hard-coded sample verdict tailored to the user's primary condition. `StreakStart` shows Day 1 + triggers `expo-store-review` request (when installed).
4. Conclusion: `Personalising → PlanSummary → BodyDetails → Disclaimer → Notifications → Commitment → SignUpScreen` (the existing email-and-Apple screen from `screens/auth/`, reused as the final step).
5. On any auth success (email sign-up, sign-in, or Apple), `AuthGate` detects the `user` transition from null → non-null and runs a single side-effect:
   - `useUserStore.ensure(...)` seeds `users/{uid}` if missing.
   - If `useOnboardingStore` has buffered answers (`hasCommittableOnboardingAnswers`), `commitOnboardingProfile(uid, answers)` writes name → `displayName`, conditions, customConditions, weight, height, birthday, `disclaimerAcknowledgedAt` to Firestore in a single `update`, AND mirrors the name to Firebase Auth's `displayName` via `updateProfile`.
   - `useUserStore.updateProfile(...)` mirrors the same patch into the in-memory profile so `HomeGreeting` and `ProfileScreen` reflect it immediately without waiting for the next Firestore read.
   - `useOnboardingStore.reset()` clears the buffer.
6. `AuthGate` re-renders → `MainTabs/HomeScreen`. Name shows up in `HomeGreeting`, `ProfileScreen`, and anywhere else `userStore.profile.displayName` is read.

**Edge case:** If the profile-commit step fails (e.g. network drop right after Firebase Auth succeeds), the onboarding store stays intact on AsyncStorage. The next app launch retries the commit automatically through the same AuthGate side-effect — no extra UI needed.

### B. Photo scan happy path (Pro user, or Free user with scans remaining)

1. `HomeScreen` → tap **Take a Photo**
2. Permission prompt for camera if first time → grant
3. `CameraScreen` → tap shutter → photo saved to app document directory via `expo-file-system` → URI cached in `scanStore`
4. Navigate to `AnalysingScreen` → start progressive status animation
5. `analyseMealUseCase.execute({ photoUri, conditions, age, weightKg })` → reads file, encodes base64, calls OpenAI
6. Zod validates response → on success, write to `users/{uid}/currentScan/scan` (single doc, overwritten)
7. `incrementStreakUseCase` runs — if `lastScanDate` is not today, `streakCount += 1` (or resets if gap > 1 day) and `lastScanDate = today`
8. If user is Free + scanType is `meal` or `ingredients` → `lifetimePhotoScansUsed += 1`
9. Cancel scheduled "8pm streak risk" notification for today; if streak hits 7/14/30, schedule milestone push for next morning 9am
10. Navigate to `LastScanScreen` (Last Scan tab becomes selected) — modal stack pops underneath

### C. Photo scan, free-limit hit

1. Same as B, steps 1–2
2. Before opening camera, `scanStore.canTakePhotoScan()` checks `plan === 'pro' || lifetimePhotoScansUsed < 3`
3. If false → present `PaywallScreen` modally instead of camera
4. User either purchases (jump to flow F) or dismisses → returns to Home

### D. Type-It-In (always free)

1. `HomeScreen` → tap **Type It In** → `TypeItInScreen`
2. User types meal description, taps **Check my meal →**
3. `AnalysingScreen` → `analyseMealUseCase.execute({ text, conditions, age, weightKg })` (no `photoUri`)
4. Same write/increment/notify path as B (note: `lifetimePhotoScansUsed` is NOT incremented — text is unlimited)
5. `LastScanScreen` with header "Here's the breakdown 🍽️"

### E. Eat Anyway / Damage Control

1. From `LastScanScreen`, user taps **Eat anyway →** on a flagged item card
2. Navigate to `DamageControlScreen` with that item's ID
3. Show 2-sentence condition-specific advice from the AI response
4. Tap **Next →** → cycles to next flagged item not yet visited (`damageControlVisited` array on the scan doc)
5. Tap **← Back to results** → pops to `LastScanScreen`. The visited items now show **See Damage Control** instead of **Eat anyway**

### F. Pro purchase

1. `PaywallScreen` shown (modal, dismissible × in top-right)
2. User selects Monthly or Annual (annual highlighted by default with "SAVE 58%")
3. Tap CTA → `revenuecat.purchasePackage(pkg)` → native Apple sheet
4. On success: RevenueCat returns updated `customerInfo`; `entitlementStore` flips `pro = true`
5. `userStore` writes `plan: 'pro'` to Firestore and `lifetimePhotoScansUsed` becomes irrelevant
6. Modal dismisses, user returns to where they were (Home or pre-paywall scan flow continues automatically)

### G. Streak risk notification

1. On every scan completion or app foreground, schedule a local notification at **today 20:00** with body: `"Your N-day streak ends tonight — scan your dinner to keep it alive 🍽️"`
2. If user scans before 20:00, cancel that day's pending notification
3. If user opens the notification → deep-link to `HomeScreen` with scan-prompt highlighted (subtle pulse on Take a Photo button)

### H. Sign out & re-auth

1. `ProfileScreen` → **Sign out** → confirm dialog → `auth.signOut()`
2. All Firestore listeners detached; all Zustand stores reset
3. `AuthGate` sees null user → routes to `AuthStack`
4. On next sign-in, listeners re-attach for that uid; user lands on Home if onboarding was completed previously

---

## 6. Data Model — Firestore

Schema is intentionally minimal. **There is no scan history** — only a single `currentScan` doc per user, overwritten each scan. This is a product decision, not a budget one.

### `users/{uid}` — root profile doc

```ts
type UserDoc = {
  email: string;
  displayName: string | null;
  authProvider: 'apple' | 'password';
  conditions: ConditionId[];          // canonical preset IDs
  customConditions: string[];         // user free-text additions
  weightKg: number;                   // > 0
  heightCm: number;                   // > 0
  birthday: Timestamp;
  streakCount: number;                // ≥ 0
  lastScanDate: Timestamp | null;
  plan: 'free' | 'pro';
  lifetimePhotoScansUsed: number;     // 0..3 enforced for free; ignored for pro
  disclaimerAcknowledgedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type ConditionId =
  | 'diabetes' | 'gastritis' | 'hypertension' | 'gerd'
  | 'high_cholesterol' | 'gout' | 'celiac' | 'lactose_intolerance';
```

**Example document:**

```json
{
  "email": "kavindu@example.com",
  "displayName": "Kavindu",
  "authProvider": "apple",
  "conditions": ["diabetes", "gastritis"],
  "customConditions": ["thyroid"],
  "weightKg": 68,
  "heightCm": 174,
  "birthday": "1998-03-12T00:00:00Z",
  "streakCount": 5,
  "lastScanDate": "2026-05-02T08:14:00Z",
  "plan": "pro",
  "lifetimePhotoScansUsed": 0,
  "disclaimerAcknowledgedAt": "2026-04-27T11:02:00Z",
  "createdAt": "2026-04-27T11:00:00Z",
  "updatedAt": "2026-05-02T08:14:00Z"
}
```

### `users/{uid}/currentScan/scan` — single doc, fixed ID `scan`

```ts
type CurrentScanDoc = {
  scanType: 'meal' | 'ingredients' | 'text' | 'unrecognised';
  inputText: string | null;             // populated only for scanType === 'text'
  photoLocalUri: string | null;         // file:// path on device, null for text/unrecognised
  items: ScanItem[];
  dishSafetyPct: number;                // 0..100
  insight: string;                      // ≤ 240 chars
  damageControlVisited: string[];       // ScanItem.id values
  createdAt: Timestamp;
};

type ScanItem = {
  id: string;                           // UUID v4 generated client-side
  name: string;                         // "Fried onion garnish"
  score: 0 | 1 | 2 | 3 | 4 | 5;
  verdict: 'all_good' | 'mostly_fine' | 'eat_less' | 'not_ideal' | 'skip_it';
  reasoning: string;                    // ≤ 200 chars
  damageControl: string;                // 2 sentences, ≤ 320 chars; or fallback string
};
```

**Example document** (mock 08, chicken curry):

```json
{
  "scanType": "meal",
  "inputText": null,
  "photoLocalUri": "file:///var/mobile/.../scans/2026-05-02-141402.jpg",
  "items": [
    { "id": "a1", "name": "Steamed rice", "score": 5, "verdict": "all_good",
      "reasoning": "Plain steamed rice is well-tolerated and safe for both conditions in moderate portions.",
      "damageControl": "" },
    { "id": "a2", "name": "Cucumber", "score": 5, "verdict": "all_good",
      "reasoning": "Hydrating, low GI, soothing for gastritis.", "damageControl": "" },
    { "id": "a3", "name": "Lentils", "score": 5, "verdict": "all_good",
      "reasoning": "High fibre and protein, low glycaemic — diabetes-friendly.", "damageControl": "" },
    { "id": "a4", "name": "Fried onion garnish", "score": 2, "verdict": "not_ideal",
      "reasoning": "Fried and oily — known gastritis trigger.",
      "damageControl": "Follow this with chamomile or fresh ginger tea — both calm gastritis inflammation within about 30 minutes. Avoid lying down for at least an hour." },
    { "id": "a5", "name": "Chicken curry", "score": 3, "verdict": "eat_less",
      "reasoning": "Spice level may aggravate gastritis; moderate portion blunts glucose impact.",
      "damageControl": "Pair with a small bowl of plain yogurt — it buffers the acidity. A 15-minute walk after the meal helps blood sugar." }
  ],
  "dishSafetyPct": 72,
  "insight": "The base of rice & lentils is solid. The main risks are the fried garnish and spice level — skip or reduce those and this is a reasonable meal.",
  "damageControlVisited": [],
  "createdAt": "2026-05-02T14:14:02Z"
}
```

### Score → verdict mapping

| Score | Verdict ID | Chip label | Hex color |
| --- | --- | --- | --- |
| 5 | `all_good` | All Good! | `#D4EDDA` (text `#276132`) |
| 4 | `mostly_fine` | Mostly Fine | `#C8E6C9` (text `#2E6B34`) |
| 3 | `eat_less` | Eat Less | `#FFF9C4` (text `#8B5E00`) |
| 2 | `not_ideal` | Not Ideal | `#FFE0B2` (text `#C64A00`) |
| 0–1 | `skip_it` | Skip It | `#FFCDD2` (text `#B71C1C`) |

The mapping is canonical: defined once in `src/domain/entities/Verdict.ts`, used everywhere.

---

## 7. Authentication Flow

- **Source of truth:** Firebase Auth via `@react-native-firebase/auth` (native SDK, not the JS SDK — needed for Keychain session persistence and Apple credential exchange).
- **Sign-up — email/password:** `auth().createUserWithEmailAndPassword(email, password)` → on success, run `seedUserDoc(uid)` to create `users/{uid}` with defaults.
- **Sign-up / sign-in — Apple:**
  1. `AppleAuthentication.signInAsync({ requestedScopes: [FULL_NAME, EMAIL] })`
  2. Build `auth.AppleAuthProvider.credential(identityToken, nonce)`
  3. `auth().signInWithCredential(credential)`
  4. On first-ever sign-in, seed `users/{uid}` (Apple may not return email on subsequent sign-ins — handle null).
- **Session persistence:** automatic via `@react-native-firebase/auth` (uses Keychain). No manual token storage.
- **AuthGate** at the root:
  - `null user` → `AuthStack`
  - `user but disclaimerAcknowledgedAt == null` → `OnboardingStack`
  - `user fully onboarded` → `MainTabs`
- **Forgot password:** `auth().sendPasswordResetEmail(email)` from `LoginScreen`.
- **Account deletion** (App Store mandate): `ProfileScreen → Settings → Delete account`. Sequence:
  1. Re-authenticate (prompt for password or re-Apple)
  2. Delete `users/{uid}/currentScan/scan` doc, then `users/{uid}` doc
  3. `auth().currentUser.delete()`
  4. RevenueCat: call `Purchases.logOut()` (subscription itself is bound to Apple ID, not deleted)
  5. Reset all Zustand stores, route to `AuthStack`

---

## 8. Tech Stack — Pinned Versions

All versions verified against **Expo SDK 54** at the time of writing. Run `npx expo install --check` after `npm install` to catch any drift.

| Package | Version | Why |
| --- | --- | --- |
| expo | 54.0.0 | Target SDK |
| react | 19.1.0 | Bundled with SDK 54 |
| react-native | 0.81.4 | Bundled with SDK 54 |
| typescript | 5.9.2 | Strict mode |
| @react-navigation/native | 7.1.6 | Navigation primitive |
| @react-navigation/bottom-tabs | 7.3.10 | Home / Last Scan / Profile tabs |
| @react-navigation/native-stack | 7.3.10 | Auth stack, scan modal stack, sub-stacks |
| @react-native-firebase/app | 22.2.0 | Native Firebase core |
| @react-native-firebase/auth | 22.2.0 | Auth (Keychain persistence + Apple credential exchange) |
| @react-native-firebase/firestore | 22.2.0 | Firestore native SDK |
| @react-native-firebase/analytics | 22.2.0 | Telemetry |
| zustand | 5.0.2 | Global state |
| react-native-purchases | 8.10.1 | RevenueCat SDK |
| expo-apple-authentication | 7.1.3 | Apple Sign-In |
| expo-camera | 16.0.16 | Meal/label photo capture |
| expo-image-picker | 16.0.6 | Gallery picker |
| expo-image | 2.0.6 | Image rendering with caching |
| expo-file-system | 18.0.7 | Save scan photos to app documents directory |
| expo-notifications | 0.29.13 | Local notifications (streak nudges, milestones) |
| expo-haptics | 14.0.1 | Tactile feedback on scan / verdict reveal |
| expo-sharing | 13.0.1 | iOS share sheet for result card |
| expo-constants | 17.0.5 | Read EAS env values from `app.config.ts` |
| react-native-reanimated | 3.16.7 | Streak flame, analysing-screen animation |
| react-native-safe-area-context | 4.12.0 | Required by Expo / RN Nav |
| react-native-svg | 15.8.0 | Verdict chip icons, status bar glyphs |
| react-native-gesture-handler | 2.20.2 | Required by RN Nav |
| react-native-view-shot | 4.0.3 | Capture share-card image |
| openai | 4.77.0 | Direct OpenAI client (see §12 risk note) |
| zod | 3.24.1 | Validate AI JSON responses + form inputs |
| date-fns | 4.1.0 | Streak math, age calc |
| @shopify/flash-list | 1.7.2 | Scan-item list perf |
| @react-native-async-storage/async-storage | 2.1.0 | Zustand persist (non-sensitive cache) |
| eslint | 9.17.0 | Linting |
| @typescript-eslint/eslint-plugin | 8.18.2 | TS linting rules |
| @typescript-eslint/parser | 8.18.2 | TS parser |
| eslint-plugin-react-native | 4.1.0 | RN-specific lints |
| prettier | 3.4.2 | Formatting |

**No Jest / Detox / E2E framework in v1** — manual QA only (see §14, §17).

---

## 9. Project Structure (Clean Architecture)

```
NutriGuard-App/
├── App.tsx                       # mounts providers + RootNavigator
├── app.config.ts                 # Expo config; reads .env
├── eas.json                      # EAS Build profiles
├── package.json                  # pinned versions per §8
├── tsconfig.json                 # strict mode, @/ path alias
├── babel.config.js               # expo preset + reanimated plugin (must be LAST)
├── .env.example                  # template; do NOT commit .env
├── .eslintrc.cjs
├── .prettierrc
├── GoogleService-Info.plist      # Firebase iOS config (committed; not secret)
├── docs/
│   └── overview.md               # this file
├── firebase/
│   ├── firestore.rules           # see §11
│   └── firestore.indexes.json    # empty for v1
└── src/
    ├── presentation/             # UI layer
    │   ├── navigation/
    │   │   ├── RootNavigator.tsx
    │   │   ├── AuthGate.tsx
    │   │   ├── AuthStack.tsx
    │   │   ├── OnboardingStack.tsx
    │   │   ├── MainTabs.tsx
    │   │   ├── ScanStack.tsx       # modal stack over Home
    │   │   ├── HomeStack.tsx
    │   │   ├── LastScanStack.tsx
    │   │   └── ProfileStack.tsx
    │   ├── screens/
    │   │   ├── auth/{SignUpScreen,LoginScreen}.tsx
    │   │   ├── onboarding/{PickConditionsScreen,BodyDetailsScreen,DisclaimerScreen}.tsx
    │   │   ├── home/HomeScreen.tsx
    │   │   ├── scan/{CameraScreen,TypeItInScreen,AnalysingScreen}.tsx
    │   │   ├── result/{LastScanScreen,DamageControlScreen}.tsx
    │   │   ├── profile/{ProfileScreen,EditProfileScreen,DeleteAccountScreen}.tsx
    │   │   └── paywall/PaywallScreen.tsx
    │   ├── components/
    │   │   ├── VerdictChip.tsx
    │   │   ├── ScanItemCard.tsx
    │   │   ├── StreakBadge.tsx
    │   │   ├── DishSafetyMeter.tsx
    │   │   ├── ConditionChip.tsx
    │   │   ├── PrimaryButton.tsx
    │   │   ├── SecondaryButton.tsx
    │   │   ├── DisclaimerFooter.tsx
    │   │   └── Toast.tsx
    │   ├── theme/
    │   │   ├── colors.ts           # palette from mocks (see §18)
    │   │   ├── spacing.ts
    │   │   └── typography.ts       # Georgia serif headings + system body
    │   └── hooks/
    │       ├── useAuth.ts
    │       ├── useUser.ts
    │       ├── useCurrentScan.ts
    │       ├── useStreak.ts
    │       └── useEntitlement.ts
    ├── domain/                   # pure TS, no React, no Firebase
    │   ├── entities/
    │   │   ├── User.ts
    │   │   ├── Scan.ts
    │   │   ├── ScanItem.ts
    │   │   ├── Verdict.ts          # score → verdict mapping (canonical)
    │   │   └── Condition.ts        # CONDITIONS preset list
    │   ├── usecases/
    │   │   ├── AnalyseMealUseCase.ts
    │   │   ├── IncrementStreakUseCase.ts
    │   │   ├── CanScanPhotoUseCase.ts
    │   │   ├── AcknowledgeDisclaimerUseCase.ts
    │   │   └── PurchaseProUseCase.ts
    │   └── repositories/           # interfaces ONLY
    │       ├── UserRepository.ts
    │       ├── ScanRepository.ts
    │       └── EntitlementRepository.ts
    ├── data/                     # implementation layer
    │   ├── repositories/
    │   │   ├── FirestoreUserRepository.ts
    │   │   ├── FirestoreScanRepository.ts
    │   │   └── RevenueCatEntitlementRepository.ts
    │   ├── services/
    │   │   ├── firebase.ts         # init + exports
    │   │   ├── openai.ts           # client + prompt builder + Zod parser
    │   │   ├── revenuecat.ts       # init + offerings + purchase
    │   │   ├── notifications.ts    # local notifications scheduling
    │   │   ├── photoStorage.ts     # save/read/delete photos via expo-file-system
    │   │   └── analytics.ts        # thin wrapper over Firebase Analytics
    │   └── mappers/
    │       ├── userMapper.ts
    │       └── scanMapper.ts
    ├── stores/
    │   ├── authStore.ts
    │   ├── userStore.ts
    │   ├── scanStore.ts
    │   ├── entitlementStore.ts
    │   └── onboardingStore.ts        # buffers all pre-auth answers; flushed at sign-up
    ├── config/
    │   ├── constants.ts            # CONDITIONS, FREE_SCAN_LIMIT=3, NOTIFICATION_HOUR=20
    │   ├── env.ts                  # typed env access
    │   └── analyticsEvents.ts      # event name constants
    ├── utils/
    │   ├── streak.ts               # isSameDay, daysBetween
    │   ├── age.ts                  # calculateAge(birthday)
    │   ├── formatters.ts
    │   └── id.ts                   # uuid v4
    └── types/
        ├── env.d.ts
        └── global.d.ts
```

**Layering rule:** `presentation` may import from `domain` and `stores`. `domain` may NOT import from `presentation` or `data` (only from itself + `utils`). `data` implements `domain/repositories` interfaces. Stores orchestrate use-cases and repositories.

---

## 10. State Management Plan

**Library:** Zustand 5.x. Justification: ~1.5KB, no boilerplate, fits the 4 distinct domains cleanly, integrates trivially with React 19 and Firestore listeners. Redux Toolkit is overkill for an MVP this size; Jotai's atomicity buys nothing here.

### Stores

```ts
// authStore — mirrors Firebase Auth
type AuthStore = {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
};

// userStore — mirrors users/{uid} doc; live-updated by Firestore listener
type UserStore = {
  profile: UserDoc | null;
  isLoading: boolean;
  updateProfile: (patch: Partial<UserDoc>) => Promise<void>;
  acknowledgeDisclaimer: () => Promise<void>;
  reset: () => void;                    // called on sign-out
};

// scanStore — current scan + analysing state
type ScanStore = {
  current: CurrentScanDoc | null;
  isAnalysing: boolean;
  error: AppError | null;
  analyseMeal: (input: AnalyseInput) => Promise<void>;
  markDamageControlVisited: (itemId: string) => Promise<void>;
  reset: () => void;
};

// entitlementStore — RevenueCat
type EntitlementStore = {
  isPro: boolean;
  offerings: PurchasesOffering | null;
  refresh: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<void>;
  restore: () => Promise<void>;
};
```

- All stores expose a `reset()` that the auth listener calls on sign-out.
- `userStore` and `scanStore` attach Firestore `onSnapshot` listeners on auth-ready and detach on sign-out.
- `entitlementStore` listens to `Purchases.addCustomerInfoUpdateListener`.
- **Persisted slices:** none in v1. Firestore is the source of truth for profile + scan; RevenueCat is the source for entitlement. `AsyncStorage` is wired in but only used by Zustand persist when we explicitly opt in (e.g., post-launch caching).

**Local-only state** stays in component `useState`: form inputs, camera ref, modal visibility, ephemeral animations.

---

## 11. Firebase Architecture

### Project setup

- **Region:** `nam5` (multi-region US) for Firestore. Auth is global.
- **Bundle ID:** `com.nutriguard.app` (confirm before App Store record creation)
- **Firestore mode:** Native (not Datastore). Single database `(default)`.
- **No Cloud Functions in v1.** Migrating the OpenAI call to a callable Function is the #1 post-launch improvement (see §12).

### Security rules (`firebase/firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function signedInAsSelf(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    match /users/{uid} {
      allow read: if signedInAsSelf(uid);
      allow create: if signedInAsSelf(uid)
        && request.resource.data.plan == 'free'
        && request.resource.data.lifetimePhotoScansUsed == 0
        && request.resource.data.streakCount == 0;
      allow update: if signedInAsSelf(uid)
        && request.resource.data.lifetimePhotoScansUsed
           >= resource.data.lifetimePhotoScansUsed
        && request.resource.data.lifetimePhotoScansUsed
           <= (resource.data.plan == 'pro' ? 9999 : 3);
      allow delete: if signedInAsSelf(uid);

      match /currentScan/{doc} {
        allow read, write, delete: if signedInAsSelf(uid);
      }
    }
  }
}
```

The `lifetimePhotoScansUsed` clamp is a defence-in-depth backstop. Client logic also enforces the cap. `plan: 'pro'` is set only after a successful RevenueCat purchase confirmation.

### Indexes

None needed. All reads are single-doc by ID.

---

## 12. API & Integration Layer

### OpenAI (`src/data/services/openai.ts`)

**Risk note:** v1 ships with the OpenAI API key bundled in the app via env. This is a known liability — the key can be extracted from a built IPA. Acceptable for closed TestFlight; **must move to a Cloud Function before public App Store launch.** Tracking item, P0.

```ts
analyseMeal(input: AnalyseInput): Promise<ScanResult>

type AnalyseInput = {
  photoBase64?: string;        // mutually exclusive with text
  text?: string;
  conditions: ConditionId[];
  customConditions: string[];
  ageYears: number;
  weightKg: number;
};
```

- **Model:** `gpt-4o-mini` for cost (~$0.0005/scan) — escalate to `gpt-4o` only on parse failure retry.
- **Mode:** JSON mode (`response_format: { type: 'json_object' }`), forced schema.
- **Validation:** `zod.parse()` against `ScanResult` schema; on failure, retry once with stricter prompt; on second failure, return `{ scanType: 'unrecognised' }`.
- **Prompt structure** (sketched in code, not duplicated here):
  - System: verdict rubric (0–5 → labels), tone rules ("warm, straight-talking, not a doctor"), JSON-only output, max insight length 240 chars
  - User: conditions list, age, weight, plus either `[image_url: data:image/jpeg;base64,...]` or text description
- **Timeout:** 30 s. On timeout, surface `AppError('AI_TIMEOUT')` → analysis screen shows "Try again".

### RevenueCat (`src/data/services/revenuecat.ts`)

```ts
init(apiKey: string, appUserId: string): Promise<void>
getOfferings(): Promise<PurchasesOffering>
purchase(pkg: PurchasesPackage): Promise<CustomerInfo>
restore(): Promise<CustomerInfo>
isPro(info: CustomerInfo): boolean       // checks entitlements['pro'].isActive
```

- Product IDs (configure in App Store Connect AND RevenueCat dashboard):
  - `nutriguard_pro_monthly_999` → entitlement `pro`
  - `nutriguard_pro_annual_4999` → entitlement `pro`
- App user ID = Firebase `uid`. Call `Purchases.logIn(uid)` after Firebase sign-in; `Purchases.logOut()` on sign-out.

### Apple Sign-In (`src/data/services/appleAuth.ts`)

Wraps `expo-apple-authentication`:
1. Generate nonce (SHA-256 hex)
2. `AppleAuthentication.signInAsync({ requestedScopes, nonce })`
3. Build Firebase credential, sign in
4. Handle null email on subsequent sign-ins (Apple returns it only the first time)

### Local notifications (`src/data/services/notifications.ts`)

```ts
ensurePermissions(): Promise<boolean>
scheduleStreakRiskTonight(streakCount: number): Promise<string>     // returns notif id
cancelStreakRiskTonight(): Promise<void>
scheduleMilestone(streakCount: 7 | 14 | 30): Promise<string>
scheduleFirstScanNudge(): Promise<string>                            // 24h post sign-up
cancelAllForUser(): Promise<void>                                    // on sign-out
```

All notifications are **local** (scheduled on the device). No FCM, no server. The 8pm streak-risk is rescheduled daily on app foreground.

### Photo storage (`src/data/services/photoStorage.ts`)

- All photos saved under `${FileSystem.documentDirectory}scans/`
- Filename: `${ISO timestamp}.jpg`
- On every new scan, delete previous scan's photo to keep storage bounded to 1 file
- Return `file://...` URI for display in `LastScanScreen` via `expo-image`
- Photos NEVER uploaded to Firebase Storage (and Firebase Storage is NOT enabled in this project)

---

## 13. Navigation Structure

```
RootNavigator (NativeStack, headerShown: false)
├── AuthGate (renders one of):
│   ├── OnboardingFlowStack (NativeStack — pre-auth conversion funnel, 29 screens)
│   │   ├── Welcome / Problem / Solution           (introduction — pillar 1)
│   │   ├── Name / Birthday / Conditions           (identity)
│   │   ├── Duration / Bombshell / Bridge          (aha moment + bridge)
│   │   ├── QuestionStrategy / ReflectStrategy     (question bank)
│   │   ├── QuestionPain / QuestionAnxiety / QuestionGoal
│   │   ├── Mirror                                 (fade-in summary)
│   │   ├── Cuisine / Cooking                      (analytics)
│   │   ├── DemoIntro / DemoAnalysing / DemoResult (climax — pillar 2)
│   │   ├── StreakStart                            (peak emotion + native review prompt)
│   │   ├── Personalising / PlanSummary            (conclusion — pillar 3)
│   │   ├── BodyDetails / Disclaimer / Notifications
│   │   ├── Commitment                             (Cialdini commitment screen)
│   │   ├── SignUp                                 (existing `SignUpScreen` — auth final step)
│   │   └── Login                                  (existing `LoginScreen`)
│   └── MainTabs (BottomTabs — labels: Home, Last Scan, Profile)
│       ├── HomeStack (NativeStack)
│       │   ├── HomeScreen
│       │   └── ScanStack (presentation: 'modal')
│       │       ├── CameraScreen
│       │       ├── TypeItInScreen
│       │       └── AnalysingScreen           # auto-pops to LastScan tab on success
│       ├── LastScanStack (NativeStack)
│       │   ├── LastScanScreen
│       │   └── DamageControlScreen
│       └── ProfileStack (NativeStack)
│           ├── ProfileScreen
│           ├── EditProfileScreen
│           └── DeleteAccountScreen
└── PaywallScreen (presentation: 'modal', from RootNavigator — overlays MainTabs)
```

Tab order matches mocks (Home / Last Scan / Profile). `AnalysingScreen` is non-dismissible until result lands or fails. After success, it does `navigation.popToTop()` on the modal stack and switches the tab to `Last Scan`.

---

## 14. Error Handling Strategy

- **Root error boundary** in `App.tsx` → fallback `<ErrorScreen />` with a Reload button (`DevSettings.reload()` in dev, `Updates.reloadAsync()` in prod).
- **Typed `AppError`** in `src/types/global.d.ts`:
  ```ts
  class AppError extends Error {
    constructor(public code: AppErrorCode, message?: string) { super(message); }
  }
  type AppErrorCode =
    | 'NETWORK' | 'AI_TIMEOUT' | 'AI_PARSE_FAIL'
    | 'AUTH_INVALID' | 'AUTH_RATE_LIMITED'
    | 'PURCHASE_CANCELLED' | 'PURCHASE_FAILED'
    | 'SCAN_LIMIT_REACHED' | 'PERMISSION_DENIED' | 'UNKNOWN';
  ```
- **Lightweight in-house Toast** (`src/presentation/components/Toast.tsx`) — single static API `Toast.show({ type, message })`. No external lib.
- **OpenAI errors:** silent retry once → on second failure, write a `scanType: 'unrecognised'` doc and route to `LastScanScreen` showing mock 10 with "Try again" CTA.
- **`SCAN_LIMIT_REACHED`:** caught in `analyseMealUseCase` for free users at scan #4; the use-case throws this code, and the UI layer presents the `PaywallScreen` modal instead of the analysing screen.
- **`PERMISSION_DENIED`** for camera/photos: present an alert with "Open Settings" CTA via `Linking.openSettings()`.
- **Analytics:** every `AppError` thrown is logged via `analytics.logEvent('error_<code>', { ... })`.

---

## 15. Environment Configuration

### Env loading

`app.config.ts` reads from `process.env` and exposes values via `expo-constants`:

```ts
// app.config.ts (summary)
export default ({ config }) => ({
  ...config,
  name: 'NutriGuard',
  slug: 'nutriguard',
  ios: { bundleIdentifier: 'com.nutriguard.app', ... },
  extra: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    revenueCatIosKey: process.env.REVENUECAT_IOS_KEY,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    eas: { projectId: '<filled by eas init>' },
  },
});
```

### `.env.example`

```
OPENAI_API_KEY=sk-proj-...
REVENUECAT_IOS_KEY=appl_...
FIREBASE_PROJECT_ID=nutriguard-prod
```

`GoogleService-Info.plist` is committed (it's not a secret — it's a public client config).

### EAS profiles (`eas.json`)

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "env": { "APP_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false },
      "env": { "APP_ENV": "preview" }
    },
    "production": {
      "autoIncrement": true,
      "env": { "APP_ENV": "production" }
    }
  },
  "submit": { "production": { "ios": { "ascAppId": "<fill in>" } } }
}
```

- `development` → Dev Client builds for daily work
- `preview` → internal TestFlight
- `production` → App Store

---

## 16. App Store Compliance Checklist

- [ ] **Category:** Health & Fitness (NOT Medical)
- [ ] **Disclaimer** acknowledged during onboarding (`DisclaimerScreen`) AND visible as `<DisclaimerFooter />` on every results-bearing screen
- [ ] **Info.plist usage strings** (set in `app.config.ts → ios.infoPlist`):
  - `NSCameraUsageDescription`: "NutriGuard uses your camera to scan meals and food labels."
  - `NSPhotoLibraryUsageDescription`: "Choose a meal photo from your library to scan."
  - `NSPhotoLibraryAddUsageDescription`: "Save your shared result card to Photos."
  - `NSUserNotificationsUsageDescription`: handled at runtime via `expo-notifications` request
- [ ] **Apple Sign-In** offered (App Store Guideline 4.8 — required because we offer non-Apple sign-in)
- [ ] **Privacy policy URL** — TODO before submission, hosted at `nutriguard.app/privacy` (or similar)
- [ ] **App Tracking Transparency** — NOT required (no IDFA collection, no ad networks)
- [ ] **Sensitive content** — medical-adjacent, but Health & Fitness category is correct because we provide general wellness info, not diagnosis or treatment
- [ ] **In-app purchases** via StoreKit / RevenueCat only — no external payment links
- [ ] **Restore purchases** button in Paywall and Profile (App Store Guideline 3.1.1)
- [ ] **Account deletion** in Profile (App Store Guideline 5.1.1(v))
- [ ] **Sign in with Apple** name/email scope requested but UI gracefully handles null email on returning sign-ins
- [ ] **Review notes** for App Review: include sandbox test account, RevenueCat sandbox subscriber, notes that AI may occasionally misidentify food

---

## 17. Development Phases

Each phase ships independently to TestFlight. Don't move to phase N+1 until N is demoably working.

| # | Phase | Definition of done |
| --- | --- | --- |
| 0 | **Prereqs** | RevenueCat account created; products `nutriguard_pro_monthly_999` & `nutriguard_pro_annual_4999` configured in App Store Connect AND RevenueCat dashboard with entitlement `pro`; Apple Developer team ID confirmed; Firebase project keys in `.env`; OpenAI API key with funded billing |
| 1 | **Scaffold** | `npx create-expo-app`, all packages from §8 installed, TS strict, ESLint + Prettier wired, EAS init, `eas build --profile development` produces a working Dev Client on a real device |
| 2 | **Firebase wired** | `firebase.ts` initialises, Auth listener emits, Firestore connects, security rules deployed via `firebase deploy --only firestore:rules` |
| 3 | **Auth + Onboarding** | Email + Apple sign-up/in works end-to-end, `users/{uid}` doc created, `OnboardingStack` 3 screens functional, lands on Home after disclaimer |
| 4 | **Tabs + Home shell** | All 3 tabs render; Home shows mock streak + last-scan card; Profile is read-only with profile data |
| 5 | **Type It In flow** | TypeItInScreen → AnalysingScreen → LastScanScreen with mocked AI response. Validates the full UI loop without OpenAI. |
| 6 | **OpenAI integration** | `analyseMeal()` real, prompt + Zod schema solid, retry-once, unrecognised fallback works |
| 7 | **Results + Damage Control + Verdict chips** | All five chip variants render correctly, Eat-Anyway / Damage-Control / Next button cycle works, "See Damage Control" relabel after first visit |
| 8 | **Camera + Gallery scans** | `expo-camera` capture saves to `expo-file-system`, `expo-image-picker` works, photo displays on `LastScanScreen` |
| 9 | **Free-tier counter + Paywall + RevenueCat** | Scans 1–3 work, scan #4 (free, photo/label) presents `PaywallScreen`, monthly + annual purchase flips `plan: 'pro'`, restore works |
| 10 | **Streak engine + notifications** | Streak increments daily, resets on gap, 8pm risk notification scheduled/cancelled correctly, milestone (7/14/30) push fires next morning, first-scan nudge at +24h |
| 11 | **Share result card** | iOS share sheet via `expo-sharing` + `react-native-view-shot` snapshot of a custom card view |
| 12 | **Profile editing + account deletion** | Weight/height/birthday editable, condition chips add/remove, custom condition free-text works, delete-account flow nukes everything per §7 |
| 13 | **Polish + analytics** | All screens pixel-checked against mocks; key events logged: `signup`, `login`, `scan_started`, `scan_completed`, `paywall_shown`, `purchase_completed`, `share_initiated`, `streak_milestone`, `error_*` |
| 14 | **QA pass** | Manual QA matrix across all 13 screens × free/pro × empty/populated states; streak rollover at midnight; sign-out/in preserves state; offline behaviour |
| 15 | **App Store submission** | Privacy policy live, screenshots taken (6.7" + 6.1"), review notes filed, TestFlight beta done, submitted |

---

## 18. Conventions & Standards

### TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitAny: true`
- No `any`. Use `unknown` and narrow.
- `interface` for object shapes, `type` for unions / mapped types.
- Path alias `@/*` maps to `src/*` (configured in `tsconfig.json` AND `babel.config.js` via `babel-plugin-module-resolver`).

### Naming

- `PascalCase`: components, types, classes, enums, files exporting a default React component
- `camelCase`: functions, variables, hooks (`useFoo`), file names for utilities
- `SCREAMING_SNAKE_CASE`: top-level constants in `src/config/constants.ts`
- File matches export: `VerdictChip.tsx` exports `VerdictChip`; `streak.ts` exports `isSameDay`, `daysBetween`

### React

- Function components only. No class components.
- Props typed via `interface XxxProps`. No prop destructuring with defaults inside the signature — use a default-merge inside the body when needed.
- Custom hooks live in `src/presentation/hooks/`. They MUST start with `use`.

### Theme

Colors from the mocks (do not improvise):

```ts
// src/presentation/theme/colors.ts
export const colors = {
  bg: '#E8E3D8',
  surface: '#F5F1EA',
  card: '#FFFFFF',
  ink: '#2B2117',
  inkSoft: '#6B5E52',
  inkMuted: '#9B8E82',
  border: '#E2DBD0',
  primary: '#3A5239',          // deep green
  accent: '#C9A870',           // golden
  verdict: {
    allGood: { bg: '#D4EDDA', fg: '#276132' },
    mostlyFine: { bg: '#C8E6C9', fg: '#2E6B34' },
    eatLess: { bg: '#FFF9C4', fg: '#8B5E00' },
    notIdeal: { bg: '#FFE0B2', fg: '#C64A00' },
    skipIt: { bg: '#FFCDD2', fg: '#B71C1C' },
  },
};
```

Typography: Georgia (serif) for headings, system sans for body and UI. No external font loading.

### Git

- **Branches:** `main` (protected), `feat/*`, `fix/*`, `chore/*`, `docs/*`
- **Commits:** Conventional Commits — `feat: add streak badge`, `fix: prevent free user past 3 scans`, `chore: bump expo to 54.0.1`
- **PRs:** one feature per PR, screenshot or screen-recording for any UI change, link the PR description to the relevant `overview.md` section (e.g., "Implements §5.B step 3").
- **No comments in code** unless explaining a non-obvious *why*. Identifiers carry intent.

---

## Appendix A — Verdict copy reference (mocks)

| Verdict | Header copy on results | Card secondary text |
| --- | --- | --- |
| All Good! | "Safe to enjoy" section | none — chip alone |
| Mostly Fine | "Safe to enjoy" section | none — chip alone |
| Eat Less | "Worth a closer look" section | reasoning → Eat Anyway button |
| Not Ideal | "Worth a closer look" section | reasoning → Eat Anyway button |
| Skip It | "Worth a closer look" section | reasoning → Eat Anyway button (label remains "Eat Anyway", not "Skip Anyway") |

## Appendix B — Notification copy

| Trigger | Title | Body |
| --- | --- | --- |
| Streak risk (daily 8pm if no scan) | NutriGuard | "Your {N}-day streak ends tonight — scan your dinner to keep it alive 🍽️" |
| Streak milestone 7 | NutriGuard | "7 days in a row — you're actually building a habit here 🍽️" |
| Streak milestone 14 | NutriGuard | "Two weeks straight. That's not luck, that's discipline 🍽️" |
| Streak milestone 30 | NutriGuard | "30 days. NutriGuard has officially become your habit 🍽️" |
| First scan nudge (+24h) | NutriGuard | "You haven't tried your first scan yet — takes about 10 seconds 🍽️" |

## Appendix C — Disclaimer copy (verbatim)

> "NutriGuard gives general wellness info based on widely accepted dietary guidelines. This isn't medical advice — always check with your doctor before changing what you eat."

Shown:
1. As a checkbox-gated paragraph on `SignUpScreen`
2. As a full screen on `DisclaimerScreen` (acknowledgement persisted to Firestore)
3. As a small italic footer on `LastScanScreen`, `DamageControlScreen`, and any verdict-bearing modal
4. In the App Store description and the privacy policy

---

*End of overview.*
