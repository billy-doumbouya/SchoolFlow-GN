"use client";
import { useState } from "react";
import { useFetch, useApi } from "@/hooks";
import { Button, Card, Badge, LoadingPage } from "@/components/ui";
import { SUBSCRIPTION_PLANS } from "@/services/paymentService";

// client-side plan definitions (mirrored from service)
const PLANS = [
  {
    key: "FREE",
    name: "Free",
    price: 0,
    features: [
      "Up to 50 students",
      "5 teachers",
      "Basic reports",
      "Community support",
    ],
    color: "slate",
  },
  {
    key: "BASIC",
    name: "Basic",
    price: 500000,
    features: [
      "Up to 200 students",
      "20 teachers",
      "Full reports",
      "Payment tracking",
      "Email support",
    ],
    color: "blue",
    popular: false,
  },
  {
    key: "PRO",
    name: "Pro",
    price: 1500000,
    features: [
      "Up to 1 000 students",
      "100 teachers",
      "Advanced analytics",
      "Custom branding",
      "Priority support",
    ],
    color: "brand",
    popular: true,
  },
  {
    key: "ENTERPRISE",
    name: "Enterprise",
    price: 5000000,
    features: [
      "Unlimited students & teachers",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
      "Onboarding",
    ],
    color: "purple",
  },
];

function formatGNF(v) {
  return v === 0
    ? "Free"
    : new Intl.NumberFormat("fr-GN", {
        style: "currency",
        currency: "GNF",
        maximumFractionDigits: 0,
      }).format(v);
}

export default function BillingPage() {
  const [toast, setToast] = useState(null);
  const { data: subData, loading } = useFetch("/api/payments/subscription");
  const { post, loading: upgrading } = useApi();

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  async function handleUpgrade(plan) {
    try {
      const result = await post("/api/payments", {
        amount: PLANS.find((p) => p.key === plan)?.price || 0,
        paymentType: "SUBSCRIPTION",
        description: `SchoolFlow ${plan} Plan – Annual`,
      });
      notify("Payment link created! Redirecting to GuinePay…");
      if (result?.redirectUrl) {
        setTimeout(() => window.open(result.redirectUrl, "_blank"), 1000);
      }
    } catch (e) {
      notify(e.message, "error");
    }
  }

  return (
    <div className="p-8">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-panel ${toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-900">Billing & Plans</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Upgrade your plan to unlock more students, teachers, and features
        </p>
      </div>

      {/* Current plan banner */}
      {subData?.subscription && (
        <div className="mb-8 bg-brand-50 border border-brand-200 rounded-2xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-800">
                Current Plan:{" "}
                <span className="text-brand-600">
                  {subData.subscription.plan}
                </span>
              </p>
              <p className="text-xs text-brand-700 mt-0.5">
                {subData.subscription.maxStudents} students ·{" "}
                {subData.subscription.maxTeachers} teachers
                {subData.subscription.endDate &&
                  ` · Expires ${new Date(subData.subscription.endDate).toLocaleDateString()}`}
              </p>
            </div>
            <Badge
              variant={
                subData.subscription.status === "ACTIVE" ? "success" : "danger"
              }
            >
              {subData.subscription.status}
            </Badge>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = subData?.subscription?.plan === plan.key;
          return (
            <div
              key={plan.key}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.popular
                  ? "border-brand-500 bg-brand-600 text-white shadow-panel"
                  : "border-surface-border bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-4">
                <p
                  className={`font-bold text-lg ${plan.popular ? "text-white" : "text-slate-900"}`}
                >
                  {plan.name}
                </p>
                <div className="mt-2">
                  <span
                    className={`text-3xl font-extrabold ${plan.popular ? "text-white" : "text-slate-900"}`}
                  >
                    {formatGNF(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span
                      className={`text-sm ml-1 ${plan.popular ? "text-brand-200" : "text-slate-500"}`}
                    >
                      /year
                    </span>
                  )}
                </div>
              </div>

              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <svg
                      className={`w-4 h-4 flex-shrink-0 ${plan.popular ? "text-brand-200" : "text-green-500"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span
                      className={
                        plan.popular ? "text-brand-100" : "text-slate-600"
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div
                  className={`text-center text-sm font-semibold py-2 rounded-lg ${plan.popular ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  Current Plan ✓
                </div>
              ) : plan.price === 0 ? (
                <div className="text-center text-sm text-slate-400 py-2">
                  Free forever
                </div>
              ) : (
                <Button
                  onClick={() => handleUpgrade(plan.key)}
                  loading={upgrading}
                  variant={plan.popular ? "secondary" : "primary"}
                  className={
                    plan.popular
                      ? "bg-white text-brand-700 hover:bg-brand-50"
                      : ""
                  }
                >
                  Upgrade to {plan.name}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 bg-slate-50 border border-surface-border rounded-2xl p-6">
        <h3 className="font-semibold text-slate-900 mb-2">
          💳 Payments powered by GuinePay
        </h3>
        <p className="text-sm text-slate-600">
          All payments are processed securely through <strong>GuinePay</strong>,
          Guinea's leading payment gateway. We support Mobile Money (Orange
          Money, MTN MoMo) and bank card payments. Your subscription renews
          annually. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
