import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  LogIn, UserPlus, LayoutDashboard, Wallet, Users, Receipt, ArrowLeftRight,
  MapPin, Plus, Trash2, X, TrainFront,
  LogOut, Loader2, TrendingUp, TrendingDown, CheckCircle2, Circle,
  Pencil, Save, ChevronDown, ChevronUp, ShieldCheck, Luggage, CalendarDays,
  AlertCircle, Sprout, PiggyBank, CloudRain, UtensilsCrossed, Coffee,
  Clock, Route, Info, Star
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from "recharts";

/* ============================== CONSTANTS ============================== */

const KEYS = {
  APP: "ooty:app-data",
  LOG: "ooty:expense-log",
  USERS: "ooty:users",
  PLAN: "ooty:plan-data",
  PACK_REQS: "ooty:packing-requests",
  CONTACT_REQS: "ooty:contact-requests",
  PHOTOS: "ooty:photos",
};

// Bump this when the seeded trip-guide content changes so cached plans refresh.
const PLAN_SCHEMA = "2026-07-ooty-guide-v4";

const TRAIN_LEGS = [
  { key: "hydMysore", label: "Hyderabad \u2192 Mysore" },
  { key: "blrMysore", label: "Bangalore \u2192 Mysore" },
  { key: "mysoreBlr", label: "Mysore \u2192 Bangalore" },
  { key: "mysoreHyd", label: "Mysore \u2192 Hyderabad" },
];

const CATEGORIES = ["Transport", "Stay", "Food", "Sightseeing", "Shopping", "Other"];

function uid(prefix) {
  return (prefix || "id") + "_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function seedMembers() {
  const raw = [
    ["Sai krishna", 1385, [1, 0, 0, 1]],
    ["Sri Priyanka", 1385, [1, 0, 0, 1]],
    ["Pooja", 1385, [1, 0, 0, 1]],
    ["Shruthi", 1385, [1, 0, 0, 1]],
    ["Jagadish", 1385, [1, 0, 1, 0]],
    ["Jaya", 1000, [0, 1, 1, 0]],
    ["Shakoor", 1385, [1, 0, 1, 0]],
    ["Praneeth", 1385, [0, 1, 1, 0]],
    ["Mahesh", 1385, [0, 1, 1, 0]],
    ["Nikhil", 0, [0, 1, 1, 0]],
    ["Rohit", 1400, [1, 0, 0, 1]],
    ["Subbu", 1000, [1, 0, 1, 0]],
    ["Gopal", 1385, [0, 1, 1, 0]],
    ["Deepu", 1385, [1, 0, 0, 1]],
  ];
  return raw.map(([name, advancePaid, legsArr]) => ({
    id: uid("mem"),
    name,
    advancePaid,
    claimed: false,
    username: null,
    legs: {
      hydMysore: !!legsArr[0],
      blrMysore: !!legsArr[1],
      mysoreBlr: !!legsArr[2],
      mysoreHyd: !!legsArr[3],
    },
  }));
}

function seedCommonExpenses() {
  return [
    { id: uid("ce"), category: "Onward Train \u2014 Hyderabad to Mysore", totalCost: 4226, advancePaid: 0, splitAmong: 9, type: "train", legKey: "hydMysore" },
    { id: uid("ce"), category: "Onward Train \u2014 Bangalore to Mysore", totalCost: 1128, advancePaid: 0, splitAmong: 5, type: "train", legKey: "blrMysore" },
    { id: uid("ce"), category: "Return Train \u2014 Mysore to Bangalore", totalCost: 1495, advancePaid: 0, splitAmong: 8, type: "train", legKey: "mysoreBlr" },
    { id: uid("ce"), category: "Return Train \u2014 Mysore to Hyderabad", totalCost: 2775, advancePaid: 0, splitAmong: 6, type: "train", legKey: "mysoreHyd" },
    { id: uid("ce"), category: "Resort \u2014 Premium Room Deluxe (3N, Breakfast incl.)", totalCost: 20000, advancePaid: 5000, splitAmong: 14, type: "shared", legKey: null },
    { id: uid("ce"), category: "Food", totalCost: 0, advancePaid: 0, splitAmong: 14, type: "shared", legKey: null },
    { id: uid("ce"), category: "Tempo Traveller", totalCost: 0, advancePaid: 0, splitAmong: 14, type: "shared", legKey: null },
    { id: uid("ce"), category: "Entry Tickets", totalCost: 0, advancePaid: 0, splitAmong: 14, type: "shared", legKey: null },
  ];
}

function seedAppData() {
  return {
    tripInfo: {
      name: "Ooty Group Trip",
      destination: "Mysore \u2192 Ooty, Nilgiris",
      startDate: "2026-07-17",
      endDate: "2026-07-20",
      currency: "\u20B9",
    },
    members: seedMembers(),
    commonExpenses: seedCommonExpenses(),
  };
}

/* A blank plan for brand-new trips (keeps the app reusable / non-hardcoded). */
function emptyPlanData() {
  return {
    days: [
      { id: uid("day"), title: "Day 1", date: "", activities: [] },
    ],
    packing: [],
    contacts: [],
    notes: "",
    weather: { location: "", asOf: "", summary: "", days: [], tips: [] },
    food: [],
    restaurants: [],
  };
}

function act(time, text, detail) {
  return { id: uid("act"), time: time || "", text, detail: detail || "", done: false };
}

function seedPlanData() {
  return {
    days: [
      {
        id: uid("day"),
        title: "Day 1 \u2014 Mysore \u2192 Bandipur \u2192 Pykara Falls \u2192 Ooty",
        date: "2026-07-17",
        subtitle: "Fill tank in Mysore \u00b7 drive through the forest \u00b7 Pykara Falls & Lake on the way up \u00b7 check in by evening",
        activities: [
          act("10:00 AM", "Mysore \u2014 Pickup & fuel up", "Fill full tank. Last good petrol before the forest. Load the tempo traveller and assemble everyone from the station."),
          act("10:15 AM", "Drive: Mysore \u2192 Gundlupet", "~2 hrs on NH 766 via Nanjangud (~67 km). Smooth highway. Stock snacks and water here for the forest stretch."),
          act("12:15 PM", "Lunch \u2014 Gundlupet / Bandipur checkpost", "1 hr. Resort restaurants and dhabas at the checkpost. Last proper meal before Ooty \u2014 eat well."),
          act("1:15 PM", "Drive through Bandipur National Park", "45 min. Watch wildlife from windows \u2014 elephants, deer, gaur. \u26a0 Do NOT stop or get out inside the reserve. Forest is open 6 AM\u20139 PM only."),
          act("2:00 PM", "Drive through Mudumalai \u2192 Theppakadu \u2192 Gudalur", "45 min. More wildlife en route \u2014 keep moving. The elephant camp bathing & safari are fully planned for Day 4 morning."),
          act("2:45 PM", "Drive: Gudalur \u2192 Pykara", "45 min. Ghat section begins. Tea estates and pine forest on both sides. Stunning even in monsoon mist."),
          act("3:30 PM", "Pykara Falls", "45 min \u00b7 Opens 8:30 AM, closes 5:30 PM \u00b7 \u20b930/person. Short 10\u201315 min walk down steps. Full monsoon flow \u2014 spectacular. Visit falls BEFORE the lake (they are 2.5 km apart on the same road; falls come first descending from the Ooty direction). Camera charges extra."),
          act("4:15 PM", "Pykara Dam", "15 min \u00b7 Free \u00b7 Daylight only. Roadside photo stop. Quick group shot at the dam wall."),
          act("4:30 PM", "Pykara Lake + Boat House", "45 min \u00b7 9 AM\u20135:30 PM \u00b7 Entry free; Boating \u20b9240+/boat. Motor and speed boats. Leave by 5:15 PM at the latest. \u26a0 If running late at Pykara, skip boating and do Ooty Lake on Day 2 instead. Never risk being in the forest after dark."),
          act("5:15 PM", "Drive: Pykara \u2192 Ooty resort", "~1 hr. Slow ghat drive in monsoon. Almost there."),
          act("6:15 PM", "Check in, dinner at resort", "Premium Room Deluxe, breakfast included. Early night \u2014 big days ahead. Ooty town has commercial-vehicle limits 8 AM\u20139 PM \u2014 driver will handle parking."),
        ],
      },
      {
        id: uid("day"),
        title: "Day 2 \u2014 Ooty Town + Optional Pykara-road cluster",
        date: "2026-07-18",
        subtitle: "Botanical Garden & Doddabetta early \u00b7 town loop \u00b7 optional western cluster if weather & energy allow",
        activities: [
          act("8:00 AM", "Breakfast at resort", "Included with stay. 45-min window."),
          act("8:45 AM", "Drive to Botanical Garden", "15 min from resort."),
          act("9:00 AM", "Government Botanical Garden", "1 hr \u00b7 7 AM\u20136:30 PM \u00b7 \u20b930 adult / \u20b915 child. 55 acres of curated Nilgiri flora. 20-million-year-old fossil tree trunk is the highlight. Go early before crowds. Camera \u20b950 still / \u20b9100 video."),
          act("10:15 AM", "Drive: Botanical Garden \u2192 Doddabetta Peak", "20 min \u00b7 9 km uphill."),
          act("10:35 AM", "Doddabetta Peak (2,637 m)", "45 min \u00b7 7 AM\u20136 PM \u00b7 \u20b96/person. Highest point in the Nilgiris. \u26a0 Must reach before 11 AM \u2014 monsoon clouds close in fast in July. Telescope house at top. Camera \u20b910 still / \u20b950 video."),
          act("11:20 AM", "Tea Factory + Tea Museum (Doddabetta Road)", "45 min \u00b7 8 AM\u20136 PM \u00b7 \u20b910\u201320/person. Processing demo (CTC + orthodox), tasting, buy estate-fresh Nilgiri tea. Same road as Doddabetta."),
          act("12:05 PM", "Chocolate Factory", "30 min \u00b7 9 AM\u20138 PM \u00b7 Free entry \u2014 pay for what you buy. Milk, dark, nut, fruit, chilli varieties."),
          act("12:35 PM", "Lunch \u2014 Ooty town", "1 hr. HBH Biryani / Junior Kuppanna / Pankaj Bhojanalaya \u2014 see restaurant guide in this app."),
          act("1:35 PM", "Wax World Museum", "30 min \u00b7 9 AM\u20138 PM \u00b7 \u20b930\u201340 adult / \u20b920 child. Last entry ~5:45 PM. Opposite Ooty Lake. Camera \u20b930\u201350."),
          act("2:10 PM", "Rose Garden", "45 min \u00b7 8:30 AM\u20136:30 PM \u00b7 \u20b930 adult / \u20b915 child. Terraced hillside, thousands of rose varieties. Camera charges apply."),
          act("3:00 PM", "Ooty Lake + Boat House", "1 hr \u00b7 9 AM\u20136 PM \u00b7 Entry \u20b910\u201320; Boating \u20b9240+/boat. Pedal/motor boats. Chilli-bajji stalls at the lake."),
          act("4:15 PM", "Optional \u2014 Pine Forest", "20 min \u00b7 Daylight \u00b7 Free (small parking). Famous pine avenue, great photos. ~20 min drive from Ooty Lake on the Pykara road."),
          act("4:35 PM", "Optional \u2014 9th Mile / Wenlock Downs (Shooting Point)", "25 min \u00b7 Daylight \u00b7 Small parking fee. Open grassland sweep \u2014 iconic Ooty backdrop. Great group panoramas."),
          act("5:05 PM", "Optional \u2014 Kamraj Sagar Dam", "20 min \u00b7 Daylight \u00b7 Free. Scenic dam on Wenlock Downs slopes."),
          act("5:30 PM", "Optional \u2014 Tree Park", "20 min \u00b7 9 AM\u20136 PM \u00b7 \u20b910/person. Eco park next to Botanical Garden. Quiet forest walk. \u26a0 If the optional cluster feels rushed (in monsoon it often does), keep Pine Forest + Wenlock Downs and drop Tree Park & Kamraj Sagar."),
          act("6:00 PM", "Drive back to resort + dinner", "Charring Cross shopping on the way if time allows \u2014 woolens, tea, oils, varkey, homemade chocolates."),
        ],
      },
      {
        id: uid("day"),
        title: "Day 3 \u2014 Coonoor Full Day",
        date: "2026-07-19",
        subtitle: "Ketti Valley \u00b7 Sim\u2019s Park \u00b7 Lamb\u2019s Rock \u00b7 Dolphin\u2019s Nose \u00b7 Highfield Tea Estate \u00b7 special group dinner",
        activities: [
          act("8:00 AM", "Breakfast at resort", "Included with stay."),
          act("8:45 AM", "Drive: Ooty \u2192 Ketti Valley View Point", "20 min \u00b7 4 km from Ooty on the Ooty\u2013Coonoor road."),
          act("9:05 AM", "Ketti Valley View Point", "20 min \u00b7 Daylight \u00b7 \u20b910\u201320 (small entry/parking). Largest valley in the Nilgiris \u2014 spectacular scale on a clear morning. Worth the quick stop."),
          act("9:25 AM", "Drive: Ketti \u2192 Coonoor", "30 min."),
          act("9:55 AM", "Sim's Park, Coonoor", "1 hr \u00b7 9 AM\u20136 PM \u00b7 \u20b930 adult / \u20b910 child. Century-old botanical park. Quieter and more peaceful than Ooty's Botanical Garden. Rare plants, small lake. Camera \u20b950 still / \u20b9100 video."),
          act("11:00 AM", "Drive: Sim's Park \u2192 Lamb's Rock / Dolphin's Nose", "20 min \u00b7 Narrow road; driver knows the route."),
          act("11:20 AM", "Lamb's Rock", "30 min \u00b7 6 AM\u20136:30 PM \u00b7 Free (small parking). Sheer cliff viewpoint. Panoramic views over Coimbatore plains and tea estates stretching to the horizon."),
          act("11:55 AM", "Dolphin's Nose", "45 min \u00b7 6 AM\u20135 PM \u00b7 Free (small local charge may apply). Dramatic flat rock jutting over the valley. Best viewpoint to see Catherine Falls across the gorge."),
          act("12:45 PM", "Lunch \u2014 Coonoor town / Wellington", "1 hr. Cafe Diem / Tranquilitea Tea Lounge / local restaurants in Coonoor town."),
          act("1:45 PM", "Highfield Tea Garden", "1 hr \u00b7 9 AM\u20136 PM \u00b7 Free entry; guided tour + tasting \u20b9100+. Walk through plucking rows, factory tour (withering, rolling, sorting), expert tasting session. Buy directly from the estate."),
          act("2:50 PM", "Oil Factory (Eucalyptus distillation)", "30 min \u00b7 9 AM\u20136 PM \u00b7 Free entry. Watch eucalyptus oil distillation. Buy what you like \u2014 popular for muscle rubs and aromatherapy."),
          act("3:25 PM", "Catherine Falls viewpoint", "30 min \u00b7 Daylight \u00b7 Free. Roadside viewpoint. Full trail to the base requires forest officer permission and a 2\u20133 km trek \u2014 skip it in monsoon (leeches, slippery). The view from Dolphin's Nose is actually better."),
          act("4:00 PM", "Drive: Coonoor \u2192 Ooty resort", "1 hr."),
          act("5:00 PM", "Rest at resort", "Refresh and change for the special group dinner."),
          act("7:00 PM", "Group dinner \u2014 special evening", "Earl's Secret @ Kings Cliff (book ahead for 14 \u2014 Ooty's finest, glass-enclosed colonial bungalow, famous white-chocolate brownie) or HBH Biryani for a big, hearty feed."),
        ],
      },
      {
        id: uid("day"),
        title: "Day 4 \u2014 Mudumalai Safari + Elephant Camp \u2192 Mysore \u2192 Chamundeshwari \u2192 Train",
        date: "2026-07-20",
        subtitle: "Zero slack today \u2014 work backward from 2 PM at Mysore station. Safari, elephant bathing, temple, then home.",
        activities: [
          act("5:00 AM", "Depart Ooty (hard start \u2014 check out the night before)", "Bills settled and luggage loaded the evening before. Forest traffic opens at 6 AM \u2014 leaving at 5 AM means you hit Theppakadu right on time at 7 AM."),
          act("5:00\u20137:00 AM", "Drive: Ooty \u2192 Theppakadu (Mudumalai)", "2 hrs \u00b7 ~67 km via Gudalur route. \u26a0 Do NOT take the Kalhatty 36-hairpin road \u2014 court-closed to tourist vehicles in 2026 and too narrow for a tempo traveller."),
          act("7:00 AM", "Theppakadu Elephant Camp \u2014 morning bathing", "30 min \u00b7 Open 7:00\u20137:30 AM only \u00b7 Small entry fee. Elephants brought to the Moyar River for bathing and feeding of ragi balls and jaggery. Quiet and memorable. \u26a0 This window is tight \u2014 do not miss it."),
          act("7:30 AM", "Report to safari booking counter", "Counter at Theppakadu reception. First come first served \u2014 no reliable advance online booking. Buy tickets immediately for the 8:00 AM safari slot."),
          act("8:00\u20139:10 AM", "Mudumalai Jeep / Van Safari", "70 min \u00b7 6:30 AM\u201310:40 AM (morning block) \u00b7 Van: \u20b9350/person. Jeep (Gypsy): \u20b93,000/vehicle (max 6) + \u20b950\u2013115/person + eco fee. Camera: \u20b925 still / \u20b9150 video. Best wildlife slot of the day \u2014 elephants, deer, gaur, langur, peacocks commonly seen. \u26a0 Do NOT alight from vehicle at any point. Park can close on heavy monsoon rain days."),
          act("9:15 AM", "Tea & snacks near Theppakadu", "15 min. Small stalls near the reception. Quick bite before the long drive to Mysore."),
          act("9:30 AM", "Depart Theppakadu \u2192 Mysore (hard deadline)", "Must leave by 9:30 AM to reach Mysore by noon. No further stops inside the forest."),
          act("9:30 AM\u201312:00 PM", "Drive: Theppakadu \u2192 Mysore", "2.5 hrs \u00b7 ~90 km via Bandipur\u2013Gundlupet\u2013Nanjangud. Crossing forest mid-morning, well within the 6 AM\u20139 PM window."),
          act("12:00 PM", "Reach Mysore \u2014 Quick lunch", "45 min. Near the palace / ring road area. Fast lunch \u2014 no time to linger."),
          act("12:45 PM", "Drive: Mysore city \u2192 Chamundi Hills", "20 min \u00b7 13 km winding road up the hill."),
          act("1:05 PM", "Chamundeshwari Temple, Chamundi Hills", "45 min \u00b7 Morning session closes 2:00 PM sharp \u00b7 Free general darshan; VIP \u20b930\u2013100/person. \u26a0 Must reach by 1:05\u20131:10 PM to get darshan before the 2 PM closure. VIP darshan strongly recommended for 14 people \u2014 no time for a long queue. See the Nandi monolith, Mahishasura statue & Mysore city view. July 20 is a Monday \u2014 lighter crowds than Fridays."),
          act("1:50 PM", "Drive: Chamundi Hills \u2192 Mysore Railway Station", "20 min \u00b7 13 km from the station. If running behind anywhere, shorten the temple visit \u2014 not the train."),
          act("2:10 PM", "\u2705 Mysore Railway Station \u2014 Trip ends!", "Board your return trains. Safe travels everyone!"),
        ],
      },
    ],
    packing: [
      { id: uid("pk"), text: "Rain jacket / poncho (umbrellas fail in wind)", checked: false, cat: "Rain gear" },
      { id: uid("pk"), text: "Compact umbrella (one per person)", checked: false, cat: "Rain gear" },
      { id: uid("pk"), text: "Waterproof / quick-dry shoes with good grip + a spare pair", checked: false, cat: "Rain gear" },
      { id: uid("pk"), text: "Dry bags / zip-locks for phone, camera, documents", checked: false, cat: "Rain gear" },
      { id: uid("pk"), text: "Daypack with a rain cover", checked: false, cat: "Rain gear" },
      { id: uid("pk"), text: "Light fleece / sweater + windproof jacket (nights 11\u201313\u00b0C)", checked: false, cat: "Warm layers" },
      { id: uid("pk"), text: "Full-sleeve tops & long trousers", checked: false, cat: "Warm layers" },
      { id: uid("pk"), text: "Extra dry socks; light cap / beanie", checked: false, cat: "Warm layers" },
      { id: uid("pk"), text: "Motion-sickness tablets (take before the ghat climb)", checked: false, cat: "Health & practical" },
      { id: uid("pk"), text: "Anti-leech: salt / repellent, tuck socks in on trails", checked: false, cat: "Health & practical" },
      { id: uid("pk"), text: "First-aid, personal meds, moisturizer, lip balm, sunscreen", checked: false, cat: "Health & practical" },
      { id: uid("pk"), text: "Cash (forest stretch & stalls have no signal / UPI)", checked: false, cat: "Health & practical" },
      { id: uid("pk"), text: "Offline maps downloaded (network drops near Gudalur)", checked: false, cat: "Health & practical" },
      { id: uid("pk"), text: "Torch / headlamp (power cuts common in monsoon)", checked: false, cat: "Health & practical" },
      { id: uid("pk"), text: "ID proof (for resort check-in & temple VIP darshan)", checked: false, cat: "Health & practical" },
      { id: uid("pk"), text: "Power bank & chargers", checked: false, cat: "Health & practical" },
    ],
    contacts: [
      { id: uid("ct"), name: "Tempo traveller driver", phone: "\u2014 add before trip" },
      { id: uid("ct"), name: "Ooty resort front desk", phone: "\u2014 add before trip" },
    ],
    notes: "Route decided for you: take the Gudalur road BOTH ways (~155\u2013160 km, 4\u20134.5 hrs). The short Kalhatty 36-hairpin road is court-closed to tourist vehicles in 2026 and too tight for a tempo traveller. Cross the Bandipur/Mudumalai forest only between 6 AM and 9 PM (night traffic ban).\n\nToy train verdict: skip the full Mettupalayam route (wrong side of the hills, monsoon-cancellation risk). If you want the experience, do the short Ooty\u2192Coonoor section on Day 3 and have the vehicle meet you.",
    weather: {
      location: "Ooty (Nilgiris) \u00b7 Mysore",
      asOf: "Climatological averages for mid-July \u2014 not a forecast. Check the actual IMD forecast ~10 days before travel.",
      summary: "July is the WETTEST month in Ooty \u2014 peak monsoon. Cool, misty and rainy in the hills; warm and drier down in Mysore. Expect fog cutting mountain views, slippery ghat roads, and leeches on forest/plantation trails.",
      days: [
        { label: "Ooty \u2014 day high", value: "15\u201319\u00b0C", note: "Lowest highs of the year; jacket weather" },
        { label: "Ooty \u2014 night low", value: "11\u201313\u00b0C", note: "Cold at the resort in the evening" },
        { label: "Rainfall", value: "~251 mm", note: "Over ~10 days; only ~3.8 hrs sun/day" },
        { label: "Humidity / sky", value: "50\u201366%", note: "Overcast most of the day, heavy mist" },
        { label: "Mysore (plains)", value: "~28\u00b0C day", note: "Much warmer & drier than the hills" },
      ],
      tips: [
        "Doddabetta views are clearest 10 AM\u2013noon before clouds close in.",
        "Roads can close after landslides; keep plans flexible and add buffer to drive times.",
        "If a Red/Orange IMD alert is active on your dates, drop Avalanche/Pykara and the toy train and keep to town/indoor plans.",
        "Take motion-sickness tablets before the ghat climb; roads are wet and winding.",
      ],
    },
    food: [
      { id: uid("fd"), name: "Nilgiri tea", note: "The signature product. Roadside chai is strong CTC; for a real experience seek single-estate orthodox tea from Coonoor estates \u2014 lighter and aromatic." },
      { id: uid("fd"), name: "Ooty Varkey", note: "GI-tagged flaky biscuit (maida/rice flour, ghee, fermented starter, wood-fired). Best dipped in hot chai. West Coast Bakery; Crown Bakery in Coonoor." },
      { id: uid("fd"), name: "Homemade chocolates", note: "A genuine local craft \u2014 milk, dark, nut, fruit, even chilli. King Star & shops around Charring Cross / Commercial Road." },
      { id: uid("fd"), name: "Badaga cuisine", note: "Food of the indigenous Badaga community \u2014 millet-based dishes, kattu saadham, keerai masiyal, Badaga chicken curry & thali. Jackfruit curry is a regional specialty." },
      { id: uid("fd"), name: "Chilli bajji (mulaga bajji)", note: "The essential street-food bite from the stalls at Ooty Lake." },
      { id: uid("fd"), name: "Ooty carrots & hill vegetables", note: "The Nilgiris supplies much of South India's cold-weather produce \u2014 fresh, sweet carrots are a local point of pride." },
      { id: uid("fd"), name: "Toda buffalo dairy", note: "Some Toda communities sell rich buffalo butter/dairy \u2014 ask at craft outlets near the Botanical Garden (not always available)." },
    ],
    restaurants: [
      { id: uid("rs"), name: "Hyderabad Biryani House (HBH)", tier: "Cheap & best", cuisine: "Hyderabadi biryani, Al Faham, kebabs", note: "The group crowd-pleaser. Huge portions (a Jumbo biryani feeds 6\u20137), window views. Go early; on-road parking. Reviewers eat here multiple nights." },
      { id: uid("rs"), name: "Hotel Junior Kuppanna", tier: "Cheap & best", cuisine: "Kongu-style non-veg, banana-leaf meals", note: "Authentic mutton specialty, locally recommended. Can be crowded; tight parking." },
      { id: uid("rs"), name: "Hotel Pankaj Bhojanalaya", tier: "Cheap & best", cuisine: "Pure-veg North Indian", note: "Soft home-style rotis, very affordable. Locals rate it over the touristy chains." },
      { id: uid("rs"), name: "Willy's Coffee Pub", tier: "Cheap & best", cuisine: "Cafe \u2014 burgers, pizza, lemon tea", note: "Budget hangout loved by students/backpackers; has a book collection." },
      { id: uid("rs"), name: "Shinkow's Chinese Restaurant", tier: "Mid-range", cuisine: "Authentic Chinese", note: "Ooty institution since 1954 \u2014 chilli pork, American chop suey. ~\u20b9800 for two. Go early." },
      { id: uid("rs"), name: "Place to Bee", tier: "Mid-range", cuisine: "Cafe \u2014 wood-fired pizza, desserts", note: "Vintage charm, banoffee pie & tiramisu, organic/vegan-friendly. Great ambience." },
      { id: uid("rs"), name: "Nahar's Sidewalk Cafe", tier: "Mid-range", cuisine: "Veg multi-cuisine", note: "Wood-fired pizza, pastas, garden seating at Charring Cross." },
      { id: uid("rs"), name: "Cliff Top Restaurant", tier: "Mid-range", cuisine: "Multi-cuisine + valley views", note: "North/South Indian, Chinese, seafood; well-reviewed for food + scenery." },
      { id: uid("rs"), name: "Earl's Secret @ Kings Cliff", tier: "Luxury", cuisine: "Fine dining, continental", note: "Ooty's standout \u2014 glass-enclosed colonial bungalow, valley views, famous white-chocolate brownie. Book ahead for 14." },
      { id: uid("rs"), name: "Curry & Rice, Fernhill Royale Palace", tier: "Luxury", cuisine: "Anglo-Indian / royal", note: "Wodeyar-legacy cuisine in an opulent heritage palace. ~\u20b91,000+ for two." },
    ],
  };
}

/* ============================== HELPERS ============================== */

async function hashPassword(pw) {
  const payload = "ooty-trip-salt::" + pw;
  try {
    const enc = new TextEncoder().encode(payload);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    let h = 0;
    for (let i = 0; i < payload.length; i++) {
      h = (h << 5) - h + payload.charCodeAt(i);
      h |= 0;
    }
    return "fb" + Math.abs(h).toString(16);
  }
}

function formatMoney(n, symbol) {
  const val = Number(n) || 0;
  const rounded = Math.round(val);
  return (symbol || "\u20B9") + rounded.toLocaleString("en-IN");
}

function computeMember(member, commonExpenses, logEntries) {
  const trainShare = commonExpenses
    .filter((e) => e.type === "train" && member.legs && member.legs[e.legKey])
    .reduce((sum, e) => sum + (Number(e.totalCost) || 0) / (Number(e.splitAmong) || 1), 0);
  const sharedShare = commonExpenses
    .filter((e) => e.type === "shared")
    .reduce((sum, e) => sum + (Number(e.totalCost) || 0) / (Number(e.splitAmong) || 1), 0);
  const shareOfCommon = trainShare + sharedShare;
  const myLog = logEntries.filter((e) => e.memberId === member.id);
  const groupCredit = myLog.filter((e) => e.type === "Group").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const personal = myLog.filter((e) => e.type === "Personal").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalPaid = (Number(member.advancePaid) || 0) + groupCredit;
  const totalExpenditure = shareOfCommon + personal;
  const balance = totalExpenditure - totalPaid;
  const status = balance > 0.5 ? "To Pay" : balance < -0.5 ? "To Receive" : "Settled";
  return { ...member, trainShare, sharedShare, shareOfCommon, groupCredit, personal, totalPaid, totalExpenditure, balance, status, logCount: myLog.length };
}

function computeSettlements(computedMembers) {
  const debtors = [];
  const creditors = [];
  computedMembers.forEach((m) => {
    const bal = Math.round(m.balance * 100) / 100;
    if (bal > 0.5) debtors.push({ name: m.name, amt: bal });
    else if (bal < -0.5) creditors.push({ name: m.name, amt: -bal });
  });
  debtors.sort((a, b) => b.amt - a.amt);
  creditors.sort((a, b) => b.amt - a.amt);
  const txns = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    if (pay > 0.5) txns.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(pay) });
    debtors[i].amt -= pay;
    creditors[j].amt -= pay;
    if (debtors[i].amt <= 0.5) i++;
    if (creditors[j].amt <= 0.5) j++;
  }
  return txns;
}

async function loadKey(key, fallback) {
  try {
    const res = await window.storage.get(key, true);
    return res && res.value ? JSON.parse(res.value) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function saveKey(key, value) {
  try {
    const res = await window.storage.set(key, JSON.stringify(value), true);
    return !!res;
  } catch (e) {
    return false;
  }
}

/* ============================== STYLES ============================== */

const STYLES = `
.otm-root {
  --bg: #EDF1E8;
  --surface: #FFFFFF;
  --surface-soft: #F6F9F2;
  --ink: #1A2A1F;
  --ink-soft: #52604F;
  --ink-faint: #8B9686;
  --primary: #234B36;
  --primary-light: #3E6B4E;
  --primary-dark: #16332400;
  --accent: #C1892E;
  --accent-soft: #F0DBA8;
  --danger: #A64F3E;
  --danger-soft: #F4DCD5;
  --success: #2F7A52;
  --success-soft: #D9EBDD;
  --border: #DBE3D3;
  --shadow: rgba(24, 38, 26, 0.10);
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  color: var(--ink);
  background: var(--bg);
  min-height: 100vh;
  width: 100%;
}
.otm-root * { box-sizing: border-box; }
.otm-display { font-family: 'Fraunces', Georgia, serif; }
.otm-mono { font-family: 'IBM Plex Mono', monospace; }

.otm-loading { display:flex; align-items:center; justify-content:center; min-height:100vh; flex-direction:column; gap:12px; color:var(--ink-soft); }
.otm-spin { animation: otm-spin 1s linear infinite; }
@keyframes otm-spin { to { transform: rotate(360deg); } }

/* ---------- Auth screen ---------- */
.otm-auth-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; background:
  radial-gradient(circle at 15% 10%, #2c5a41 0%, transparent 45%),
  radial-gradient(circle at 85% 90%, #1a3527 0%, transparent 50%),
  var(--primary); }
.otm-auth-card { width:100%; max-width:440px; background:var(--surface); border-radius:18px; box-shadow: 0 24px 60px rgba(0,0,0,0.28); overflow:hidden; }
.otm-auth-head { background:var(--primary); color:#fff; padding:28px 28px 22px; position:relative; }
.otm-auth-head h1 { margin:0 0 4px; font-size:26px; font-weight:600; letter-spacing:0.2px; }
.otm-auth-head p { margin:0; color:#cfe0d3; font-size:13px; }
.otm-leaf { position:absolute; right:22px; top:22px; opacity:0.55; }
.otm-auth-body { padding:24px 28px 28px; }
.otm-auth-tabs { display:flex; gap:6px; margin-bottom:20px; background:var(--surface-soft); border-radius:10px; padding:4px; }
.otm-auth-tab { flex:1; text-align:center; padding:9px 0; border-radius:8px; font-size:13.5px; font-weight:600; cursor:pointer; color:var(--ink-soft); border:none; background:transparent; }
.otm-auth-tab.active { background:var(--primary); color:#fff; }
.otm-field { margin-bottom:14px; }
.otm-field label { display:block; font-size:12.5px; font-weight:600; color:var(--ink-soft); margin-bottom:5px; letter-spacing:0.2px; }
.otm-input, .otm-select, textarea.otm-input {
  width:100%; padding:10px 12px; border:1.5px solid var(--border); border-radius:9px; font-size:14px;
  background:var(--surface); color:var(--ink); font-family:inherit;
}
.otm-input:focus, .otm-select:focus, textarea.otm-input:focus { outline:2px solid var(--accent); outline-offset:1px; border-color:var(--accent); }
.otm-check-row { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--ink-soft); margin:10px 0 16px; }
.otm-btn {
  display:inline-flex; align-items:center; justify-content:center; gap:7px;
  padding:11px 18px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer;
  border:1.5px solid transparent; transition: transform 0.05s ease;
}
.otm-btn:active { transform: scale(0.98); }
.otm-btn-primary { background:var(--primary); color:#fff; width:100%; }
.otm-btn-primary:hover { background:var(--primary-light); }
.otm-btn-accent { background:var(--accent); color:#fff; }
.otm-btn-ghost { background:transparent; color:var(--primary); border-color:var(--border); }
.otm-btn-ghost:hover { background:var(--surface-soft); }
.otm-btn-danger { background:transparent; color:var(--danger); border-color:var(--danger-soft); }
.otm-btn-danger:hover { background:var(--danger-soft); }
.otm-btn-sm { padding:6px 11px; font-size:12.5px; border-radius:8px; }
.otm-err { background:var(--danger-soft); color:#7a2e1f; padding:9px 12px; border-radius:8px; font-size:13px; margin-bottom:14px; display:flex; gap:8px; align-items:flex-start; }
.otm-hint { font-size:12px; color:var(--ink-faint); margin-top:10px; line-height:1.5; }

/* ---------- App shell ---------- */
.otm-shell { display:flex; min-height:100vh; }
.otm-sidebar { width:236px; background:var(--primary); color:#fff; display:flex; flex-direction:column; padding:22px 14px; flex-shrink:0; }
.otm-brand { display:flex; align-items:center; gap:9px; padding:0 8px 20px; }
.otm-brand-name { font-family:'Fraunces', serif; font-size:18px; font-weight:600; line-height:1.15; }
.otm-brand-sub { font-size:11px; color:#bcd2c1; }
.otm-nav { display:flex; flex-direction:column; gap:3px; flex:1; }
.otm-nav-btn { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:9px; color:#dbe8dd; background:transparent; border:none; font-size:13.5px; font-weight:500; cursor:pointer; text-align:left; }
.otm-nav-btn:hover { background:rgba(255,255,255,0.08); color:#fff; }
.otm-nav-btn.active { background:rgba(255,255,255,0.16); color:#fff; font-weight:600; }
.otm-nav-btn.active svg { color:var(--accent-soft); }
.otm-sidebar-foot { border-top:1px solid rgba(255,255,255,0.15); padding-top:14px; margin-top:10px; }
.otm-user-chip { display:flex; align-items:center; gap:9px; padding:8px; border-radius:9px; margin-bottom:8px; }
.otm-avatar { width:32px; height:32px; border-radius:50%; background:var(--accent); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0; }
.otm-user-name { font-size:13px; font-weight:600; color:#fff; line-height:1.2; }
.otm-user-role { font-size:11px; color:#a9c6ae; }
.otm-logout { width:100%; }

.otm-main { flex:1; padding:30px 34px 60px; max-width:1180px; margin:0 auto; width:100%; }
.otm-topline { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:26px; gap:16px; flex-wrap:wrap; }
.otm-page-title { font-family:'Fraunces', serif; font-size:26px; font-weight:600; margin:0 0 4px; }
.otm-page-sub { font-size:13.5px; color:var(--ink-soft); margin:0; }

.otm-cards { display:grid; grid-template-columns:repeat(auto-fit, minmax(190px,1fr)); gap:14px; margin-bottom:26px; }
.otm-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px 18px; box-shadow:0 1px 2px var(--shadow); }
.otm-card-label { font-size:11.5px; text-transform:uppercase; letter-spacing:0.6px; color:var(--ink-faint); font-weight:600; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
.otm-card-value { font-family:'IBM Plex Mono', monospace; font-size:22px; font-weight:600; color:var(--ink); }
.otm-card-value.neg { color:var(--danger); }
.otm-card-value.pos { color:var(--success); }

.otm-panel { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:22px; margin-bottom:24px; }
.otm-panel-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px; }
.otm-panel-title { font-size:15.5px; font-weight:700; margin:0; display:flex; align-items:center; gap:8px; }

.otm-table { width:100%; border-collapse:collapse; font-size:13px; }
.otm-table th { text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.4px; color:var(--ink-faint); font-weight:700; padding:8px 10px; border-bottom:2px solid var(--border); white-space:nowrap; }
.otm-table td { padding:9px 10px; border-bottom:1px solid var(--border); vertical-align:middle; }
.otm-table tr:last-child td { border-bottom:none; }
.otm-table tr.clickable { cursor:pointer; }
.otm-table tr.clickable:hover { background:var(--surface-soft); }
.otm-num { font-family:'IBM Plex Mono', monospace; text-align:right; white-space:nowrap; }

.otm-stamp { display:inline-flex; align-items:center; gap:5px; padding:4px 10px 4px 8px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:0.4px; text-transform:uppercase; border:1.5px solid; }
.otm-stamp.topay { color:#7a2e1f; border-color:var(--danger); background:var(--danger-soft); }
.otm-stamp.toreceive { color:#1d5c3b; border-color:var(--success); background:var(--success-soft); }
.otm-stamp.settled { color:var(--ink-soft); border-color:var(--border); background:var(--surface-soft); }

.otm-empty { text-align:center; padding:34px 10px; color:var(--ink-faint); font-size:13.5px; }
.otm-inline-form { display:flex; gap:8px; flex-wrap:wrap; align-items:flex-end; margin-top:14px; padding-top:14px; border-top:1px dashed var(--border); }
.otm-inline-form .otm-field { margin-bottom:0; flex:1; min-width:120px; }

.otm-track { display:flex; align-items:center; gap:10px; margin:6px 0; }
.otm-track-name { font-weight:600; font-size:13.5px; background:var(--surface-soft); padding:6px 12px; border-radius:20px; border:1px solid var(--border); }
.otm-track-line { flex:1; height:0; border-top:2px dashed var(--accent-soft); position:relative; min-width:40px; }
.otm-track-amt { font-family:'IBM Plex Mono', monospace; font-weight:700; color:var(--accent); font-size:13px; background:#fff; padding:2px 8px; }

.otm-checklist-item { display:flex; align-items:center; gap:10px; padding:8px 4px; border-bottom:1px solid var(--border); }
.otm-checklist-item:last-child { border-bottom:none; }
.otm-checklist-item.done .otm-checklist-text { text-decoration:line-through; color:var(--ink-faint); }
.otm-checklist-text { flex:1; font-size:13.5px; }
.otm-check-btn { cursor:pointer; color:var(--primary); background:none; border:none; display:flex; padding:0; }

.otm-day-card { border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:14px; background:var(--surface-soft); }
.otm-day-title { font-weight:700; font-size:14.5px; margin-bottom:10px; display:flex; align-items:center; gap:8px; }

.otm-act { display:flex; gap:10px; padding:10px 4px; border-bottom:1px solid var(--border); align-items:flex-start; }
.otm-act:last-of-type { border-bottom:none; }
.otm-act.done .otm-act-text { text-decoration:line-through; color:var(--ink-faint); }
.otm-act-head { display:flex; align-items:baseline; gap:9px; flex-wrap:wrap; }
.otm-act-text { font-size:13.5px; font-weight:600; }
.otm-time { font-family:'IBM Plex Mono', monospace; font-size:11px; font-weight:600; color:var(--accent); background:#fff; border:1px solid var(--accent-soft); padding:2px 7px; border-radius:6px; white-space:nowrap; display:inline-flex; align-items:center; gap:3px; }
.otm-act-detail { font-size:12.5px; color:var(--ink-soft); line-height:1.5; margin-top:4px; }

.otm-food-item { padding:11px 2px; border-bottom:1px solid var(--border); }
.otm-food-item:last-child { border-bottom:none; }
.otm-food-name { font-weight:700; font-size:14px; margin-bottom:3px; }
.otm-food-note { font-size:12.5px; color:var(--ink-soft); line-height:1.5; }

.otm-rest-item { padding:12px 2px; border-bottom:1px solid var(--border); }
.otm-rest-item:last-child { border-bottom:none; }
.otm-rest-name { font-weight:700; font-size:14px; }
.otm-rest-cuisine { font-size:12px; color:var(--accent); font-weight:600; }

.otm-tabbar { display:flex; gap:6px; margin-bottom:20px; overflow-x:auto; border-bottom:1px solid var(--border); }
.otm-tabbar button { padding:9px 4px; margin-right:18px; border:none; background:none; font-size:13.5px; font-weight:600; color:var(--ink-faint); cursor:pointer; border-bottom:2.5px solid transparent; white-space:nowrap; }
.otm-tabbar button.active { color:var(--primary); border-bottom-color:var(--primary); }

.otm-banner { display:flex; align-items:center; gap:9px; background:var(--accent-soft); color:#6b4a12; padding:10px 14px; border-radius:10px; font-size:12.5px; margin-bottom:20px; }

@media (max-width: 860px) {
  .otm-shell { flex-direction:column; }
  .otm-sidebar { width:100%; flex-direction:row; align-items:center; overflow-x:auto; padding:12px 14px; gap:14px; }
  .otm-brand { padding:0; }
  .otm-nav { flex-direction:row; flex:none; }
  .otm-sidebar-foot { border-top:none; margin:0; padding:0; display:flex; align-items:center; gap:10px; }
  .otm-user-chip { margin-bottom:0; }
  .otm-main { padding:20px 16px 50px; }
}
`;

/* ============================== SMALL UI PIECES ============================== */

function StatusStamp({ status }) {
  const cls = status === "To Pay" ? "topay" : status === "To Receive" ? "toreceive" : "settled";
  const Icon = status === "To Pay" ? TrendingUp : status === "To Receive" ? TrendingDown : CheckCircle2;
  return (
    <span className={"otm-stamp " + cls}>
      <Icon size={12} /> {status}
    </span>
  );
}

function Card({ label, value, icon, tone }) {
  const Icon = icon;
  return (
    <div className="otm-card">
      <div className="otm-card-label"><Icon size={13} /> {label}</div>
      <div className={"otm-card-value otm-mono" + (tone ? " " + tone : "")}>{value}</div>
    </div>
  );
}

/* ============================== AUTH SCREEN ============================== */

function AuthScreen({ members, onRegister, onLogin, authError, busy }) {
  const [mode, setMode] = useState("login");
  const [loginU, setLoginU] = useState("");
  const [loginP, setLoginP] = useState("");
  const [regName, setRegName] = useState("");
  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regPass2, setRegPass2] = useState("");
  const [linkChoice, setLinkChoice] = useState("__new__");
  const [isAdmin, setIsAdmin] = useState(false);
  const [localErr, setLocalErr] = useState("");

  const unclaimed = members.filter((m) => !m.claimed);

  function submitLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    setLocalErr("");
    if (!loginU || !loginP) { setLocalErr("Enter your username and password."); return; }
    onLogin(loginU.trim().toLowerCase(), loginP);
  }
  function loginKeyDown(e) { if (e.key === "Enter") submitLogin(e); }

  function submitRegister(e) {
    if (e && e.preventDefault) e.preventDefault();
    setLocalErr("");
    if (!regName.trim() || !regUser.trim() || !regPass) { setLocalErr("Please fill in your name, username and password."); return; }
    if (regPass.length < 4) { setLocalErr("Password should be at least 4 characters."); return; }
    if (regPass !== regPass2) { setLocalErr("Passwords do not match."); return; }
    onRegister({
      displayName: regName.trim(),
      username: regUser.trim().toLowerCase(),
      password: regPass,
      linkChoice,
      isAdmin,
    });
  }
  function registerKeyDown(e) { if (e.key === "Enter") submitRegister(e); }

  const err = localErr || authError;

  return (
    <div className="otm-auth-wrap">
      <div className="otm-auth-card">
        <div className="otm-auth-head">
          <Sprout size={20} className="otm-leaf" />
          <h1 className="otm-display">Ooty Trip Manager</h1>
          <p>Shared budget & itinerary tracker for the whole group</p>
        </div>
        <div className="otm-auth-body">
          <div className="otm-auth-tabs">
            <button className={"otm-auth-tab" + (mode === "login" ? " active" : "")} onClick={() => setMode("login")}>Log in</button>
            <button className={"otm-auth-tab" + (mode === "register" ? " active" : "")} onClick={() => setMode("register")}>Register</button>
          </div>

          {err && <div className="otm-err"><AlertCircle size={15} /> <span>{err}</span></div>}

          {mode === "login" ? (
            <div onKeyDown={loginKeyDown}>
              <div className="otm-field">
                <label>Username</label>
                <input className="otm-input" value={loginU} onChange={(e) => setLoginU(e.target.value)} placeholder="e.g. sai.krishna" autoFocus />
              </div>
              <div className="otm-field">
                <label>Password</label>
                <input className="otm-input" type="password" value={loginP} onChange={(e) => setLoginP(e.target.value)} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022" />
              </div>
              <button className="otm-btn otm-btn-primary" type="button" onClick={submitLogin} disabled={busy}>
                {busy ? <Loader2 size={15} className="otm-spin" /> : <LogIn size={15} />} Log in
              </button>
            </div>
          ) : (
            <div onKeyDown={registerKeyDown}>
              <div className="otm-field">
                <label>Your name</label>
                <input className="otm-input" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="otm-field">
                <label>Choose username</label>
                <input className="otm-input" value={regUser} onChange={(e) => setRegUser(e.target.value)} placeholder="e.g. sai.krishna" />
              </div>
              <div className="otm-field">
                <label>Password</label>
                <input className="otm-input" type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} placeholder="At least 4 characters" />
              </div>
              <div className="otm-field">
                <label>Confirm password</label>
                <input className="otm-input" type="password" value={regPass2} onChange={(e) => setRegPass2(e.target.value)} />
              </div>
              <div className="otm-field">
                <label>Link to a name already on the budget sheet</label>
                <select className="otm-select" value={linkChoice} onChange={(e) => setLinkChoice(e.target.value)}>
                  <option value="__new__">{"I'm not listed \u2014 add me as a new traveller"}</option>
                  {unclaimed.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <label className="otm-check-row">
                <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
                I'm the trip organizer (can edit shared costs & members)
              </label>
              <button className="otm-btn otm-btn-primary" type="button" onClick={submitRegister} disabled={busy}>
                {busy ? <Loader2 size={15} className="otm-spin" /> : <UserPlus size={15} />} Create account
              </button>
            </div>
          )}
          <p className="otm-hint">
            {"Data is saved in this browser only \u2014 it is NOT synced between different phones/computers. Everyone in the group should log in from the same shared device/browser to see the same numbers, or ask the organizer for a version with shared online storage. Passwords are hashed before saving, but this is a lightweight tool for a trusted friend group, not bank-grade security."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================== SIDEBAR ============================== */

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "myexpenses", label: "My Expenses", icon: Wallet },
  { key: "members", label: "Members", icon: Users },
  { key: "common", label: "Common Expenses", icon: Receipt },
  { key: "settle", label: "Settle Up", icon: ArrowLeftRight },
  { key: "itinerary", label: "Itinerary & Packing", icon: MapPin },
];

function Sidebar({ active, setActive, currentUser, tripName, onLogout }) {
  const initials = (currentUser.displayName || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="otm-sidebar">
      <div className="otm-brand">
        <TrainFront size={22} />
        <div>
          <div className="otm-brand-name">{tripName}</div>
          <div className="otm-brand-sub">Trip Budget & Planner</div>
        </div>
      </div>
      <div className="otm-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.key} className={"otm-nav-btn" + (active === item.key ? " active" : "")} onClick={() => setActive(item.key)}>
              <Icon size={16} /> {item.label}
            </button>
          );
        })}
      </div>
      <div className="otm-sidebar-foot">
        <div className="otm-user-chip">
          <div className="otm-avatar">{initials}</div>
          <div>
            <div className="otm-user-name">{currentUser.displayName}</div>
            <div className="otm-user-role">{currentUser.role === "admin" ? "Trip organizer" : "Traveller"}</div>
          </div>
        </div>
        <button className="otm-btn otm-btn-ghost otm-btn-sm otm-logout" onClick={onLogout} style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
          <LogOut size={13} /> Log out
        </button>
      </div>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */

function DashboardTab({ appData, computedMembers, logEntries }) {
  const symbol = appData.tripInfo.currency;
  const totalCollected = computedMembers.reduce((s, m) => s + m.totalPaid, 0);
  const totalCommon = appData.commonExpenses.reduce((s, e) => s + (Number(e.totalCost) || 0), 0);
  const totalPersonal = computedMembers.reduce((s, m) => s + m.personal, 0);
  const totalExpenditure = computedMembers.reduce((s, m) => s + m.totalExpenditure, 0);
  const outstanding = computedMembers.reduce((s, m) => s + Math.max(0, m.balance), 0);

  const chartData = useMemo(() => {
    return [...computedMembers]
      .sort((a, b) => b.balance - a.balance)
      .map((m) => ({ name: m.name, balance: Math.round(m.balance), fill: m.balance >= 0 ? "#A64F3E" : "#2F7A52" }));
  }, [computedMembers]);

  const pieData = [
    { name: "Train", value: computedMembers.reduce((s, m) => s + m.trainShare, 0) },
    { name: "Resort & shared", value: computedMembers.reduce((s, m) => s + m.sharedShare, 0) },
    { name: "Personal spends", value: totalPersonal },
  ].filter((d) => d.value > 0.5);
  const pieColors = ["#234B36", "#C1892E", "#3E6B4E"];

  return (
    <div>
      <div className="otm-topline">
        <div>
          <h1 className="otm-page-title">Trip Dashboard</h1>
          <p className="otm-page-sub">{appData.tripInfo.destination} · {appData.members.length} travellers</p>
        </div>
      </div>

      <div className="otm-cards">
        <Card label="Total Collected" value={formatMoney(totalCollected, symbol)} icon={PiggyBank} />
        <Card label="Common Expenses" value={formatMoney(totalCommon, symbol)} icon={Receipt} />
        <Card label="Personal Spends" value={formatMoney(totalPersonal, symbol)} icon={Wallet} />
        <Card label="Total Expenditure" value={formatMoney(totalExpenditure, symbol)} icon={TrendingUp} />
        <Card label="Still To Collect" value={formatMoney(outstanding, symbol)} icon={AlertCircle} tone={outstanding > 0 ? "neg" : "pos"} />
      </div>

      <div className="otm-panel">
        <div className="otm-panel-head">
          <h3 className="otm-panel-title"><ArrowLeftRight size={16} /> Balance by member</h3>
        </div>
        <ResponsiveContainer width="100%" height={Math.max(260, computedMembers.length * 30)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#DBE3D3" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11.5 }} />
            <Tooltip formatter={(v) => formatMoney(v, symbol)} />
            <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, idx) => (<Cell key={idx} fill={entry.fill} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="otm-hint">Red bars still owe money to the group; green bars are owed money back.</p>
      </div>

      <div className="otm-panel">
        <div className="otm-panel-head">
          <h3 className="otm-panel-title"><Receipt size={16} /> Where the money is going</h3>
        </div>
        {pieData.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                {pieData.map((entry, idx) => (<Cell key={idx} fill={pieColors[idx % pieColors.length]} />))}
              </Pie>
              <Legend />
              <Tooltip formatter={(v) => formatMoney(v, symbol)} />
            </PieChart>
          </ResponsiveContainer>
        ) : <div className="otm-empty">Log some expenses to see the breakdown.</div>}
      </div>
    </div>
  );
}

/* ============================== MY EXPENSES ============================== */

function MyExpensesTab({ currentUser, appData, logEntries, onAddExpense, onDeleteExpense }) {
  const symbol = appData.tripInfo.currency;
  const member = appData.members.find((m) => m.id === currentUser.memberId);
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Personal");
  const [category, setCategory] = useState("Other");

  if (!member) {
    return <div className="otm-empty">Your account isn't linked to a traveller profile yet.</div>;
  }

  const computed = computeMember(member, appData.commonExpenses, logEntries);
  const myLog = logEntries.filter((e) => e.memberId === member.id).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!desc.trim() || !amount || Number(amount) <= 0) return;
    onAddExpense({
      id: uid("exp"),
      memberId: member.id,
      date: date || new Date().toISOString().slice(0, 10),
      description: desc.trim(),
      amount: Number(amount),
      type,
      category,
    });
    setDesc(""); setAmount(""); setDate("");
  }

  return (
    <div>
      <div className="otm-topline">
        <div>
          <h1 className="otm-page-title">My Expenses</h1>
          <p className="otm-page-sub">Personal ledger for {member.name}</p>
        </div>
        <StatusStamp status={computed.status} />
      </div>

      <div className="otm-cards">
        <Card label="Advance Paid" value={formatMoney(member.advancePaid, symbol)} icon={PiggyBank} />
        <Card label="Group Spends Credit" value={formatMoney(computed.groupCredit, symbol)} icon={Receipt} />
        <Card label="Share of Common Costs" value={formatMoney(computed.shareOfCommon, symbol)} icon={TrainFront} />
        <Card label="Personal Spends" value={formatMoney(computed.personal, symbol)} icon={Wallet} />
        <Card label="Final Balance" value={formatMoney(Math.abs(computed.balance), symbol)} icon={ArrowLeftRight} tone={computed.balance > 0.5 ? "neg" : computed.balance < -0.5 ? "pos" : undefined} />
      </div>

      <div className="otm-panel">
        <div className="otm-panel-head">
          <h3 className="otm-panel-title"><Plus size={16} /> Log an expense</h3>
        </div>
        <div className="otm-inline-form" onKeyDown={(e) => { if (e.key === "Enter") submit(e); }}>
          <div className="otm-field">
            <label>Date</label>
            <input className="otm-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="otm-field" style={{ flex: 2 }}>
            <label>Description</label>
            <input className="otm-input" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Auto fare, souvenirs..." />
          </div>
          <div className="otm-field">
            <label>Amount ({symbol})</label>
            <input className="otm-input" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>
          <div className="otm-field">
            <label>Category</label>
            <select className="otm-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div className="otm-field">
            <label>Type</label>
            <select className="otm-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Personal">Personal (just for me)</option>
              <option value="Group">Group (I paid, reimburse me)</option>
            </select>
          </div>
          <button className="otm-btn otm-btn-accent" type="button" onClick={submit}><Save size={14} /> Add</button>
        </div>
        <p className="otm-hint">
          <b>Personal</b> expenses count only toward your own total. <b>Group</b> expenses mean you fronted money
          for the whole trip out of pocket — it's credited back to you automatically, just like the "Group Expenses Paid" column in the original tracker.
        </p>
      </div>

      <div className="otm-panel">
        <div className="otm-panel-head">
          <h3 className="otm-panel-title"><Receipt size={16} /> Expense log</h3>
        </div>
        {myLog.length ? (
          <table className="otm-table">
            <thead>
              <tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th className="otm-num">Amount</th><th></th></tr>
            </thead>
            <tbody>
              {myLog.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.description}</td>
                  <td>{e.category}</td>
                  <td>{e.type}</td>
                  <td className="otm-num">{formatMoney(e.amount, symbol)}</td>
                  <td><button className="otm-btn otm-btn-ghost otm-btn-sm" onClick={() => onDeleteExpense(e.id)}><Trash2 size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="otm-empty">No expenses logged yet. Add your first one above.</div>}
      </div>
    </div>
  );
}

/* ============================== MEMBERS ============================== */

function MembersTab({ appData, computedMembers, logEntries, currentUser, onUpdateMember, onAddMember, onDeleteMember }) {
  const symbol = appData.tripInfo.currency;
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const isAdmin = currentUser.role === "admin";

  const sorted = [...computedMembers].sort((a, b) => b.balance - a.balance);

  function startEdit(m) {
    setEditingId(m.id);
    setDraft({ advancePaid: m.advancePaid, legs: { ...m.legs } });
  }
  function saveEdit(id) {
    onUpdateMember(id, draft);
    setEditingId(null); setDraft(null);
  }

  return (
    <div>
      <div className="otm-topline">
        <div>
          <h1 className="otm-page-title">All Members</h1>
          <p className="otm-page-sub">{appData.members.length} travellers · checking every person's expenditure at a glance</p>
        </div>
        {isAdmin && <button className="otm-btn otm-btn-accent otm-btn-sm" onClick={() => setShowAdd((s) => !s)}><Plus size={14} /> Add traveller</button>}
      </div>

      {showAdd && (
        <div className="otm-panel">
          <div className="otm-inline-form" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
            <div className="otm-field">
              <label>Name</label>
              <input className="otm-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Traveller name" />
            </div>
            <button className="otm-btn otm-btn-primary" onClick={() => { if (newName.trim()) { onAddMember(newName.trim()); setNewName(""); setShowAdd(false); } }}>Add</button>
          </div>
        </div>
      )}

      <div className="otm-panel" style={{ overflowX: "auto" }}>
        <table className="otm-table">
          <thead>
            <tr>
              <th>Name</th><th className="otm-num">Advance</th><th className="otm-num">Group Credit</th>
              <th className="otm-num">Total Paid</th><th className="otm-num">Common Share</th>
              <th className="otm-num">Personal</th><th className="otm-num">Total Spend</th>
              <th className="otm-num">Balance</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <React.Fragment key={m.id}>
                <tr className="clickable" onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                  <td style={{ fontWeight: 600 }}>{expandedId === m.id ? <ChevronUp size={12} style={{ marginRight: 4 }} /> : <ChevronDown size={12} style={{ marginRight: 4 }} />}{m.name}</td>
                  <td className="otm-num">{formatMoney(m.advancePaid, symbol)}</td>
                  <td className="otm-num">{formatMoney(m.groupCredit, symbol)}</td>
                  <td className="otm-num">{formatMoney(m.totalPaid, symbol)}</td>
                  <td className="otm-num">{formatMoney(m.shareOfCommon, symbol)}</td>
                  <td className="otm-num">{formatMoney(m.personal, symbol)}</td>
                  <td className="otm-num">{formatMoney(m.totalExpenditure, symbol)}</td>
                  <td className="otm-num" style={{ fontWeight: 700, color: m.balance > 0.5 ? "var(--danger)" : m.balance < -0.5 ? "var(--success)" : "inherit" }}>{formatMoney(Math.abs(m.balance), symbol)}</td>
                  <td><StatusStamp status={m.status} /></td>
                  <td>{isAdmin && <button className="otm-btn otm-btn-ghost otm-btn-sm" onClick={(ev) => { ev.stopPropagation(); startEdit(m); }}><Pencil size={12} /></button>}</td>
                </tr>
                {expandedId === m.id && (
                  <tr>
                    <td colSpan={10} style={{ background: "var(--surface-soft)" }}>
                      {editingId === m.id ? (
                        <div style={{ padding: 10 }}>
                          <div className="otm-field" style={{ maxWidth: 220 }}>
                            <label>Advance paid ({symbol})</label>
                            <input className="otm-input" type="number" value={draft.advancePaid} onChange={(e) => setDraft({ ...draft, advancePaid: Number(e.target.value) })} />
                          </div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>Train legs taken</label>
                          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", margin: "6px 0 12px" }}>
                            {TRAIN_LEGS.map((leg) => (
                              <label key={leg.key} style={{ fontSize: 12.5, display: "flex", gap: 6, alignItems: "center" }}>
                                <input type="checkbox" checked={!!draft.legs[leg.key]} onChange={(e) => setDraft({ ...draft, legs: { ...draft.legs, [leg.key]: e.target.checked } })} />
                                {leg.label}
                              </label>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="otm-btn otm-btn-primary otm-btn-sm" onClick={() => saveEdit(m.id)}><Save size={12} /> Save</button>
                            <button className="otm-btn otm-btn-ghost otm-btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                            {isAdmin && <button className="otm-btn otm-btn-danger otm-btn-sm" onClick={() => { onDeleteMember(m.id); setEditingId(null); setExpandedId(null); }}><Trash2 size={12} /> Remove traveller</button>}
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: "10px 4px" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 6 }}>EXPENSE LOG</div>
                          {logEntries.filter((e) => e.memberId === m.id).length ? (
                            <table className="otm-table">
                              <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th className="otm-num">Amount</th></tr></thead>
                              <tbody>
                                {logEntries.filter((e) => e.memberId === m.id).map((e) => (
                                  <tr key={e.id}><td>{e.date}</td><td>{e.description}</td><td>{e.category}</td><td>{e.type}</td><td className="otm-num">{formatMoney(e.amount, symbol)}</td></tr>
                                ))}
                              </tbody>
                            </table>
                          ) : <div className="otm-empty" style={{ padding: 12 }}>No personal or group expenses logged yet.</div>}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================== COMMON EXPENSES ============================== */

function CommonExpensesTab({ appData, currentUser, onUpdateExpense, onAddExpense, onDeleteExpense }) {
  const symbol = appData.tripInfo.currency;
  const isAdmin = currentUser.role === "admin";
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newSplit, setNewSplit] = useState(appData.members.length);

  function startEdit(e) { setEditingId(e.id); setDraft({ totalCost: e.totalCost, advancePaid: e.advancePaid, splitAmong: e.splitAmong }); }
  function saveEdit(id) { onUpdateExpense(id, draft); setEditingId(null); setDraft(null); }

  const totalAll = appData.commonExpenses.reduce((s, e) => s + (Number(e.totalCost) || 0), 0);
  const totalAdvance = appData.commonExpenses.reduce((s, e) => s + (Number(e.advancePaid) || 0), 0);

  return (
    <div>
      <div className="otm-topline">
        <div>
          <h1 className="otm-page-title">Common Expenses</h1>
          <p className="otm-page-sub">Shared trip costs — train legs, resort, food, transport & tickets</p>
        </div>
        {isAdmin && <button className="otm-btn otm-btn-accent otm-btn-sm" onClick={() => setShowAdd((s) => !s)}><Plus size={14} /> Add category</button>}
      </div>

      {!isAdmin && (
        <div className="otm-banner"><ShieldCheck size={15} /> Only the trip organizer can edit shared costs. Ask them if something needs updating.</div>
      )}

      {showAdd && isAdmin && (
        <div className="otm-panel">
          <div className="otm-inline-form" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
            <div className="otm-field" style={{ flex: 2 }}><label>Category name</label><input className="otm-input" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. Snacks & water bottles" /></div>
            <div className="otm-field"><label>Total cost ({symbol})</label><input className="otm-input" type="number" value={newCost} onChange={(e) => setNewCost(e.target.value)} /></div>
            <div className="otm-field"><label>Split among (#)</label><input className="otm-input" type="number" value={newSplit} onChange={(e) => setNewSplit(e.target.value)} /></div>
            <button className="otm-btn otm-btn-primary" onClick={() => { if (newCat.trim()) { onAddExpense({ id: uid("ce"), category: newCat.trim(), totalCost: Number(newCost) || 0, advancePaid: 0, splitAmong: Number(newSplit) || 1, type: "shared", legKey: null }); setNewCat(""); setNewCost(""); setShowAdd(false); } }}>Add</button>
          </div>
        </div>
      )}

      <div className="otm-panel" style={{ overflowX: "auto" }}>
        <table className="otm-table">
          <thead><tr><th>Category</th><th>Type</th><th className="otm-num">Total Cost</th><th className="otm-num">Advance Paid</th><th className="otm-num">Split Among</th><th className="otm-num">Cost / Person</th><th></th></tr></thead>
          <tbody>
            {appData.commonExpenses.map((e) => {
              const perPerson = (Number(e.totalCost) || 0) / (Number(e.splitAmong) || 1);
              return (
                <tr key={e.id}>
                  <td>{e.category}</td>
                  <td>{e.type === "train" ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}><TrainFront size={13} /> Train</span> : <span style={{ fontSize: 12 }}>Shared</span>}</td>
                  {editingId === e.id ? (
                    <>
                      <td className="otm-num"><input className="otm-input" style={{ width: 90, textAlign: "right" }} type="number" value={draft.totalCost} onChange={(ev) => setDraft({ ...draft, totalCost: ev.target.value })} /></td>
                      <td className="otm-num"><input className="otm-input" style={{ width: 90, textAlign: "right" }} type="number" value={draft.advancePaid} onChange={(ev) => setDraft({ ...draft, advancePaid: ev.target.value })} /></td>
                      <td className="otm-num"><input className="otm-input" style={{ width: 70, textAlign: "right" }} type="number" value={draft.splitAmong} onChange={(ev) => setDraft({ ...draft, splitAmong: ev.target.value })} /></td>
                      <td className="otm-num">{formatMoney((Number(draft.totalCost) || 0) / (Number(draft.splitAmong) || 1), symbol)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="otm-btn otm-btn-primary otm-btn-sm" onClick={() => saveEdit(e.id)}><Save size={12} /></button>
                          <button className="otm-btn otm-btn-ghost otm-btn-sm" onClick={() => setEditingId(null)}><X size={12} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="otm-num">{formatMoney(e.totalCost, symbol)}</td>
                      <td className="otm-num">{formatMoney(e.advancePaid, symbol)}</td>
                      <td className="otm-num">{e.splitAmong}</td>
                      <td className="otm-num" style={{ fontWeight: 600 }}>{formatMoney(perPerson, symbol)}</td>
                      <td>{isAdmin && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="otm-btn otm-btn-ghost otm-btn-sm" onClick={() => startEdit(e)}><Pencil size={12} /></button>
                          <button className="otm-btn otm-btn-danger otm-btn-sm" onClick={() => onDeleteExpense(e.id)}><Trash2 size={12} /></button>
                        </div>
                      )}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tbody>
            <tr style={{ fontWeight: 700 }}>
              <td>Total</td><td></td>
              <td className="otm-num">{formatMoney(totalAll, symbol)}</td>
              <td className="otm-num">{formatMoney(totalAdvance, symbol)}</td>
              <td></td><td></td><td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="otm-hint">Train categories are split only across the travellers on that specific leg (edit legs from the Members tab). Resort, food, transport and tickets are split across everyone by default.</p>
    </div>
  );
}

/* ============================== SETTLE UP ============================== */

function SettleUpTab({ appData, computedMembers }) {
  const symbol = appData.tripInfo.currency;
  const txns = useMemo(() => computeSettlements(computedMembers), [computedMembers]);
  const [settled, setSettled] = useState({});

  return (
    <div>
      <div className="otm-topline">
        <div>
          <h1 className="otm-page-title">Settle Up</h1>
          <p className="otm-page-sub">The fewest payments needed to bring everyone to zero</p>
        </div>
      </div>

      <div className="otm-panel">
        {txns.length ? (
          txns.map((t, idx) => {
            const key = t.from + "->" + t.to;
            const done = !!settled[key];
            return (
              <div className="otm-track" key={idx} style={{ opacity: done ? 0.45 : 1 }}>
                <span className="otm-track-name">{t.from}</span>
                <div className="otm-track-line"><span className="otm-track-amt" style={{ position: "absolute", left: "50%", top: -11, transform: "translateX(-50%)" }}>{formatMoney(t.amount, symbol)}</span></div>
                <TrainFront size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                <span className="otm-track-name">{t.to}</span>
                <button className="otm-btn otm-btn-ghost otm-btn-sm" onClick={() => setSettled((s) => ({ ...s, [key]: !done }))}>
                  {done ? <Circle size={12} /> : <CheckCircle2 size={12} />} {done ? "Undo" : "Mark paid"}
                </button>
              </div>
            );
          })
        ) : <div className="otm-empty">Everyone is settled up — nothing to pay!</div>}
      </div>
      <p className="otm-hint">This uses the same debt-simplification idea Splitwise popularized: instead of everyone paying everyone, only the minimum number of transfers happen. "Mark paid" is just a visual checklist — it doesn't change anyone's balance.</p>
    </div>
  );
}

/* ============================== ITINERARY & PACKING ============================== */

function ItineraryTab({ planData, onUpdatePlan, isAdmin, currentUser, onRequestPacking, onRequestContact, packReqs, contactReqs, onApprovePackReq, onRejectPackReq, onApproveContactReq, onRejectContactReq }) {
  const [tab, setTab] = useState("itinerary");
  const [newItem, setNewItem] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newActivityFor, setNewActivityFor] = useState({});

  const weather = planData.weather || { days: [], tips: [] };
  const food = planData.food || [];
  const restaurants = planData.restaurants || [];

  function toggleActivity(dayId, actId) {
    const days = planData.days.map((d) => d.id !== dayId ? d : { ...d, activities: d.activities.map((a) => a.id === actId ? { ...a, done: !a.done } : a) });
    onUpdatePlan({ ...planData, days });
  }
  function addActivity(dayId) {
    const text = (newActivityFor[dayId] || "").trim();
    if (!text) return;
    const days = planData.days.map((d) => d.id !== dayId ? d : { ...d, activities: [...d.activities, { id: uid("act"), text, detail: "", time: "", done: false }] });
    onUpdatePlan({ ...planData, days });
    setNewActivityFor({ ...newActivityFor, [dayId]: "" });
  }
  function removeActivity(dayId, actId) {
    const days = planData.days.map((d) => d.id !== dayId ? d : { ...d, activities: d.activities.filter((a) => a.id !== actId) });
    onUpdatePlan({ ...planData, days });
  }
  function togglePacking(id) {
    onUpdatePlan({ ...planData, packing: planData.packing.map((p) => p.id === id ? { ...p, checked: !p.checked } : p) });
  }
  function addPacking() {
    if (!newItem.trim()) return;
    onUpdatePlan({ ...planData, packing: [...planData.packing, { id: uid("pk"), text: newItem.trim(), checked: false, cat: "Added" }] });
    setNewItem("");
  }
  function removePacking(id) {
    onUpdatePlan({ ...planData, packing: planData.packing.filter((p) => p.id !== id) });
  }
  function addContact() {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    onUpdatePlan({ ...planData, contacts: [...(planData.contacts || []), { id: uid("ct"), name: newContactName.trim(), phone: newContactPhone.trim() }] });
    setNewContactName(""); setNewContactPhone("");
  }
  function removeContact(id) {
    onUpdatePlan({ ...planData, contacts: planData.contacts.filter((c) => c.id !== id) });
  }

  // group packing by category, in stable order
  const packCats = [];
  (planData.packing || []).forEach((p) => { const c = p.cat || "Other"; if (!packCats.includes(c)) packCats.push(c); });

  const tierOrder = ["Cheap & best", "Mid-range", "Luxury"];
  const tierMeta = {
    "Cheap & best": { cls: "toreceive", stars: 1 },
    "Mid-range": { cls: "settled", stars: 2 },
    "Luxury": { cls: "topay", stars: 3 },
  };

  return (
    <div>
      <div className="otm-topline">
        <div>
          <h1 className="otm-page-title">Itinerary & Trip Guide</h1>
          <p className="otm-page-sub">The day plan, weather, packing, food & where to eat — all in one place</p>
        </div>
      </div>

      <div className="otm-tabbar">
        <button className={tab === "itinerary" ? "active" : ""} onClick={() => setTab("itinerary")}><CalendarDays size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Day plan</button>
        <button className={tab === "weather" ? "active" : ""} onClick={() => setTab("weather")}><CloudRain size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Weather</button>
        <button className={tab === "packing" ? "active" : ""} onClick={() => setTab("packing")}><Luggage size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Packing</button>
        <button className={tab === "food" ? "active" : ""} onClick={() => setTab("food")}><UtensilsCrossed size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Food to try</button>
        <button className={tab === "restaurants" ? "active" : ""} onClick={() => setTab("restaurants")}><Coffee size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Where to eat</button>
        <button className={tab === "contacts" ? "active" : ""} onClick={() => setTab("contacts")}><ShieldCheck size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Contacts & notes</button>
      </div>

      {tab === "itinerary" && (
        <div>
          <div className="otm-banner"><Route size={15} /> Route is decided for you: take the Gudalur road both ways (~155–160 km, 4–4.5 hrs). Cross the Bandipur forest only 6 AM–9 PM.</div>
          {planData.days.map((day) => (
            <div className="otm-day-card" key={day.id}>
              <div className="otm-day-title"><CalendarDays size={14} /> {day.title}</div>
              {day.subtitle && <div style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "-4px 0 12px", paddingLeft: 22 }}>{day.subtitle}</div>}
              {day.activities.map((a) => (
                <div className={"otm-act" + (a.done ? " done" : "")} key={a.id}>
                  <button className="otm-check-btn" onClick={() => toggleActivity(day.id, a.id)} style={{ marginTop: 2 }}>{a.done ? <CheckCircle2 size={17} /> : <Circle size={17} />}</button>
                  <div style={{ flex: 1 }}>
                    <div className="otm-act-head">
                      {a.time && <span className="otm-time"><Clock size={11} /> {a.time}</span>}
                      <span className="otm-act-text">{a.text}</span>
                    </div>
                    {a.detail && <div className="otm-act-detail">{a.detail}</div>}
                  </div>
                  {isAdmin && <button className="otm-btn otm-btn-ghost otm-btn-sm" onClick={() => removeActivity(day.id, a.id)}><Trash2 size={11} /></button>}
                </div>
              ))}
              {isAdmin && (
                <div className="otm-inline-form" style={{ marginTop: 10, paddingTop: 10 }}>
                  <input className="otm-input" placeholder="Add activity..." value={newActivityFor[day.id] || ""} onChange={(e) => setNewActivityFor({ ...newActivityFor, [day.id]: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") addActivity(day.id); }} />
                  <button className="otm-btn otm-btn-ghost otm-btn-sm" onClick={() => addActivity(day.id)}><Plus size={13} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "weather" && (
        <div>
          <div className="otm-panel">
            <div className="otm-panel-head">
              <h3 className="otm-panel-title"><CloudRain size={16} /> {weather.location || "Weather"}</h3>
            </div>
            {weather.summary && <p style={{ fontSize: 13.5, color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.55 }}>{weather.summary}</p>}
            <div className="otm-cards" style={{ marginBottom: 8 }}>
              {(weather.days || []).map((d, i) => (
                <div className="otm-card" key={i}>
                  <div className="otm-card-label">{d.label}</div>
                  <div className="otm-card-value otm-mono" style={{ fontSize: 19 }}>{d.value}</div>
                  {d.note && <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 4 }}>{d.note}</div>}
                </div>
              ))}
            </div>
            {weather.asOf && <p className="otm-hint" style={{ marginTop: 12 }}><Info size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{weather.asOf}</p>}
          </div>
          {(weather.tips || []).length > 0 && (
            <div className="otm-panel">
              <div className="otm-panel-head"><h3 className="otm-panel-title"><AlertCircle size={16} /> Monsoon travel tips</h3></div>
              {weather.tips.map((t, i) => (
                <div className="otm-checklist-item" key={i}>
                  <CloudRain size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <span className="otm-checklist-text">{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "packing" && (
        <div>
          {packCats.map((cat) => (
            <div className="otm-panel" key={cat} style={{ marginBottom: 16 }}>
              <div className="otm-panel-head"><h3 className="otm-panel-title"><Luggage size={15} /> {cat}</h3></div>
              {(planData.packing || []).filter((p) => (p.cat || "Other") === cat).map((p) => (
                <div className={"otm-checklist-item" + (p.checked ? " done" : "")} key={p.id}>
                  <button className="otm-check-btn" onClick={() => togglePacking(p.id)}>{p.checked ? <CheckCircle2 size={17} /> : <Circle size={17} />}</button>
                  <span className="otm-checklist-text">{p.text}</span>
                  {isAdmin && <button className="otm-btn otm-btn-ghost otm-btn-sm" onClick={() => removePacking(p.id)}><Trash2 size={11} /></button>}
                </div>
              ))}
            </div>
          ))}
          <div className="otm-panel">
            {isAdmin ? (
              <div className="otm-inline-form" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
                <input className="otm-input" placeholder="Add packing item..." value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addPacking(); }} />
                <button className="otm-btn otm-btn-accent otm-btn-sm" onClick={addPacking}><Plus size={13} /> Add</button>
              </div>
            ) : (
              <div>
                <div className="otm-banner" style={{ marginBottom: 10 }}><Info size={14} /> You can check off items. To suggest a new packing item, use the request form below — the trip organizer will approve it.</div>
                <div className="otm-inline-form" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
                  <input className="otm-input" placeholder="Suggest an item..." value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { if (newItem.trim()) { onRequestPacking({ id: uid("pkr"), text: newItem.trim(), cat: "Requested", requestedBy: currentUser.displayName, requestedAt: new Date().toISOString() }); setNewItem(""); } } }} />
                  <button className="otm-btn otm-btn-ghost otm-btn-sm" type="button" onClick={() => { if (newItem.trim()) { onRequestPacking({ id: uid("pkr"), text: newItem.trim(), cat: "Requested", requestedBy: currentUser.displayName, requestedAt: new Date().toISOString() }); setNewItem(""); } }}><Plus size={13} /> Request</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "packing" && isAdmin && packReqs && packReqs.length > 0 && (
        <div className="otm-panel" style={{ marginTop: 12 }}>
          <h3 className="otm-panel-title" style={{ marginBottom: 10, color: "var(--accent)" }}>Pending packing requests ({packReqs.length})</h3>
          {packReqs.map((r) => (
            <div key={r.id} className="otm-checklist-item" style={{ justifyContent: "space-between" }}>
              <span className="otm-checklist-text"><b>{r.text}</b> <span style={{ color: "var(--muted)", fontSize: 12 }}>— requested by {r.requestedBy}</span></span>
              <span style={{ display: "flex", gap: 6 }}>
                <button className="otm-btn otm-btn-accent otm-btn-sm" type="button" onClick={() => onApprovePackReq(r.id)}>Approve</button>
                <button className="otm-btn otm-btn-ghost otm-btn-sm" type="button" onClick={() => onRejectPackReq(r.id)}>Reject</button>
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "contacts" && isAdmin && contactReqs && contactReqs.length > 0 && (
        <div className="otm-panel" style={{ marginTop: 12 }}>
          <h3 className="otm-panel-title" style={{ marginBottom: 10, color: "var(--accent)" }}>Pending contact requests ({contactReqs.length})</h3>
          {contactReqs.map((r) => (
            <div key={r.id} className="otm-checklist-item" style={{ justifyContent: "space-between" }}>
              <span className="otm-checklist-text"><b>{r.name}</b> {r.phone} <span style={{ color: "var(--muted)", fontSize: 12 }}>— by {r.requestedBy}</span></span>
              <span style={{ display: "flex", gap: 6 }}>
                <button className="otm-btn otm-btn-accent otm-btn-sm" type="button" onClick={() => onApproveContactReq(r.id)}>Approve</button>
                <button className="otm-btn otm-btn-ghost otm-btn-sm" type="button" onClick={() => onRejectContactReq(r.id)}>Reject</button>
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "food" && (
        <div className="otm-panel">
          <div className="otm-panel-head"><h3 className="otm-panel-title"><UtensilsCrossed size={16} /> Local dishes & specialties to try</h3></div>
          {food.length ? food.map((f) => (
            <div className="otm-food-item" key={f.id}>
              <div className="otm-food-name">{f.name}</div>
              <div className="otm-food-note">{f.note}</div>
            </div>
          )) : <div className="otm-empty">No food notes yet.</div>}
        </div>
      )}

      {tab === "restaurants" && (
        <div>
          {tierOrder.map((tier) => {
            const items = restaurants.filter((r) => r.tier === tier);
            if (!items.length) return null;
            const meta = tierMeta[tier] || { cls: "settled", stars: 1 };
            return (
              <div className="otm-panel" key={tier} style={{ marginBottom: 16 }}>
                <div className="otm-panel-head">
                  <h3 className="otm-panel-title">
                    <span className={"otm-stamp " + meta.cls} style={{ fontSize: 10 }}>
                      {Array.from({ length: meta.stars }).map((_, i) => <Star key={i} size={10} />)} {tier}
                    </span>
                  </h3>
                </div>
                {items.map((r) => (
                  <div className="otm-rest-item" key={r.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <span className="otm-rest-name">{r.name}</span>
                      <span className="otm-rest-cuisine">{r.cuisine}</span>
                    </div>
                    <div className="otm-food-note">{r.note}</div>
                  </div>
                ))}
              </div>
            );
          })}
          {!restaurants.length && <div className="otm-panel"><div className="otm-empty">No restaurant recommendations yet.</div></div>}
        </div>
      )}

      {tab === "contacts" && (
        <div className="otm-panel">
          <h3 className="otm-panel-title" style={{ marginBottom: 12 }}>Key contacts</h3>
          {(planData.contacts || []).map((c) => (
            <div className="otm-checklist-item" key={c.id}>
              <span className="otm-checklist-text"><b>{c.name}</b>{" — "}{c.phone}</span>
              {isAdmin && <button className="otm-btn otm-btn-ghost otm-btn-sm" onClick={() => removeContact(c.id)}><Trash2 size={11} /></button>}
            </div>
          ))}
          {isAdmin ? (
            <div className="otm-inline-form">
              <input className="otm-input" placeholder="Name" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} />
              <input className="otm-input" placeholder="Phone / details" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} />
              <button className="otm-btn otm-btn-accent otm-btn-sm" type="button" onClick={addContact}><Plus size={13} /> Add</button>
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              <div className="otm-banner" style={{ marginBottom: 10 }}><Info size={14} /> To add a contact, submit a request below. The trip organizer will review it.</div>
              <div className="otm-inline-form" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
                <input className="otm-input" placeholder="Name" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} />
                <input className="otm-input" placeholder="Phone / details" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} />
                <button className="otm-btn otm-btn-ghost otm-btn-sm" type="button" onClick={() => { if (newContactName.trim() && newContactPhone.trim()) { onRequestContact({ id: uid("ctr"), name: newContactName.trim(), phone: newContactPhone.trim(), requestedBy: currentUser.displayName, requestedAt: new Date().toISOString() }); setNewContactName(""); setNewContactPhone(""); } }}>
                  <Plus size={13} /> Request
                </button>
              </div>
            </div>
          )}
          <h3 className="otm-panel-title" style={{ margin: "22px 0 12px" }}>Trip notes</h3>
          {isAdmin ? (
            <textarea className="otm-input" rows={7} value={planData.notes || ""} onChange={(e) => onUpdatePlan({ ...planData, notes: e.target.value })} placeholder="Resort address, check-in time, driver number, anything the group should know..." />
          ) : (
            <div style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: 9, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-soft)", whiteSpace: "pre-wrap" }}>
              {planData.notes || "No trip notes yet — the organizer will add details here."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================== ROOT APP ============================== */

export default function OotyTripManager() {
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState(null);
  const [logEntries, setLogEntries] = useState([]);
  const [users, setUsers] = useState([]);
  const [planData, setPlanData] = useState(null);
  const [packReqs, setPackReqs] = useState([]);
  const [contactReqs, setContactReqs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    (async () => {
      let app = await loadKey(KEYS.APP, null);
      if (!app) { app = seedAppData(); await saveKey(KEYS.APP, app); }
      if (!app.tripInfo || !app.tripInfo.startDate) {
        app = { ...app, tripInfo: { ...(app.tripInfo || {}), startDate: "2026-07-17", endDate: "2026-07-20", destination: "Mysore \u2192 Ooty, Nilgiris" } };
        await saveKey(KEYS.APP, app);
      }
      let plan = await loadKey(KEYS.PLAN, null);
      // Load / upgrade the trip guide. Older cached plans lack weather/food/restaurants;
      // refresh them to the current seeded content (the guide is reference data, not user-entered).
      if (!plan || plan.schema !== PLAN_SCHEMA) {
        plan = { ...seedPlanData(), schema: PLAN_SCHEMA };
        await saveKey(KEYS.PLAN, plan);
      }
      const log = await loadKey(KEYS.LOG, []);
      const us = await loadKey(KEYS.USERS, []);
      const pr = await loadKey(KEYS.PACK_REQS, []);
      const cr = await loadKey(KEYS.CONTACT_REQS, []);
      setAppData(app);
      setPlanData(plan);
      setLogEntries(log);
      setUsers(us);
      setPackReqs(pr);
      setContactReqs(cr);
      setLoading(false);
    })();
  }, []);

  const computedMembers = useMemo(() => {
    if (!appData) return [];
    return appData.members.map((m) => computeMember(m, appData.commonExpenses, logEntries));
  }, [appData, logEntries]);

  async function handleRegister({ displayName, username, password, linkChoice, isAdmin }) {
    setAuthError(""); setBusy(true);
    try {
      if (users.some((u) => u.username === username)) {
        setAuthError("That username is already taken.");
        setBusy(false);
        return;
      }
      let members = [...appData.members];
      let memberId;
      if (linkChoice === "__new__") {
        const newMember = { id: uid("mem"), name: displayName, advancePaid: 0, claimed: true, username, legs: { hydMysore: false, blrMysore: false, mysoreBlr: false, mysoreHyd: false } };
        members = [...members, newMember];
        memberId = newMember.id;
      } else {
        members = members.map((m) => m.id === linkChoice ? { ...m, claimed: true, username } : m);
        memberId = linkChoice;
      }
      const passwordHash = await hashPassword(password);
      const newUser = { username, passwordHash, displayName, memberId, role: isAdmin ? "admin" : "member", createdAt: new Date().toISOString() };
      const newUsers = [...users, newUser];
      const newAppData = { ...appData, members };
      setUsers(newUsers);
      setAppData(newAppData);
      await saveKey(KEYS.USERS, newUsers);
      await saveKey(KEYS.APP, newAppData);
      setCurrentUser(newUser);
    } catch (e) {
      console.error("Registration failed:", e);
      setAuthError("Something went wrong creating your account (" + (e && e.message ? e.message : "unknown error") + "). Please try again.");
    }
    setBusy(false);
  }

  async function handleLogin(username, password) {
    setAuthError(""); setBusy(true);
    const hash = await hashPassword(password);
    const found = users.find((u) => u.username === username && u.passwordHash === hash);
    if (!found) {
      setAuthError("Incorrect username or password.");
      setBusy(false);
      return;
    }
    setCurrentUser(found);
    setBusy(false);
  }

  function handleLogout() { setCurrentUser(null); setActiveTab("dashboard"); }

  async function persistApp(next) { setAppData(next); await saveKey(KEYS.APP, next); }
  async function persistLog(next) { setLogEntries(next); await saveKey(KEYS.LOG, next); }
  async function persistPlan(next) { setPlanData(next); await saveKey(KEYS.PLAN, next); }
  async function persistPackReqs(next) { setPackReqs(next); await saveKey(KEYS.PACK_REQS, next); }
  async function persistContactReqs(next) { setContactReqs(next); await saveKey(KEYS.CONTACT_REQS, next); }

  function submitPackReq(req) { persistPackReqs([...packReqs, req]); }
  function approvePackReq(id) {
    const req = packReqs.find((r) => r.id === id);
    if (!req) return;
    const updated = { ...planData, packing: [...(planData.packing || []), { id: uid("pk"), text: req.text, cat: req.cat || "General", done: false }] };
    persistPlan(updated);
    persistPackReqs(packReqs.filter((r) => r.id !== id));
  }
  function rejectPackReq(id) { persistPackReqs(packReqs.filter((r) => r.id !== id)); }

  function submitContactReq(req) { persistContactReqs([...contactReqs, req]); }
  function approveContactReq(id) {
    const req = contactReqs.find((r) => r.id === id);
    if (!req) return;
    const updated = { ...planData, contacts: [...(planData.contacts || []), { id: uid("ct"), name: req.name, phone: req.phone }] };
    persistPlan(updated);
    persistContactReqs(contactReqs.filter((r) => r.id !== id));
  }
  function rejectContactReq(id) { persistContactReqs(contactReqs.filter((r) => r.id !== id)); }

  function addExpense(entry) { persistLog([...logEntries, entry]); }
  function deleteExpense(id) { persistLog(logEntries.filter((e) => e.id !== id)); }

  function updateMember(id, patch) {
    persistApp({ ...appData, members: appData.members.map((m) => m.id === id ? { ...m, ...patch } : m) });
  }
  function addMember(name) {
    persistApp({ ...appData, members: [...appData.members, { id: uid("mem"), name, advancePaid: 0, claimed: false, username: null, legs: { hydMysore: false, blrMysore: false, mysoreBlr: false, mysoreHyd: false } }] });
  }
  function deleteMember(id) {
    persistApp({ ...appData, members: appData.members.filter((m) => m.id !== id) });
    persistLog(logEntries.filter((e) => e.memberId !== id));
  }
  function updateCommonExpense(id, patch) {
    persistApp({ ...appData, commonExpenses: appData.commonExpenses.map((e) => e.id === id ? { ...e, ...patch, totalCost: Number(patch.totalCost), advancePaid: Number(patch.advancePaid), splitAmong: Number(patch.splitAmong) } : e) });
  }
  function addCommonExpense(entry) { persistApp({ ...appData, commonExpenses: [...appData.commonExpenses, entry] }); }
  function deleteCommonExpense(id) { persistApp({ ...appData, commonExpenses: appData.commonExpenses.filter((e) => e.id !== id) }); }

  return (
    <div className="otm-root">
      <style>{STYLES}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');"}</style>

      {loading ? (
        <div className="otm-loading"><Loader2 size={28} className="otm-spin" /> Loading your trip data…</div>
      ) : !currentUser ? (
        <AuthScreen members={appData.members} onRegister={handleRegister} onLogin={handleLogin} authError={authError} busy={busy} />
      ) : (
        <div className="otm-shell">
          <Sidebar active={activeTab} setActive={setActiveTab} currentUser={currentUser} tripName={appData.tripInfo.name} onLogout={handleLogout} />
          <div className="otm-main">
            {activeTab === "dashboard" && <DashboardTab appData={appData} computedMembers={computedMembers} logEntries={logEntries} />}
            {activeTab === "myexpenses" && <MyExpensesTab currentUser={currentUser} appData={appData} logEntries={logEntries} onAddExpense={addExpense} onDeleteExpense={deleteExpense} />}
            {activeTab === "members" && <MembersTab appData={appData} computedMembers={computedMembers} logEntries={logEntries} currentUser={currentUser} onUpdateMember={updateMember} onAddMember={addMember} onDeleteMember={deleteMember} />}
            {activeTab === "common" && <CommonExpensesTab appData={appData} currentUser={currentUser} onUpdateExpense={updateCommonExpense} onAddExpense={addCommonExpense} onDeleteExpense={deleteCommonExpense} />}
            {activeTab === "settle" && <SettleUpTab appData={appData} computedMembers={computedMembers} />}
            {activeTab === "itinerary" && <ItineraryTab planData={planData} onUpdatePlan={persistPlan} isAdmin={currentUser.role === "admin"} currentUser={currentUser} onRequestPacking={submitPackReq} onRequestContact={submitContactReq} packReqs={packReqs} contactReqs={contactReqs} onApprovePackReq={approvePackReq} onRejectPackReq={rejectPackReq} onApproveContactReq={approveContactReq} onRejectContactReq={rejectContactReq} />}
          </div>
        </div>
      )}
    </div>
  );
}
