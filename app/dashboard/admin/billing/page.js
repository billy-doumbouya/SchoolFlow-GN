"use client";
import { useState, useEffect } from "react";
import { useFetch, useApi } from "@/hooks";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  LoadingPage,
  PageHeader,
} from "@/components/ui";
import {
  PLANS,
  getPlanByKey,
  formatGNF,
  formatGNFShort,
  PAYMENT_MODE,
} from "@/lib/pricing";

function TrialBanner({ subscription }) {
  if (!subscription) return null;
  const daysLeft = subscription.endDate
    ? Math.ceil((new Date(subscription.endDate) - new Date()) / 86400000)
    : 0;
  const isTrialing = subscription.plan === "FREE" && daysLeft > 0;
  const isExpired = daysLeft <= 0 && subscription.plan === "FREE";
  if (!isTrialing && !isExpired) return null;
  return (
    <div
      style={{
        marginBottom: "24px",
        padding: "14px 20px",
        borderRadius: "14px",
        background: isExpired ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
        border: `1px solid ${isExpired ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <p
          style={{
            margin: "0 0 2px",
            fontSize: "13px",
            fontWeight: "700",
            color: isExpired ? "#ef4444" : "#fbbf24",
          }}
        >
          {isExpired
            ? "⚠️ Période d'essai expirée"
            : `🎁 Essai gratuit — ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#64748b",
            fontWeight: "300",
          }}
        >
          {isExpired
            ? "Choisissez un plan pour continuer"
            : "Profitez de toutes les fonctionnalités"}
        </p>
      </div>
    </div>
  );
}

function UsageBar({ label, current, max }) {
  const pct = Math.round((current / max) * 100);
  const color = pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : "#22c55e";
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <span style={{ fontSize: "11px", color: "#64748b" }}>{label}</span>
        <span
          style={{
            fontSize: "11px",
            color: pct > 90 ? "#ef4444" : "#94a3b8",
            fontWeight: "600",
          }}
        >
          {current} / {max}
        </span>
      </div>
      <div
        style={{
          height: "4px",
          background: "rgba(255,255,255,0.07)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(pct, 100)}%`,
            background: color,
            borderRadius: "2px",
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

function CurrentPlanCard({ subscription, usage, onUpgrade }) {
  if (!subscription) return null;
  const plan = getPlanByKey(subscription.plan);
  return (
    <Card style={{ marginBottom: "28px" }}>
      <CardContent
        style={{
          display: "flex",
          gap: "32px",
          flexWrap: "wrap",
          alignItems: "flex-start",
          paddingTop: "24px",
        }}
      >
        <div style={{ flex: 1, minWidth: "180px" }}>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "11px",
              color: "#475569",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Plan actuel
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "6px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: "800",
                color: "white",
                fontFamily: "Syne, sans-serif",
              }}
            >
              {plan.label}
            </h3>
            <Badge
              variant={subscription.status === "ACTIVE" ? "success" : "danger"}
            >
              {subscription.status}
            </Badge>
          </div>
          <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#64748b" }}>
            {subscription.endDate
              ? `Expire le ${new Date(subscription.endDate).toLocaleDateString("fr-GN", { day: "numeric", month: "long", year: "numeric" })}`
              : "Essai gratuit"}
          </p>
          {plan.priceGNF > 0 && (
            <p
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "800",
                color: "white",
                fontFamily: "Syne, sans-serif",
              }}
            >
              {formatGNFShort(plan.priceGNF)}
              <span
                style={{
                  fontSize: "11px",
                  color: "#475569",
                  fontWeight: "400",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                /an
              </span>
            </p>
          )}
        </div>
        <div
          style={{
            flex: 2,
            minWidth: "220px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "11px",
              color: "#475569",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Utilisation
          </p>
          <UsageBar
            label="Élèves"
            current={usage.students}
            max={subscription.maxStudents}
          />
          <UsageBar
            label="Enseignants"
            current={usage.teachers}
            max={subscription.maxTeachers}
          />
          <UsageBar
            label="Classes"
            current={usage.classes}
            max={subscription.maxClasses || 999}
          />
        </div>
        <div>
          <Button onClick={onUpgrade} size="md">
            ↑ Changer de plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PlanCard({ plan, currentPlan, selected, onSelect }) {
  const isCurrent = currentPlan === plan.key;
  const isEnterprise = plan.key === "ENTERPRISE";
  return (
    <div
      onClick={() => !isCurrent && !isEnterprise && onSelect(plan.key)}
      style={{
        position: "relative",
        background: selected ? plan.bg : "rgba(255,255,255,0.03)",
        border: `2px solid ${selected ? plan.border : isCurrent ? plan.border : "rgba(255,255,255,0.07)"}`,
        borderRadius: "18px",
        padding: "18px",
        cursor: isCurrent || isEnterprise ? "default" : "pointer",
        transition: "all 0.25s",
        opacity: isCurrent ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isCurrent && !isEnterprise && !selected)
          e.currentTarget.style.borderColor = plan.border;
      }}
      onMouseLeave={(e) => {
        if (!selected && !isCurrent)
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      {plan.popular && (
        <div
          style={{
            position: "absolute",
            top: "-11px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
            color: "white",
            fontSize: "10px",
            fontWeight: "700",
            padding: "3px 12px",
            borderRadius: "999px",
            whiteSpace: "nowrap",
          }}
        >
          ⭐ Populaire
        </div>
      )}
      {isCurrent && (
        <div
          style={{
            position: "absolute",
            top: "-11px",
            right: "14px",
            background: "#22c55e",
            color: "white",
            fontSize: "10px",
            fontWeight: "700",
            padding: "3px 10px",
            borderRadius: "999px",
          }}
        >
          Actuel
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: "800",
            color: "white",
            fontFamily: "Syne, sans-serif",
          }}
        >
          {plan.label}
        </p>
        {selected && !isCurrent && (
          <span
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: plan.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "white",
              flexShrink: 0,
            }}
          >
            ✓
          </span>
        )}
      </div>

      <div style={{ marginBottom: "12px" }}>
        {isEnterprise ? (
          <p
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "800",
              color: "white",
              fontFamily: "Syne, sans-serif",
            }}
          >
            Sur devis
          </p>
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "white",
                fontFamily: "Syne, sans-serif",
              }}
            >
              {formatGNFShort(plan.priceGNF)}
            </span>
            <span style={{ fontSize: "10px", color: "#475569" }}>/an</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {[
          `${plan.maxStudents >= 999999 ? "∞" : plan.maxStudents} élèves`,
          `${plan.maxTeachers >= 999999 ? "∞" : plan.maxTeachers} enseignants`,
          `${plan.maxClasses >= 999999 ? "∞" : plan.maxClasses} classes`,
        ].map((f) => (
          <div
            key={f}
            style={{ display: "flex", alignItems: "center", gap: "5px" }}
          >
            <div
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: plan.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{f}</span>
          </div>
        ))}
      </div>

      {isEnterprise && (
        <a
          href="https://wa.me/224623952011?text=Bonjour, je suis intéressé par SchoolFlow Enterprise"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "block",
            marginTop: "12px",
            padding: "7px",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "9px",
            color: "#22c55e",
            fontSize: "11px",
            fontWeight: "600",
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          💬 Contacter via WhatsApp
        </a>
      )}
    </div>
  );
}

function PaymentSection({ plan, onPayOnline, onPayManual, loading }) {
  const showOnline = PAYMENT_MODE === "online" || PAYMENT_MODE === "both";
  const showManual = PAYMENT_MODE === "manual" || PAYMENT_MODE === "both";
  const [tab, setTab] = useState(showOnline ? "online" : "manual");

  return (
    <Card
      style={{ marginTop: "24px", border: "1px solid rgba(43,80,245,0.3)" }}
    >
      <CardHeader>
        <CardTitle>💳 Paiement — Plan {plan.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          style={{
            background: "rgba(43,80,245,0.08)",
            border: "1px solid rgba(43,80,245,0.15)",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 2px",
                fontSize: "13px",
                color: "#93c5fd",
                fontWeight: "600",
              }}
            >
              Plan {plan.label} — 1 an
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#475569" }}>
              {plan.maxStudents} élèves · {plan.maxTeachers} enseignants ·{" "}
              {plan.maxClasses} classes
            </p>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: "800",
              color: "white",
              fontFamily: "Syne, sans-serif",
            }}
          >
            {formatGNF(plan.priceGNF)}
          </p>
        </div>

        {PAYMENT_MODE === "both" && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            <button
              onClick={() => setTab("online")}
              style={{
                flex: 1,
                padding: "10px",
                background:
                  tab === "online"
                    ? "linear-gradient(135deg,#1a3aeb,#7c3aed)"
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${tab === "online" ? "transparent" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "10px",
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                transition: "all 0.2s",
              }}
            >
              📱 En ligne — GuinePay
            </button>
            <button
              onClick={() => setTab("manual")}
              style={{
                flex: 1,
                padding: "10px",
                background:
                  tab === "manual"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${tab === "manual" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "10px",
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
                transition: "all 0.2s",
              }}
            >
              🏦 Virement manuel
            </button>
          </div>
        )}

        {tab === "online" && showOnline && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#94a3b8",
                lineHeight: 1.7,
              }}
            >
              Payez via <strong style={{ color: "white" }}>GuinePay</strong>.
              Activation instantanée après confirmation.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["📱 Orange Money", "📱 MTN MoMo", "💳 Carte bancaire"].map(
                (m) => (
                  <span
                    key={m}
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      background: "rgba(255,255,255,0.05)",
                      padding: "3px 10px",
                      borderRadius: "7px",
                    }}
                  >
                    {m}
                  </span>
                ),
              )}
            </div>
            <Button onClick={onPayOnline} loading={loading} size="lg">
              Payer {formatGNF(plan.priceGNF)} via GuinePay →
            </Button>
          </div>
        )}

        {tab === "manual" && showManual && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#94a3b8",
                lineHeight: 1.7,
              }}
            >
              Envoyez le montant exact, puis cliquez sur{" "}
              <strong style={{ color: "white" }}>"J'ai payé"</strong>.
              Activation sous{" "}
              <strong style={{ color: "white" }}>24h ouvrées</strong>.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {[
                { label: "Orange Money", color: "#f59e0b" },
                { label: "MTN MoMo", color: "#fbbf24" },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 3px",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: m.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {m.label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "white",
                      fontFamily: "Syne, sans-serif",
                    }}
                  >
                    +224 623 952 011
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "11px",
                      color: "#475569",
                    }}
                  >
                    G-Tech Academy
                  </p>
                </div>
              ))}
            </div>
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: "10px",
              }}
            >
              <p
                style={{
                  margin: "0 0 3px",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#fbbf24",
                }}
              >
                ⚠️ Référence obligatoire
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "#94a3b8",
                  lineHeight: 1.6,
                }}
              >
                Indiquez le nom de votre école comme référence. Conservez la
                capture d'écran.
              </p>
            </div>
            <Button
              onClick={onPayManual}
              loading={loading}
              variant="secondary"
              size="lg"
            >
              ✅ J'ai effectué le paiement — Notifier l'équipe
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const { data, loading } = useFetch("/payments/subscription");
  const { data: usageData } = useFetch("/dashboard/stats");
  const { post, loading: paying } = useApi();

  const subscription = data?.subscription;
  const currentPlanKey = subscription?.plan || "FREE";
  const usage = {
    students: usageData?.data?.kpis?.totalStudents || 0,
    teachers: usageData?.data?.kpis?.totalTeachers || 0,
    classes: usageData?.data?.kpis?.totalClasses || 0,
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (plan && plan !== "FREE") {
      setSelectedPlan(plan);
      setShowPayment(true);
      toast.info(`Plan ${plan} présélectionné — finalisez votre abonnement`);
    }
  }, []);

  async function handlePayOnline() {
    const plan = PLANS.find((p) => p.key === selectedPlan);
    if (!plan) return;
    try {
      const result = await post("/payments", {
        amount: plan.priceGNF,
        paymentType: "SUBSCRIPTION",
        description: `Abonnement SchoolFlow ${plan.label} — 1 an`,
        planKey: plan.key,
      });
      toast.success("Redirection vers GuinePay...");
      if (result?.redirectUrl)
        setTimeout(() => (window.location.href = result.redirectUrl), 800);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handlePayManual() {
    const plan = PLANS.find((p) => p.key === selectedPlan);
    if (!plan) return;
    try {
      await post("/payments/manual-notify", {
        planKey: plan.key,
        priceGNF: plan.priceGNF,
      });
      toast.success(
        "✅ Équipe notifiée ! Activation sous 24h — vous recevrez un WhatsApp.",
      );
      setShowPayment(false);
    } catch (e) {
      toast.error(e.message);
    }
  }

  const selectedPlanObj = PLANS.find((p) => p.key === selectedPlan);

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "1000px",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <PageHeader title="Abonnement" subtitle="Gérez votre plan SchoolFlow" />
      {loading ? (
        <LoadingPage />
      ) : (
        <>
          <TrialBanner subscription={subscription} />
          <CurrentPlanCard
            subscription={subscription}
            usage={usage}
            onUpgrade={() => {
              setShowPayment(false);
              setSelectedPlan(null);
            }}
          />
          <h2
            style={{
              margin: "0 0 14px",
              fontSize: "15px",
              fontWeight: "700",
              color: "white",
              fontFamily: "Syne, sans-serif",
            }}
          >
            Choisir un plan
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                currentPlan={currentPlanKey}
                selected={selectedPlan === plan.key}
                onSelect={(key) => {
                  setSelectedPlan(key);
                  setShowPayment(true);
                }}
              />
            ))}
          </div>
          {showPayment &&
            selectedPlanObj &&
            selectedPlanObj.key !== "ENTERPRISE" && (
              <PaymentSection
                plan={selectedPlanObj}
                onPayOnline={handlePayOnline}
                onPayManual={handlePayManual}
                loading={paying}
              />
            )}
          <div
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              🎁{" "}
              <strong style={{ color: "#e2e8f0" }}>
                15 jours d'essai gratuit
              </strong>{" "}
              à l'inscription — aucune carte requise.
            </p>
            <a
              href="https://wa.me/224623952011?text=Bonjour, j'ai une question sur les plans SchoolFlow"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "12px",
                color: "#22c55e",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              💬 Question ? WhatsApp →
            </a>
          </div>
        </>
      )}
    </div>
  );
}
