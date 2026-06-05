"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function MockCheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const intent = searchParams.get("intent");
  const [status, setStatus] = useState(null); // null | "success" | "failed"
  const [loading, setLoading] = useState(false);

  async function simulate(outcome) {
    setLoading(true);
    // Simulate a small network delay
    await new Promise((r) => setTimeout(r, 1200));

    // In real GuinePay flow, their server calls our webhook.
    // Here we call it ourselves to mimic that.
    try {
      await fetch("/api/webhooks/guinepay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: outcome === "success" ? "payment.completed" : "payment.failed",
          data: {
            intent_id: intent,
            reference: `mock_ref_${Date.now()}`,
            ...(outcome === "failed" && {
              failure_reason: "Simulation de refus",
            }),
          },
        }),
      });
    } catch (e) {
      console.warn("[Mock] Webhook call failed:", e.message);
    }

    setStatus(outcome);
    setLoading(false);
  }

  // ── Résultat final ──────────────────────────────────────────────────────────
  if (status) {
    const isSuccess = status === "success";
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full text-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isSuccess ? "bg-emerald-50" : "bg-red-50"
            }`}
          >
            {isSuccess ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-2">
            {isSuccess ? "Paiement réussi" : "Paiement échoué"}
          </p>
          <h1 className="text-lg font-semibold text-slate-900 mb-1">
            {isSuccess ? "Transaction confirmée" : "Transaction refusée"}
          </h1>
          <p className="text-sm text-slate-500 mb-1">
            {isSuccess
              ? "Votre abonnement a été activé avec succès."
              : "Le paiement n'a pas pu être traité."}
          </p>
          <p className="text-xs text-slate-400 font-mono mb-6">{intent}</p>

          <button
            onClick={() => router.push("/dashboard/admin/billing")}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors"
          >
            Retour à la facturation
          </button>
        </div>
      </div>
    );
  }

  // ── Checkout simulé ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="5"
                width="20"
                height="14"
                rx="2"
                stroke="#d97706"
                strokeWidth="1.5"
              />
              <path d="M2 10h20" stroke="#d97706" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">GuinePay</p>
            <p className="text-sm font-semibold text-slate-900">
              Checkout simulé
            </p>
          </div>
          <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
            DEV
          </span>
        </div>

        {/* Intent */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs text-slate-400 mb-0.5">Référence intent</p>
          <p className="text-xs font-mono text-slate-700 break-all">{intent}</p>
        </div>

        {/* Méthodes de paiement (décoratif) */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Méthode de paiement
        </p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {["Orange Money", "MTN MoMo", "Carte bancaire"].map((m) => (
            <div
              key={m}
              className="border border-slate-200 rounded-lg p-2.5 text-center text-xs text-slate-500"
            >
              {m}
            </div>
          ))}
        </div>

        {/* Actions */}
        <p className="text-xs text-slate-400 text-center mb-3">
          Simuler le résultat du paiement
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => simulate("success")}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "…" : "✓ Succès"}
          </button>
          <button
            onClick={() => simulate("failed")}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "…" : "✕ Échec"}
          </button>
        </div>

        <button
          onClick={() => router.back()}
          disabled={loading}
          className="w-full mt-2 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
