"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchoolSchema } from "@/schemas";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(registerSchoolSchema) });

  async function onSubmit(data) {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.status === 429) {
        toast.error("Trop de tentatives. Réessayez plus tard.");
        return;
      }
      if (!res.ok) {
        toast.error(json.error || "Erreur lors de l'inscription");
        return;
      }
      toast.success("École créée avec succès ! Redirection...");
      setTimeout(() => {
        window.location.href = "/dashboard/admin";
      }, 800);
    } catch {
      toast.error("Erreur réseau — réessayez");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <style>{`* { box-sizing: border-box; } input::placeholder { color: #475569; } @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          animation: "fadeUp 0.4s ease",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "32px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              background: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
              borderRadius: "11px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "800",
              fontFamily: "Syne, sans-serif",
            }}
          >
            <Image
              src="/schoolflow-logo.png"
              alt="SchoolFlow"
              width={20}
              height={20}
            />
          </div>
          <div>
            <p
              style={{
                margin: 0,
                color: "white",
                fontWeight: "700",
                fontSize: "15px",
                fontFamily: "Syne, sans-serif",
                lineHeight: 1.1,
              }}
            >
              SchoolFlow-GN
            </p>
            <p style={{ margin: 0, color: "#475569", fontSize: "10px" }}>
              by G-Tech Academy
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#0f1623",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "36px 32px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: "24px",
                fontWeight: "800",
                color: "white",
                fontFamily: "Syne, sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              Créer mon école
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#64748b",
                fontWeight: "300",
              }}
            >
              Démarrez gratuitement en moins de 2 minutes
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* School info */}
            <div
              style={{
                background: "rgba(43,80,245,0.05)",
                border: "1px solid rgba(43,80,245,0.12)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#93c5fd",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                🏫 Informations de l'école
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <RegField
                  label="Nom de l'école"
                  error={errors.schoolName?.message}
                  required
                >
                  <input
                    {...register("schoolName")}
                    placeholder="École Excellence"
                    style={iStyle(errors.schoolName)}
                    onFocus={iFocus}
                    onBlur={iBlur}
                  />
                </RegField>
                <RegField
                  label="Email de l'école"
                  error={errors.schoolEmail?.message}
                  required
                >
                  <input
                    {...register("schoolEmail")}
                    type="email"
                    placeholder="contact@ecole.gn"
                    style={iStyle(errors.schoolEmail)}
                    onFocus={iFocus}
                    onBlur={iBlur}
                  />
                </RegField>
              </div>
            </div>

            {/* Admin info */}
            <div
              style={{
                background: "rgba(124,58,237,0.05)",
                border: "1px solid rgba(124,58,237,0.12)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#a78bfa",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                👤 Compte administrateur
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <RegField
                  label="Prénom"
                  error={errors.adminFirstName?.message}
                  required
                >
                  <input
                    {...register("adminFirstName")}
                    placeholder="Mamadou"
                    style={iStyle(errors.adminFirstName)}
                    onFocus={iFocus}
                    onBlur={iBlur}
                  />
                </RegField>
                <RegField
                  label="Nom"
                  error={errors.adminLastName?.message}
                  required
                >
                  <input
                    {...register("adminLastName")}
                    placeholder="Diallo"
                    style={iStyle(errors.adminLastName)}
                    onFocus={iFocus}
                    onBlur={iBlur}
                  />
                </RegField>
              </div>
              <RegField
                label="Email administrateur"
                error={errors.adminEmail?.message}
                required
              >
                <input
                  {...register("adminEmail")}
                  type="email"
                  placeholder="admin@ecole.gn"
                  style={iStyle(errors.adminEmail)}
                  onFocus={iFocus}
                  onBlur={iBlur}
                />
              </RegField>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <RegField
                  label="Mot de passe"
                  error={errors.adminPassword?.message}
                  required
                >
                  <input
                    {...register("adminPassword")}
                    type="password"
                    placeholder="Min. 8 caractères"
                    style={iStyle(errors.adminPassword)}
                    onFocus={iFocus}
                    onBlur={iBlur}
                  />
                </RegField>
                <RegField
                  label="Confirmer"
                  error={errors.confirmPassword?.message}
                  required
                >
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder="Répéter"
                    style={iStyle(errors.confirmPassword)}
                    onFocus={iFocus}
                    onBlur={iBlur}
                  />
                </RegField>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                height: "46px",
                background: isSubmitting
                  ? "rgba(43,80,245,0.4)"
                  : "linear-gradient(135deg,#1a3aeb,#7c3aed)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontSize: "14px",
                fontWeight: "700",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: "DM Sans, sans-serif",
                boxShadow: "0 4px 24px rgba(43,80,245,0.3)",
                transition: "all 0.2s",
                marginTop: "4px",
              }}
            >
              {isSubmitting ? (
                <>
                  <BtnSpinner />
                  Création en cours...
                </>
              ) : (
                "🚀 Créer mon espace école"
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "12px",
              color: "#475569",
            }}
          >
            Déjà inscrit ?{" "}
            <Link
              href="/login"
              style={{
                color: "#93c5fd",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegField({ label, error, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
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
        {required && (
          <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>
        )}
      </label>
      {children}
      {error && (
        <p style={{ margin: 0, fontSize: "11px", color: "#ef4444" }}>{error}</p>
      )}
    </div>
  );
}
const iStyle = (err) => ({
  height: "38px",
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: `1px solid ${err ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
  borderRadius: "10px",
  padding: "0 12px",
  color: "white",
  fontSize: "13px",
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
  e.target.style.borderColor = "rgba(255,255,255,0.08)";
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
