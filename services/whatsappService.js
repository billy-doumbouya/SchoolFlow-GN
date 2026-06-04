import "server-only";
import twilio from "twilio";

// ─── Twilio Client (lazy init) ────────────────────────────────────────────────
let client = null;

function getClient() {
  if (!client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      console.warn(
        "[WhatsApp] Twilio credentials missing — messages will be skipped",
      );
      return null;
    }
    client = twilio(sid, token);
  }
  return client;
}

const FROM = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
const IS_PROD = process.env.NODE_ENV === "production";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SANDBOX_CODE = process.env.TWILIO_SANDBOX_CODE || "rejoindre contes-mort";

// ─── Format phone number ──────────────────────────────────────────────────────
function formatPhone(phone) {
  if (!phone) return null;
  // Remove spaces and dashes
  let p = phone.replace(/[\s\-\(\)]/g, "");
  // Add + if missing
  if (!p.startsWith("+")) {
    // Guinea numbers start with 224
    if (p.startsWith("00")) p = "+" + p.slice(2);
    else if (p.startsWith("224")) p = "+" + p;
    else p = "+224" + p;
  }
  return `whatsapp:${p}`;
}

// ─── Core send function ───────────────────────────────────────────────────────
async function sendWhatsApp(to, message) {
  const twClient = getClient();
  if (!twClient) return { success: false, reason: "no_client" };

  const toFormatted = formatPhone(to);
  if (!toFormatted) return { success: false, reason: "invalid_phone" };

  try {
    const result = await twClient.messages.create({
      from: FROM,
      to: toFormatted,
      body: message,
    });
    console.log(`[WhatsApp] ✅ Sent to ${to} — SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (err) {
    console.error(`[WhatsApp] ❌ Failed to ${to}:`, err.message);
    return { success: false, reason: err.message };
  }
}

// ─── Sandbox activation notice (dev only) ────────────────────────────────────
function sandboxNotice() {
  if (IS_PROD) return "";
  return `\n\n──────────────────────\n⚙️ *Activation requise*\nPour recevoir les notifications, envoyez ce message au *+1 415 523 8886* sur WhatsApp :\n\n*${SANDBOX_CODE}*`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. Bienvenue Élève ───────────────────────────────────────────────────────
export async function sendStudentWelcome({
  phone,
  firstName,
  lastName,
  schoolName,
  email,
  password,
  className,
}) {
  if (!phone) return { success: false, reason: "no_phone" };

  const message = `🎓 *Bienvenue sur SchoolFlow !*

Bonjour *${firstName} ${lastName}*,

Votre compte élève a été créé avec succès à *${schoolName}*.

📚 *Classe :* ${className || "Non assignée"}

🔐 *Vos identifiants de connexion :*
• Email : ${email}
• Mot de passe : ${password}

🌐 *Connexion :* ${APP_URL}/login

⚠️ Changez votre mot de passe dès la première connexion.${sandboxNotice()}`;

  return sendWhatsApp(phone, message);
}

// ─── 2. Bienvenue Parent ─────────────────────────────────────────────────────
export async function sendParentWelcome({
  phone,
  parentName,
  studentName,
  schoolName,
  className,
}) {
  if (!phone) return { success: false, reason: "no_phone" };

  const message = `👨‍👩‍👧 *SchoolFlow — Notification Parent*

Bonjour *${parentName}*,

Votre enfant *${studentName}* vient d'être inscrit à *${schoolName}*.

📚 *Classe :* ${className || "Non assignée"}

Vous recevrez désormais les notifications concernant :
✅ Les résultats d'examens
✅ Les paiements de scolarité
✅ Les examens planifiés

💬 *Support :* ${APP_URL}${sandboxNotice()}`;

  return sendWhatsApp(phone, message);
}

// ─── 3. Bienvenue Enseignant ──────────────────────────────────────────────────
export async function sendTeacherWelcome({
  phone,
  firstName,
  lastName,
  schoolName,
  email,
  password,
  teacherCode,
}) {
  if (!phone) return { success: false, reason: "no_phone" };

  const message = `👨‍🏫 *Bienvenue sur SchoolFlow !*

Bonjour *${firstName} ${lastName}*,

Votre compte enseignant a été créé à *${schoolName}*.

🪪 *Code enseignant :* ${teacherCode}

🔐 *Vos identifiants :*
• Email : ${email}
• Mot de passe : ${password}

🌐 *Connexion :* ${APP_URL}/login

⚠️ Changez votre mot de passe dès la première connexion.${sandboxNotice()}`;

  return sendWhatsApp(phone, message);
}

// ─── 4. Paiement reçu ────────────────────────────────────────────────────────
export async function sendPaymentConfirmation({
  phone,
  parentName,
  studentName,
  amount,
  currency = "GNF",
  paymentType,
  reference,
  schoolName,
}) {
  if (!phone) return { success: false, reason: "no_phone" };

  const amountFormatted = new Intl.NumberFormat("fr-GN").format(amount);
  const date = new Date().toLocaleDateString("fr-GN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const message = `✅ *Reçu de Paiement — SchoolFlow*

Bonjour *${parentName || studentName}*,

Votre paiement a été reçu avec succès.

👤 *Élève :* ${studentName}
💰 *Montant :* ${amountFormatted} ${currency}
📋 *Type :* ${paymentType || "Frais de scolarité"}
📅 *Date :* ${date}
🔖 *Référence :* ${reference || "N/A"}

🏫 *${schoolName}*

Merci pour votre paiement. 🙏`;

  return sendWhatsApp(phone, message);
}

// ─── 5. Nouvelle note disponible ─────────────────────────────────────────────
export async function sendGradeNotification({
  phoneStudent,
  phoneParent,
  studentName,
  subjectName,
  examTitle,
  marks,
  totalMarks,
  grade,
  passed,
  schoolName,
}) {
  const pct = ((marks / totalMarks) * 100).toFixed(1);
  const emoji = passed ? "✅" : "❌";
  const mention = passed ? "Admis(e)" : "Non admis(e)";

  const message = `📊 *Résultats disponibles — SchoolFlow*

Bonjour,

Les résultats de *${studentName}* sont disponibles.

📚 *Matière :* ${subjectName}
📝 *Examen :* ${examTitle}
🎯 *Note :* ${marks}/${totalMarks} (${pct}%)
🏅 *Mention :* ${grade || "—"}
${emoji} *Résultat :* ${mention}

🌐 Consultez tous les résultats :
${APP_URL}/login

🏫 *${schoolName}*`;

  const results = [];
  if (phoneStudent) results.push(await sendWhatsApp(phoneStudent, message));
  if (phoneParent && phoneParent !== phoneStudent)
    results.push(await sendWhatsApp(phoneParent, message));
  return results;
}

// ─── 6. Examen planifié ───────────────────────────────────────────────────────
export async function sendExamReminder({
  phone,
  studentName,
  examTitle,
  subjectName,
  className,
  examDate,
  totalMarks,
  passingMarks,
  schoolName,
}) {
  if (!phone) return { success: false, reason: "no_phone" };

  const dateStr = new Date(examDate).toLocaleDateString("fr-GN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const message = `📅 *Examen Planifié — SchoolFlow*

Bonjour *${studentName}*,

Un examen a été planifié pour votre classe.

📚 *Matière :* ${subjectName}
📝 *Examen :* ${examTitle}
🏫 *Classe :* ${className}
📆 *Date :* ${dateStr}
🎯 *Total :* ${totalMarks} points
✅ *Passage :* ${passingMarks} points

Bonne préparation ! 💪

🏫 *${schoolName}*`;

  return sendWhatsApp(phone, message);
}

// ─── 7. OTP Mot de passe oublié ───────────────────────────────────────────────
export async function sendOTP({ phone, firstName, otp }) {
  if (!phone) return { success: false, reason: "no_phone" };

  const message = `🔐 *SchoolFlow — Réinitialisation*

Bonjour *${firstName}*,

Votre code de vérification est :

*${otp}*

⏱️ Valable *10 minutes* uniquement.
🚫 Ne partagez jamais ce code.

Si vous n'avez pas demandé ce code,
ignorez ce message.`;

  return sendWhatsApp(phone, message);
}

// ─── 8. Rappel abonnement expirant ────────────────────────────────────────────
export async function sendSubscriptionReminder({
  phone,
  adminName,
  schoolName,
  plan,
  expiryDate,
  daysLeft,
}) {
  if (!phone) return { success: false, reason: "no_phone" };

  const dateStr = new Date(expiryDate).toLocaleDateString("fr-GN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const message = `⚠️ *Rappel Abonnement — SchoolFlow*

Bonjour *${adminName}*,

Votre abonnement *${plan}* pour *${schoolName}* expire dans *${daysLeft} jours*.

📅 *Date d'expiration :* ${dateStr}

Pour renouveler votre abonnement :
🌐 ${APP_URL}/dashboard/admin/billing

💬 *Besoin d'aide ?*
wa.me/224623952011

*SchoolFlow by G-Tech Academy*`;

  return sendWhatsApp(phone, message);
}

// ─── 9. Inscription classe (enrollment) ───────────────────────────────────────
export async function sendEnrollmentConfirmation({
  phone,
  studentName,
  className,
  academicYear,
  schoolName,
}) {
  if (!phone) return { success: false, reason: "no_phone" };

  const message = `📚 *Inscription en Classe — SchoolFlow*

Bonjour,

*${studentName}* a été inscrit(e) avec succès.

🏫 *Classe :* ${className}
📅 *Année scolaire :* ${academicYear}
🏛️ *École :* ${schoolName}

Bonne année scolaire ! 🎓`;

  return sendWhatsApp(phone, message);
}
