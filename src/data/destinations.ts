/**
 * Placeholder destination catalogue.
 *
 * Shapes mirror the `Destination` model in PLAN.md. Slugs are unchanged from the
 * original file, so every existing /destinations/[slug] URL still resolves —
 * `jaisalmer` is the only addition.
 *
 * `operatorCount`, `tripCount`, `packageCount`, `avgPrice` and `priceFrom` are
 * DERIVED from packages.ts. They were previously hand-typed and had drifted a long
 * way from reality (Coorg claimed 11 operators against a single Coorg package).
 * `tripCount` now counts real scheduled departures rather than being invented.
 *
 * Every photo below was opened and visually verified to depict the destination it
 * is attached to. The previous set had India Gate (Delhi) on Coorg and a Kashmiri
 * snow meadow on Meghalaya.
 */

import { packages, unsplash } from "./packages";

export type MonthStatus = "closed" | "ideal" | "best";
export type DestinationCategory = "Mountains" | "Forests" | "Adventure" | "Desert";

export interface DestinationExperience {
  title: string;
  description: string;
}

export interface DestinationFaq {
  question: string;
  answer: string;
}

export interface Destination {
  /* identity */
  id: string;
  slug: string;
  isDemoData: boolean;

  /* presentation */
  name: string;
  region: string;
  state: string;
  country: string;
  tagline: string;
  description: string;
  image: string;
  heroImage: string;
  category: DestinationCategory;
  accentColor: string;

  /* practical */
  difficulty: string;
  bestTime: string;
  avgDuration: string;
  avgDurationDays: number;
  nearestAirport: string;
  latitude: number;
  longitude: number;
  monthStatuses: Record<string, MonthStatus>;

  /* content */
  highlights: string[];
  experiences: DestinationExperience[];
  faqs: DestinationFaq[];

  /* derived from packages.ts */
  operatorCount: number;
  packageCount: number;
  /** Total scheduled departures across every package here. */
  tripCount: number;
  /** Mean retail price — what operators charge direct. */
  avgPrice: number;
  /** Lowest platform price — what a customer actually pays through Atlaso. */
  priceFrom: number;
}

type DestinationSeed = Omit<
  Destination,
  | "slug"
  | "isDemoData"
  | "operatorCount"
  | "packageCount"
  | "tripCount"
  | "avgPrice"
  | "priceFrom"
>;

const destinationSeeds: DestinationSeed[] = [
  {
    id: "spiti-valley",
    name: "Spiti Valley",
    region: "Himachal Pradesh",
    state: "Himachal Pradesh",
    country: "India",
    tagline: "Cold Desert Mountain Valley",
    image: unsplash("1653844573020-71f77a0ccb8c"),
    heroImage: unsplash("1653844573020-71f77a0ccb8c", 1600),
    category: "Mountains",
    accentColor: "#FF5A5F",
    difficulty: "Moderate",
    bestTime: "Jun – Sep",
    avgDuration: "7 Days",
    avgDurationDays: 7,
    nearestAirport: "Bhuntar (KUU), 245 km",
    latitude: 32.2464,
    longitude: 78.0349,
    highlights: ["Key Monastery", "Chandratal Lake", "Kaza", "Kibber"],
    description:
      "A cold desert mountain valley nestled high in the Himalayas of Himachal Pradesh. Known for its raw, unspoiled beauty, ancient monasteries, and adventure opportunities.",
    experiences: [
      { title: "Key Monastery", description: "The iconic cliff-top monastery dating back to the 11th century." },
      { title: "Chandratal Lake", description: "A glacial crescent-shaped lake at 4,300m — absolutely breathtaking." },
      { title: "Snow Leopard Spotting", description: "Kibber is one of the best places in the world to spot snow leopards." },
      { title: "Cycling Expeditions", description: "Some of the world's highest motorable roads, perfect for cycling enthusiasts." },
    ],
    monthStatuses: {
      jan: "closed", feb: "closed", mar: "closed", apr: "closed",
      may: "closed", jun: "ideal", jul: "ideal", aug: "best",
      sep: "ideal", oct: "closed", nov: "closed", dec: "closed",
    },
    faqs: [
      {
        question: "When is the best time to visit Spiti Valley?",
        answer:
          "June to October is the ideal window. The roads open around mid-June and close with the first heavy snowfall in late October.",
      },
      {
        question: "Do I need an Inner Line Permit?",
        answer:
          "Yes, foreign nationals need an Inner Line Permit (ILP) to visit certain areas of Spiti Valley. Indian nationals do not need a permit.",
      },
      {
        question: "Is Spiti suitable for beginners?",
        answer:
          "Spiti Valley can be visited by beginners, but altitude sickness is a real concern. Acclimatization is key — avoid rushing your itinerary.",
      },
      {
        question: "What is the road condition like?",
        answer:
          "Roads in Spiti Valley are rough and unpaved in many stretches, especially on the Manali–Kaza route. 4WD vehicles and experienced drivers are recommended.",
      },
    ],
  },
  {
    id: "leh-ladakh",
    name: "Leh Ladakh",
    region: "Ladakh",
    state: "Ladakh",
    country: "India",
    tagline: "Land of High Passes",
    image: unsplash("1635255506105-b74adbd94026"),
    heroImage: unsplash("1635255506105-b74adbd94026", 1600),
    category: "Mountains",
    accentColor: "#7C3AED",
    difficulty: "Moderate",
    bestTime: "Jun – Sep",
    avgDuration: "8 Days",
    avgDurationDays: 8,
    nearestAirport: "Leh Kushok Bakula Rimpochee (IXL)",
    latitude: 34.1526,
    longitude: 77.5771,
    highlights: ["Pangong Lake", "Nubra Valley", "Khardung La", "Magnetic Hill"],
    description:
      "The jewel of the Indian Himalayas. Dramatic landscapes, high altitude passes, crystal clear lakes and Buddhist monasteries perched on cliffsides.",
    experiences: [
      { title: "Pangong Lake", description: "The stunning blue lake stretching across India and China at 4,350m altitude." },
      { title: "Nubra Valley", description: "A high-altitude desert with double-humped Bactrian camels and sand dunes." },
      { title: "Khardung La Pass", description: "One of the highest motorable roads in the world at 5,359m above sea level." },
      { title: "Magnetic Hill", description: "A fascinating optical illusion where vehicles appear to move uphill on their own." },
    ],
    monthStatuses: {
      jan: "closed", feb: "closed", mar: "closed", apr: "closed",
      may: "closed", jun: "ideal", jul: "best", aug: "ideal",
      sep: "ideal", oct: "closed", nov: "closed", dec: "closed",
    },
    faqs: [
      {
        question: "When is the best time to visit Leh Ladakh?",
        answer:
          "June to September is the ideal time. July is peak season with all roads open. Winter (Nov–Mar) is only for experienced travellers.",
      },
      {
        question: "Do I need a permit to visit Ladakh?",
        answer:
          "Indian nationals don't need a permit for Leh city. Foreign nationals need a Protected Area Permit (PAP) for certain zones including Nubra Valley and Pangong.",
      },
      {
        question: "How do I acclimatize to the altitude?",
        answer:
          "Spend the first 1–2 days resting in Leh (3,500m) before heading higher. Drink plenty of water, avoid alcohol, and don't exert yourself initially.",
      },
      {
        question: "What is the best way to reach Leh?",
        answer:
          "Flying into Leh Kushok Bakula Rimpochee Airport is the quickest option. The Manali–Leh and Srinagar–Leh highways are popular road trip routes.",
      },
    ],
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    region: "Northeast India",
    state: "Meghalaya",
    country: "India",
    tagline: "Abode of Clouds",
    image: unsplash("1593813738953-fb3c93e0769d"),
    heroImage: unsplash("1593813738953-fb3c93e0769d", 1600),
    category: "Forests",
    accentColor: "#16A34A",
    difficulty: "Easy",
    bestTime: "Oct – May",
    avgDuration: "5 Days",
    avgDurationDays: 5,
    nearestAirport: "Guwahati (GAU), 125 km",
    latitude: 25.467,
    longitude: 91.3662,
    highlights: ["Living Root Bridges", "Dawki River", "Cherrapunji", "Mawlynnong"],
    description:
      "India's greenest state. Famous for living root bridges, the cleanest village in Asia, crystal clear rivers, and some of the highest rainfall on earth.",
    experiences: [
      { title: "Living Root Bridges", description: "Ancient bridges grown from rubber tree roots over centuries by the Khasi people." },
      { title: "Dawki River", description: "Crystal-clear river on the India-Bangladesh border where boats appear to float on air." },
      { title: "Cherrapunji Waterfalls", description: "Home to some of the world's most spectacular waterfalls including Nohkalikai." },
      { title: "Mawlynnong Village", description: "Asia's cleanest village — a model of community-led eco-tourism." },
    ],
    monthStatuses: {
      jan: "ideal", feb: "ideal", mar: "best", apr: "ideal",
      may: "ideal", jun: "closed", jul: "closed", aug: "closed",
      sep: "closed", oct: "ideal", nov: "ideal", dec: "ideal",
    },
    faqs: [
      {
        question: "When is the best time to visit Meghalaya?",
        answer:
          "October to May is ideal. March offers pleasant weather and blooming landscapes. Avoid June–September when heavy monsoon rains make travel difficult.",
      },
      {
        question: "How many days are enough for Meghalaya?",
        answer:
          "5–7 days is ideal to cover Shillong, Cherrapunji, Dawki, and Mawlynnong comfortably. Longer trips allow trekking to remote root bridges.",
      },
      {
        question: "Is Meghalaya safe for solo travellers?",
        answer:
          "Yes, Meghalaya is considered one of the safest states in Northeast India. The locals are warm and welcoming to tourists.",
      },
      {
        question: "Do I need a permit to visit Meghalaya?",
        answer:
          "Indian nationals do not need a permit. Foreign nationals need to register with FRRO and carry their passport with a valid Indian visa.",
      },
    ],
  },
  {
    id: "coorg",
    name: "Coorg",
    region: "Karnataka",
    state: "Karnataka",
    country: "India",
    tagline: "Scotland of India",
    image: unsplash("1599922760936-e840fa373d8d"),
    heroImage: unsplash("1599922760936-e840fa373d8d", 1600),
    category: "Forests",
    accentColor: "#F97316",
    difficulty: "Easy",
    bestTime: "Oct – Mar",
    avgDuration: "4 Days",
    avgDurationDays: 4,
    nearestAirport: "Mangaluru (IXE), 135 km",
    latitude: 12.3375,
    longitude: 75.8069,
    highlights: ["Coffee Plantations", "Abbey Falls", "Raja's Seat", "Namdroling Monastery"],
    description:
      "Rolling hills covered in coffee and spice plantations, misty forests, and cascading waterfalls. The perfect escape from city life.",
    experiences: [
      { title: "Coffee Plantation Walk", description: "Walk through aromatic coffee and cardamom estates and learn about the harvest process." },
      { title: "Abbey Falls", description: "A stunning 70ft waterfall surrounded by lush green coffee plantations." },
      { title: "Raja's Seat", description: "A scenic garden with a breathtaking sunset view, favoured by the kings of Kodagu." },
      { title: "Namdroling Monastery", description: "The Golden Temple — one of the largest Nyingmapa teaching centres outside Tibet." },
    ],
    monthStatuses: {
      jan: "ideal", feb: "ideal", mar: "ideal", apr: "closed",
      may: "closed", jun: "closed", jul: "closed", aug: "closed",
      sep: "closed", oct: "ideal", nov: "ideal", dec: "best",
    },
    faqs: [
      {
        question: "When is the best time to visit Coorg?",
        answer:
          "October to March is the best time. December is peak season with perfect weather and the harvest festival. Avoid June–September for heavy monsoons.",
      },
      {
        question: "How far is Coorg from Bangalore?",
        answer:
          "Coorg (Madikeri) is approximately 250km from Bangalore — about a 5–6 hour drive. The NH-275 via Hassan is the most popular route.",
      },
      {
        question: "What are the must-try activities in Coorg?",
        answer:
          "River rafting on the Barapole, zip-lining, trekking to Tadiandamol peak, visiting coffee estates, and jeep safaris in Nagarhole National Park.",
      },
      {
        question: "Is Coorg good for a family trip?",
        answer:
          "Absolutely. Coorg is ideal for families with its plantation stays, mild weather, nature walks, and kid-friendly resorts and activities.",
      },
    ],
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    region: "Uttarakhand",
    state: "Uttarakhand",
    country: "India",
    tagline: "Adventure Capital of India",
    image: unsplash("1720819029162-8500607ae232"),
    heroImage: unsplash("1720819029162-8500607ae232", 1600),
    category: "Adventure",
    accentColor: "#0891B2",
    difficulty: "Easy",
    bestTime: "Sep – Jun",
    avgDuration: "3 Days",
    avgDurationDays: 3,
    nearestAirport: "Jolly Grant, Dehradun (DED), 35 km",
    latitude: 30.0869,
    longitude: 78.2676,
    highlights: ["River Rafting", "Bungee Jumping", "Laxman Jhula", "Beatles Ashram"],
    description:
      "Where the Ganges meets adventure. World-class white water rafting, bungee jumping, yoga retreats and spiritual experiences all in one place.",
    experiences: [
      { title: "White Water Rafting", description: "Tackle Grade 3–5 rapids on the Ganges — India's most thrilling river rafting route." },
      { title: "Bungee Jumping", description: "India's highest fixed bungee jump at 83 metres — not for the faint-hearted." },
      { title: "Laxman Jhula", description: "The iconic suspension bridge across the Ganges with stunning Himalayan views." },
      { title: "Beatles Ashram", description: "The legendary ashram where The Beatles stayed in 1968 to study Transcendental Meditation." },
    ],
    monthStatuses: {
      jan: "ideal", feb: "ideal", mar: "best", apr: "ideal",
      may: "ideal", jun: "ideal", jul: "closed", aug: "closed",
      sep: "ideal", oct: "ideal", nov: "ideal", dec: "ideal",
    },
    faqs: [
      {
        question: "When is the best time to visit Rishikesh?",
        answer:
          "September to June is ideal. March to May offers the best rafting conditions. July–August monsoon is not recommended as the Ganges becomes dangerous.",
      },
      {
        question: "How do I get to Rishikesh?",
        answer:
          "The nearest airport is Jolly Grant Airport in Dehradun (35km away). Rishikesh is well connected by road and rail from Delhi (240km, ~5–6 hours).",
      },
      {
        question: "Is rafting safe in Rishikesh?",
        answer:
          "Yes, rafting is safe with certified operators who provide all safety equipment and trained guides. Avoid rafting during the monsoon season (July–August).",
      },
      {
        question: "What is the minimum age for bungee jumping?",
        answer:
          "The minimum age is 12 years and minimum weight is 40kg. There is also a maximum weight limit of 110kg for safety reasons.",
      },
    ],
  },
  {
    id: "jaisalmer",
    name: "Jaisalmer",
    region: "Rajasthan",
    state: "Rajasthan",
    country: "India",
    tagline: "The Golden City",
    image: unsplash("1713349881676-594b95a5742b"),
    heroImage: unsplash("1713349881676-594b95a5742b", 1600),
    category: "Desert",
    accentColor: "#D97706",
    difficulty: "Easy",
    bestTime: "Oct – Mar",
    avgDuration: "4 Days",
    avgDurationDays: 4,
    nearestAirport: "Jaisalmer (JSA), 17 km",
    latitude: 26.9157,
    longitude: 70.9083,
    highlights: ["Jaisalmer Fort", "Sam Sand Dunes", "Patwon Ki Haveli", "Gadisar Lake"],
    description:
      "A sandstone city rising straight out of the Thar Desert. One of the world's few living forts, carved havelis, camel expeditions across the dunes and some of the darkest night skies in India.",
    experiences: [
      { title: "Sonar Quila", description: "A 12th-century fort where roughly 3,000 people still live inside the walls — not a museum, a neighbourhood." },
      { title: "Sam Sand Dunes", description: "Camel and jeep safaris over rolling dunes, best at golden hour when the sand turns copper." },
      { title: "Desert Stargazing", description: "Almost no light pollution once you are an hour out of town. The Milky Way is visible to the naked eye." },
      { title: "Kuldhara Ruins", description: "An abandoned village left overnight in 1825 and untouched since — eerie and completely quiet." },
    ],
    monthStatuses: {
      jan: "best", feb: "ideal", mar: "ideal", apr: "closed",
      may: "closed", jun: "closed", jul: "closed", aug: "closed",
      sep: "closed", oct: "ideal", nov: "ideal", dec: "best",
    },
    faqs: [
      {
        question: "When is the best time to visit Jaisalmer?",
        answer:
          "October to March. December and January are the most comfortable, with daytime temperatures around 22–25°C. Avoid April to September, when the desert regularly passes 45°C.",
      },
      {
        question: "How do I reach Jaisalmer?",
        answer:
          "Jaisalmer Airport (17km) has seasonal flights from Delhi and Mumbai between October and March. The overnight train from Delhi or Jodhpur is the more reliable option year-round.",
      },
      {
        question: "Is the Sam desert camp worth it, or is it too touristy?",
        answer:
          "Sam is genuinely crowded in peak season. If you want quiet, choose a camp near Khuri or further out — several operators here run private camps an hour beyond the main cluster.",
      },
      {
        question: "How cold does the desert get at night?",
        answer:
          "In December and January it can drop to 5°C after dark, occasionally lower. Camps provide blankets, but carry a jacket — the swing from afternoon to midnight is dramatic.",
      },
    ],
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Derivation
   ──────────────────────────────────────────────────────────────────────────── */

export const destinations: Destination[] = destinationSeeds.map((seed) => {
  const here = packages.filter((p) => p.destinationId === seed.id);
  const retailPrices = here.map((p) => p.pricing.retailPrice);
  const platformPrices = here.map((p) => p.pricing.platformPrice);

  return {
    ...seed,
    slug: seed.id,
    isDemoData: true,
    operatorCount: new Set(here.map((p) => p.operatorId)).size,
    packageCount: here.length,
    tripCount: here.reduce((sum, p) => sum + p.departures.length, 0),
    avgPrice: retailPrices.length
      ? Math.round(retailPrices.reduce((a, b) => a + b, 0) / retailPrices.length)
      : 0,
    priceFrom: platformPrices.length ? Math.min(...platformPrices) : 0,
  };
});

export const destinationById: Record<string, Destination> = Object.fromEntries(
  destinations.map((d) => [d.id, d])
);
