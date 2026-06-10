import { NextResponse } from "next/server";

// Liste des modèles gratuits Google AI Studio à tester dans l'ordre en cas de surcharge (503)
const MODELS_TO_TRY = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://schoolflow.gn";

// ─── SchoolFlow system prompt ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'assistant virtuel officiel de SchoolFlow-GN, la plateforme intelligente de gestion scolaire créée par G-Tech Academy en Guinée.

IDENTITÉ
────────
- Nom : Assistant SchoolFlow
- Créé par : G-Tech Academy, Conakry, Guinée
- Plateforme : SchoolFlow — "Éduquer • Connecter • Autonomiser"
- Contact WhatsApp : +224 623 952 011
- Site : ${APP_URL}

LANGUE
──────
Détecte automatiquement la langue du visiteur et réponds dans la même langue.
Langues supportées : Français (principal), Anglais.
Si le visiteur écrit en Pular, Soussou ou Malinké, réponds en français avec une phrase d'accueil dans leur langue.

FONCTIONNALITÉS DE SCHOOLFLOW
──────────────────────────────
1. Gestion des élèves — inscriptions, profils, informations parents, suivi académique
2. Gestion des enseignants — fiches, qualifications, attribution des matières et classes
3. Classes & Matières — création par niveau et année scolaire, gestion des capacités
4. Examens & Notes — planification, saisie en masse, calcul automatique des moyennes, mentions (A+/A/B/C/D/F)
5. Paiements — collecte des frais de scolarité via Orange Money, MTN MoMo et carte bancaire grâce à GuinePay
6. Notifications WhatsApp — envoi automatique des identifiants, résultats, reçus de paiement aux élèves et parents
7. Tableaux de bord — KPIs en temps réel pour directeurs, enseignants et élèves
8. Multi-tenant — chaque école a son espace isolé et sécurisé

RÔLES ET ACCÈS
──────────────
- Directeur/Admin : accès complet à toute l'école
- Enseignant : gestion des classes, examens et notes
- Élève : consultation des notes et planning
- Parent : suivi de l'enfant et paiements

PLANS ET TARIFS
───────────────
- STARTER    : 1–150 élèves      → 1 000 000 GNF/an
- GROWTH     : 151–400 élèves    → 2 000 000 GNF/an
- SCHOOL     : 401–800 élèves    → 3 500 000 GNF/an  ⭐ Populaire
- ADVANCED   : 801–1500 élèves   → 5 500 000 GNF/an
- PREMIUM    : 1501–3000 élèves  → 8 000 000 GNF/an
- LARGE      : 3001–6000 élèves  → 12 000 000 GNF/an
- ENTERPRISE : 6000+ élèves      → Sur devis (contacter WhatsApp)
- Essai gratuit : 15 jours sans carte bancaire
- Paiements acceptés : Orange Money, MTN MoMo, virement bancaire

QUESTIONS FRÉQUENTES
─────────────────────
Q: Comment s'inscrire ?
R: Allez sur ${APP_URL}/register, entrez le nom de votre école et créez votre compte admin. C'est gratuit et prend moins de 2 minutes.

Q: Est-ce que mes données sont sécurisées ?
R: Oui. Chaque école a son espace totalement isolé (architecture multi-tenant). Les données sont chiffrées, hébergées en Europe, sauvegardées automatiquement chaque jour.

Q: Comment les parents reçoivent-ils les notifications ?
R: Automatiquement par WhatsApp. Quand un élève est inscrit ou qu'une note est publiée, les parents et élèves reçoivent un message WhatsApp instantané.

Q: Fonctionne-t-il sur mobile ?
R: Oui, SchoolFlow est 100% responsive. Il fonctionne parfaitement sur téléphone Android, tablette et ordinateur. Une application Android native est en développement.

Q: Y a-t-il une formation ?
R: Oui. Toutes les formations sont incluses. Notre équipe vous accompagne sur WhatsApp. Pour les grandes écoles, une formation en présentiel à Conakry est disponible.

STYLE DE RÉPONSE
────────────────
- Sois chaleureux, professionnel et concis
- Utilise des emojis avec modération pour rendre les réponses plus lisibles
- Ne commence pas chaque réponse par « Bonjour » ; utilise une salutation seulement au début de la conversation ou si l'utilisateur le demande explicitement
- Évite les salutations répétitives pendant la même session
- Si une question dépasse tes connaissances, oriente vers WhatsApp : +224 623 952 011
- Ne réponds JAMAIS à des questions hors du contexte de SchoolFlow ou de l'éducation en Guinée
- Maximum 3-4 paragraphes par réponse
- Si la question concerne les données personnelles d'un élève ou d'une école spécifique, dis que tu n'as pas accès à ces informations privées et oriente vers le support

LIMITATIONS
───────────
- Tu n'as PAS accès aux données des écoles, élèves ou paiements
- Tu ne peux PAS créer de comptes ou effectuer des actions
- Pour toute action spécifique, oriente l'utilisateur vers le site ou WhatsApp`;

// ─── Language detection helper ────────────────────────────────────────────────
function detectLanguage(messages) {
  const lastMsg = messages[messages.length - 1]?.content || "";
  const frWords = [
    "bonjour",
    "merci",
    "comment",
    "est-ce",
    "quoi",
    "votre",
    "pour",
    "avec",
    "dans",
  ];
  const enWords = [
    "hello",
    "what",
    "how",
    "can",
    "does",
    "your",
    "the",
    "and",
    "for",
  ];
  const lower = lastMsg.toLowerCase();
  const frScore = frWords.filter((w) => lower.includes(w)).length;
  const enScore = enWords.filter((w) => lower.includes(w)).length;
  return enScore > frScore ? "en" : "fr";
}

// ─── Rate limiting (simple in-memory) ────────────────────────────────────────
const rateLimitMap = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const window = 60 * 1000; // 1 minute
  const maxReqs = 20;
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + window };
  if (entry.resetAt < now) {
    entry.count = 0;
    entry.resetAt = now + window;
  }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count <= maxReqs;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error(
        "❌ Erreur : GEMINI_API_KEY manquante dans le fichier .env",
      );
      return NextResponse.json(
        { success: false, error: "Configuration serveur incomplète" },
        { status: 500 },
      );
    }

    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Trop de messages. Veuillez patienter une minute.",
        },
        { status: 429 },
      );
    }

    const { messages } = await request.json();
    if (!messages?.length) {
      return NextResponse.json(
        { success: false, error: "Messages requis" },
        { status: 400 },
      );
    }

    // Keep only last 10 messages for context (cost control)
    const recentMessages = messages.slice(-10);
    const lang = detectLanguage(recentMessages);

    // Nettoyage de l'historique : Élimine le message d'accueil s'il est resté en index 0
    const validHistory = recentMessages.filter(
      (m, index) =>
        !(
          index === 0 &&
          m.role === "assistant" &&
          m.content?.includes("Bonjour")
        ) && m.content?.trim(),
    );

    // Formatage natif Google AI Studio (assistant -> model, user -> user)
    const formattedContents = validHistory.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    if (formattedContents.length === 0) {
      formattedContents.push({ role: "user", parts: [{ text: "Bonjour" }] });
    }

    // Préparation du Payload unique
    const payload = {
      contents: formattedContents,
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    };

    let response;
    let currentModelUsed = "";
    let lastErrorLog = "";

    // Boucle Fallback : test des modèles l'un après l'autre si saturation (503)
    for (const modelName of MODELS_TO_TRY) {
      currentModelUsed = modelName;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        break;
      }

      lastErrorLog = await response.text();
      console.warn(
        `⚠️ Le modèle ${modelName} a échoué pour SchoolFlow. Tentative de repli...`,
      );
    }

    // Si aucun modèle n'a répondu favorablement
    if (!response || !response.ok) {
      console.error(
        "❌ Tous les modèles de secours ont échoué pour SchoolFlow. Erreur brute :",
        lastErrorLog,
      );
      return NextResponse.json(
        {
          success: false,
          error:
            lang === "fr"
              ? "Le service est temporairement surchargé. Réessayez ou contactez-nous sur WhatsApp."
              : "Service is temporarily overloaded. Please try again or contact us on WhatsApp.",
        },
        { status: 503 },
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Réponse vide générée par l'IA" },
        { status: 500 },
      );
    }

    // On conserve la structure de retour exacte de SchoolFlow { success, data: { content } }
    return NextResponse.json({ success: true, data: { content } });
  } catch (err) {
    console.error("[Chat API - SchoolFlow Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne. Contactez-nous sur WhatsApp : +224 623 952 011",
      },
      { status: 500 },
    );
  }
}
