import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendOTP } from "@/services/whatsappService";
import { hashPassword } from "@/lib/auth";
import { AppError } from "@/lib/api";

// ─── Generate 6-digit OTP ─────────────────────────────────────────────────────
function generateOTP() {
  // cryptographically secure random OTP
  return crypto.randomInt(100000, 999999).toString();
}

// ─── Request OTP ──────────────────────────────────────────────────────────────
export async function requestPasswordReset(phone) {
  if (!phone?.trim()) throw new AppError("Numéro de téléphone requis", 400);

  // Normalize phone
  let normalizedPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (!normalizedPhone.startsWith("+")) {
    if (normalizedPhone.startsWith("00"))
      normalizedPhone = "+" + normalizedPhone.slice(2);
    else if (normalizedPhone.startsWith("224"))
      normalizedPhone = "+" + normalizedPhone;
    else normalizedPhone = "+224" + normalizedPhone;
  }

  // Find user by phone
  const user = await prisma.user.findFirst({
    where: { phone: normalizedPhone, isActive: true },
    include: { tenant: { select: { name: true } } },
  });

  // Always return success to avoid phone enumeration
  if (!user) {
    console.log(`[OTP] No user found for phone ${normalizedPhone}`);
    throw new AppError("Aucun compte trouvé pour ce numéro.", 404);
    return {
      message: "Si ce numéro est enregistré, vous recevrez un code WhatsApp.",
    };
  }

  // Invalidate old OTPs
  await prisma.oTP.deleteMany({
    where: { phone: normalizedPhone, used: false },
  });

  // Create new OTP
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.oTP.create({
    data: { phone: normalizedPhone, code, expiresAt },
  });

  // Send via WhatsApp
  await sendOTP({
    phone: normalizedPhone,
    firstName: user.firstName,
    otp: code,
  });

  return {
    message: "Si ce numéro est enregistré, vous recevrez un code WhatsApp.",
  };
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export async function verifyOTP(phone, code) {
  let normalizedPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (!normalizedPhone.startsWith("+")) {
    if (normalizedPhone.startsWith("224"))
      normalizedPhone = "+" + normalizedPhone;
    else normalizedPhone = "+224" + normalizedPhone;
  }

  const otp = await prisma.oTP.findFirst({
    where: {
      phone: normalizedPhone,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) throw new AppError("Code invalide ou expiré", 400);

  return { valid: true, phone: normalizedPhone };
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export async function resetPassword(phone, code, newPassword) {
  if (!newPassword || newPassword.length < 8) {
    throw new AppError(
      "Le mot de passe doit contenir au moins 8 caractères",
      400,
    );
  }

  // Verify OTP first
  await verifyOTP(phone, code);

  let normalizedPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (!normalizedPhone.startsWith("+")) {
    if (normalizedPhone.startsWith("224"))
      normalizedPhone = "+" + normalizedPhone;
    else normalizedPhone = "+224" + normalizedPhone;
  }

  // Find user
  const user = await prisma.user.findFirst({
    where: { phone: normalizedPhone, isActive: true },
  });
  if (!user) throw new AppError("Utilisateur non trouvé", 404);

  // Update password + mark OTP as used
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.oTP.updateMany({
      where: { phone: normalizedPhone, used: false },
      data: { used: true },
    }),
  ]);

  return { message: "Mot de passe réinitialisé avec succès" };
}
