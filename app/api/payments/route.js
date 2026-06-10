/**
 * app/api/webhooks/djomy/route.js
 *
 * ⚠️ IMPORTANT — avant de tester :
 *  1. Configurer l'URL webhook dans le dashboard Djomy (espace développeur)
 *     → l'URL doit être en HTTPS (Djomy ignore silencieusement les URLs http://)
 *  2. En local, lancer : npx ngrok http 3000
 *     puis coller l'URL ngrok HTTPS dans le dashboard Djomy
 */

import { processWebhook } from "@/services/paymentService";

export async function POST(request) {
  // Lire le corps brut — indispensable pour la vérification de signature
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-webhook-signature") ?? "";

  try {
    const result = await processWebhook(rawBody, signatureHeader);
    // ⚠️ Toujours retourner 200 immédiatement — même si traitement asynchrone
    // Un non-200 est considéré comme un échec de livraison par Djomy
    return Response.json(result, { status: 200 });
  } catch (err) {
    // Signature invalide → 401, autres erreurs → 200 quand même pour éviter les retry
    if (err.message.includes("signature")) {
      console.error("[Webhook Djomy] Signature invalide:", err.message);
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[Webhook Djomy] Erreur de traitement:", err.message);
    return Response.json({ received: true }, { status: 200 });
  }
}
