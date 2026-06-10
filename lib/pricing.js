// ─── SchoolFlow Pricing — Single source of truth ─────────────────────────────
// Used in: billing page, super admin, quota checks, webhooks

export const PLANS = [
  {
    key: "STARTER",
    label: "Starter",
    maxStudents: 150,
    maxTeachers: 15,
    maxClasses: 10,
    priceGNF: 1_000_000,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    description: "Idéal pour les petits établissements",
    features: [
      "Jusqu'à 150 élèves",
      "15 enseignants",
      "10 classes",
      "Notes & examens",
      "Paiements GuinePay",
      "Notifications WhatsApp",
      "Support standard",
    ],
  },
  {
    key: "GROWTH",
    label: "Growth",
    maxStudents: 400,
    maxTeachers: 40,
    maxClasses: 25,
    priceGNF: 2_000_000,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.25)",
    description: "Pour les établissements en croissance",
    features: [
      "Jusqu'à 400 élèves",
      "40 enseignants",
      "25 classes",
      "Tout Starter inclus",
      "Rapports avancés",
      "Export PDF",
      "Support prioritaire",
    ],
  },
  {
    key: "SCHOOL",
    label: "School",
    maxStudents: 800,
    maxTeachers: 80,
    maxClasses: 50,
    priceGNF: 3_500_000,
    popular: true,
    color: "#1a3aeb",
    bg: "rgba(26,58,235,0.15)",
    border: "rgba(43,80,245,0.4)",
    description: "Le choix des établissements sérieux",
    features: [
      "Jusqu'à 800 élèves",
      "80 enseignants",
      "50 classes",
      "Tout Growth inclus",
      "Branding personnalisé",
      "Analytics complets",
      "Support dédié",
    ],
  },
  {
    key: "ADVANCED",
    label: "Advanced",
    maxStudents: 1500,
    maxTeachers: 150,
    maxClasses: 100,
    priceGNF: 5_500_000,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    border: "rgba(6,182,212,0.25)",
    description: "Pour les grands établissements",
    features: [
      "Jusqu'à 1 500 élèves",
      "150 enseignants",
      "100 classes",
      "Tout School inclus",
      "Multi-campus",
      "API accès",
      "SLA 99.9%",
    ],
  },
  {
    key: "PREMIUM",
    label: "Premium",
    maxStudents: 3000,
    maxTeachers: 300,
    maxClasses: 200,
    priceGNF: 8_000_000,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    description: "Pour les grandes institutions",
    features: [
      "Jusqu'à 3 000 élèves",
      "300 enseignants",
      "200 classes",
      "Tout Advanced inclus",
      "Formation équipe incluse",
      "Intégrations custom",
      "Support 24/7",
    ],
  },
  {
    key: "LARGE",
    label: "Large",
    maxStudents: 6000,
    maxTeachers: 600,
    maxClasses: 400,
    priceGNF: 12_000_000,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
    description: "Pour les très grands établissements",
    features: [
      "Jusqu'à 6 000 élèves",
      "600 enseignants",
      "400 classes",
      "Tout Premium inclus",
      "Serveur dédié option",
      "Onboarding sur site",
      "Manager dédié",
    ],
  },
  {
    key: "ENTERPRISE",
    label: "Enterprise",
    maxStudents: 999999,
    maxTeachers: 999999,
    maxClasses: 999999,
    priceGNF: 0, // Sur devis
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.08)",
    border: "rgba(148,163,184,0.2)",
    description: "Pour les groupes scolaires & institutions",
    features: [
      "Élèves illimités",
      "Enseignants illimités",
      "Tout Large inclus",
      "Contrat sur mesure",
      "Déploiement privé",
      "SLA garanti",
      "Support dédié exclusif",
    ],
  },
];

// ─── FREE plan (default at registration) ─────────────────────────────────────
export const FREE_PLAN = {
  key: "FREE",
  label: "Gratuit",
  maxStudents: 30,
  maxTeachers: 5,
  maxClasses: 3,
  priceGNF: 0,
  trialDays: 15,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getPlanByKey(key) {
  if (key === "FREE") return FREE_PLAN;
  return PLANS.find((p) => p.key === key) || FREE_PLAN;
}

export function getPlanForStudentCount(count) {
  return PLANS.find((p) => count <= p.maxStudents) || PLANS[PLANS.length - 2];
}

export function formatGNF(amount) {
  if (amount === 0) return "Sur devis";
  return new Intl.NumberFormat("fr-GN", {
    style: "currency",
    currency: "GNF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatGNFShort(amount) {
  if (amount === 0) return "Sur devis";
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M GNF`;
  return `${(amount / 1_000).toFixed(0)}K GNF`;
}

// ─── Payment mode from env ────────────────────────────────────────────────────
// PAYMENT_MODE = 'online' | 'manual' | 'both'
export const PAYMENT_MODE = process.env.PAYMENT_MODE || "both";
