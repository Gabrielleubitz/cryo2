/**
 * Single source of truth for NAP (name/address/phone) data.
 *
 * The legacy WordPress site carried two different phone numbers and referenced
 * a previous equipment vendor ("Iceberg", "Antarctica") in headings. Everything
 * here is normalised to the numbers and hardware the clinic actually runs.
 */
export const BUSINESS = {
  name: "Cryotherapy Rejuvenate",
  street: "757 Scranton Carbondale Highway",
  city: "Dickson City",
  state: "PA",
  zip: "18508",
  get address() {
    return `${this.street}, ${this.city}, ${this.state} ${this.zip}`;
  },
  phoneDisplay: "(570) 290-1979",
  phoneHref: "tel:+15702901979",
  email: "info@cryotherapyrejuvenate.com",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=757+Scranton+Carbondale+Highway+Dickson+City+PA+18508",
  social: {
    facebook: "https://www.facebook.com/cryotherapyrejuvenate",
    instagram: "https://www.instagram.com/cryotherapyrejuvenate",
  },
  /** TODO: point at the real scheduler once the client confirms it. */
  bookingUrl: "#book",
  hours: [
    { days: "Monday – Friday", time: "11:00 AM – 7:00 PM" },
    { days: "Saturday", time: "9:00 AM – 1:00 PM" },
    { days: "Sunday", time: "9:00 AM – 1:00 PM" },
  ],
  /** schema.org openingHours shorthand */
  schemaHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], open: "11:00", close: "19:00" },
    { days: ["Saturday", "Sunday"], open: "09:00", close: "13:00" },
  ],
} as const;

export const PACKAGES = [
  {
    id: "student",
    name: "Student-Athlete",
    note: "Valid high-school or college ID required",
    blurb:
      "Built for in-season recovery — get back to practice tomorrow instead of Thursday.",
    unlimited: { price: 175, label: "1 month unlimited", fine: "One visit per day" },
    sessions: [
      { qty: "1 session", price: 20, strike: null },
      { qty: "5 sessions", price: 75, strike: null },
      { qty: "10 sessions", price: 100, strike: null },
    ],
    includes: ["Team recovery sessions welcome", "Gloves and slippers provided"],
    featured: false,
  },
  {
    id: "adult",
    name: "Adult",
    note: "18 and over",
    blurb:
      "For training, chronic aches, sleep and skin — the everyday whole-body reset.",
    unlimited: { price: 225, label: "1 month unlimited", fine: "One visit per day" },
    sessions: [
      { qty: "1 session", price: 30, strike: null },
      { qty: "5 sessions", price: 125, strike: null },
      { qty: "10 sessions", price: 200, strike: null },
    ],
    includes: ["Best value on 10-packs", "Gloves and slippers provided"],
    featured: true,
  },
  {
    id: "responder",
    name: "Military & First Responder",
    note: "Valid service ID required",
    blurb:
      "For the people who carry the load. Drop in on a shift, walk out reset.",
    unlimited: null,
    sessions: [{ qty: "3-minute session", price: 25, strike: 30 }],
    includes: [
      "Discounted every day, no restrictions",
      "Walk in on or off shift",
      "Ask about multi-session rates",
    ],
    featured: false,
  },
] as const;

/**
 * Deliberately carries no per-benefit "stat".
 *
 * These previously paired each benefit with a facility fact ("0 nitrogen
 * used" under skin rejuvenation, "7 days a week" under metabolism), which
 * read as data but said nothing. The honest alternatives would be clinical
 * outcome numbers this clinic has no basis to publish, so the cards are
 * indexed instead and the facility facts live in the trust bar.
 */
export const BENEFITS = [
  {
    title: "Muscle recovery",
    body: "Cut soreness and inflammation fast, so hard training days stack instead of stacking up on you.",
  },
  {
    title: "Pain relief",
    body: "Chronic aches and joint pain ease as the cold triggers endorphin release and calms inflammation.",
  },
  {
    title: "Skin rejuvenation",
    body: "Encourages collagen production and improves elasticity for firmer, brighter-looking skin.",
  },
  {
    title: "Circulation & energy",
    body: "Blood floods to your core, reoxygenates, then rushes back out. Most people feel it for hours.",
  },
  {
    title: "Metabolism",
    body: "Your body burns energy rewarming itself, so thermogenesis keeps working after you leave.",
  },
] as const;

export const FAQS = [
  {
    q: "What actually happens in a session?",
    a: "You change into shorts, a t-shirt or sports bra, socks, and the gloves and slippers we provide. You step into the chamber, an attendant stays with you the whole time, and you walk out three minutes later. That's it.",
  },
  {
    q: "Is this the kind with liquid nitrogen?",
    a: "No. Our MECOTEC cryo:one+ is fully electric. There's no nitrogen vapor, so you're breathing normal air the entire time and the cold is distributed evenly from head to toe instead of pooling around your legs.",
  },
  {
    q: "How cold does it get, and is it safe?",
    a: "Down to roughly −220°F. It's dry cold, which is far more tolerable than it sounds — nothing like an ice bath. A trained attendant runs and monitors every session.",
  },
  {
    q: "What should I wear?",
    a: "Shorts, and a t-shirt or sports bra, plus socks. We supply gloves and slippers. Come dry — no lotions, no jewelry, no damp clothing.",
  },
  {
    q: "Do I need an appointment?",
    a: "Booking ahead is best and payment is taken at the time of booking. Walk-ins are genuinely welcome, but you may wait if a session is already running.",
  },
  {
    q: "How often should I go?",
    a: "One visit per day maximum. Athletes in season often come three to five times a week; most people doing general recovery come one to three times a week.",
  },
  {
    q: "How do I pay?",
    a: "All major credit cards, PayPal, Venmo, Google Pay and Apple Pay. We also offer a cash discount.",
  },
  {
    q: "Who shouldn't use cryotherapy?",
    a: "If you're pregnant, or have uncontrolled high blood pressure, a serious heart condition, Raynaud's, or cold allergies, talk to your doctor first. We'll go through a short health screening on your first visit.",
  },
] as const;
