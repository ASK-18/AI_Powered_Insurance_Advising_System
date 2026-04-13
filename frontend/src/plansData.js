// plansData.js — plans are stored in MongoDB via the backend API.
// localStorage is used only as a fallback cache when the API hasn't responded yet.

export const API_BASE = "http://localhost:8000";

const DEFAULT_PLANS = [
  {
    id: "basic-shield",
    label: "Basic Shield Plan",
    icon: "🛡",
    iconClass: "icon-orange",
    tagline: "Essential coverage for low-risk individuals",
    riskLevel: "Low",
    premium: "₹3,000 – ₹6,000 / year",
    sumInsured: "Up to ₹3 Lakhs",
    bestFor: "Young, healthy individuals with no dependents",
    highlights: [
      "Hospitalisation cover up to ₹3 Lakhs",
      "Pre & post hospitalisation (30/60 days)",
      "Day-care procedures covered",
      "No-claim bonus: 10% per year (max 50%)",
      "Free annual health check-up",
    ],
    exclusions: [
      "Pre-existing diseases (first 2 years)",
      "Cosmetic or dental treatment",
      "Self-inflicted injuries",
    ],
    color: "#e8500a",
  },
  {
    id: "secure-plus",
    label: "SecurePlus Plan",
    icon: "🔰",
    iconClass: "icon-blue",
    tagline: "Balanced coverage for mid-risk profiles",
    riskLevel: "Medium",
    premium: "₹8,000 – ₹14,000 / year",
    sumInsured: "Up to ₹10 Lakhs",
    bestFor: "Families and individuals with moderate health risks",
    highlights: [
      "Hospitalisation cover up to ₹10 Lakhs",
      "Critical illness rider available",
      "Maternity cover (after 2-year waiting period)",
      "Ambulance charges covered",
      "Pre & post hospitalisation (60/90 days)",
      "No-claim bonus: 15% per year (max 75%)",
    ],
    exclusions: [
      "Pre-existing diseases (first 1 year)",
      "Experimental treatments",
      "War or nuclear hazard injuries",
    ],
    color: "#3b82f6",
  },
  {
    id: "premium-care",
    label: "PremiumCare Plan",
    icon: "💎",
    iconClass: "icon-purple",
    tagline: "Comprehensive coverage for high-risk profiles",
    riskLevel: "High",
    premium: "₹18,000 – ₹35,000 / year",
    sumInsured: "Up to ₹50 Lakhs",
    bestFor: "Smokers, seniors, and individuals with chronic conditions",
    highlights: [
      "Hospitalisation cover up to ₹50 Lakhs",
      "Critical illness cover included",
      "International emergency cover",
      "Mental health treatment covered",
      "OPD expenses covered",
      "Pre & post hospitalisation (90/180 days)",
      "No-claim bonus: 20% per year (max 100%)",
      "Annual wellness benefits worth ₹5,000",
    ],
    exclusions: [
      "Intentional self-harm",
      "Alcohol or substance abuse treatment",
      "Elective cosmetic procedures",
    ],
    color: "#8b5cf6",
  },
];

const STORAGE_KEY = "insureai_plans";

/** Synchronously read cached plans from localStorage (used while API loads) */
export function getCachedPlans() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  return DEFAULT_PLANS;
}

/** Fetch latest plans from MongoDB via the API and update the local cache */
export async function fetchPlansFromAPI() {
  const res = await fetch(`${API_BASE}/plans`);
  if (!res.ok) throw new Error("Failed to fetch plans");
  const plans = await res.json();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans)); // keep cache in sync
  return plans;
}

export default DEFAULT_PLANS;