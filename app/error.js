"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("[SchoolFlow Error]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Sans, sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            margin: "0 auto 24px",
          }}
        >
          ⚠️
        </div>

        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "28px",
            fontWeight: "800",
            color: "white",
            fontFamily: "Syne, sans-serif",
          }}
        >
          Une erreur s'est produite
        </h1>
        <p
          style={{
            margin: "0 0 32px",
            fontSize: "15px",
            color: "#64748b",
            lineHeight: 1.7,
            fontWeight: "300",
          }}
        >
          Quelque chose s'est mal passé. Notre équipe a été notifiée. Vous
          pouvez réessayer ou retourner au tableau de bord.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            🔄 Réessayer
          </button>
          <Link
            href="/dashboard/admin"
            style={{
              padding: "12px 24px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#e2e8f0",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            ← Tableau de bord
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "12px",
              textAlign: "left",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#ef4444",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Dev — Détail de l'erreur
            </p>
            <pre
              style={{
                margin: 0,
                fontSize: "11px",
                color: "#94a3b8",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {error?.message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
