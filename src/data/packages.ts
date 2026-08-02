/**
 * Placeholder package inventory.
 *
 * Shapes here mirror the `Package`, `PackagePricing`, `PackageDeparture` and
 * `Review` models in PLAN.md so the move to Postgres is a data migration rather
 * than a refactor. Two notes on how to read this file:
 *
 * 1. MONEY is in whole rupees, matching `formatPrice()`. The DB will hold paise.
 * 2. `pricing.platformPrice` is NEVER hand-written. Every package declares only
 *    `retailPrice` (what the operator charges direct) and `b2bCost` (what the
 *    operator charges us); the platform price, margin, savings and validation
 *    status are produced by `computePricing()` in ./pricing.ts at module load.
 *    That is the same engine the server will run once this is a real database.
 *
 * The legacy `price` field is kept and equals `retailPrice`, so every component
 * that reads `pkg.price` today renders exactly what it rendered before. Phase 2
 * switches customer-facing surfaces over to `pkg.pricing.platformPrice`.
 *
 * Photography: every Unsplash ID below was opened and visually checked to confirm
 * it depicts the destination it is attached to. The previous set did not — Coorg
 * was illustrated with India Gate in Delhi, and Meghalaya with a Kashmiri meadow.
 */

import { computePricing, type PackagePricing } from "./pricing";

/* ────────────────────────────────────────────────────────────────────────────
   Verified imagery. Each constant is an Unsplash photo ID that was inspected and
   confirmed to show the place it is named for.
   ──────────────────────────────────────────────────────────────────────────── */

const PHOTO = {
  // Spiti Valley — cold desert, barren ochre slopes, cliff monasteries
  spitiKeyMonastery: "1653844573020-71f77a0ccb8c",
  spitiRiverValley: "1583912489026-898cdc54cbe0",
  spitiBarrenValley: "1643196539282-8a65ee03e715",
  spitiDhankar: "1580389915863-f9bc9ff15bd9",
  spitiNightCamp: "1632510343991-a82b81b2ceef",
  spitiMonasteryRidge: "1617159156637-dfb8655c9f95",

  // Leh Ladakh — high-altitude desert, blue lakes, highway passes
  ladakhPangong: "1635255506105-b74adbd94026",
  ladakhConfluence: "1619837374214-f5b9eb80876d",
  ladakhNubra: "1600438831035-48f5f196d3bf",
  ladakhHighway: "1617824077360-7a77db40aae1",
  ladakhMotorcycle: "1581793745862-99fde7fa73d2",

  // Meghalaya — subtropical green, root bridges, plunge waterfalls
  meghalayaRootBridge: "1593813738953-fb3c93e0769d",
  meghalayaNohkalikai: "1637043765564-a071ff91a09f",
  meghalayaSevenSisters: "1609276804051-8c5e906cc430",
  meghalayaCliffs: "1689089526066-c7e6e95ee265",
  meghalayaHills: "1625826415128-3fbae9b3022c",

  // Coorg — Western Ghats, coffee estates, mist
  coorgEstate: "1599922760936-e840fa373d8d",
  coorgAbbeyFalls: "1655128633542-b6b7e86e93b4",
  coorgMistyRoad: "1622004468207-4f8b21600c20",
  coorgHills: "1560357647-62a43d9897bb",
  coorgLayeredRidges: "1529057299613-a565b7ce93aa",

  // Rishikesh — Ganges, suspension bridges, rafting
  rishikeshJhula: "1720819029162-8500607ae232",
  rishikeshRafting: "1718383537411-6f9e727ae0bb",
  rishikeshKayaks: "1603867106100-0d2039fc8757",
  rishikeshTemple: "1650341259809-9314b0de9268",
  rishikeshRiverfront: "1712510817140-917938f92e5b",

  // Jaisalmer — Thar desert, sandstone fort, dunes
  jaisalmerFort: "1713349881676-594b95a5742b",
  jaisalmerCamels: "1654245363109-b873bb61b2fa",
  jaisalmerCamelSunset: "1709620220232-12ecd7ca33a8",
  jaisalmerFortNight: "1586612438666-ffd0ae97ad36",
  jaisalmerGadisar: "1600954700722-b9a768fc9397",
  jaisalmerDunes: "1602858659965-ea6f743b7679",
} as const;

export function unsplash(photoId: string, width = 800): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=80`;
}

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

export type PackageStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "PAUSED"
  | "PRICING_VIOLATION";

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface PackageReview {
  id: string;
  /** Reviews are 1:1 with a completed booking — no booking, no review. */
  bookingReference: string;
  verified: boolean;
  name: string;
  rating: number;
  date: string;
  text: string;
  avatar: string;
}

export interface PackageDeparture {
  id: string;
  /** ISO date, yyyy-mm-dd. */
  startDate: string;
  endDate: string;
  seatsTotal: number;
  seatsBooked: number;
  /** Overrides the computed platform price for this departure only. */
  priceOverride: number | null;
}

export interface Package {
  /* identity */
  id: string;
  /** Same value as `id`. Preserves the existing /packages/[id] URLs. */
  slug: string;
  isDemoData: boolean;
  status: PackageStatus;
  publishedAt: string;

  /* relations — operator fields are denormalised here exactly as before, because
     components read them directly. The DB replaces these with a join. */
  operatorId: string;
  operatorName: string;
  operatorVerified: boolean;
  operatorRating: number;
  operatorReviews: number;
  destinationId: string;

  /* content */
  title: string;
  summary: string;
  highlights: string[];
  tags: string[];
  images: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];

  /* logistics */
  duration: string;
  durationDays: number;
  nights: number;
  groupSize: string;
  groupSizeMin: number;
  groupSizeMax: number;
  difficulty: string;
  minAge: number;
  hotelType: string;
  mealsIncluded: boolean;
  guideIncluded: boolean;
  transportIncluded: boolean;
  pickupPoint: string;
  dropPoint: string;
  cancellationPolicy: string;
  cancellationPolicyId: string;

  /* pricing — server-computed, see ./pricing.ts */
  /** Legacy alias of `pricing.retailPrice`. Existing components read this. */
  price: number;
  pricing: PackagePricing;

  /* trust signals */
  reviews: PackageReview[];
  packageRating: number;
  packageReviewCount: number;
  bookingsLast30d: number;

  /* inventory */
  departures: PackageDeparture[];
}

/* ────────────────────────────────────────────────────────────────────────────
   Helpers — all deterministic. No Date.now()/Math.random(), because this data is
   rendered during SSR and any nondeterminism becomes a hydration mismatch.
   ──────────────────────────────────────────────────────────────────────────── */

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** [startDate, seatsTotal, seatsBooked] */
type DepartureSpec = readonly [string, number, number];

function makeDepartures(
  packageId: string,
  durationDays: number,
  specs: readonly DepartureSpec[]
): PackageDeparture[] {
  return specs.map(([startDate, seatsTotal, seatsBooked], i) => ({
    id: `${packageId}-dep-${i + 1}`,
    startDate,
    endDate: addDays(startDate, durationDays - 1),
    seatsTotal,
    seatsBooked,
    priceOverride: null,
  }));
}

function bookingReference(packageId: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < packageId.length; i++) {
    hash = (hash * 31 + packageId.charCodeAt(i)) >>> 0;
  }
  return `ATL-${(((hash + index * 7919) % 900000) + 100000).toString()}`;
}

/* ────────────────────────────────────────────────────────────────────────────
   Seed data
   ──────────────────────────────────────────────────────────────────────────── */

type ReviewSeed = Omit<PackageReview, "id" | "bookingReference" | "verified">;

type PackageSeed = Omit<
  Package,
  | "slug"
  | "isDemoData"
  | "price"
  | "pricing"
  | "nights"
  | "reviews"
  | "packageRating"
  | "packageReviewCount"
> & {
  /** What the operator charges a customer directly. */
  retailPrice: number;
  /** What the operator charges Atlaso. Gap to retail is 15–25% on every package. */
  b2bCost: number;
  reviews: ReviewSeed[];
};

const packageSeeds: PackageSeed[] = [
  /* ══ SPITI VALLEY ══════════════════════════════════════════════════════════ */
  {
    id: "alpine-spiti-7d",
    status: "ACTIVE",
    publishedAt: "2025-11-04",
    operatorId: "alpine-treks",
    operatorName: "Alpine Treks Co",
    operatorVerified: true,
    operatorRating: 4.9,
    operatorReviews: 312,
    destinationId: "spiti-valley",
    title: "Ultimate Spiti Valley Explorer",
    summary:
      "Our most complete Spiti circuit — Shimla in, Manali out, with two nights high in Kaza and a camp at Chandratal.",
    highlights: ["Key Monastery", "Chandratal camping", "Kunzum Pass", "Delhi–Delhi transport"],
    tags: ["Road Trip", "Monasteries", "Camping"],
    retailPrice: 14999,
    b2bCost: 11849,
    duration: "7 Days / 6 Nights",
    durationDays: 7,
    groupSize: "Max 12",
    groupSizeMin: 4,
    groupSizeMax: 12,
    difficulty: "Moderate",
    minAge: 14,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Guesthouse + Camping",
    pickupPoint: "Delhi (Majnu Ka Tila)",
    dropPoint: "Delhi (Majnu Ka Tila)",
    cancellationPolicy: "Free cancellation until 7 days before",
    cancellationPolicyId: "flexible-7d",
    bookingsLast30d: 34,
    images: [
      unsplash(PHOTO.spitiKeyMonastery),
      unsplash(PHOTO.spitiBarrenValley),
      unsplash(PHOTO.spitiNightCamp),
    ],
    inclusions: [
      "All meals (breakfast, lunch, dinner)",
      "Experienced mountain guide",
      "Delhi to Delhi transport (AC Volvo)",
      "All permits and entry fees",
      "Accommodation (guesthouse/camps)",
      "First aid and emergency support",
      "Travel insurance",
    ],
    exclusions: ["Personal expenses", "Porter charges", "Tips for guide/driver", "Any extra meals"],
    itinerary: [
      { day: 1, title: "Delhi → Shimla", description: "Overnight bus from Delhi to Shimla. Arrive early morning.", activities: ["Bus travel", "Rest"] },
      { day: 2, title: "Shimla → Narkanda → Nako", description: "Drive through apple orchards, cross into Kinnaur.", activities: ["Scenic drive", "Nako Lake visit"] },
      { day: 3, title: "Nako → Kaza", description: "Enter the Spiti Valley. Visit Dhankar Monastery.", activities: ["Dhankar Monastery", "Pin Valley view"] },
      { day: 4, title: "Kaza Local", description: "Full day in Kaza. Visit Key Monastery and Kibber village.", activities: ["Key Monastery", "Kibber Village", "Local market"] },
      { day: 5, title: "Kaza → Chandratal", description: "Trek to the magical Chandratal Lake at 14,100 ft.", activities: ["Chandratal Trek", "Camping"] },
      { day: 6, title: "Chandratal → Manali", description: "Cross Kunzum Pass, descend to Manali.", activities: ["Kunzum Pass", "Rohtang"] },
      { day: 7, title: "Manali → Delhi", description: "Overnight bus back to Delhi.", activities: ["Rest", "Overnight bus"] },
    ],
    reviews: [
      { name: "Rahul Sharma", rating: 5, date: "March 2024", text: "Absolutely life-changing trip. The guide was knowledgeable and caring. Chandratal lake took my breath away.", avatar: "RS" },
      { name: "Priya Mehta", rating: 5, date: "Feb 2024", text: "Best organized trek I've been on. Everything was perfectly timed, food was great.", avatar: "PM" },
      { name: "Aditya Nair", rating: 4, date: "Jan 2024", text: "Great experience overall. Slight delay on day 2 but handled professionally.", avatar: "AN" },
    ],
    departures: makeDepartures("alpine-spiti-7d", 7, [
      ["2026-08-14", 12, 9],
      ["2026-09-04", 12, 5],
      ["2027-06-12", 12, 1],
      ["2027-07-10", 12, 0],
    ]),
  },
  {
    id: "summit-spiti-6d",
    status: "ACTIVE",
    publishedAt: "2025-11-18",
    operatorId: "summit-squad",
    operatorName: "Summit Squad",
    operatorVerified: true,
    operatorRating: 4.7,
    operatorReviews: 189,
    destinationId: "spiti-valley",
    title: "Spiti Budget Adventure Pack",
    summary:
      "The cheapest honest way into Spiti. Tents throughout, self-arranged travel to Shimla, everything else handled.",
    highlights: ["Hikkim post office", "Langza fossils", "Chandratal camp", "Small group of 8"],
    tags: ["Budget", "Camping", "Youth"],
    retailPrice: 9999,
    b2bCost: 8199,
    duration: "6 Days / 5 Nights",
    durationDays: 6,
    groupSize: "Max 8",
    groupSizeMin: 4,
    groupSizeMax: 8,
    difficulty: "Moderate",
    minAge: 16,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: false,
    hotelType: "Camping",
    pickupPoint: "Shimla (Old Bus Stand)",
    dropPoint: "Manali (Mall Road)",
    cancellationPolicy: "No refund after booking",
    cancellationPolicyId: "non-refundable",
    bookingsLast30d: 41,
    images: [
      unsplash(PHOTO.spitiNightCamp),
      unsplash(PHOTO.spitiRiverValley),
      unsplash(PHOTO.spitiMonasteryRidge),
    ],
    inclusions: [
      "All meals included",
      "Certified guide",
      "Tented accommodation",
      "All permits",
      "Basic first aid",
    ],
    exclusions: ["Transport to Shimla", "Personal gear", "Travel insurance", "Tips"],
    itinerary: [
      { day: 1, title: "Shimla → Nako", description: "Meet at Shimla bus stand. Drive to Nako village.", activities: ["Group meeting", "Drive"] },
      { day: 2, title: "Nako → Kaza", description: "Enter Spiti. Stop at Dhankar Lake.", activities: ["Dhankar Lake", "Kaza arrival"] },
      { day: 3, title: "Kaza Sightseeing", description: "Key Monastery, Kibber, Hikkim (world's highest post office).", activities: ["Key Monastery", "Hikkim Post Office"] },
      { day: 4, title: "Langza & Komic", description: "Visit fossil village Langza and Komic monastery.", activities: ["Langza fossils", "Komic"] },
      { day: 5, title: "Chandratal Lake", description: "Trek 6km to Chandratal. Camp overnight.", activities: ["Chandratal Trek", "Stargazing"] },
      { day: 6, title: "Return to Manali", description: "Early morning drive to Manali via Kunzum.", activities: ["Departure"] },
    ],
    reviews: [
      { name: "Kavya Reddy", rating: 5, date: "Apr 2024", text: "Unbelievable value for money. The camping nights were magical.", avatar: "KR" },
      { name: "Siddharth Roy", rating: 4, date: "Mar 2024", text: "Great budget option. Transport not included was the only downside.", avatar: "SR" },
    ],
    departures: makeDepartures("summit-spiti-6d", 6, [
      ["2026-08-08", 8, 8],
      ["2026-08-22", 8, 6],
      ["2026-09-12", 8, 3],
      ["2027-06-19", 8, 0],
    ]),
  },
  {
    id: "peak-spiti-8d",
    status: "ACTIVE",
    publishedAt: "2025-10-22",
    operatorId: "peak-pathways",
    operatorName: "Peak Pathways",
    operatorVerified: true,
    operatorRating: 4.8,
    operatorReviews: 241,
    destinationId: "spiti-valley",
    title: "Spiti Premium Expedition",
    summary:
      "Boutique stays, a travelling chef and a naturalist guide. Spiti without giving up comfort or altitude safety.",
    highlights: ["Private chef", "Heritage stay at Sarahan", "Satellite phone", "Max 10 guests"],
    tags: ["Premium", "Slow Travel", "Guided"],
    retailPrice: 19999,
    b2bCost: 15599,
    duration: "8 Days / 7 Nights",
    durationDays: 8,
    groupSize: "Max 10",
    groupSizeMin: 4,
    groupSizeMax: 10,
    difficulty: "Moderate",
    minAge: 12,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Boutique Hotels + Luxury Camps",
    pickupPoint: "Delhi (Aerocity)",
    dropPoint: "Delhi (Aerocity)",
    cancellationPolicy: "Free cancellation until 3 days before",
    cancellationPolicyId: "flexible-3d",
    bookingsLast30d: 17,
    images: [
      unsplash(PHOTO.spitiDhankar),
      unsplash(PHOTO.spitiKeyMonastery),
      unsplash(PHOTO.spitiRiverValley),
    ],
    inclusions: [
      "All gourmet meals (chef accompanied)",
      "Expert naturalist guide",
      "Delhi-Delhi luxury transport",
      "Boutique hotel + luxury tents",
      "All permits and fees",
      "Satellite phone",
      "Comprehensive travel insurance",
      "Welcome and farewell dinner",
    ],
    exclusions: ["Alcoholic beverages", "Personal shopping", "Helicopter evacuation (extra)"],
    itinerary: [
      { day: 1, title: "Delhi → Shimla", description: "Luxury AC coach from Delhi. Welcome dinner in Shimla.", activities: ["Luxury coach", "Welcome dinner"] },
      { day: 2, title: "Shimla → Sarahan", description: "Visit Bhimakali temple. Stay at heritage property.", activities: ["Bhimakali Temple", "Heritage hotel"] },
      { day: 3, title: "Sarahan → Nako", description: "Scenic drive through Kinnaur valley.", activities: ["Kinnaur views", "Nako Lake"] },
      { day: 4, title: "Nako → Kaza", description: "Enter Spiti. Monastery visit and cultural interaction.", activities: ["Monastery", "Local interaction"] },
      { day: 5, title: "Kaza Exploration", description: "Key, Kibber, Hikkim with expert guide commentary.", activities: ["Key Monastery", "Kibber", "Hikkim"] },
      { day: 6, title: "Langza → Chandratal", description: "Fossil hunting in Langza, evening at Chandratal.", activities: ["Fossil hunting", "Chandratal sunset"] },
      { day: 7, title: "Chandratal → Manali", description: "Leisurely morning, cross Kunzum, luxury camp in Manali.", activities: ["Kunzum Pass", "Rohtang"] },
      { day: 8, title: "Manali → Delhi", description: "Luxury bus to Delhi. Farewell packet from team.", activities: ["Farewell", "Bus to Delhi"] },
    ],
    reviews: [
      { name: "Ananya Singh", rating: 5, date: "May 2024", text: "Worth every rupee. The gourmet meals at 14,000 ft were surreal.", avatar: "AS" },
      { name: "Vikram Patel", rating: 5, date: "Apr 2024", text: "The naturalist guide transformed this trip. Learned so much.", avatar: "VP" },
      { name: "Meera Joshi", rating: 5, date: "Mar 2024", text: "Peak Pathways redefined what a Himalayan trip can feel like.", avatar: "MJ" },
    ],
    departures: makeDepartures("peak-spiti-8d", 8, [
      ["2026-08-16", 10, 7],
      ["2026-09-06", 10, 4],
      ["2027-06-20", 10, 1],
    ]),
  },
  {
    id: "himalayan-souls-spiti-7d",
    status: "ACTIVE",
    publishedAt: "2025-12-02",
    operatorId: "himalayan-souls",
    operatorName: "Himalayan Souls",
    operatorVerified: true,
    operatorRating: 4.6,
    operatorReviews: 156,
    destinationId: "spiti-valley",
    title: "Spiti Community Immersion",
    summary:
      "Homestays with Spitian families, home-cooked food and an afternoon cooking with your hosts. Run with village-owned accommodation.",
    highlights: ["Village homestays", "Tabo Monastery", "Cooking with hosts", "Bonfire evenings"],
    tags: ["Homestay", "Culture", "Community"],
    retailPrice: 11499,
    b2bCost: 9299,
    duration: "7 Days / 6 Nights",
    durationDays: 7,
    groupSize: "Max 10",
    groupSizeMin: 2,
    groupSizeMax: 10,
    difficulty: "Moderate",
    minAge: 12,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: false,
    hotelType: "Local Homestays",
    pickupPoint: "Shimla (Old Bus Stand)",
    dropPoint: "Manali (Mall Road)",
    cancellationPolicy: "Free cancellation 5 days before",
    cancellationPolicyId: "flexible-5d",
    bookingsLast30d: 23,
    images: [
      unsplash(PHOTO.spitiMonasteryRidge),
      unsplash(PHOTO.spitiKeyMonastery),
      unsplash(PHOTO.spitiBarrenValley),
    ],
    inclusions: [
      "Local homestay accommodation",
      "All meals (home-cooked)",
      "Licensed local guide",
      "All permits and entry fees",
      "Cultural immersion session with village elders",
      "Bonfire evenings",
    ],
    exclusions: ["Transport to Shimla", "Personal expenses", "Travel insurance", "Tips"],
    itinerary: [
      { day: 1, title: "Shimla → Nako", description: "Arrive Shimla. Drive to Nako village via Kinnaur.", activities: ["Scenic drive", "Nako Lake"] },
      { day: 2, title: "Nako → Tabo", description: "Visit Tabo Monastery, one of the oldest in India.", activities: ["Tabo Monastery", "Cave exploration"] },
      { day: 3, title: "Tabo → Kaza", description: "Enter the heart of Spiti Valley.", activities: ["Dhankar Fort", "Kaza arrival"] },
      { day: 4, title: "Kaza – Village Life", description: "Full immersion day with Spiti locals. Cook traditional food.", activities: ["Cooking class", "Cultural session", "Local market"] },
      { day: 5, title: "Key Monastery + Kibber", description: "Guided tour of Key Monastery and Kibber village.", activities: ["Key Monastery", "Kibber", "Hikkim Post Office"] },
      { day: 6, title: "Chandratal Trek", description: "Trek to the stunning Chandratal Lake. Camp under stars.", activities: ["Chandratal Trek", "Stargazing", "Bonfire"] },
      { day: 7, title: "Manali → Departure", description: "Drive over Rohtang and return to Manali.", activities: ["Rohtang Pass", "Departure"] },
    ],
    reviews: [
      { name: "Kiran Rao", rating: 5, date: "Apr 2024", text: "The homestay experience was unlike anything I've done before. So authentic.", avatar: "KR" },
      { name: "Simran Kaur", rating: 4, date: "Mar 2024", text: "Great value with genuine local hospitality. Transport not included is a bit inconvenient.", avatar: "SK" },
    ],
    departures: makeDepartures("himalayan-souls-spiti-7d", 7, [
      ["2026-08-11", 10, 6],
      ["2026-09-01", 10, 2],
      ["2027-06-15", 10, 0],
      ["2027-07-13", 10, 0],
    ]),
  },
  {
    id: "adventure-seekers-spiti-6d",
    status: "ACTIVE",
    publishedAt: "2025-09-30",
    operatorId: "adventure-seekers",
    operatorName: "Adventure Seekers",
    operatorVerified: true,
    operatorRating: 4.6,
    operatorReviews: 145,
    destinationId: "spiti-valley",
    title: "Spiti Valley Off-Beat Explorer",
    summary:
      "Skips the standard stops for side valleys most itineraries never reach. Guesthouses, local food, a fast pace.",
    highlights: ["Hidden side valleys", "Chandratal", "Local guesthouses", "Kunzum Pass"],
    tags: ["Off-beat", "Road Trip", "Trekking"],
    retailPrice: 12499,
    b2bCost: 10099,
    duration: "6 Days / 5 Nights",
    durationDays: 6,
    groupSize: "Max 14",
    groupSizeMin: 6,
    groupSizeMax: 14,
    difficulty: "Moderate",
    minAge: 15,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Local Guesthouses",
    pickupPoint: "Shimla (Old Bus Stand)",
    dropPoint: "Delhi (Kashmere Gate)",
    cancellationPolicy: "60% refund until 10 days before",
    cancellationPolicyId: "moderate-10d",
    bookingsLast30d: 19,
    images: [
      unsplash(PHOTO.spitiBarrenValley),
      unsplash(PHOTO.spitiRiverValley),
      unsplash(PHOTO.spitiDhankar),
    ],
    inclusions: [
      "Expert adventure guide",
      "All local meals",
      "Permits and entry fees",
      "Emergency support",
      "Local homestay experiences",
    ],
    exclusions: ["Flights to Shimla", "Personal expenses", "Tips"],
    itinerary: [
      { day: 1, title: "Shimla → Kaza", description: "Scenic drive to Spiti Valley via high altitude passes.", activities: ["Scenic drive", "Dhankar visit"] },
      { day: 2, title: "Kaza Local Exploration", description: "Key Monastery, Kibber village, and local markets.", activities: ["Key Monastery", "Kibber Village", "Local market"] },
      { day: 3, title: "Chandratal Trek", description: "Trek to the magical alpine lake at 14,100 ft.", activities: ["Chandratal Trek", "Camping", "Photography"] },
      { day: 4, title: "Hidden Valleys", description: "Explore remote Spiti valleys and traditional villages.", activities: ["Valley trekking", "Village visits", "Local culture"] },
      { day: 5, title: "Manali Route", description: "Cross Kunzum Pass to Manali. Last night celebration.", activities: ["Kunzum Pass", "Rohtang view", "Celebration dinner"] },
      { day: 6, title: "Manali → Delhi", description: "Bus journey back to Delhi with memorable experiences.", activities: ["Bus journey", "Departure"] },
    ],
    reviews: [
      { name: "Vikram Singh", rating: 5, date: "May 2024", text: "Off-beat and amazing. Real Spiti experience.", avatar: "VS" },
    ],
    departures: makeDepartures("adventure-seekers-spiti-6d", 6, [
      ["2026-08-20", 14, 11],
      ["2026-09-10", 14, 6],
      ["2027-07-03", 14, 0],
    ]),
  },
  {
    id: "spiti-specialists-spiti-8d",
    status: "ACTIVE",
    publishedAt: "2025-08-14",
    operatorId: "spiti-specialists",
    operatorName: "Spiti Specialists",
    operatorVerified: true,
    operatorRating: 4.7,
    operatorReviews: 178,
    destinationId: "spiti-valley",
    title: "Spiti Homestay Cultural Immersion",
    summary:
      "Eight slow days built around one host family — farming, weaving, language basics and a farewell ceremony.",
    highlights: ["Host family stay", "Traditional farming", "Craft workshop", "Tabo Monastery"],
    tags: ["Homestay", "Culture", "Slow Travel"],
    retailPrice: 13999,
    b2bCost: 11199,
    duration: "8 Days / 7 Nights",
    durationDays: 8,
    groupSize: "Max 10",
    groupSizeMin: 2,
    groupSizeMax: 10,
    difficulty: "Easy",
    minAge: 10,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Local Homestays",
    pickupPoint: "Shimla (Old Bus Stand)",
    dropPoint: "Shimla (Old Bus Stand)",
    cancellationPolicy: "Free cancellation until 10 days before",
    cancellationPolicyId: "flexible-10d",
    bookingsLast30d: 12,
    images: [
      unsplash(PHOTO.spitiRiverValley),
      unsplash(PHOTO.spitiMonasteryRidge),
      unsplash(PHOTO.spitiKeyMonastery),
    ],
    inclusions: [
      "Local Spitian host families",
      "Home-cooked traditional meals",
      "Cultural immersion programs",
      "Language basics workshop",
      "Local artisan visits",
      "All permits and guidance",
    ],
    exclusions: ["Flights to Shimla", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Shimla → Kaza", description: "Scenic drive through Himalayan passes to Spiti.", activities: ["Mountain drive", "Dhankar visit"] },
      { day: 2, title: "Family Welcome", description: "Meet your homestay family. Learn Spitian traditions.", activities: ["Family introduction", "Language basics", "Cooking lesson"] },
      { day: 3, title: "Key Monastery & Village Life", description: "Visit Key Monastery and explore Kibber village.", activities: ["Monastery visit", "Village exploration", "Local crafts"] },
      { day: 4, title: "Traditional Farming", description: "Join family in daily farming activities. Harvest experience.", activities: ["Farm work", "Traditional methods", "Local lunch"] },
      { day: 5, title: "Chandratal Trek", description: "Trek to alpine lake with local guides.", activities: ["Chandratal Trek", "Photography", "Camping"] },
      { day: 6, title: "Tabo Art & Architecture", description: "Visit ancient Tabo Monastery. Learn Buddhist art.", activities: ["Tabo Monastery", "Art workshop", "Local museum"] },
      { day: 7, title: "Craft Workshop", description: "Learn traditional Spitian crafts and weaving.", activities: ["Craft workshop", "Weaving lesson", "Art creation"] },
      { day: 8, title: "Farewell & Departure", description: "Farewell ceremony with host family. Departure.", activities: ["Farewell ceremony", "Gift exchange", "Departure"] },
    ],
    reviews: [
      { name: "Priya Nair", rating: 5, date: "Jun 2024", text: "The homestay experience was life-changing. Real Spiti culture.", avatar: "PN" },
    ],
    departures: makeDepartures("spiti-specialists-spiti-8d", 8, [
      ["2026-08-18", 10, 5],
      ["2026-09-08", 10, 2],
      ["2027-06-22", 10, 0],
    ]),
  },

  /* ══ LEH LADAKH ════════════════════════════════════════════════════════════ */
  {
    id: "zenith-leh-10d",
    status: "ACTIVE",
    publishedAt: "2025-07-19",
    operatorId: "zenith-expeditions",
    operatorName: "Zenith Expeditions",
    operatorVerified: true,
    operatorRating: 4.9,
    operatorReviews: 389,
    destinationId: "leh-ladakh",
    title: "Ultimate Leh Ladakh Premium Expedition",
    summary:
      "Ten days across Nubra, Pangong and Tso Moriri with a private chef, a historian guide and two nights lakeside.",
    highlights: ["Pangong luxury camp", "Khardung La", "Tso Moriri", "Private chef"],
    tags: ["Premium", "Lakes", "Expedition"],
    retailPrice: 24999,
    b2bCost: 19249,
    duration: "10 Days / 9 Nights",
    durationDays: 10,
    groupSize: "Max 8",
    groupSizeMin: 2,
    groupSizeMax: 8,
    difficulty: "Moderate",
    minAge: 12,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Luxury Camps + Heritage Hotel",
    pickupPoint: "Leh Airport",
    dropPoint: "Leh Airport",
    cancellationPolicy: "Free cancellation 10 days before",
    cancellationPolicyId: "flexible-10d",
    bookingsLast30d: 21,
    images: [
      unsplash(PHOTO.ladakhPangong),
      unsplash(PHOTO.ladakhNubra),
      unsplash(PHOTO.ladakhConfluence),
    ],
    inclusions: [
      "All gourmet meals by private chef",
      "Expert naturalist and historian guide",
      "Leh to Leh luxury SUV transport",
      "All permits and inner line permits",
      "Satellite phone for emergencies",
      "Pangong Lake luxury camp (2 nights)",
      "Nubra Valley camel safari",
      "Khardung La crossing certificate",
      "Comprehensive travel insurance",
    ],
    exclusions: ["Flights to/from Leh", "Alcoholic beverages", "Personal shopping", "Helicopter evacuation (extra)"],
    itinerary: [
      { day: 1, title: "Arrival in Leh", description: "Pickup from Leh airport. Full day rest for acclimatization. Heritage hotel stay.", activities: ["Airport pickup", "Acclimatization", "Welcome dinner"] },
      { day: 2, title: "Leh City Exploration", description: "Leh Palace, Shanti Stupa, local bazaar with expert guide commentary.", activities: ["Leh Palace", "Shanti Stupa", "Local bazaar"] },
      { day: 3, title: "Monasteries Day", description: "Visit Hemis, Thiksey and Spituk monasteries.", activities: ["Hemis Monastery", "Thiksey", "Spituk"] },
      { day: 4, title: "Nubra Valley via Khardung La", description: "Cross the world's highest motorable road at 18,380 ft. Descend to Nubra Valley.", activities: ["Khardung La pass", "Diskit Monastery", "Nubra Valley"] },
      { day: 5, title: "Nubra Camel Safari", description: "Bactrian camel safari in the sand dunes. Optional ATV ride.", activities: ["Camel safari", "Sand dunes", "ATV ride"] },
      { day: 6, title: "Nubra → Pangong Lake", description: "Drive to Pangong Lake via Shyok Valley. Arrive at luxury camp.", activities: ["Shyok Valley", "Pangong arrival", "Sunset by lake"] },
      { day: 7, title: "Pangong Sunrise + Exploration", description: "Watch the sunrise over the lake. Explore the blue shifting waters.", activities: ["Sunrise", "Boat ride", "Photography"] },
      { day: 8, title: "Pangong → Tso Moriri", description: "Drive to Tso Moriri lake via Mahe bridge.", activities: ["Mahe Bridge", "Tso Moriri", "Nomad village"] },
      { day: 9, title: "Return to Leh", description: "Scenic drive back to Leh. Farewell dinner at heritage restaurant.", activities: ["Scenic drive", "Farewell dinner", "Leh bazaar"] },
      { day: 10, title: "Departure", description: "Airport drop. Certificate and farewell gift from Zenith team.", activities: ["Checkout", "Certificate ceremony", "Airport drop"] },
    ],
    reviews: [
      { name: "Ravi Mehta", rating: 5, date: "Jun 2024", text: "Zenith turned Ladakh into a luxury experience without losing authenticity. Beyond expectations.", avatar: "RM" },
      { name: "Priti Agarwal", rating: 5, date: "May 2024", text: "The chef at Pangong camp cooked gourmet dal makhni at 14,000 ft. Surreal.", avatar: "PA" },
      { name: "Abhishek Gupta", rating: 5, date: "Apr 2024", text: "Worth every rupee. Satellite phone gave us complete peace of mind.", avatar: "AG" },
    ],
    departures: makeDepartures("zenith-leh-10d", 10, [
      ["2026-08-12", 8, 6],
      ["2026-09-02", 8, 3],
      ["2027-06-18", 8, 0],
    ]),
  },
  {
    id: "mountain-magic-ladakh-5d",
    status: "ACTIVE",
    publishedAt: "2025-09-08",
    operatorId: "mountain-magic",
    operatorName: "Mountain Magic",
    operatorVerified: true,
    operatorRating: 4.7,
    operatorReviews: 267,
    destinationId: "leh-ladakh",
    title: "Ladakh Photography Expedition",
    summary:
      "Built around light, not mileage. Golden-hour positions, monastery access at prayer time, and a review session on the last morning.",
    highlights: ["Golden hour shoots", "Monastery access", "Nubra Valley", "Portfolio review"],
    tags: ["Photography", "Guided", "Culture"],
    retailPrice: 16999,
    b2bCost: 13599,
    duration: "5 Days / 4 Nights",
    durationDays: 5,
    groupSize: "Max 10",
    groupSizeMin: 4,
    groupSizeMax: 10,
    difficulty: "Easy",
    minAge: 14,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Heritage Hotel",
    pickupPoint: "Leh Airport",
    dropPoint: "Leh Airport",
    cancellationPolicy: "Free cancellation until 5 days before",
    cancellationPolicyId: "flexible-5d",
    bookingsLast30d: 28,
    images: [
      unsplash(PHOTO.ladakhConfluence),
      unsplash(PHOTO.ladakhNubra),
      unsplash(PHOTO.ladakhPangong),
    ],
    inclusions: [
      "Professional photography guide",
      "All meals and snacks",
      "Airport transfers",
      "Photography tips and feedback",
      "Sunset viewpoint permits",
      "Local guide expertise",
    ],
    exclusions: ["Camera equipment", "Flights to Leh", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Leh Arrival & Golden Hour", description: "Arrive in Leh, settle in heritage hotel. Evening golden hour photography at Shanti Stupa.", activities: ["Airport pickup", "Hotel check-in", "Golden hour shoot"] },
      { day: 2, title: "Monasteries & Cultural Sites", description: "Hemis and Thiksey monasteries. Capture monks in traditional settings.", activities: ["Hemis Monastery", "Thiksey Photography", "Local villages"] },
      { day: 3, title: "Nubra Valley Photography Tour", description: "Khardung La pass and Nubra Valley scenic shots. Camel safari photography.", activities: ["Khardung La", "Nubra Valley", "Camel safari"] },
      { day: 4, title: "Market & Local Life", description: "Street photography, local bazaars, authentic Ladakhi life.", activities: ["Leh bazaar", "Street photography", "Culture walk"] },
      { day: 5, title: "Departure & Gallery", description: "Photo review session. Breakfast and departure.", activities: ["Photo review", "Gallery creation", "Departure"] },
    ],
    reviews: [
      { name: "Aditya Verma", rating: 5, date: "Apr 2024", text: "Best photography tour. Guide's tips transformed my photos.", avatar: "AV" },
      { name: "Sarah Khan", rating: 5, date: "Mar 2024", text: "Professional guidance at every step. Got amazing shots!", avatar: "SK" },
    ],
    departures: makeDepartures("mountain-magic-ladakh-5d", 5, [
      ["2026-08-10", 10, 8],
      ["2026-08-24", 10, 5],
      ["2026-09-14", 10, 2],
      ["2027-06-14", 10, 0],
    ]),
  },
  {
    id: "journey-masters-multi-10d",
    status: "ACTIVE",
    publishedAt: "2025-06-25",
    operatorId: "journey-masters",
    operatorName: "Journey Masters",
    operatorVerified: true,
    operatorRating: 4.8,
    operatorReviews: 298,
    destinationId: "leh-ladakh",
    title: "Grand Himalayan Circuit",
    summary:
      "Ladakh's three great lakes plus a Rishikesh tail-end. One booking, two states, ten days.",
    highlights: ["Pangong & Tso Moriri", "Khardung La", "Ganges rafting", "Multi-region"],
    tags: ["Multi-region", "Lakes", "Adventure"],
    retailPrice: 24999,
    b2bCost: 19499,
    duration: "10 Days / 9 Nights",
    durationDays: 10,
    groupSize: "Max 14",
    groupSizeMin: 6,
    groupSizeMax: 14,
    difficulty: "Moderate",
    minAge: 14,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Mix of Hotels & Camps",
    pickupPoint: "Delhi (IGI Terminal 1)",
    dropPoint: "Delhi (IGI Terminal 1)",
    cancellationPolicy: "Free cancellation until 14 days before",
    cancellationPolicyId: "flexible-14d",
    bookingsLast30d: 15,
    images: [
      unsplash(PHOTO.ladakhHighway),
      unsplash(PHOTO.ladakhPangong),
      unsplash(PHOTO.rishikeshRafting),
    ],
    inclusions: [
      "Expert multi-destination guide",
      "All meals and refreshments",
      "Complete transportation",
      "Permits and fees",
      "Emergency medical support",
      "Photography stops",
    ],
    exclusions: ["Flights to Leh", "Travel insurance", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Delhi → Leh", description: "Overnight flight to Leh. Acclimatization day.", activities: ["Flight", "Hotel check-in", "Rest"] },
      { day: 2, title: "Leh City Tour", description: "Explore Leh Palace, Shanti Stupa, local markets.", activities: ["Leh tour", "Cultural heritage"] },
      { day: 3, title: "Pangong Lake", description: "Drive to stunning Pangong Tso lake via Changla.", activities: ["Pangong Lake", "Photography", "Sunset"] },
      { day: 4, title: "Pangong Exploration", description: "Sunrise and exploration at Pangong Lake.", activities: ["Sunrise", "Boat ride", "Local culture"] },
      { day: 5, title: "Tso Moriri Lake", description: "Drive to Tso Moriri through remote Ladakh.", activities: ["Tso Moriri", "Nomad villages"] },
      { day: 6, title: "Leh → Nubra Valley", description: "Cross Khardung La pass. Camel safari in sand dunes.", activities: ["Khardung La", "Camel safari"] },
      { day: 7, title: "Nubra Valley Tour", description: "Diskit Monastery and exploration of valley.", activities: ["Monastery tour", "Valley exploration"] },
      { day: 8, title: "Leh → Rishikesh Flight", description: "Flight to Delhi then drive to Rishikesh.", activities: ["Flight to Delhi", "Drive to Rishikesh"] },
      { day: 9, title: "Rishikesh Adventure", description: "River rafting and ashram visits.", activities: ["River rafting", "Ashram tour", "Yoga session"] },
      { day: 10, title: "Departure", description: "Morning yoga and departure to Delhi.", activities: ["Yoga", "Farewell breakfast", "Departure"] },
    ],
    reviews: [
      { name: "Rohit Sharma", rating: 5, date: "May 2024", text: "Covered three amazing regions seamlessly. Great itinerary planning.", avatar: "RS" },
    ],
    departures: makeDepartures("journey-masters-multi-10d", 10, [
      ["2026-08-15", 14, 10],
      ["2026-09-05", 14, 4],
      ["2027-06-21", 14, 0],
    ]),
  },
  {
    id: "ladakh-legends-leh-5d",
    status: "ACTIVE",
    publishedAt: "2026-01-16",
    operatorId: "ladakh-legends",
    operatorName: "Ladakh Legends",
    operatorVerified: false,
    operatorRating: 4.4,
    operatorReviews: 89,
    destinationId: "leh-ladakh",
    title: "Ladakhi Culture & Monasteries",
    summary:
      "A monastery-first itinerary run by a Leh family. Prayer rituals, Ladakhi kitchens and no rushed lake dashes.",
    highlights: ["Hemis & Thiksey", "Prayer rituals", "Nubra Valley", "Ladakhi home cooking"],
    tags: ["Culture", "Monasteries", "Local"],
    retailPrice: 10999,
    b2bCost: 8799,
    duration: "5 Days / 4 Nights",
    durationDays: 5,
    groupSize: "Max 12",
    groupSizeMin: 2,
    groupSizeMax: 12,
    difficulty: "Easy",
    minAge: 8,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Heritage Guesthouse",
    pickupPoint: "Leh Airport",
    dropPoint: "Leh Airport",
    cancellationPolicy: "60% refund until 7 days before",
    cancellationPolicyId: "moderate-7d",
    bookingsLast30d: 9,
    images: [
      unsplash(PHOTO.ladakhNubra),
      unsplash(PHOTO.ladakhHighway),
      unsplash(PHOTO.ladakhConfluence),
    ],
    inclusions: [
      "Local Ladakhi guide",
      "Traditional Ladakhi meals",
      "Monastery visits with rituals",
      "Nubra Valley visit",
      "Cultural exchange",
      "Heritage hotel stay",
    ],
    exclusions: ["Flights to Leh", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Leh Arrival & Acclimatization", description: "Arrive in Leh. Rest and acclimatization at heritage guesthouse.", activities: ["Arrival", "Rest", "Welcome meal"] },
      { day: 2, title: "Hemis & Thiksey Monasteries", description: "Visit active monasteries. Learn about Ladakhi Buddhism.", activities: ["Hemis Monastery", "Thiksey", "Prayer rituals"] },
      { day: 3, title: "Nubra Valley & Culture", description: "Drive to Nubra Valley. Experience traditional Ladakhi hospitality.", activities: ["Khardung La", "Nubra Valley", "Local village visit"] },
      { day: 4, title: "Spituk Monastery & Leh Bazaar", description: "Explore Spituk Monastery and traditional markets.", activities: ["Spituk Monastery", "Bazaar shopping", "Local crafts"] },
      { day: 5, title: "Leh Palace & Departure", description: "Visit Leh Palace. Farewell and departure.", activities: ["Leh Palace", "Photography", "Departure"] },
    ],
    reviews: [
      { name: "Amit Patel", rating: 4, date: "May 2024", text: "Authentic Ladakhi experiences. Great local knowledge.", avatar: "AP" },
    ],
    departures: makeDepartures("ladakh-legends-leh-5d", 5, [
      ["2026-08-17", 12, 4],
      ["2026-09-07", 12, 1],
      ["2027-06-16", 12, 0],
    ]),
  },
  {
    id: "peak-pathways-ladakh-7d",
    status: "ACTIVE",
    publishedAt: "2026-02-11",
    operatorId: "peak-pathways",
    operatorName: "Peak Pathways",
    operatorVerified: true,
    operatorRating: 4.8,
    operatorReviews: 241,
    destinationId: "leh-ladakh",
    title: "Ladakh Overland: Manali to Leh",
    summary:
      "The overland route in, flight out. Five high passes, two nights under canvas at Sarchu, and a proper acclimatisation schedule.",
    highlights: ["Baralacha La", "Gata Loops", "Sarchu camp", "Tanglang La"],
    tags: ["Road Trip", "Overland", "High Passes"],
    retailPrice: 18999,
    b2bCost: 14799,
    duration: "7 Days / 6 Nights",
    durationDays: 7,
    groupSize: "Max 10",
    groupSizeMin: 4,
    groupSizeMax: 10,
    difficulty: "Moderate",
    minAge: 15,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Camps + Guesthouses",
    pickupPoint: "Manali (Volvo Bus Stand)",
    dropPoint: "Leh Airport",
    cancellationPolicy: "Free cancellation until 10 days before",
    cancellationPolicyId: "flexible-10d",
    bookingsLast30d: 22,
    images: [
      unsplash(PHOTO.ladakhHighway),
      unsplash(PHOTO.ladakhMotorcycle),
      unsplash(PHOTO.ladakhConfluence),
    ],
    inclusions: [
      "Manali to Leh overland transport (Tempo Traveller)",
      "All meals on route",
      "Sarchu camp accommodation (2 nights)",
      "Oxygen cylinders and pulse oximeter",
      "All inner line permits",
      "Experienced high-altitude driver and guide",
    ],
    exclusions: ["Flight out of Leh", "Travel insurance", "Personal expenses", "Tips"],
    itinerary: [
      { day: 1, title: "Manali → Jispa", description: "Cross Atal Tunnel and Baralacha approach. Night at Jispa on the Bhaga river.", activities: ["Atal Tunnel", "Keylong", "Jispa"] },
      { day: 2, title: "Jispa → Sarchu", description: "Cross Baralacha La at 16,040 ft. Camp on the Sarchu plains.", activities: ["Baralacha La", "Suraj Tal", "Camping"] },
      { day: 3, title: "Sarchu Acclimatisation", description: "Deliberate rest day at altitude. Short walks only, oxygen checks twice daily.", activities: ["Rest", "Short walk", "Health check"] },
      { day: 4, title: "Sarchu → Leh", description: "Gata Loops, Nakee La, Lachulung La and Tanglang La. Descend into the Indus valley.", activities: ["Gata Loops", "Tanglang La", "More Plains"] },
      { day: 5, title: "Leh Local", description: "Leh Palace, Shanti Stupa and the old town bazaar.", activities: ["Leh Palace", "Shanti Stupa", "Old town"] },
      { day: 6, title: "Pangong Day Trip", description: "Cross Chang La to Pangong Tso and return to Leh by evening.", activities: ["Chang La", "Pangong Tso", "Photography"] },
      { day: 7, title: "Departure", description: "Airport drop for the morning flight out.", activities: ["Airport drop"] },
    ],
    reviews: [
      { name: "Nikhil Bhatt", rating: 5, date: "Jul 2024", text: "The acclimatisation day at Sarchu is why this trip works. Nobody in our group got sick.", avatar: "NB" },
      { name: "Tanya Fernandes", rating: 5, date: "Jun 2024", text: "Doing the road in and flying out is the right call. Best decision of the trip.", avatar: "TF" },
    ],
    departures: makeDepartures("peak-pathways-ladakh-7d", 7, [
      ["2026-08-09", 10, 7],
      ["2026-08-23", 10, 4],
      ["2026-09-13", 10, 1],
      ["2027-07-04", 10, 0],
    ]),
  },
  {
    id: "summit-squad-ladakh-6d",
    status: "ACTIVE",
    publishedAt: "2025-12-02",
    operatorId: "summit-squad",
    operatorName: "Summit Squad",
    operatorVerified: true,
    operatorRating: 4.7,
    operatorReviews: 189,
    destinationId: "leh-ladakh",
    title: "Ladakh on a Budget: Leh Hostel Circuit",
    summary:
      "Hostel dorms in Leh, a shared Innova for the passes, and no single supplement games — the cheapest honest way to see Pangong and Nubra.",
    highlights: ["Khardung La", "Pangong Tso", "Nubra sand dunes", "Small group of 10"],
    tags: ["Budget", "Youth", "Road Trip"],
    retailPrice: 12999,
    b2bCost: 10399,
    duration: "6 Days / 5 Nights",
    durationDays: 6,
    groupSize: "Max 10",
    groupSizeMin: 4,
    groupSizeMax: 10,
    difficulty: "Moderate",
    minAge: 16,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: false,
    hotelType: "Hostel Dorm",
    pickupPoint: "Leh Airport",
    dropPoint: "Leh Airport",
    cancellationPolicy: "No refund after booking",
    cancellationPolicyId: "non-refundable",
    bookingsLast30d: 27,
    images: [
      unsplash(PHOTO.ladakhMotorcycle),
      unsplash(PHOTO.ladakhNubra),
      unsplash(PHOTO.ladakhPangong),
    ],
    inclusions: [
      "5 nights hostel dorm bed in Leh",
      "Shared Innova for all sightseeing days",
      "All meals included",
      "Inner line permits",
      "Basic first aid and oxygen backup",
    ],
    exclusions: ["Flights to/from Leh", "Personal gear", "Travel insurance", "Tips for driver"],
    itinerary: [
      { day: 1, title: "Arrival & Acclimatisation", description: "Land in Leh, rest at the hostel. Short evening walk to the market only.", activities: ["Hostel check-in", "Rest", "Leh Market"] },
      { day: 2, title: "Leh Local", description: "Leh Palace, Shanti Stupa and Magnetic Hill.", activities: ["Leh Palace", "Shanti Stupa", "Magnetic Hill"] },
      { day: 3, title: "Khardung La → Nubra", description: "Cross the world's highest motorable pass to the Nubra sand dunes.", activities: ["Khardung La", "Nubra dunes", "Double-hump camels"] },
      { day: 4, title: "Nubra → Pangong", description: "Cross Shyok valley to the shores of Pangong Tso. Night by the lake.", activities: ["Shyok Valley", "Pangong Tso"] },
      { day: 5, title: "Pangong → Leh", description: "Return via Chang La, free evening in Leh.", activities: ["Chang La", "Free evening"] },
      { day: 6, title: "Departure", description: "Airport drop for the morning flight.", activities: ["Airport drop"] },
    ],
    reviews: [
      { name: "Ankit Verma", rating: 5, date: "Sep 2025", text: "Dorm was clean and the Innova group never felt cramped. Best value Ladakh trip I found.", avatar: "AV" },
      { name: "Sneha Kulkarni", rating: 4, date: "Aug 2025", text: "Great trip, just wish day 1 had a bit more to do besides resting.", avatar: "SK" },
    ],
    departures: makeDepartures("summit-squad-ladakh-6d", 6, [
      ["2026-07-18", 10, 8],
      ["2026-08-15", 10, 6],
      ["2026-09-05", 10, 2],
      ["2027-06-20", 10, 0],
    ]),
  },

  /* ══ MEGHALAYA ═════════════════════════════════════════════════════════════ */
  {
    id: "nomad-tribe-meghalaya-5d",
    status: "ACTIVE",
    publishedAt: "2025-10-09",
    operatorId: "nomad-tribe",
    operatorName: "Nomad Tribe",
    operatorVerified: true,
    operatorRating: 4.8,
    operatorReviews: 203,
    destinationId: "meghalaya",
    title: "Meghalaya Living Roots Experience",
    summary:
      "Cherrapunji, the double-decker root bridge and the glass-clear Umngot at Dawki, in groups of eight.",
    highlights: ["Double decker root bridge", "Dawki boating", "Mawlynnong", "Nohkalikai Falls"],
    tags: ["Trekking", "Nature", "Small Group"],
    retailPrice: 8499,
    b2bCost: 6799,
    duration: "5 Days / 4 Nights",
    durationDays: 5,
    groupSize: "Max 8",
    groupSizeMin: 2,
    groupSizeMax: 8,
    difficulty: "Easy",
    minAge: 10,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Eco Resorts",
    pickupPoint: "Shillong (Police Bazaar)",
    dropPoint: "Shillong (Police Bazaar)",
    cancellationPolicy: "Free cancellation 7 days before",
    cancellationPolicyId: "flexible-7d",
    bookingsLast30d: 31,
    images: [
      unsplash(PHOTO.meghalayaRootBridge),
      unsplash(PHOTO.meghalayaNohkalikai),
      unsplash(PHOTO.meghalayaHills),
    ],
    inclusions: [
      "Shillong to Shillong transport",
      "All meals (breakfast and dinner)",
      "Expert local guide",
      "All permits and entry fees",
      "Root bridge trek",
      "Dawki river boating",
      "Mawlynnong village visit",
    ],
    exclusions: ["Flights to Shillong", "Lunches", "Personal expenses", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Shillong → Cherrapunji", description: "Pickup from Shillong. Drive to Cherrapunji, world's wettest place.", activities: ["Scenic drive", "Nohkalikai Falls"] },
      { day: 2, title: "Double Decker Root Bridge", description: "Full day trek to the iconic double decker living root bridge.", activities: ["Root bridge trek", "Swimming hole", "Village walk"] },
      { day: 3, title: "Dawki River", description: "Drive to Dawki. Boating on the crystal-clear Umngot River.", activities: ["River boating", "Shnongpdeng beach"] },
      { day: 4, title: "Mawlynnong → Shillong", description: "Visit Asia's cleanest village. Return to Shillong.", activities: ["Mawlynnong walk", "Sky walk", "Shillong nightlife"] },
      { day: 5, title: "Shillong Local + Departure", description: "Morning at leisure. Visit Don Bosco Museum before departure.", activities: ["Don Bosco Museum", "Police Bazaar", "Departure"] },
    ],
    reviews: [
      { name: "Arjun Nair", rating: 5, date: "May 2024", text: "Nomad Tribe made Meghalaya feel like home. The root bridge was magical.", avatar: "AN" },
      { name: "Ritu Shah", rating: 5, date: "Apr 2024", text: "Eco resorts were beautiful. The guide knew every hidden corner of Meghalaya.", avatar: "RS" },
    ],
    departures: makeDepartures("nomad-tribe-meghalaya-5d", 5, [
      ["2026-10-10", 8, 6],
      ["2026-11-07", 8, 3],
      ["2027-02-13", 8, 0],
      ["2027-03-06", 8, 0],
    ]),
  },
  {
    id: "adventure-seekers-meghalaya-4d",
    status: "ACTIVE",
    publishedAt: "2025-11-27",
    operatorId: "adventure-seekers",
    operatorName: "Adventure Seekers",
    operatorVerified: true,
    operatorRating: 4.6,
    operatorReviews: 145,
    destinationId: "meghalaya",
    title: "Living Roots Bridge & Waterfalls",
    summary:
      "A shorter, more physical take on Meghalaya — waterfall rappelling and canyoning alongside the root bridge trek.",
    highlights: ["Waterfall rappelling", "Root bridge trek", "Canyoning", "Khasi villages"],
    tags: ["Adventure", "Trekking", "Waterfalls"],
    retailPrice: 9999,
    b2bCost: 7899,
    duration: "4 Days / 3 Nights",
    durationDays: 4,
    groupSize: "Max 15",
    groupSizeMin: 6,
    groupSizeMax: 15,
    difficulty: "Moderate",
    minAge: 16,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Comfort Resort",
    pickupPoint: "Guwahati Airport",
    dropPoint: "Guwahati Airport",
    cancellationPolicy: "50% refund until 5 days before",
    cancellationPolicyId: "moderate-5d",
    bookingsLast30d: 18,
    images: [
      unsplash(PHOTO.meghalayaSevenSisters),
      unsplash(PHOTO.meghalayaCliffs),
      unsplash(PHOTO.meghalayaRootBridge),
    ],
    inclusions: [
      "Local trek guide",
      "All meals",
      "Canyoning safety gear",
      "Waterfall exploration",
      "Living roots bridge visit",
    ],
    exclusions: ["Flights to Shillong", "Alcoholic beverages"],
    itinerary: [
      { day: 1, title: "Shillong Arrival", description: "Explore Meghalaya's capital. Visit Khasi villages.", activities: ["Shillong city tour", "Village exploration"] },
      { day: 2, title: "Cherrapunji Experience", description: "Explore the world's wettest place. Waterfall rappelling.", activities: ["Cherrapunji", "Waterfall rappelling", "Local culture"] },
      { day: 3, title: "Living Roots Bridge Trek", description: "Trek to ancient living roots bridges through rainforests.", activities: ["Roots bridge trek", "Rainforest walk", "Photography"] },
      { day: 4, title: "Local Experiences & Departure", description: "Tribal village visit and departure.", activities: ["Village visit", "Tribal traditions", "Departure"] },
    ],
    reviews: [
      { name: "Anjali Desai", rating: 5, date: "Mar 2024", text: "Magical experience. Living roots were breathtaking.", avatar: "AD" },
    ],
    departures: makeDepartures("adventure-seekers-meghalaya-4d", 4, [
      ["2026-10-17", 15, 11],
      ["2026-11-14", 15, 5],
      ["2027-02-20", 15, 0],
    ]),
  },
  {
    id: "forest-nomads-meghalaya-coorg-7d",
    status: "ACTIVE",
    publishedAt: "2025-12-15",
    operatorId: "forest-nomads",
    operatorName: "Forest Nomads",
    operatorVerified: true,
    operatorRating: 4.5,
    operatorReviews: 112,
    destinationId: "meghalaya",
    title: "Northeast Rainforest & Tribal Life",
    summary:
      "A two-region rainforest trip: Khasi hills first, Western Ghats second, with community-run lodging throughout.",
    highlights: ["Khasi tribal homestay", "Root bridges", "Coorg plantations", "Abbey Falls"],
    tags: ["Multi-region", "Eco", "Community"],
    retailPrice: 11499,
    b2bCost: 9199,
    duration: "7 Days / 6 Nights",
    durationDays: 7,
    groupSize: "Max 12",
    groupSizeMin: 4,
    groupSizeMax: 12,
    difficulty: "Moderate",
    minAge: 12,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Eco Lodges",
    pickupPoint: "Guwahati Airport",
    dropPoint: "Bangalore (Kempegowda Airport)",
    cancellationPolicy: "Free cancellation until 7 days before",
    cancellationPolicyId: "flexible-7d",
    bookingsLast30d: 7,
    images: [
      unsplash(PHOTO.meghalayaCliffs),
      unsplash(PHOTO.meghalayaHills),
      unsplash(PHOTO.coorgEstate),
    ],
    inclusions: [
      "Local tribal guides",
      "Sustainable meals",
      "Eco lodge stay",
      "Tribal experiences",
      "Rainforest trekking",
      "Conservation education",
    ],
    exclusions: ["Flights", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Guwahati → Shillong", description: "Arrive in Guwahati, drive to Shillong. Traditional Khasi welcome.", activities: ["Arrival", "Shillong tour", "Welcome dinner"] },
      { day: 2, title: "Cherrapunji & Waterfalls", description: "Wettest place on Earth. Explore canyons and waterfalls.", activities: ["Cherrapunji", "Waterfall trekking", "Local market"] },
      { day: 3, title: "Living Roots Bridge", description: "Trek through ancient rainforests to living root bridges.", activities: ["Roots bridge trek", "Rainforest hike"] },
      { day: 4, title: "Tribal Village Immersion", description: "Spend time with Khasi tribal communities. Learn traditions.", activities: ["Tribal homestay", "Traditional cooking", "Cultural exchange"] },
      { day: 5, title: "Coorg → Plantations", description: "Travel to Coorg. Coffee and spice plantation tour.", activities: ["Scenic drive", "Plantation tour", "Local tasting"] },
      { day: 6, title: "Coorg Waterfalls & Forest", description: "Abbey Falls trek. Explore coffee forests.", activities: ["Abbey Falls", "Forest trek", "Nature walk"] },
      { day: 7, title: "Return Journey", description: "Final day experiences and departure.", activities: ["Local market", "Departure"] },
    ],
    reviews: [
      { name: "Deepak Kumar", rating: 5, date: "Apr 2024", text: "Authentic tribal experiences. Truly sustainable tourism.", avatar: "DK" },
    ],
    departures: makeDepartures("forest-nomads-meghalaya-coorg-7d", 7, [
      ["2026-10-24", 12, 5],
      ["2026-11-21", 12, 2],
      ["2027-02-27", 12, 0],
    ]),
  },
  {
    id: "wild-wanderers-meghalaya-6d",
    status: "ACTIVE",
    publishedAt: "2026-03-05",
    operatorId: "wild-wanderers",
    operatorName: "Wild Wanderers",
    operatorVerified: false,
    operatorRating: 4.5,
    operatorReviews: 98,
    destinationId: "meghalaya",
    title: "Meghalaya Caves & Canyons",
    summary:
      "The limestone side of Meghalaya — Mawsmai and Arwah caves, Laitlum canyon at sunrise, and two nights camped by the Umngot.",
    highlights: ["Mawsmai caves", "Laitlum Canyon", "Riverside camping", "Krang Suri Falls"],
    tags: ["Caving", "Camping", "Off-beat"],
    retailPrice: 10499,
    b2bCost: 8399,
    duration: "6 Days / 5 Nights",
    durationDays: 6,
    groupSize: "Max 12",
    groupSizeMin: 4,
    groupSizeMax: 12,
    difficulty: "Moderate",
    minAge: 14,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Riverside Camps + Guesthouse",
    pickupPoint: "Guwahati Airport",
    dropPoint: "Shillong (Police Bazaar)",
    cancellationPolicy: "50% refund until 5 days before",
    cancellationPolicyId: "moderate-5d",
    bookingsLast30d: 11,
    images: [
      unsplash(PHOTO.meghalayaHills),
      unsplash(PHOTO.meghalayaSevenSisters),
      unsplash(PHOTO.meghalayaCliffs),
    ],
    inclusions: [
      "Guwahati to Shillong transport",
      "All meals",
      "Caving equipment and headlamps",
      "Riverside camping (2 nights)",
      "Certified caving guide",
      "All entry permits",
    ],
    exclusions: ["Flights to Guwahati", "Personal expenses", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Guwahati → Shillong", description: "Drive up to Shillong. Evening at Ward's Lake and Police Bazaar.", activities: ["Scenic drive", "Ward's Lake"] },
      { day: 2, title: "Laitlum Canyon", description: "Pre-dawn drive to Laitlum for sunrise over the canyon. Afternoon at Elephant Falls.", activities: ["Laitlum sunrise", "Elephant Falls"] },
      { day: 3, title: "Cherrapunji Caves", description: "Mawsmai and Arwah limestone caves with fossil formations.", activities: ["Mawsmai Cave", "Arwah Cave", "Seven Sisters Falls"] },
      { day: 4, title: "Krang Suri & Shnongpdeng", description: "Swim at Krang Suri Falls, then camp on the Umngot riverbank.", activities: ["Krang Suri Falls", "Riverside camp", "Bonfire"] },
      { day: 5, title: "Umngot River Day", description: "Kayaking and cliff jumping on the clearest river in India.", activities: ["Kayaking", "Cliff jumping", "Snorkelling"] },
      { day: 6, title: "Return to Shillong", description: "Drive back via Mawlynnong. Drop at Police Bazaar.", activities: ["Mawlynnong", "Departure"] },
    ],
    reviews: [
      { name: "Farhan Qureshi", rating: 5, date: "Nov 2025", text: "Laitlum at sunrise is worth the 4am alarm. The caving day was better than I expected.", avatar: "FQ" },
      { name: "Ishita Bose", rating: 4, date: "Oct 2025", text: "Camping by the Umngot was the highlight. Guesthouse on night one was basic.", avatar: "IB" },
    ],
    departures: makeDepartures("wild-wanderers-meghalaya-6d", 6, [
      ["2026-10-13", 12, 4],
      ["2026-11-10", 12, 1],
      ["2027-02-16", 12, 0],
      ["2027-03-09", 12, 0],
    ]),
  },

  /* ══ COORG ═════════════════════════════════════════════════════════════════ */
  {
    id: "eco-explorers-coorg-4d",
    status: "ACTIVE",
    publishedAt: "2025-10-30",
    operatorId: "eco-explorers",
    operatorName: "Eco Explorers",
    operatorVerified: true,
    operatorRating: 4.6,
    operatorReviews: 134,
    destinationId: "coorg",
    title: "Coorg Coffee & Conservation Trek",
    summary:
      "Pick and process your own coffee on a working organic estate, then trek Abbey Falls with the estate's conservation team.",
    highlights: ["Coffee picking", "Abbey Falls trek", "Organic meals", "Conservation workshop"],
    tags: ["Eco", "Plantations", "Easy"],
    retailPrice: 7999,
    b2bCost: 6599,
    duration: "4 Days / 3 Nights",
    durationDays: 4,
    groupSize: "Max 16",
    groupSizeMin: 4,
    groupSizeMax: 16,
    difficulty: "Easy",
    minAge: 8,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Eco Resort",
    pickupPoint: "Bangalore (Majestic)",
    dropPoint: "Bangalore (Majestic)",
    cancellationPolicy: "50% refund until 5 days before",
    cancellationPolicyId: "moderate-5d",
    bookingsLast30d: 26,
    images: [
      unsplash(PHOTO.coorgEstate),
      unsplash(PHOTO.coorgAbbeyFalls),
      unsplash(PHOTO.coorgMistyRoad),
    ],
    inclusions: [
      "Certified eco-guide",
      "All organic meals",
      "Coffee plantation tour",
      "Nature trails",
      "Conservation workshop",
      "Eco-lodge stay",
    ],
    exclusions: ["Flights to Bangalore", "Personal activities"],
    itinerary: [
      { day: 1, title: "Bangalore → Coorg", description: "Drive to Coorg via scenic routes. Plantation introduction.", activities: ["Scenic drive", "Resort check-in", "Plantation walk"] },
      { day: 2, title: "Coffee & Spice Plantation", description: "Learn organic coffee cultivation. Pick and process coffee.", activities: ["Coffee picking", "Processing demo", "Tasting"] },
      { day: 3, title: "Abbey Falls & Conservation", description: "Trek to Abbey Falls. Learn about forest conservation.", activities: ["Abbey Falls trek", "Conservation talk", "Forest bath"] },
      { day: 4, title: "Local Culture & Departure", description: "Visit local villages and markets. Departure.", activities: ["Market visit", "Local culture", "Departure"] },
    ],
    reviews: [
      { name: "Kavita Iyer", rating: 5, date: "Mar 2024", text: "Sustainable tourism done right. Love the conservation focus.", avatar: "KI" },
    ],
    departures: makeDepartures("eco-explorers-coorg-4d", 4, [
      ["2026-10-16", 16, 12],
      ["2026-11-13", 16, 8],
      ["2026-12-11", 16, 3],
      ["2027-02-12", 16, 0],
    ]),
  },
  {
    id: "wild-wanderers-coorg-3d",
    status: "ACTIVE",
    publishedAt: "2026-02-24",
    operatorId: "wild-wanderers",
    operatorName: "Wild Wanderers",
    operatorVerified: false,
    operatorRating: 4.5,
    operatorReviews: 98,
    destinationId: "coorg",
    title: "Coorg Weekend Escape",
    summary:
      "A genuine two-night weekend out of Bangalore — Friday night drive, Tadiandamol summit on Saturday, home Sunday evening.",
    highlights: ["Tadiandamol trek", "Friday night departure", "Estate stay", "Nagarhole safari option"],
    tags: ["Weekend", "Trekking", "Budget"],
    retailPrice: 6499,
    b2bCost: 5299,
    duration: "3 Days / 2 Nights",
    durationDays: 3,
    groupSize: "Max 18",
    groupSizeMin: 6,
    groupSizeMax: 18,
    difficulty: "Moderate",
    minAge: 14,
    mealsIncluded: false,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Plantation Homestay",
    pickupPoint: "Bangalore (Silk Board)",
    dropPoint: "Bangalore (Silk Board)",
    cancellationPolicy: "50% refund until 3 days before",
    cancellationPolicyId: "moderate-3d",
    bookingsLast30d: 37,
    images: [
      unsplash(PHOTO.coorgHills),
      unsplash(PHOTO.coorgLayeredRidges),
      unsplash(PHOTO.coorgMistyRoad),
    ],
    inclusions: [
      "Bangalore to Bangalore transport",
      "Plantation homestay (2 nights)",
      "Breakfast on both mornings",
      "Trek guide for Tadiandamol",
      "Forest entry permits",
    ],
    exclusions: ["Lunch and dinner", "Nagarhole safari fee", "Personal expenses", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Bangalore → Coorg (overnight)", description: "Friday 10pm departure. Arrive Madikeri at dawn, check into the estate.", activities: ["Overnight drive", "Estate check-in", "Raja's Seat sunset"] },
      { day: 2, title: "Tadiandamol Trek", description: "Summit Coorg's highest peak at 5,735 ft. Evening at the plantation bonfire.", activities: ["Tadiandamol trek", "Plantation walk", "Bonfire"] },
      { day: 3, title: "Abbey Falls → Bangalore", description: "Morning at Abbey Falls and the Golden Temple, then drive home.", activities: ["Abbey Falls", "Namdroling Monastery", "Departure"] },
    ],
    reviews: [
      { name: "Sneha Krishnan", rating: 4, date: "Dec 2025", text: "Perfect Bangalore weekend. The overnight bus is rough but you don't lose a day of leave.", avatar: "SK" },
      { name: "Manoj Pillai", rating: 5, date: "Nov 2025", text: "Tadiandamol was gorgeous and the homestay food was worth paying extra for.", avatar: "MP" },
    ],
    departures: makeDepartures("wild-wanderers-coorg-3d", 3, [
      ["2026-10-09", 18, 15],
      ["2026-10-23", 18, 11],
      ["2026-11-20", 18, 6],
      ["2026-12-18", 18, 2],
    ]),
  },
  {
    id: "journey-masters-coorg-5d",
    status: "ACTIVE",
    publishedAt: "2026-01-08",
    operatorId: "journey-masters",
    operatorName: "Journey Masters",
    operatorVerified: true,
    operatorRating: 4.8,
    operatorReviews: 298,
    destinationId: "coorg",
    title: "Coorg & Nagarhole Wildlife Trail",
    summary:
      "Coffee country paired with two Nagarhole safaris. Built for families — short drives, private cottages, no early treks.",
    highlights: ["Two jeep safaris", "Private cottages", "Dubare elephant camp", "Family friendly"],
    tags: ["Wildlife", "Family", "Comfort"],
    retailPrice: 12999,
    b2bCost: 10299,
    duration: "5 Days / 4 Nights",
    durationDays: 5,
    groupSize: "Max 12",
    groupSizeMin: 2,
    groupSizeMax: 12,
    difficulty: "Easy",
    minAge: 5,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Resort Cottages",
    pickupPoint: "Bangalore (Kempegowda Airport)",
    dropPoint: "Bangalore (Kempegowda Airport)",
    cancellationPolicy: "Free cancellation until 7 days before",
    cancellationPolicyId: "flexible-7d",
    bookingsLast30d: 14,
    images: [
      unsplash(PHOTO.coorgLayeredRidges),
      unsplash(PHOTO.coorgEstate),
      unsplash(PHOTO.coorgAbbeyFalls),
    ],
    inclusions: [
      "Airport pickup and drop",
      "All meals",
      "Two Nagarhole jeep safaris",
      "Dubare elephant camp visit",
      "Private cottage accommodation",
      "Naturalist guide",
    ],
    exclusions: ["Flights", "Camera fees at Nagarhole", "Alcoholic beverages"],
    itinerary: [
      { day: 1, title: "Bangalore → Madikeri", description: "Airport pickup and drive to Coorg. Evening at Raja's Seat.", activities: ["Scenic drive", "Raja's Seat", "Check-in"] },
      { day: 2, title: "Plantation & Golden Temple", description: "Morning estate walk, afternoon at Namdroling Monastery.", activities: ["Coffee estate walk", "Namdroling Monastery"] },
      { day: 3, title: "Nagarhole Safari", description: "Dawn and dusk jeep safaris in Nagarhole National Park.", activities: ["Morning safari", "Evening safari", "Naturalist briefing"] },
      { day: 4, title: "Dubare & Abbey Falls", description: "Elephant camp in the morning, Abbey Falls after lunch.", activities: ["Dubare elephant camp", "Abbey Falls", "River walk"] },
      { day: 5, title: "Departure", description: "Leisurely breakfast and drive back to Bangalore.", activities: ["Breakfast", "Departure"] },
    ],
    reviews: [
      { name: "Lakshmi Menon", rating: 5, date: "Jan 2026", text: "Took my parents and my 7-year-old. Pace was right for all three. Saw a tiger on the second safari.", avatar: "LM" },
      { name: "George Mathew", rating: 5, date: "Dec 2025", text: "Cottages were excellent and the naturalist really knew the park.", avatar: "GM" },
    ],
    departures: makeDepartures("journey-masters-coorg-5d", 5, [
      ["2026-10-19", 12, 8],
      ["2026-11-16", 12, 4],
      ["2026-12-21", 12, 9],
      ["2027-02-15", 12, 0],
    ]),
  },
  {
    id: "nomad-tribe-coorg-4d",
    status: "ACTIVE",
    publishedAt: "2026-03-19",
    operatorId: "nomad-tribe",
    operatorName: "Nomad Tribe",
    operatorVerified: true,
    operatorRating: 4.8,
    operatorReviews: 203,
    destinationId: "coorg",
    title: "Coorg Rivers & Rainforest",
    summary:
      "Barapole rafting, a Brahmagiri rainforest trek and one night in a treehouse. Small groups, no resort filler.",
    highlights: ["Barapole rafting", "Brahmagiri trek", "Treehouse night", "Small group of 8"],
    tags: ["Rafting", "Trekking", "Small Group"],
    retailPrice: 8999,
    b2bCost: 7299,
    duration: "4 Days / 3 Nights",
    durationDays: 4,
    groupSize: "Max 8",
    groupSizeMin: 4,
    groupSizeMax: 8,
    difficulty: "Moderate",
    minAge: 14,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Treehouse + Homestay",
    pickupPoint: "Mysore Railway Station",
    dropPoint: "Mysore Railway Station",
    cancellationPolicy: "60% refund until 7 days before",
    cancellationPolicyId: "moderate-7d",
    bookingsLast30d: 20,
    images: [
      unsplash(PHOTO.coorgMistyRoad),
      unsplash(PHOTO.coorgAbbeyFalls),
      unsplash(PHOTO.coorgHills),
    ],
    inclusions: [
      "Mysore to Mysore transport",
      "All meals (local Kodava cuisine)",
      "Barapole river rafting with safety gear",
      "Brahmagiri trek permits and guide",
      "One night treehouse stay",
    ],
    exclusions: ["Train/flight to Mysore", "Personal expenses", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Mysore → Coorg", description: "Drive into the Ghats. Evening Kodava dinner at the homestay.", activities: ["Scenic drive", "Kodava dinner", "Check-in"] },
      { day: 2, title: "Barapole Rafting", description: "Grade III–IV rapids on the Barapole. Afternoon rest at the estate.", activities: ["River rafting", "Estate walk"] },
      { day: 3, title: "Brahmagiri Trek & Treehouse", description: "Full-day rainforest trek to Brahmagiri. Night in the canopy treehouse.", activities: ["Brahmagiri trek", "Iruppu Falls", "Treehouse stay"] },
      { day: 4, title: "Return to Mysore", description: "Morning birding walk, then drive back to Mysore.", activities: ["Birding walk", "Departure"] },
    ],
    reviews: [
      { name: "Divya Ranganathan", rating: 5, date: "Feb 2026", text: "The treehouse night was unreal. Rafting on the Barapole is genuinely thrilling, not a tourist float.", avatar: "DR" },
    ],
    departures: makeDepartures("nomad-tribe-coorg-4d", 4, [
      ["2026-10-22", 8, 5],
      ["2026-11-19", 8, 2],
      ["2026-12-17", 8, 0],
      ["2027-02-18", 8, 0],
    ]),
  },

  /* ══ RISHIKESH ═════════════════════════════════════════════════════════════ */
  {
    id: "trailblazers-rishikesh-3d",
    status: "ACTIVE",
    publishedAt: "2025-09-12",
    operatorId: "trailblazers",
    operatorName: "Trailblazers India",
    operatorVerified: false,
    operatorRating: 4.4,
    operatorReviews: 74,
    destinationId: "rishikesh",
    title: "Rishikesh Adrenaline Rush",
    summary:
      "Rafting and India's highest bungee in one weekend, with camp accommodation and nothing you don't need.",
    highlights: ["16km Grade III–IV rafting", "83m bungee", "Camp bonfire", "Laxman Jhula"],
    tags: ["Adventure", "Budget", "Weekend"],
    retailPrice: 5999,
    b2bCost: 4999,
    duration: "3 Days / 2 Nights",
    durationDays: 3,
    groupSize: "Max 15",
    groupSizeMin: 4,
    groupSizeMax: 15,
    difficulty: "Easy",
    minAge: 12,
    mealsIncluded: false,
    guideIncluded: true,
    transportIncluded: false,
    hotelType: "Hostel / Camp",
    pickupPoint: "Rishikesh (Tapovan)",
    dropPoint: "Rishikesh (Tapovan)",
    cancellationPolicy: "50% refund 3 days before",
    cancellationPolicyId: "moderate-3d",
    bookingsLast30d: 52,
    images: [
      unsplash(PHOTO.rishikeshRafting),
      unsplash(PHOTO.rishikeshJhula),
      unsplash(PHOTO.rishikeshKayaks),
    ],
    inclusions: [
      "White water rafting (16km Grade III-IV)",
      "Bungee jump (83m)",
      "Certified adventure guide",
      "Camping accommodation",
      "Bonfire evening",
      "All safety equipment",
    ],
    exclusions: ["All meals", "Transport to Rishikesh", "Travel insurance", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Arrival + Rishikesh Explore", description: "Arrive and check into camp. Evening walk across Laxman Jhula.", activities: ["Check-in", "Laxman Jhula", "Bonfire"] },
      { day: 2, title: "Rafting + Bungee", description: "Morning 16km white water rafting on the Ganges. Afternoon bungee jump.", activities: ["16km Rafting", "Bungee Jump", "Cliff jumping"] },
      { day: 3, title: "Morning Yoga + Departure", description: "Optional morning yoga session. Check out after breakfast.", activities: ["Yoga session", "Beatles Ashram", "Checkout"] },
    ],
    reviews: [
      { name: "Harsh Jain", rating: 5, date: "Jun 2024", text: "The bungee jump was terrifying and amazing. Great value for money.", avatar: "HJ" },
      { name: "Pooja Verma", rating: 4, date: "May 2024", text: "Rafting was epic! Meals not included was a surprise though.", avatar: "PV" },
    ],
    departures: makeDepartures("trailblazers-rishikesh-3d", 3, [
      ["2026-09-18", 15, 14],
      ["2026-10-02", 15, 12],
      ["2026-10-30", 15, 7],
      ["2026-11-20", 15, 3],
      ["2027-03-12", 15, 0],
    ]),
  },
  {
    id: "mountain-magic-rishikesh-3d",
    status: "ACTIVE",
    publishedAt: "2025-10-03",
    operatorId: "mountain-magic",
    operatorName: "Mountain Magic",
    operatorVerified: true,
    operatorRating: 4.7,
    operatorReviews: 267,
    destinationId: "rishikesh",
    title: "Rishikesh Adventure Photography",
    summary:
      "Shoot the Ganges properly — an in-raft action session, the ghats at first light and the ashram at dusk.",
    highlights: ["In-raft action shots", "Ghat photography", "Beatles Ashram", "Riverside resort"],
    tags: ["Photography", "Adventure", "Weekend"],
    retailPrice: 8999,
    b2bCost: 6999,
    duration: "3 Days / 2 Nights",
    durationDays: 3,
    groupSize: "Max 12",
    groupSizeMin: 4,
    groupSizeMax: 12,
    difficulty: "Easy",
    minAge: 14,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: false,
    hotelType: "Riverside Resort",
    pickupPoint: "Rishikesh (Laxman Jhula)",
    dropPoint: "Rishikesh (Laxman Jhula)",
    cancellationPolicy: "50% refund until 3 days before",
    cancellationPolicyId: "moderate-3d",
    bookingsLast30d: 24,
    images: [
      unsplash(PHOTO.rishikeshTemple),
      unsplash(PHOTO.rishikeshKayaks),
      unsplash(PHOTO.rishikeshRiverfront),
    ],
    inclusions: [
      "Photography guide",
      "Breakfast & dinner",
      "River rafting photo session",
      "Yoga ashram visit",
      "Night city photography",
    ],
    exclusions: ["Flights", "Lunch", "Camera rental"],
    itinerary: [
      { day: 1, title: "Arrival & Golden Hour", description: "Arrive in Rishikesh. Sunset photography by Ganges.", activities: ["Arrival", "Sunset shoot", "Dinner"] },
      { day: 2, title: "Rafting & Ashram", description: "River rafting with action photography. Beatles Ashram exploration.", activities: ["River rafting shoot", "Beatles Ashram", "Local exploration"] },
      { day: 3, title: "Markets & Departure", description: "Morning Ganges ghat photography. Local market shoot.", activities: ["Ghat photography", "Market exploration", "Departure"] },
    ],
    reviews: [
      { name: "Neha Sharma", rating: 5, date: "Feb 2024", text: "Captured the best moments of my adventure.", avatar: "NS" },
    ],
    departures: makeDepartures("mountain-magic-rishikesh-3d", 3, [
      ["2026-09-25", 12, 9],
      ["2026-10-23", 12, 5],
      ["2026-11-13", 12, 2],
      ["2027-03-19", 12, 0],
    ]),
  },
  {
    id: "eco-explorers-rishikesh-3d",
    status: "ACTIVE",
    publishedAt: "2025-11-11",
    operatorId: "eco-explorers",
    operatorName: "Eco Explorers",
    operatorVerified: true,
    operatorRating: 4.6,
    operatorReviews: 134,
    destinationId: "rishikesh",
    title: "Yoga & Eco River Retreat",
    summary:
      "No rafting, no bungee. Twice-daily yoga, silent meditation and vegetarian food at a riverside ashram.",
    highlights: ["Twice-daily yoga", "Meditation sessions", "Organic vegetarian meals", "River-bank practice"],
    tags: ["Wellness", "Yoga", "Eco"],
    retailPrice: 6999,
    b2bCost: 5499,
    duration: "3 Days / 2 Nights",
    durationDays: 3,
    groupSize: "Max 15",
    groupSizeMin: 2,
    groupSizeMax: 15,
    difficulty: "Easy",
    minAge: 16,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: false,
    hotelType: "Eco Ashram",
    pickupPoint: "Rishikesh (Ram Jhula)",
    dropPoint: "Rishikesh (Ram Jhula)",
    cancellationPolicy: "50% refund until 3 days before",
    cancellationPolicyId: "moderate-3d",
    bookingsLast30d: 16,
    images: [
      unsplash(PHOTO.rishikeshRiverfront),
      unsplash(PHOTO.rishikeshJhula),
      unsplash(PHOTO.rishikeshTemple),
    ],
    inclusions: [
      "Yoga classes (morning & evening)",
      "Vegetarian organic meals",
      "Meditation sessions",
      "Eco ranger guide",
      "Ashram accommodation",
      "Sustainable practices learning",
    ],
    exclusions: ["Flights", "Alcoholic drinks", "Non-vegetarian meals"],
    itinerary: [
      { day: 1, title: "Arrival & Yoga", description: "Arrive at eco ashram. Evening yoga and meditation.", activities: ["Check-in", "Evening yoga", "Orientation"] },
      { day: 2, title: "Full Day Wellness", description: "Morning yoga, nature walk, meditation, and organic meals.", activities: ["Yoga", "Nature walk", "Meditation", "Healing sessions"] },
      { day: 3, title: "Ganga & Departure", description: "Morning yoga by Ganga river. Breakfast and departure.", activities: ["River yoga", "Breakfast", "Departure"] },
    ],
    reviews: [
      { name: "Meera Gupta", rating: 5, date: "Apr 2024", text: "Perfect balance of adventure and spirituality in eco setting.", avatar: "MG" },
    ],
    departures: makeDepartures("eco-explorers-rishikesh-3d", 3, [
      ["2026-09-11", 15, 10],
      ["2026-10-09", 15, 6],
      ["2026-11-06", 15, 2],
      ["2027-03-05", 15, 0],
    ]),
  },
  {
    id: "nomad-tribe-rishikesh-2d",
    status: "ACTIVE",
    publishedAt: "2026-04-02",
    operatorId: "nomad-tribe",
    operatorName: "Nomad Tribe",
    operatorVerified: true,
    operatorRating: 4.8,
    operatorReviews: 203,
    destinationId: "rishikesh",
    title: "Rishikesh Overnight Riverside Camp",
    summary:
      "The cheapest way to sleep by the Ganges. One night riverside, a 12km raft, and back on the road by Sunday lunch.",
    highlights: ["Riverside tents", "12km rafting", "Cliff jumping", "Under ₹4,500"],
    tags: ["Budget", "Camping", "Weekend"],
    retailPrice: 4499,
    b2bCost: 3599,
    duration: "2 Days / 1 Night",
    durationDays: 2,
    groupSize: "Max 20",
    groupSizeMin: 4,
    groupSizeMax: 20,
    difficulty: "Easy",
    minAge: 12,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: false,
    hotelType: "Riverside Tents",
    pickupPoint: "Rishikesh (Shivpuri)",
    dropPoint: "Rishikesh (Shivpuri)",
    cancellationPolicy: "50% refund until 3 days before",
    cancellationPolicyId: "moderate-3d",
    bookingsLast30d: 63,
    images: [
      unsplash(PHOTO.rishikeshKayaks),
      unsplash(PHOTO.rishikeshRafting),
      unsplash(PHOTO.rishikeshRiverfront),
    ],
    inclusions: [
      "Riverside tent accommodation (twin sharing)",
      "Dinner, breakfast and lunch",
      "12km white water rafting",
      "Bonfire and music evening",
      "All safety equipment and certified guide",
    ],
    exclusions: ["Transport to Shivpuri", "Bungee or zipline add-ons", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Camp Check-in & Evening", description: "Arrive at the Shivpuri camp by afternoon. Beach volleyball, bonfire and dinner by the river.", activities: ["Check-in", "Beach games", "Bonfire dinner"] },
      { day: 2, title: "Rafting & Departure", description: "12km raft from Shivpuri to Rishikesh with cliff jumping and body surfing. Lunch, then checkout.", activities: ["12km rafting", "Cliff jumping", "Departure"] },
    ],
    reviews: [
      { name: "Aakash Tiwari", rating: 5, date: "Apr 2026", text: "For the price this is unbeatable. Tents were clean and the rapids were properly fun.", avatar: "AT" },
      { name: "Ritika Malhotra", rating: 4, date: "Mar 2026", text: "Great one-nighter from Delhi. Gets busy on weekends so book a weekday if you can.", avatar: "RM" },
    ],
    departures: makeDepartures("nomad-tribe-rishikesh-2d", 2, [
      ["2026-09-19", 20, 18],
      ["2026-10-03", 20, 16],
      ["2026-10-17", 20, 11],
      ["2026-11-07", 20, 5],
      ["2027-03-13", 20, 0],
    ]),
  },
  {
    id: "summit-squad-rishikesh-3d",
    status: "ACTIVE",
    publishedAt: "2026-01-15",
    operatorId: "summit-squad",
    operatorName: "Summit Squad",
    operatorVerified: true,
    operatorRating: 4.7,
    operatorReviews: 189,
    destinationId: "rishikesh",
    title: "Rishikesh Rafting & Camp Weekend",
    summary:
      "A youth-priced weekend built around the rapids — 16km of grade II–III rafting, a riverside camp, and a bonfire night in between.",
    highlights: ["16km rafting", "Riverside camp", "Cliff jumping", "Small group of 15"],
    tags: ["Budget", "Youth", "Weekend"],
    retailPrice: 5499,
    b2bCost: 4399,
    duration: "3 Days / 2 Nights",
    durationDays: 3,
    groupSize: "Max 15",
    groupSizeMin: 6,
    groupSizeMax: 15,
    difficulty: "Easy",
    minAge: 14,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: false,
    hotelType: "Riverside Camp",
    pickupPoint: "Rishikesh (Tapovan)",
    dropPoint: "Rishikesh (Tapovan)",
    cancellationPolicy: "50% refund until 3 days before",
    cancellationPolicyId: "moderate-3d",
    bookingsLast30d: 38,
    images: [
      unsplash(PHOTO.rishikeshRafting),
      unsplash(PHOTO.rishikeshKayaks),
      unsplash(PHOTO.rishikeshJhula),
    ],
    inclusions: [
      "2 nights riverside camp (twin sharing)",
      "All meals included",
      "16km white water rafting",
      "Bonfire and DJ night",
      "Certified rafting guide and safety gear",
    ],
    exclusions: ["Transport to Tapovan", "Bungee or zipline add-ons", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Camp Check-in", description: "Arrive at Tapovan, settle into camp, sunset walk to Laxman Jhula.", activities: ["Check-in", "Laxman Jhula", "Evening bonfire"] },
      { day: 2, title: "Rafting Day", description: "Full 16km raft from Shivpuri with cliff jumping and body surfing stops. DJ night at camp.", activities: ["16km rafting", "Cliff jumping", "DJ night"] },
      { day: 3, title: "Departure", description: "Optional morning yoga session, then checkout.", activities: ["Yoga session", "Departure"] },
    ],
    reviews: [
      { name: "Varun Kapoor", rating: 5, date: "Feb 2026", text: "Best weekend trip for the price. The DJ night was an unexpected bonus.", avatar: "VK" },
      { name: "Ishita Bose", rating: 4, date: "Jan 2026", text: "Rapids were great, camp was a little tight on space for 15 people.", avatar: "IB" },
    ],
    departures: makeDepartures("summit-squad-rishikesh-3d", 3, [
      ["2026-08-21", 15, 13],
      ["2026-09-18", 15, 9],
      ["2026-10-16", 15, 4],
      ["2027-03-19", 15, 0],
    ]),
  },

  /* ══ JAISALMER ═════════════════════════════════════════════════════════════ */
  {
    id: "journey-masters-jaisalmer-4d",
    status: "ACTIVE",
    publishedAt: "2026-04-21",
    operatorId: "journey-masters",
    operatorName: "Journey Masters",
    operatorVerified: true,
    operatorRating: 4.8,
    operatorReviews: 298,
    destinationId: "jaisalmer",
    title: "Jaisalmer Fort & Desert Classic",
    summary:
      "The complete Jaisalmer: two nights inside the living fort, one under canvas at Sam, and a sunset camel ride on the dunes.",
    highlights: ["Stay inside Sonar Quila", "Sam dunes camp", "Gadisar Lake", "Patwon Ki Haveli"],
    tags: ["Heritage", "Desert", "Culture"],
    retailPrice: 11999,
    b2bCost: 9599,
    duration: "4 Days / 3 Nights",
    durationDays: 4,
    groupSize: "Max 14",
    groupSizeMin: 2,
    groupSizeMax: 14,
    difficulty: "Easy",
    minAge: 6,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Fort Haveli + Desert Camp",
    pickupPoint: "Jaisalmer Railway Station",
    dropPoint: "Jaisalmer Railway Station",
    cancellationPolicy: "Free cancellation until 7 days before",
    cancellationPolicyId: "flexible-7d",
    bookingsLast30d: 29,
    images: [
      unsplash(PHOTO.jaisalmerFort),
      unsplash(PHOTO.jaisalmerCamelSunset),
      unsplash(PHOTO.jaisalmerGadisar),
    ],
    inclusions: [
      "Station pickup and drop",
      "2 nights heritage haveli inside the fort",
      "1 night Swiss tent at Sam dunes",
      "All meals including desert camp dinner",
      "Camel safari at sunset",
      "Local heritage guide",
    ],
    exclusions: ["Train/flight to Jaisalmer", "Monument camera fees", "Alcoholic beverages"],
    itinerary: [
      { day: 1, title: "Arrival & Fort Evening", description: "Check into a haveli inside Jaisalmer Fort. Evening walk through the lanes and rooftop dinner.", activities: ["Fort check-in", "Heritage walk", "Rooftop dinner"] },
      { day: 2, title: "Havelis & Gadisar Lake", description: "Patwon Ki Haveli, Salim Singh Ki Haveli and the Jain temples. Sunset boats at Gadisar.", activities: ["Patwon Ki Haveli", "Jain temples", "Gadisar Lake"] },
      { day: 3, title: "Sam Sand Dunes", description: "Drive to Sam. Camel safari at golden hour, folk music and dinner at the desert camp.", activities: ["Camel safari", "Dune sunset", "Folk performance"] },
      { day: 4, title: "Kuldhara & Departure", description: "Visit the abandoned village of Kuldhara on the way back. Station drop.", activities: ["Kuldhara ruins", "Departure"] },
    ],
    reviews: [
      { name: "Shreya Kapoor", rating: 5, date: "Feb 2026", text: "Staying inside the fort rather than in the new town makes the whole trip. Worth every rupee.", avatar: "SK" },
      { name: "Imran Sheikh", rating: 5, date: "Jan 2026", text: "The Sam camp was touristy but the camel ride at sunset genuinely delivered.", avatar: "IS" },
    ],
    departures: makeDepartures("journey-masters-jaisalmer-4d", 4, [
      ["2026-10-15", 14, 10],
      ["2026-11-12", 14, 7],
      ["2026-12-24", 14, 12],
      ["2027-02-11", 14, 1],
    ]),
  },
  {
    id: "peak-pathways-jaisalmer-3d",
    status: "ACTIVE",
    publishedAt: "2026-05-06",
    operatorId: "peak-pathways",
    operatorName: "Peak Pathways",
    operatorVerified: true,
    operatorRating: 4.8,
    operatorReviews: 241,
    destinationId: "jaisalmer",
    title: "Luxury Desert Camp & Stargazing",
    summary:
      "Two nights in a private luxury camp well beyond the Sam crowds, with a telescope, an astronomer and a chef.",
    highlights: ["Private luxury tents", "Astronomer-led stargazing", "Chef-cooked Rajasthani menu", "No crowds"],
    tags: ["Premium", "Stargazing", "Desert"],
    retailPrice: 15999,
    b2bCost: 12499,
    duration: "3 Days / 2 Nights",
    durationDays: 3,
    groupSize: "Max 8",
    groupSizeMin: 2,
    groupSizeMax: 8,
    difficulty: "Easy",
    minAge: 8,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Luxury Desert Camp",
    pickupPoint: "Jaisalmer Airport",
    dropPoint: "Jaisalmer Airport",
    cancellationPolicy: "Free cancellation until 10 days before",
    cancellationPolicyId: "flexible-10d",
    bookingsLast30d: 13,
    images: [
      unsplash(PHOTO.jaisalmerFortNight),
      unsplash(PHOTO.jaisalmerDunes),
      unsplash(PHOTO.jaisalmerCamels),
    ],
    inclusions: [
      "Airport transfers",
      "2 nights in a private luxury tent with attached bath",
      "All meals by a resident chef",
      "Astronomer-guided stargazing with telescope",
      "Private camel and jeep safari",
      "Folk music evening",
    ],
    exclusions: ["Flights to Jaisalmer", "Alcoholic beverages", "Spa treatments"],
    itinerary: [
      { day: 1, title: "Arrival & Dune Sunset", description: "Transfer to the private camp beyond Khuri. Jeep safari to a quiet dune for sunset.", activities: ["Camp check-in", "Jeep safari", "Dune sunset"] },
      { day: 2, title: "Desert Day & Stargazing", description: "Morning camel ride, afternoon at leisure, night sky session with the resident astronomer.", activities: ["Camel ride", "Rest", "Telescope session"] },
      { day: 3, title: "Fort & Departure", description: "Short Jaisalmer Fort tour before the airport drop.", activities: ["Fort tour", "Departure"] },
    ],
    reviews: [
      { name: "Radhika Iyengar", rating: 5, date: "Mar 2026", text: "Being an hour from the Sam circus is the entire point. We saw Saturn's rings from a deck chair.", avatar: "RI" },
    ],
    departures: makeDepartures("peak-pathways-jaisalmer-3d", 3, [
      ["2026-10-30", 8, 5],
      ["2026-11-27", 8, 3],
      ["2026-12-26", 8, 7],
      ["2027-02-19", 8, 0],
    ]),
  },
  {
    id: "adventure-seekers-jaisalmer-5d",
    status: "ACTIVE",
    publishedAt: "2026-05-20",
    operatorId: "adventure-seekers",
    operatorName: "Adventure Seekers",
    operatorVerified: true,
    operatorRating: 4.6,
    operatorReviews: 145,
    destinationId: "jaisalmer",
    title: "Thar Desert Camel Expedition",
    summary:
      "A real two-night camel expedition sleeping on open dunes between villages — not the one-hour ride sold at Sam.",
    highlights: ["2-night camel expedition", "Sleep on open dunes", "Khuri village", "Desert National Park"],
    tags: ["Expedition", "Off-beat", "Camping"],
    retailPrice: 13499,
    b2bCost: 10999,
    duration: "5 Days / 4 Nights",
    durationDays: 5,
    groupSize: "Max 10",
    groupSizeMin: 4,
    groupSizeMax: 10,
    difficulty: "Moderate",
    minAge: 16,
    mealsIncluded: true,
    guideIncluded: true,
    transportIncluded: true,
    hotelType: "Open Dune Camping + Guesthouse",
    pickupPoint: "Jaisalmer Railway Station",
    dropPoint: "Jaisalmer Railway Station",
    cancellationPolicy: "60% refund until 10 days before",
    cancellationPolicyId: "moderate-10d",
    bookingsLast30d: 8,
    images: [
      unsplash(PHOTO.jaisalmerCamels),
      unsplash(PHOTO.jaisalmerDunes),
      unsplash(PHOTO.jaisalmerCamelSunset),
    ],
    inclusions: [
      "All transport within Jaisalmer district",
      "2-night camel expedition with camel handlers",
      "Bedrolls and open-dune camping equipment",
      "All meals cooked on the dunes",
      "Desert National Park permits",
      "Guesthouse nights on arrival and departure",
    ],
    exclusions: ["Train/flight to Jaisalmer", "Sleeping bag (rentable)", "Travel insurance", "Tips for camel handlers"],
    itinerary: [
      { day: 1, title: "Arrival & Fort", description: "Settle into the guesthouse. Afternoon fort walk and expedition briefing.", activities: ["Check-in", "Fort walk", "Briefing"] },
      { day: 2, title: "Expedition Day 1", description: "Drive to Khuri, meet the camels and ride out to the first dune camp.", activities: ["Camel riding", "Khuri village", "Dune camp"] },
      { day: 3, title: "Expedition Day 2", description: "Ride deeper into the Desert National Park. Chinkara and desert fox sightings are common.", activities: ["Camel riding", "Wildlife spotting", "Open-air camp"] },
      { day: 4, title: "Return Ride & Kuldhara", description: "Morning ride back to the road head. Afternoon at the Kuldhara ruins.", activities: ["Camel riding", "Kuldhara ruins", "Guesthouse"] },
      { day: 5, title: "Departure", description: "Morning at Gadisar Lake, then station drop.", activities: ["Gadisar Lake", "Departure"] },
    ],
    reviews: [
      { name: "Yash Deshmukh", rating: 5, date: "Feb 2026", text: "Two nights actually sleeping on the sand, no generator, no buffet. This is the desert trip I wanted.", avatar: "YD" },
      { name: "Naina Bhargava", rating: 4, date: "Jan 2026", text: "Physically harder than advertised — you are on a camel for five hours a day. Loved it anyway.", avatar: "NB" },
    ],
    departures: makeDepartures("adventure-seekers-jaisalmer-5d", 5, [
      ["2026-11-05", 10, 4],
      ["2026-12-03", 10, 2],
      ["2027-02-04", 10, 0],
    ]),
  },
  {
    id: "trailblazers-jaisalmer-3d",
    status: "ACTIVE",
    publishedAt: "2026-06-10",
    operatorId: "trailblazers",
    operatorName: "Trailblazers India",
    operatorVerified: false,
    operatorRating: 4.4,
    operatorReviews: 74,
    destinationId: "jaisalmer",
    title: "Jaisalmer Backpacker Desert Trip",
    summary:
      "Hostel dorm in town, one night in a shared desert tent, and the fort on foot. Built for students travelling on a train ticket.",
    highlights: ["Dorm + desert tent", "Group camel ride", "Fort walking tour", "Under ₹5,000"],
    tags: ["Budget", "Backpacker", "Youth"],
    retailPrice: 5499,
    b2bCost: 4599,
    duration: "3 Days / 2 Nights",
    durationDays: 3,
    groupSize: "Max 20",
    groupSizeMin: 6,
    groupSizeMax: 20,
    difficulty: "Easy",
    minAge: 18,
    mealsIncluded: false,
    guideIncluded: true,
    transportIncluded: false,
    hotelType: "Hostel Dorm + Shared Tent",
    pickupPoint: "Jaisalmer Railway Station",
    dropPoint: "Jaisalmer Railway Station",
    cancellationPolicy: "50% refund until 3 days before",
    cancellationPolicyId: "moderate-3d",
    bookingsLast30d: 44,
    images: [
      unsplash(PHOTO.jaisalmerGadisar),
      unsplash(PHOTO.jaisalmerFort),
      unsplash(PHOTO.jaisalmerDunes),
    ],
    inclusions: [
      "1 night hostel dorm bed",
      "1 night shared desert tent at Sam",
      "Dinner and breakfast at the desert camp",
      "Group camel ride at sunset",
      "Guided fort walking tour",
    ],
    exclusions: ["Train to Jaisalmer", "Most meals", "Monument entry fees", "Travel insurance"],
    itinerary: [
      { day: 1, title: "Arrival & Fort Walk", description: "Drop bags at the hostel. Guided walk through the fort lanes and the Jain temples.", activities: ["Hostel check-in", "Fort walking tour", "Rooftop cafe"] },
      { day: 2, title: "Sam Dunes Camp", description: "Afternoon transfer to Sam. Camel ride, folk dance and dinner, night in a shared tent.", activities: ["Camel ride", "Folk dance", "Shared tent"] },
      { day: 3, title: "Gadisar & Departure", description: "Return to town, morning at Gadisar Lake, then the station.", activities: ["Gadisar Lake", "Departure"] },
    ],
    reviews: [
      { name: "Rohan Dsouza", rating: 4, date: "Mar 2026", text: "Cheap and cheerful. Tent was basic and shared with four others, exactly as described.", avatar: "RD" },
    ],
    departures: makeDepartures("trailblazers-jaisalmer-3d", 3, [
      ["2026-10-16", 20, 17],
      ["2026-11-06", 20, 12],
      ["2026-12-11", 20, 6],
      ["2027-02-05", 20, 1],
    ]),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Derivation. Everything below is computed — the seeds above declare only what a
   real operator would type into the portal.
   ──────────────────────────────────────────────────────────────────────────── */

export const packages: Package[] = packageSeeds.map((seed) => {
  const { retailPrice, b2bCost, reviews, ...rest } = seed;

  const pricing = computePricing(
    {
      packageId: seed.id,
      operatorId: seed.operatorId,
      destinationId: seed.destinationId,
    },
    retailPrice,
    b2bCost
  );

  const hydratedReviews: PackageReview[] = reviews.map((r, i) => ({
    ...r,
    id: `${seed.id}-rev-${i + 1}`,
    bookingReference: bookingReference(seed.id, i),
    verified: true,
  }));

  const packageRating =
    hydratedReviews.length > 0
      ? Math.round(
          (hydratedReviews.reduce((sum, r) => sum + r.rating, 0) /
            hydratedReviews.length) *
            10
        ) / 10
      : seed.operatorRating;

  return {
    ...rest,
    slug: seed.id,
    isDemoData: true,
    nights: seed.durationDays - 1,
    price: retailPrice,
    pricing,
    reviews: hydratedReviews,
    packageRating,
    packageReviewCount: hydratedReviews.length,
  };
});

export const packageById: Record<string, Package> = Object.fromEntries(
  packages.map((p) => [p.id, p])
);

export function packagesForDestination(destinationId: string): Package[] {
  return packages.filter((p) => p.destinationId === destinationId);
}

export function packagesForOperator(operatorId: string): Package[] {
  return packages.filter((p) => p.operatorId === operatorId);
}

/**
 * Packages whose computed pricing breaks a rule. Nothing filters on this yet —
 * once search/compare read from the database these are withheld from customers
 * and surfaced in the admin queue instead.
 */
export const pricingViolations = packages.filter(
  (p) => p.pricing.validationStatus !== "OK"
);
