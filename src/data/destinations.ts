export const destinations = [
  {
    id: "spiti-valley",
    name: "Spiti Valley",
    region: "Himachal Pradesh",
    tagline: "Cold Desert Mountain Valley",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&q=80",
    avgPrice: 12499,
    difficulty: "Moderate",
    bestTime: "Jun – Sep",
    avgDuration: "7 Days",
    operatorCount: 12,
    tripCount: 48,
    category: "Mountains" as const,
    accentColor: "#FF5A5F",
    highlights: ["Key Monastery", "Chandratal Lake", "Kaza", "Kibber"],
    description:
      "A cold desert mountain valley nestled high in the Himalayas of Himachal Pradesh. Known for its raw, unspoiled beauty, ancient monasteries, and adventure opportunities.",
    experiences: [
      {
        title: "Key Monastery",
        description: "The iconic cliff-top monastery dating back to the 11th century.",
      },
      {
        title: "Chandratal Lake",
        description: "A glacial crescent-shaped lake at 4,300m — absolutely breathtaking.",
      },
      {
        title: "Snow Leopard Spotting",
        description: "Kibber is one of the best places in the world to spot snow leopards.",
      },
      {
        title: "Cycling Expeditions",
        description: "Some of the world's highest motorable roads, perfect for cycling enthusiasts.",
      },
    ],
    monthStatuses: {
      jan: "closed", feb: "closed", mar: "closed", apr: "closed",
      may: "closed", jun: "ideal", jul: "ideal", aug: "best",
      sep: "ideal", oct: "closed", nov: "closed", dec: "closed",
    } as Record<string, "closed" | "ideal" | "best">,
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
    region: "Jammu & Kashmir",
    tagline: "Land of High Passes",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    avgPrice: 18999,
    difficulty: "Moderate",
    bestTime: "Jun – Sep",
    avgDuration: "8 Days",
    operatorCount: 22,
    tripCount: 65,
    category: "Mountains" as const,
    accentColor: "#7C3AED",
    highlights: ["Pangong Lake", "Nubra Valley", "Khardung La", "Magnetic Hill"],
    description:
      "The jewel of the Indian Himalayas. Dramatic landscapes, high altitude passes, crystal clear lakes and Buddhist monasteries perched on cliffsides.",
    experiences: [
      {
        title: "Pangong Lake",
        description: "The stunning blue lake stretching across India and China at 4,350m altitude.",
      },
      {
        title: "Nubra Valley",
        description: "A high-altitude desert with double-humped Bactrian camels and sand dunes.",
      },
      {
        title: "Khardung La Pass",
        description: "One of the highest motorable roads in the world at 5,359m above sea level.",
      },
      {
        title: "Magnetic Hill",
        description: "A fascinating optical illusion where vehicles appear to move uphill on their own.",
      },
    ],
    monthStatuses: {
      jan: "closed", feb: "closed", mar: "closed", apr: "closed",
      may: "closed", jun: "ideal", jul: "best", aug: "ideal",
      sep: "ideal", oct: "closed", nov: "closed", dec: "closed",
    } as Record<string, "closed" | "ideal" | "best">,
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
    tagline: "Abode of Clouds",
    image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1600&q=80",
    avgPrice: 9999,
    difficulty: "Easy",
    bestTime: "Oct – May",
    avgDuration: "5 Days",
    operatorCount: 9,
    tripCount: 32,
    category: "Forests" as const,
    accentColor: "#16A34A",
    highlights: ["Living Root Bridges", "Dawki River", "Cherrapunji", "Mawlynnong"],
    description:
      "India's greenest state. Famous for living root bridges, the cleanest village in Asia, crystal clear rivers, and some of the highest rainfall on earth.",
    experiences: [
      {
        title: "Living Root Bridges",
        description: "Ancient bridges grown from rubber tree roots over centuries by the Khasi people.",
      },
      {
        title: "Dawki River",
        description: "Crystal-clear river on the India-Bangladesh border where boats appear to float on air.",
      },
      {
        title: "Cherrapunji Waterfalls",
        description: "Home to some of the world's most spectacular waterfalls including Nohkalikai.",
      },
      {
        title: "Mawlynnong Village",
        description: "Asia's cleanest village — a model of community-led eco-tourism.",
      },
    ],
    monthStatuses: {
      jan: "ideal", feb: "ideal", mar: "best", apr: "ideal",
      may: "ideal", jun: "closed", jul: "closed", aug: "closed",
      sep: "closed", oct: "ideal", nov: "ideal", dec: "ideal",
    } as Record<string, "closed" | "ideal" | "best">,
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
    tagline: "Scotland of India",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=80",
    avgPrice: 7999,
    difficulty: "Easy",
    bestTime: "Oct – Mar",
    avgDuration: "4 Days",
    operatorCount: 11,
    tripCount: 28,
    category: "Forests" as const,
    accentColor: "#F97316",
    highlights: ["Coffee Plantations", "Abbey Falls", "Raja's Seat", "Namdroling Monastery"],
    description:
      "Rolling hills covered in coffee and spice plantations, misty forests, and cascading waterfalls. The perfect escape from city life.",
    experiences: [
      {
        title: "Coffee Plantation Walk",
        description: "Walk through aromatic coffee and cardamom estates and learn about the harvest process.",
      },
      {
        title: "Abbey Falls",
        description: "A stunning 70ft waterfall surrounded by lush green coffee plantations.",
      },
      {
        title: "Raja's Seat",
        description: "A scenic garden with a breathtaking sunset view, favoured by the kings of Kodagu.",
      },
      {
        title: "Namdroling Monastery",
        description: "The Golden Temple — one of the largest Nyingmapa teaching centres outside Tibet.",
      },
    ],
    monthStatuses: {
      jan: "ideal", feb: "ideal", mar: "ideal", apr: "closed",
      may: "closed", jun: "closed", jul: "closed", aug: "closed",
      sep: "closed", oct: "ideal", nov: "ideal", dec: "best",
    } as Record<string, "closed" | "ideal" | "best">,
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
    tagline: "Adventure Capital of India",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    avgPrice: 6499,
    difficulty: "Easy",
    bestTime: "Sep – Jun",
    avgDuration: "3 Days",
    operatorCount: 18,
    tripCount: 75,
    category: "Adventure" as const,
    accentColor: "#0891B2",
    highlights: ["River Rafting", "Bungee Jumping", "Laxman Jhula", "Beatles Ashram"],
    description:
      "Where the Ganges meets adventure. World-class white water rafting, bungee jumping, yoga retreats and spiritual experiences all in one place.",
    experiences: [
      {
        title: "White Water Rafting",
        description: "Tackle Grade 3–5 rapids on the Ganges — India's most thrilling river rafting route.",
      },
      {
        title: "Bungee Jumping",
        description: "India's highest fixed bungee jump at 83 metres — not for the faint-hearted.",
      },
      {
        title: "Laxman Jhula",
        description: "The iconic suspension bridge across the Ganges with stunning Himalayan views.",
      },
      {
        title: "Beatles Ashram",
        description: "The legendary ashram where The Beatles stayed in 1968 to study Transcendental Meditation.",
      },
    ],
    monthStatuses: {
      jan: "ideal", feb: "ideal", mar: "best", apr: "ideal",
      may: "ideal", jun: "ideal", jul: "closed", aug: "closed",
      sep: "ideal", oct: "ideal", nov: "ideal", dec: "ideal",
    } as Record<string, "closed" | "ideal" | "best">,
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
];

export type Destination = (typeof destinations)[number];
