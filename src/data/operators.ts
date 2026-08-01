/**
 * Placeholder operator directory.
 *
 * Shapes mirror the `Operator`, `OperatorDocument` and `OperatorPayoutAccount`
 * models in PLAN.md. Everything here is flagged `isDemoData: true` so that when
 * real operators are onboarded the placeholder rows can be bulk-deleted without
 * hand-picking them.
 *
 * KYC identifiers, bank details and contact numbers below are fabricated for
 * demo purposes. The GSTINs are format-plausible but not real registrations, and
 * account numbers are stored masked exactly as the portal will display them.
 *
 * `startingPrice`, `destinations` and `packageCount` are DERIVED from packages.ts
 * rather than typed by hand — previously they disagreed with the actual inventory
 * (e.g. Alpine Treks advertised "from ₹12,499" while its only package was ₹14,999).
 */

import { packages } from "./packages";

export type VerificationStatus = "PENDING" | "VERIFIED" | "SUSPENDED" | "REJECTED";
export type DocumentType = "GST" | "PAN" | "LICENSE" | "INSURANCE";
export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface OperatorDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  status: DocumentStatus;
  uploadedAt: string;
  reviewedAt: string | null;
}

export interface OperatorPayoutAccount {
  accountHolder: string;
  /** Masked at rest here; the DB stores this encrypted. */
  accountNumberMasked: string;
  ifsc: string;
  bankName: string;
  upiId: string | null;
  verified: boolean;
}

export interface Operator {
  /* identity */
  id: string;
  slug: string;
  isDemoData: boolean;

  /* public profile */
  name: string;
  description: string;
  badge: string | null;
  logoUrl: string | null;
  foundedYear: number;
  city: string;
  state: string;
  languages: string[];

  /* verification */
  verified: boolean;
  verificationStatus: VerificationStatus;
  documents: OperatorDocument[];

  /* legal / KYC — internal only, never rendered on a customer surface */
  legalName: string;
  gstin: string | null;
  panMasked: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  payoutAccount: OperatorPayoutAccount | null;

  /* trust signals */
  rating: number;
  reviewCount: number;
  avgResponseMinutes: number;
  responseRatePct: number;
  completedTrips: number;

  /* derived from packages.ts */
  destinations: string[];
  packageCount: number;
  /** Lowest retail price across this operator's packages. */
  startingPrice: number;
  /** Lowest platform price — what a customer actually pays. */
  startingPlatformPrice: number;
}

type OperatorSeed = Omit<
  Operator,
  | "slug"
  | "isDemoData"
  | "destinations"
  | "packageCount"
  | "startingPrice"
  | "startingPlatformPrice"
  | "verified"
> & {
  /** Used only when an operator has no packages yet. */
  fallbackStartingPrice: number;
};

function docs(
  operatorId: string,
  specs: ReadonlyArray<readonly [DocumentType, DocumentStatus, string, string | null]>
): OperatorDocument[] {
  return specs.map(([type, status, uploadedAt, reviewedAt], i) => ({
    id: `${operatorId}-doc-${i + 1}`,
    type,
    fileName: `${operatorId}-${type.toLowerCase()}.pdf`,
    status,
    uploadedAt,
    reviewedAt,
  }));
}

const operatorSeeds: OperatorSeed[] = [
  {
    id: "alpine-treks",
    name: "Alpine Treks Co",
    legalName: "Alpine Treks Adventures Private Limited",
    description: "10+ years of Himalayan expertise. Small groups, experienced guides.",
    badge: "Top Rated",
    logoUrl: null,
    foundedYear: 2013,
    city: "Manali",
    state: "Himachal Pradesh",
    languages: ["English", "Hindi"],
    verificationStatus: "VERIFIED",
    documents: docs("alpine-treks", [
      ["GST", "APPROVED", "2024-03-11", "2024-03-14"],
      ["PAN", "APPROVED", "2024-03-11", "2024-03-14"],
      ["LICENSE", "APPROVED", "2024-03-12", "2024-03-19"],
      ["INSURANCE", "APPROVED", "2024-03-12", "2024-03-19"],
    ]),
    gstin: "02AABCA4521F1Z8",
    panMasked: "AABCA****F",
    contactName: "Tenzin Norbu",
    contactEmail: "ops@alpinetreks.example.in",
    contactPhone: "+91 98160 44120",
    payoutAccount: {
      accountHolder: "Alpine Treks Adventures Pvt Ltd",
      accountNumberMasked: "XXXXXXXX4471",
      ifsc: "HDFC0001284",
      bankName: "HDFC Bank",
      upiId: "alpinetreks@hdfcbank",
      verified: true,
    },
    rating: 4.9,
    reviewCount: 312,
    avgResponseMinutes: 42,
    responseRatePct: 98,
    completedTrips: 1240,
    fallbackStartingPrice: 12499,
  },
  {
    id: "summit-squad",
    name: "Summit Squad",
    legalName: "Summit Squad Outdoors LLP",
    description: "Budget-friendly without compromising safety. Youth-focused adventures.",
    badge: "Best Value",
    logoUrl: null,
    foundedYear: 2017,
    city: "Shimla",
    state: "Himachal Pradesh",
    languages: ["English", "Hindi", "Punjabi"],
    verificationStatus: "VERIFIED",
    documents: docs("summit-squad", [
      ["GST", "APPROVED", "2024-05-02", "2024-05-06"],
      ["PAN", "APPROVED", "2024-05-02", "2024-05-06"],
      ["INSURANCE", "APPROVED", "2024-05-04", "2024-05-11"],
    ]),
    gstin: "02AAJCS7719K1Z3",
    panMasked: "AAJCS****K",
    contactName: "Rohit Thakur",
    contactEmail: "hello@summitsquad.example.in",
    contactPhone: "+91 94180 77315",
    payoutAccount: {
      accountHolder: "Summit Squad Outdoors LLP",
      accountNumberMasked: "XXXXXXXX8802",
      ifsc: "ICIC0000392",
      bankName: "ICICI Bank",
      upiId: "summitsquad@icici",
      verified: true,
    },
    rating: 4.7,
    reviewCount: 189,
    avgResponseMinutes: 78,
    responseRatePct: 94,
    completedTrips: 860,
    fallbackStartingPrice: 9999,
  },
  {
    id: "peak-pathways",
    name: "Peak Pathways",
    legalName: "Peak Pathways Hospitality Private Limited",
    description: "Premium experiences with luxury camping and gourmet meals.",
    badge: "Premium",
    logoUrl: null,
    foundedYear: 2011,
    city: "Chandigarh",
    state: "Chandigarh",
    languages: ["English", "Hindi", "French"],
    verificationStatus: "VERIFIED",
    documents: docs("peak-pathways", [
      ["GST", "APPROVED", "2023-12-08", "2023-12-12"],
      ["PAN", "APPROVED", "2023-12-08", "2023-12-12"],
      ["LICENSE", "APPROVED", "2023-12-09", "2023-12-15"],
      ["INSURANCE", "APPROVED", "2023-12-09", "2023-12-15"],
    ]),
    gstin: "04AACCP1180M1Z9",
    panMasked: "AACCP****M",
    contactName: "Ishaan Malhotra",
    contactEmail: "reservations@peakpathways.example.in",
    contactPhone: "+91 98727 30084",
    payoutAccount: {
      accountHolder: "Peak Pathways Hospitality Pvt Ltd",
      accountNumberMasked: "XXXXXXXX1067",
      ifsc: "HDFC0000512",
      bankName: "HDFC Bank",
      upiId: null,
      verified: true,
    },
    rating: 4.8,
    reviewCount: 241,
    avgResponseMinutes: 35,
    responseRatePct: 99,
    completedTrips: 1580,
    fallbackStartingPrice: 15999,
  },
  {
    id: "wild-wanderers",
    name: "Wild Wanderers",
    legalName: "Wild Wanderers Travel Co.",
    description: "Northeast India specialists with deep local connections.",
    badge: null,
    logoUrl: null,
    foundedYear: 2020,
    city: "Shillong",
    state: "Meghalaya",
    languages: ["English", "Hindi", "Khasi"],
    verificationStatus: "PENDING",
    documents: docs("wild-wanderers", [
      ["GST", "APPROVED", "2026-05-14", "2026-05-20"],
      ["PAN", "APPROVED", "2026-05-14", "2026-05-20"],
      ["LICENSE", "PENDING", "2026-06-02", null],
      ["INSURANCE", "PENDING", "2026-06-02", null],
    ]),
    gstin: "17AAGCW2264R1Z1",
    panMasked: "AAGCW****R",
    contactName: "Banri Lyngdoh",
    contactEmail: "trips@wildwanderers.example.in",
    contactPhone: "+91 87948 21160",
    payoutAccount: {
      accountHolder: "Wild Wanderers Travel Co.",
      accountNumberMasked: "XXXXXXXX3390",
      ifsc: "SBIN0007269",
      bankName: "State Bank of India",
      upiId: "wildwanderers@sbi",
      verified: false,
    },
    rating: 4.5,
    reviewCount: 98,
    avgResponseMinutes: 165,
    responseRatePct: 86,
    completedTrips: 310,
    fallbackStartingPrice: 7999,
  },
  {
    id: "himalayan-souls",
    name: "Himalayan Souls",
    legalName: "Himalayan Souls Community Tourism Society",
    description: "Community-based tourism with local guides from Spiti.",
    badge: "Community Pick",
    logoUrl: null,
    foundedYear: 2016,
    city: "Kaza",
    state: "Himachal Pradesh",
    languages: ["English", "Hindi", "Bhoti"],
    verificationStatus: "VERIFIED",
    documents: docs("himalayan-souls", [
      ["GST", "APPROVED", "2024-08-21", "2024-08-27"],
      ["PAN", "APPROVED", "2024-08-21", "2024-08-27"],
      ["INSURANCE", "APPROVED", "2024-09-03", "2024-09-09"],
    ]),
    gstin: "02AABAH5507Q1ZD",
    panMasked: "AABAH****Q",
    contactName: "Sonam Dolma",
    contactEmail: "contact@himalayansouls.example.in",
    contactPhone: "+91 94592 10877",
    payoutAccount: {
      accountHolder: "Himalayan Souls Community Tourism Society",
      accountNumberMasked: "XXXXXXXX6218",
      ifsc: "PUNB0116500",
      bankName: "Punjab National Bank",
      upiId: "himalayansouls@pnb",
      verified: true,
    },
    rating: 4.6,
    reviewCount: 156,
    avgResponseMinutes: 210,
    responseRatePct: 91,
    completedTrips: 540,
    fallbackStartingPrice: 11499,
  },
  {
    id: "nomad-tribe",
    name: "Nomad Tribe",
    legalName: "Nomad Tribe Expeditions Private Limited",
    description: "Northeast India specialists. Small groups, big experiences.",
    badge: "Eco Certified",
    logoUrl: null,
    foundedYear: 2015,
    city: "Guwahati",
    state: "Assam",
    languages: ["English", "Hindi", "Assamese", "Khasi"],
    verificationStatus: "VERIFIED",
    documents: docs("nomad-tribe", [
      ["GST", "APPROVED", "2024-02-05", "2024-02-09"],
      ["PAN", "APPROVED", "2024-02-05", "2024-02-09"],
      ["LICENSE", "APPROVED", "2024-02-06", "2024-02-14"],
      ["INSURANCE", "APPROVED", "2024-02-06", "2024-02-14"],
    ]),
    gstin: "18AAFCN9032T1Z6",
    panMasked: "AAFCN****T",
    contactName: "Pranjal Barua",
    contactEmail: "bookings@nomadtribe.example.in",
    contactPhone: "+91 70021 45590",
    payoutAccount: {
      accountHolder: "Nomad Tribe Expeditions Pvt Ltd",
      accountNumberMasked: "XXXXXXXX7743",
      ifsc: "AXIS0000817",
      bankName: "Axis Bank",
      upiId: "nomadtribe@axis",
      verified: true,
    },
    rating: 4.8,
    reviewCount: 203,
    avgResponseMinutes: 55,
    responseRatePct: 97,
    completedTrips: 1105,
    fallbackStartingPrice: 8499,
  },
  {
    id: "trailblazers",
    name: "Trailblazers India",
    legalName: "Trailblazers India Adventures",
    description: "Budget adventure trips for students and young travelers.",
    badge: null,
    logoUrl: null,
    foundedYear: 2021,
    city: "Dehradun",
    state: "Uttarakhand",
    languages: ["English", "Hindi"],
    verificationStatus: "PENDING",
    documents: docs("trailblazers", [
      ["PAN", "APPROVED", "2026-04-18", "2026-04-24"],
      ["GST", "PENDING", "2026-06-11", null],
      ["INSURANCE", "REJECTED", "2026-05-29", "2026-06-04"],
    ]),
    gstin: null,
    panMasked: "AFXPT****L",
    contactName: "Karan Rawat",
    contactEmail: "team@trailblazersindia.example.in",
    contactPhone: "+91 89279 63301",
    payoutAccount: {
      accountHolder: "Karan Rawat",
      accountNumberMasked: "XXXXXXXX2205",
      ifsc: "KKBK0004321",
      bankName: "Kotak Mahindra Bank",
      upiId: "karanrawat@okaxis",
      verified: false,
    },
    rating: 4.4,
    reviewCount: 74,
    avgResponseMinutes: 240,
    responseRatePct: 79,
    completedTrips: 190,
    fallbackStartingPrice: 5999,
  },
  {
    id: "zenith-expeditions",
    name: "Zenith Expeditions",
    legalName: "Zenith Expeditions India Private Limited",
    description: "Ultra-premium Himalayan expeditions since 2008.",
    badge: "Top Rated",
    logoUrl: null,
    foundedYear: 2008,
    city: "Leh",
    state: "Ladakh",
    languages: ["English", "Hindi", "Ladakhi", "German"],
    verificationStatus: "VERIFIED",
    documents: docs("zenith-expeditions", [
      ["GST", "APPROVED", "2023-09-14", "2023-09-18"],
      ["PAN", "APPROVED", "2023-09-14", "2023-09-18"],
      ["LICENSE", "APPROVED", "2023-09-15", "2023-09-22"],
      ["INSURANCE", "APPROVED", "2023-09-15", "2023-09-22"],
    ]),
    gstin: "38AADCZ3396N1Z2",
    panMasked: "AADCZ****N",
    contactName: "Stanzin Angmo",
    contactEmail: "expeditions@zenith.example.in",
    contactPhone: "+91 99069 11284",
    payoutAccount: {
      accountHolder: "Zenith Expeditions India Pvt Ltd",
      accountNumberMasked: "XXXXXXXX5514",
      ifsc: "HDFC0002190",
      bankName: "HDFC Bank",
      upiId: null,
      verified: true,
    },
    rating: 4.9,
    reviewCount: 389,
    avgResponseMinutes: 28,
    responseRatePct: 99,
    completedTrips: 2140,
    fallbackStartingPrice: 22999,
  },
  {
    id: "mountain-magic",
    name: "Mountain Magic",
    legalName: "Mountain Magic Journeys Private Limited",
    description: "Curated mountain experiences with photography workshops.",
    badge: "Best Photos",
    logoUrl: null,
    foundedYear: 2014,
    city: "Rishikesh",
    state: "Uttarakhand",
    languages: ["English", "Hindi"],
    verificationStatus: "VERIFIED",
    documents: docs("mountain-magic", [
      ["GST", "APPROVED", "2024-01-19", "2024-01-23"],
      ["PAN", "APPROVED", "2024-01-19", "2024-01-23"],
      ["INSURANCE", "APPROVED", "2024-01-22", "2024-01-29"],
    ]),
    gstin: "05AAHCM6640B1Z7",
    panMasked: "AAHCM****B",
    contactName: "Devika Rana",
    contactEmail: "studio@mountainmagic.example.in",
    contactPhone: "+91 90124 55870",
    payoutAccount: {
      accountHolder: "Mountain Magic Journeys Pvt Ltd",
      accountNumberMasked: "XXXXXXXX9938",
      ifsc: "ICIC0001744",
      bankName: "ICICI Bank",
      upiId: "mountainmagic@icici",
      verified: true,
    },
    rating: 4.7,
    reviewCount: 267,
    avgResponseMinutes: 64,
    responseRatePct: 96,
    completedTrips: 1320,
    fallbackStartingPrice: 13999,
  },
  {
    id: "adventure-seekers",
    name: "Adventure Seekers",
    legalName: "Adventure Seekers Outdoor Private Limited",
    description: "Off-beat adventures for explorers and nature lovers.",
    badge: null,
    logoUrl: null,
    foundedYear: 2018,
    city: "Jaipur",
    state: "Rajasthan",
    languages: ["English", "Hindi", "Rajasthani"],
    verificationStatus: "VERIFIED",
    documents: docs("adventure-seekers", [
      ["GST", "APPROVED", "2024-06-27", "2024-07-02"],
      ["PAN", "APPROVED", "2024-06-27", "2024-07-02"],
      ["INSURANCE", "APPROVED", "2024-07-05", "2024-07-11"],
    ]),
    gstin: "08AAKCA8873J1Z4",
    panMasked: "AAKCA****J",
    contactName: "Vivaan Rathore",
    contactEmail: "explore@adventureseekers.example.in",
    contactPhone: "+91 93511 20946",
    payoutAccount: {
      accountHolder: "Adventure Seekers Outdoor Pvt Ltd",
      accountNumberMasked: "XXXXXXXX4102",
      ifsc: "SBIN0031234",
      bankName: "State Bank of India",
      upiId: "adventureseekers@sbi",
      verified: true,
    },
    rating: 4.6,
    reviewCount: 145,
    avgResponseMinutes: 96,
    responseRatePct: 92,
    completedTrips: 620,
    fallbackStartingPrice: 9499,
  },
  {
    id: "forest-nomads",
    name: "Forest Nomads",
    legalName: "Forest Nomads Ecotourism LLP",
    description: "Rainforest trekking and tribal community experiences.",
    badge: "Community Pick",
    logoUrl: null,
    foundedYear: 2019,
    city: "Shillong",
    state: "Meghalaya",
    languages: ["English", "Hindi", "Khasi", "Garo"],
    verificationStatus: "VERIFIED",
    documents: docs("forest-nomads", [
      ["GST", "APPROVED", "2024-11-08", "2024-11-13"],
      ["PAN", "APPROVED", "2024-11-08", "2024-11-13"],
      ["INSURANCE", "APPROVED", "2024-11-15", "2024-11-21"],
    ]),
    gstin: "17AAMFF4418C1ZB",
    panMasked: "AAMFF****C",
    contactName: "Wanda Kharkongor",
    contactEmail: "hello@forestnomads.example.in",
    contactPhone: "+91 60093 78412",
    payoutAccount: {
      accountHolder: "Forest Nomads Ecotourism LLP",
      accountNumberMasked: "XXXXXXXX7756",
      ifsc: "SBIN0013498",
      bankName: "State Bank of India",
      upiId: "forestnomads@sbi",
      verified: true,
    },
    rating: 4.5,
    reviewCount: 112,
    avgResponseMinutes: 132,
    responseRatePct: 88,
    completedTrips: 380,
    fallbackStartingPrice: 8299,
  },
  {
    id: "journey-masters",
    name: "Journey Masters",
    legalName: "Journey Masters Holidays Private Limited",
    description: "Complete travel solutions with customizable itineraries.",
    badge: "Top Rated",
    logoUrl: null,
    foundedYear: 2010,
    city: "Bengaluru",
    state: "Karnataka",
    languages: ["English", "Hindi", "Kannada", "Tamil"],
    verificationStatus: "VERIFIED",
    documents: docs("journey-masters", [
      ["GST", "APPROVED", "2023-10-25", "2023-10-30"],
      ["PAN", "APPROVED", "2023-10-25", "2023-10-30"],
      ["LICENSE", "APPROVED", "2023-10-26", "2023-11-02"],
      ["INSURANCE", "APPROVED", "2023-10-26", "2023-11-02"],
    ]),
    gstin: "29AAECJ2207H1Z5",
    panMasked: "AAECJ****H",
    contactName: "Sowmya Prasad",
    contactEmail: "care@journeymasters.example.in",
    contactPhone: "+91 80471 22903",
    payoutAccount: {
      accountHolder: "Journey Masters Holidays Pvt Ltd",
      accountNumberMasked: "XXXXXXXX3384",
      ifsc: "HDFC0000019",
      bankName: "HDFC Bank",
      upiId: "journeymasters@hdfcbank",
      verified: true,
    },
    rating: 4.8,
    reviewCount: 298,
    avgResponseMinutes: 31,
    responseRatePct: 98,
    completedTrips: 2870,
    fallbackStartingPrice: 10999,
  },
  {
    id: "spiti-specialists",
    name: "Spiti Specialists",
    legalName: "Spiti Specialists Travel Private Limited",
    description: "Deep expertise in Spiti Valley with local homestay options.",
    badge: "Locals Pick",
    logoUrl: null,
    foundedYear: 2015,
    city: "Kaza",
    state: "Himachal Pradesh",
    languages: ["English", "Hindi", "Bhoti"],
    verificationStatus: "VERIFIED",
    documents: docs("spiti-specialists", [
      ["GST", "APPROVED", "2024-04-16", "2024-04-22"],
      ["PAN", "APPROVED", "2024-04-16", "2024-04-22"],
      ["INSURANCE", "APPROVED", "2024-04-25", "2024-05-01"],
    ]),
    gstin: "02AAJCS1195P1ZA",
    panMasked: "AAJCS****P",
    contactName: "Tashi Chhering",
    contactEmail: "info@spitispecialists.example.in",
    contactPhone: "+91 94183 60225",
    payoutAccount: {
      accountHolder: "Spiti Specialists Travel Pvt Ltd",
      accountNumberMasked: "XXXXXXXX8829",
      ifsc: "PUNB0116700",
      bankName: "Punjab National Bank",
      upiId: "spitispecialists@pnb",
      verified: true,
    },
    rating: 4.7,
    reviewCount: 178,
    avgResponseMinutes: 188,
    responseRatePct: 90,
    completedTrips: 610,
    fallbackStartingPrice: 14499,
  },
  {
    id: "eco-explorers",
    name: "Eco Explorers",
    legalName: "Eco Explorers Sustainable Travel LLP",
    description: "Sustainable tourism with focus on environmental conservation.",
    badge: "Eco Certified",
    logoUrl: null,
    foundedYear: 2016,
    city: "Madikeri",
    state: "Karnataka",
    languages: ["English", "Hindi", "Kannada", "Malayalam"],
    verificationStatus: "VERIFIED",
    documents: docs("eco-explorers", [
      ["GST", "APPROVED", "2024-07-09", "2024-07-15"],
      ["PAN", "APPROVED", "2024-07-09", "2024-07-15"],
      ["LICENSE", "APPROVED", "2024-07-10", "2024-07-18"],
      ["INSURANCE", "APPROVED", "2024-07-10", "2024-07-18"],
    ]),
    gstin: "29AAOFE5528G1Z8",
    panMasked: "AAOFE****G",
    contactName: "Nikhil Ponnappa",
    contactEmail: "plan@ecoexplorers.example.in",
    contactPhone: "+91 82778 41163",
    payoutAccount: {
      accountHolder: "Eco Explorers Sustainable Travel LLP",
      accountNumberMasked: "XXXXXXXX1190",
      ifsc: "CNRB0002215",
      bankName: "Canara Bank",
      upiId: "ecoexplorers@cnrb",
      verified: true,
    },
    rating: 4.6,
    reviewCount: 134,
    avgResponseMinutes: 88,
    responseRatePct: 93,
    completedTrips: 705,
    fallbackStartingPrice: 8999,
  },
  {
    id: "ladakh-legends",
    name: "Ladakh Legends",
    legalName: "Ladakh Legends Tours & Travels",
    description: "Traditional Ladakhi culture and high-altitude adventures.",
    badge: null,
    logoUrl: null,
    foundedYear: 2022,
    city: "Leh",
    state: "Ladakh",
    languages: ["English", "Hindi", "Ladakhi"],
    verificationStatus: "PENDING",
    documents: docs("ladakh-legends", [
      ["PAN", "APPROVED", "2026-03-27", "2026-04-01"],
      ["GST", "PENDING", "2026-05-19", null],
      ["LICENSE", "PENDING", "2026-05-19", null],
    ]),
    gstin: null,
    panMasked: "BKQPD****R",
    contactName: "Rigzin Dorjay",
    contactEmail: "yangchen@ladakhlegends.example.in",
    contactPhone: "+91 96229 30518",
    payoutAccount: null,
    rating: 4.4,
    reviewCount: 89,
    avgResponseMinutes: 320,
    responseRatePct: 74,
    completedTrips: 140,
    fallbackStartingPrice: 11999,
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Derivation
   ──────────────────────────────────────────────────────────────────────────── */

export const operators: Operator[] = operatorSeeds.map((seed) => {
  const own = packages.filter((p) => p.operatorId === seed.id);
  const { fallbackStartingPrice, ...rest } = seed;

  return {
    ...rest,
    slug: seed.id,
    isDemoData: true,
    verified: seed.verificationStatus === "VERIFIED",
    destinations: [...new Set(own.map((p) => p.destinationId))],
    packageCount: own.length,
    startingPrice: own.length
      ? Math.min(...own.map((p) => p.pricing.retailPrice))
      : fallbackStartingPrice,
    startingPlatformPrice: own.length
      ? Math.min(...own.map((p) => p.pricing.platformPrice))
      : fallbackStartingPrice,
  };
});

export const operatorById: Record<string, Operator> = Object.fromEntries(
  operators.map((o) => [o.id, o])
);

export const verifiedOperators = operators.filter((o) => o.verified);
