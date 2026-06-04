"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/schemas";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

const BG = "#0a0f1e";
const CARD = "#0f1623";

export default function LoginPage() {
  const [rateLocked, setRateLocked] = useState(null); // seconds remaining
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(loginSchema) });

  async function onSubmit(data) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.status === 429) {
        const match = json.error?.match(/(\d+)\s*secondes?/i);
        const secs = match ? parseInt(match[1]) : 900;
        const minutes = Math.ceil(secs / 60);
        setRateLocked(minutes);
        toast.error(
          `🔒 Trop de tentatives — Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}`,
          { duration: 8000 },
        );
        return;
      }
      if (!res.ok) {
        toast.error(json.error || "Identifiants incorrects");
        return;
      }

      const role = json.data?.user?.role;
      toast.success("Connexion réussie !");
      setTimeout(() => {
        if (role === "SCHOOL_ADMIN" || role === "SUPER_ADMIN")
          window.location.href = "/dashboard/admin";
        else if (role === "TEACHER")
          window.location.href = "/dashboard/teacher";
        else window.location.href = "/dashboard/student";
      }, 500);
    } catch {
      toast.error("Erreur de connexion — vérifiez votre réseau");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <style>{`* { box-sizing: border-box; } input::placeholder { color: #475569; } @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Left — Branding */}
      <div
        style={{
          display: "none",
          width: "50%",
          background: "linear-gradient(160deg,#060d1f 0%,#0d1533 100%)",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
        className="login-left"
      >
        <style>{`@media(min-width:1024px){.login-left{display:flex!important}}`}</style>

        {/* Orbs */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle,rgba(26,58,235,0.18),transparent 70%)",
            top: "-100px",
            left: "-100px",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle,rgba(124,58,237,0.15),transparent 70%)",
            bottom: "0",
            right: "-80px",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "800",
              fontSize: "14px",
              fontFamily: "Syne, sans-serif",
            }}
          >
            SF
          </div>
          <div>
            <p
              style={{
                margin: 0,
                color: "white",
                fontWeight: "700",
                fontSize: "16px",
                fontFamily: "Syne, sans-serif",
                lineHeight: 1.1,
              }}
            >
              SchoolFlow
            </p>
            <p style={{ margin: 0, color: "#475569", fontSize: "11px" }}>
              by G-Tech Academy
            </p>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              margin: "0 0 16px",
              fontSize: "44px",
              fontWeight: "800",
              color: "white",
              fontFamily: "Syne, sans-serif",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
            }}
          >
            Gérez votre école
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#60a5fa,#a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              intelligemment.
            </span>
          </h1>
          <p
            style={{
              margin: "0 0 40px",
              fontSize: "16px",
              color: "#64748b",
              lineHeight: 1.7,
              fontWeight: "300",
              maxWidth: "380px",
            }}
          >
            La plateforme de gestion scolaire conçue pour les établissements
            guinéens.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              maxWidth: "360px",
            }}
          >
            {[
              ["120+", "Écoles actives"],
              ["45k+", "Élèves inscrits"],
              ["3.2k+", "Enseignants"],
              ["99.9%", "Disponibilité"],
            ].map(([v, l]) => (
              <div
                key={l}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: "22px",
                    fontWeight: "800",
                    color: "white",
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  {v}
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
                  {l}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p
          style={{
            position: "relative",
            zIndex: 1,
            margin: 0,
            fontSize: "12px",
            color: "#334155",
          }}
        >
          © 2024 SchoolFlow by G-Tech Academy
        </p>
      </div>

      {/* Right — Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            animation: "fadeUp 0.4s ease",
          }}
        >
          {/* Mobile logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "36px",
            }}
            className="mobile-logo"
          >
            <style>{`@media(min-width:1024px){.mobile-logo{display:none!important}}`}</style>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "800",
                fontSize: "13px",
                fontFamily: "Syne, sans-serif",
              }}
            >
              SF
            </div>
            <span
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: "16px",
                fontFamily: "Syne, sans-serif",
              }}
            >
              SchoolFlow
            </span>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: "26px",
                fontWeight: "800",
                color: "white",
                fontFamily: "Syne, sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              Bienvenue
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#64748b",
                fontWeight: "300",
              }}
            >
              Connectez-vous à votre espace
            </p>
          </div>

          {/* Rate limit warning */}
          {rateLocked && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "20px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "18px", flexShrink: 0 }}>🔒</span>
              <div>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#ef4444",
                  }}
                >
                  Compte temporairement bloqué
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#94a3b8",
                    fontWeight: "300",
                  }}
                >
                  Trop de tentatives. Réessayez dans {rateLocked} minute
                  {rateLocked > 1 ? "s" : ""}.
                </p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <Field label="Adresse email" error={errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                placeholder="vous@ecole.gn"
                style={iStyle(errors.email)}
                onFocus={iFocus}
                onBlur={iBlur}
              />
            </Field>

            <Field label="Mot de passe" error={errors.password?.message}>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                style={iStyle(errors.password)}
                onFocus={iFocus}
                onBlur={iBlur}
              />
            </Field>

            <div style={{ textAlign: "right", marginTop: "-8px" }}>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: "12px",
                  color: "#93c5fd",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!rateLocked}
              style={{
                height: "44px",
                background:
                  isSubmitting || rateLocked
                    ? "rgba(43,80,245,0.4)"
                    : "linear-gradient(135deg,#1a3aeb,#7c3aed)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontSize: "14px",
                fontWeight: "700",
                cursor: isSubmitting || rateLocked ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: "DM Sans, sans-serif",
                transition: "all 0.2s",
                boxShadow: "0 4px 20px rgba(43,80,245,0.3)",
              }}
            >
              {isSubmitting ? (
                <>
                  <BtnSpinner />
                  Connexion...
                </>
              ) : rateLocked ? (
                `🔒 Bloqué — ${rateLocked} min`
              ) : (
                "Se connecter →"
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "24px",
              fontSize: "13px",
              color: "#475569",
            }}
          >
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              style={{
                color: "#93c5fd",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Inscrire mon école
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p style={{ margin: 0, fontSize: "12px", color: "#ef4444" }}>{error}</p>
      )}
    </div>
  );
}
const iStyle = (err) => ({
  height: "44px",
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: `1px solid ${err ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.09)"}`,
  borderRadius: "12px",
  padding: "0 14px",
  color: "white",
  fontSize: "14px",
  outline: "none",
  fontFamily: "DM Sans, sans-serif",
  boxSizing: "border-box",
  transition: "all 0.2s",
});
const iFocus = (e) => {
  e.target.style.borderColor = "#2b50f5";
  e.target.style.boxShadow = "0 0 0 3px rgba(43,80,245,0.12)";
};
const iBlur = (e) => {
  e.target.style.borderColor = "rgba(255,255,255,0.09)";
  e.target.style.boxShadow = "none";
};
function BtnSpinner() {
  return (
    <div
      style={{
        width: "16px",
        height: "16px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "white",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
