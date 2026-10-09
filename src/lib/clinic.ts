// Clinic configuration. All details below are DEMO placeholders — replace before launch.
import ananya from "@/assets/dentist-ananya.jpg";
import arjun from "@/assets/dentist-vikram.jpg";
import meera from "@/assets/dentist-meera.jpg";

export const CLINIC = {
  name: "Sage Dental Studio",
  tagline: "Thoughtful dentistry",
  city: "Bengaluru",
  address: "12 Lavelle Road, Ashok Nagar, Bengaluru 560001",
  phone: "+91 80 4000 0000",
  phoneHref: "tel:+918040000000",
  email: "hello@sagedental.example",
  timezone: "Asia/Kolkata",
  mapEmbed:
    "https://www.openstreetmap.org/export/embed.html?bbox=77.592%2C12.966%2C77.602%2C12.976&layer=mapnik&marker=12.971%2C77.597",
  directions: "https://www.google.com/maps/search/?api=1&query=Lavelle+Road+Bengaluru",
  hours: [
    { days: "Monday – Friday", time: "9:00 AM – 6:00 PM (lunch 1–2 PM)" },
    { days: "Saturday", time: "9:00 AM – 2:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
  parking: "Street parking on Lavelle Road; step-free entrance and lift access.",
  emergency:
    "For severe swelling, uncontrolled bleeding or trauma outside opening hours, go to the nearest hospital emergency department.",
  isDemo: true,
};

export type Service = {
  slug: string;
  name: string;
  summary: string;
  duration: number;
  reasons: string[];
  expect: string[];
  aftercare: string;
  faqs: { q: string; a: string }[];
};

const genericFaq = (name: string) => [
  {
    q: `How much does ${name.toLowerCase()} cost?`,
    a: "Pricing depends on your individual assessment. The clinic will share a clear estimate before any treatment begins.",
  },
  {
    q: "Do I need a referral?",
    a: "No referral is needed. You can book directly online or through our assistant.",
  },
];

export const SERVICES: Service[] = [
  {
    slug: "general-dentistry",
    name: "General Dentistry",
    summary: "Check-ups, fillings and everyday care to keep your mouth healthy.",
    duration: 30,
    reasons: ["Routine check-up", "Toothache or sensitivity", "Worn or broken fillings"],
    expect: ["A conversation about your concerns", "A thorough examination", "A clear plan with options"],
    aftercare: "Follow any personalised advice from your dentist and keep up regular check-ups.",
    faqs: genericFaq("General Dentistry"),
  },
  {
    slug: "cleaning",
    name: "Dental Cleaning",
    summary: "Professional cleaning and preventive care to protect teeth and gums.",
    duration: 45,
    reasons: ["Plaque and tartar build-up", "Bleeding gums", "Staying on top of prevention"],
    expect: ["Gentle scaling", "Polishing", "Home-care tips tailored to you"],
    aftercare: "Mild sensitivity can occur for a day. Brush gently and floss daily.",
    faqs: genericFaq("Dental Cleaning"),
  },
  {
    slug: "whitening",
    name: "Teeth Whitening",
    summary: "In-clinic whitening for a brighter, natural-looking smile.",
    duration: 60,
    reasons: ["Staining from coffee or tea", "Preparing for an occasion", "Natural yellowing"],
    expect: ["Shade assessment", "Gum protection", "Whitening session"],
    aftercare: "Avoid strongly coloured food and drinks for 48 hours.",
    faqs: genericFaq("Teeth Whitening"),
  },
  {
    slug: "implants",
    name: "Dental Implants",
    summary: "Consultation and planning for replacing missing teeth.",
    duration: 60,
    reasons: ["Missing teeth", "Loose dentures", "Restoring chewing comfort"],
    expect: ["Assessment and imaging", "Discussion of suitability", "Treatment timeline"],
    aftercare: "Specific aftercare is provided at each stage of treatment.",
    faqs: genericFaq("Dental Implants"),
  },
  {
    slug: "orthodontics",
    name: "Orthodontics & Clear Aligners",
    summary: "Straighten teeth with braces or discreet clear aligners.",
    duration: 45,
    reasons: ["Crooked or crowded teeth", "Gaps", "Bite concerns"],
    expect: ["Smile assessment", "Option comparison", "Personalised plan"],
    aftercare: "Wear aligners as directed and attend review visits.",
    faqs: genericFaq("Orthodontics"),
  },
  {
    slug: "root-canal",
    name: "Root Canal Treatment",
    summary: "Relieve pain and save an infected tooth.",
    duration: 90,
    reasons: ["Persistent toothache", "Sensitivity that lingers", "Infection or abscess"],
    expect: ["Local anaesthetic", "Cleaning of the root canals", "Sealing and restoration plan"],
    aftercare: "Some tenderness is normal for a few days; avoid chewing hard food on that side.",
    faqs: genericFaq("Root Canal Treatment"),
  },
  {
    slug: "cosmetic",
    name: "Cosmetic Dentistry",
    summary: "Veneers, bonding and smile design.",
    duration: 60,
    reasons: ["Chipped teeth", "Uneven shape or colour", "Smile makeover"],
    expect: ["Smile consultation", "Options and previews", "Step-by-step plan"],
    aftercare: "Care advice depends on the chosen treatment.",
    faqs: genericFaq("Cosmetic Dentistry"),
  },
  {
    slug: "pediatric",
    name: "Pediatric Dentistry",
    summary: "Gentle, patient care for children.",
    duration: 30,
    reasons: ["First dental visit", "Routine check-ups", "Preventive care"],
    expect: ["A relaxed introduction", "Gentle examination", "Tips for parents"],
    aftercare: "Help your child brush twice daily and limit sugary snacks.",
    faqs: genericFaq("Pediatric Dentistry"),
  },
  {
    slug: "emergency",
    name: "Emergency Dental Care",
    summary: "Same-day help for pain, swelling or broken teeth.",
    duration: 30,
    reasons: ["Severe toothache", "Broken or knocked-out tooth", "Swelling"],
    expect: ["Prompt assessment", "Pain relief", "Next-step plan"],
    aftercare: "Follow your dentist's instructions and book any follow-up visit.",
    faqs: genericFaq("Emergency Dental Care"),
  },
];

export type Dentist = {
  slug: string;
  name: string;
  title: string;
  specialization: string;
  languages: string[];
  bio: string;
  services: string[];
  photo: string;
};

export const DENTISTS: Dentist[] = [
  {
    slug: "ananya-rao",
    name: "Dr. Ananya Rao",
    title: "BDS, MDS (demo credentials)",
    specialization: "Prosthodontics & Implants",
    languages: ["English", "Hindi", "Kannada"],
    bio: "Focuses on restoring function and confidence with carefully planned implant and cosmetic treatment.",
    services: ["general-dentistry", "implants", "cosmetic", "whitening", "emergency"],
    photo: ananya,
  },
  {
    slug: "arjun-mehta",
    name: "Dr. Arjun Mehta",
    title: "BDS, MDS (demo credentials)",
    specialization: "Orthodontics",
    languages: ["English", "Hindi", "Gujarati"],
    bio: "Helps patients of all ages achieve straighter smiles with braces and clear aligners.",
    services: ["orthodontics", "general-dentistry", "cleaning"],
    photo: arjun,
  },
  {
    slug: "meera-iyer",
    name: "Dr. Meera Iyer",
    title: "BDS (demo credentials)",
    specialization: "General & Pediatric Dentistry",
    languages: ["English", "Tamil", "Hindi"],
    bio: "Known for a calm, unhurried approach, especially with children and anxious patients.",
    services: ["general-dentistry", "cleaning", "pediatric", "root-canal", "emergency", "whitening"],
    photo: meera,
  },
];

export const FAQS = [
  { q: "Do you accept new patients?", a: "Yes. You can book your first visit online or with our assistant in a couple of minutes." },
  { q: "What should I bring to my first visit?", a: "A photo ID, any recent dental X-rays and a list of medications you take." },
  { q: "Can I cancel or move my appointment?", a: "Yes. Ask our assistant with your booking reference, or call the clinic." },
  { q: "Do you treat dental emergencies?", a: "We keep time for urgent cases during opening hours. Call us first so we can prepare." },
];
