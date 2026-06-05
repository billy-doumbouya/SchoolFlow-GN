"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Step indicator ───────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ["Téléphone", "Code WhatsApp", "Nouveau mot de passe"];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "32px",
        justifyContent: "center",
      }}
    >
      {steps.map((s, i) => (
        <div
          key={s}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background:
                  i < current
                    ? "#22c55e"
                    : i === current
                      ? "linear-gradient(135deg,#1a3aeb,#7c3aed)"
                      : "rgba(255,255,255,0.08)",
                border: `2px solid ${i <= current ? "transparent" : "rgba(255,255,255,0.12)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "700",
                color: "white",
                transition: "all 0.3s",
              }}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontSize: "10px",
                color: i === current ? "#93c5fd" : "#475569",
                fontWeight: i === current ? "600" : "400",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                width: "40px",
                height: "2px",
                background: i < current ? "#22c55e" : "rgba(255,255,255,0.08)",
                marginBottom: "16px",
                transition: "background 0.3s",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <p style={{ margin: 0, fontSize: "12px", color: "#ef4444" }}>{error}</p>
      )}
    </div>
  );
}

const inputStyle = (err) => ({
  height: "44px",
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: `1px solid ${err ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
  borderRadius: "12px",
  padding: "0 14px",
  color: "white",
  fontSize: "15px",
  outline: "none",
  fontFamily: "DM Sans, sans-serif",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
});

const btnStyle = (loading) => ({
  width: "100%",
  height: "46px",
  background: loading
    ? "rgba(43,80,245,0.5)"
    : "linear-gradient(135deg,#1a3aeb,#7c3aed)",
  border: "none",
  borderRadius: "12px",
  color: "white",
  fontSize: "15px",
  fontWeight: "600",
  cursor: loading ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontFamily: "DM Sans, sans-serif",
  transition: "all 0.2s",
});

// ─── Step 1 — Phone ───────────────────────────────────────────────────────────
function StepPhone({ onSuccess }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!phone.trim()) return setError("Entrez votre numéro de téléphone");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onSuccess(phone);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📱</div>
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "800",
            color: "white",
            fontFamily: "Syne, sans-serif",
          }}
        >
          Mot de passe oublié ?
        </h2>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "14px",
            color: "#64748b",
            fontWeight: "300",
            lineHeight: 1.6,
          }}
        >
          Entrez votre numéro WhatsApp enregistré.
          <br />
          Nous vous enverrons un code de vérification.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "13px",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}

      <Field label="Numéro WhatsApp" error={null}>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "18px",
            }}
          >
            🇬🇳
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+224 6XX XXX XXX"
            style={{ ...inputStyle(false), paddingLeft: "44px" }}
            onFocus={(e) => (e.target.style.borderColor = "#2b50f5")}
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(255,255,255,0.1)")
            }
          />
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            color: "#475569",
            fontWeight: "300",
          }}
        >
          Le numéro doit être enregistré dans votre profil
        </p>
      </Field>

      <button type="submit" disabled={loading} style={btnStyle(loading)}>
        {loading ? (
          <>
            <Spinner />
            Envoi en cours...
          </>
        ) : (
          <>Recevoir le code WhatsApp 📲</>
        )}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: "13px",
          color: "#475569",
          margin: 0,
        }}
      >
        <Link
          href="/login"
          style={{
            color: "#93c5fd",
            textDecoration: "none",
            fontWeight: "500",
          }}
        >
          ← Retour à la connexion
        </Link>
      </p>
    </form>
  );
}

// ─── Step 2 — OTP ─────────────────────────────────────────────────────────────
function StepOTP({ phone, onSuccess }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  function handleChange(val, idx) {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[idx] = val.slice(-1);
    setCode(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  }

  function handleKeyDown(e, idx) {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) return setError("Entrez les 6 chiffres du code");
    setLoading(true);
    setError("");
    try {
      // We verify on the reset step — here just proceed
      onSuccess(fullCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResent(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setTimeout(() => setResent(false), 30000);
  }

  const maskedPhone = phone.replace(/(\+\d{3})\d+(\d{4})/, "$1•••••$2");

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "800",
            color: "white",
            fontFamily: "Syne, sans-serif",
          }}
        >
          Code de vérification
        </h2>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "14px",
            color: "#64748b",
            fontWeight: "300",
            lineHeight: 1.6,
          }}
        >
          Nous avons envoyé un code à 6 chiffres
          <br />
          sur WhatsApp au{" "}
          <strong style={{ color: "#e2e8f0" }}>{maskedPhone}</strong>
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "13px",
            color: "#ef4444",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* OTP inputs */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        {code.map((digit, idx) => (
          <input
            key={idx}
            id={`otp-${idx}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            style={{
              width: "46px",
              height: "56px",
              background: digit
                ? "rgba(43,80,245,0.2)"
                : "rgba(255,255,255,0.05)",
              border: `2px solid ${digit ? "rgba(43,80,245,0.6)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "12px",
              color: "white",
              fontSize: "22px",
              fontWeight: "800",
              textAlign: "center",
              outline: "none",
              fontFamily: "Syne, sans-serif",
              transition: "all 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2b50f5")}
            onBlur={(e) =>
              (e.target.style.borderColor = digit
                ? "rgba(43,80,245,0.6)"
                : "rgba(255,255,255,0.1)")
            }
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={loading || code.join("").length < 6}
        style={btnStyle(loading)}
      >
        {loading ? (
          <>
            <Spinner />
            Vérification...
          </>
        ) : (
          "Vérifier le code →"
        )}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: "13px",
          color: "#475569",
          margin: 0,
        }}
      >
        Vous n'avez pas reçu le code ?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resent}
          style={{
            background: "none",
            border: "none",
            color: resent ? "#475569" : "#93c5fd",
            cursor: resent ? "default" : "pointer",
            fontSize: "13px",
            fontWeight: "500",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {resent ? "Code renvoyé ✓" : "Renvoyer"}
        </button>
      </p>
    </form>
  );
}

// ─── Step 3 — New Password ────────────────────────────────────────────────────
function StepNewPassword({ phone, code, onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8)
      return setError("Le mot de passe doit contenir au moins 8 caractères");
    if (password !== confirm)
      return setError("Les mots de passe ne correspondent pas");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, newPassword: password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔐</div>
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "800",
            color: "white",
            fontFamily: "Syne, sans-serif",
          }}
        >
          Nouveau mot de passe
        </h2>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "14px",
            color: "#64748b",
            fontWeight: "300",
          }}
        >
          Choisissez un mot de passe sécurisé
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "13px",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}

      <Field label="Nouveau mot de passe">
        <div style={{ position: "relative" }}>
          <input
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 caractères"
            style={{ ...inputStyle(false), paddingRight: "44px" }}
            onFocus={(e) => (e.target.style.borderColor = "#2b50f5")}
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(255,255,255,0.1)")
            }
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#475569",
              padding: 0,
            }}
          >
            {showPwd ? "🙈" : "👁️"}
          </button>
        </div>
      </Field>

      <Field label="Confirmer le mot de passe">
        <input
          type={showPwd ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Répétez le mot de passe"
          style={inputStyle(confirm && confirm !== password)}
          onFocus={(e) => (e.target.style.borderColor = "#2b50f5")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        {confirm && confirm !== password && (
          <p style={{ margin: 0, fontSize: "12px", color: "#ef4444" }}>
            Les mots de passe ne correspondent pas
          </p>
        )}
      </Field>

      {/* Strength indicator */}
      {password && (
        <div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
            {[1, 2, 3, 4].map((i) => {
              const strength =
                password.length >= 12
                  ? 4
                  : password.length >= 10
                    ? 3
                    : password.length >= 8
                      ? 2
                      : 1;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: "3px",
                    borderRadius: "2px",
                    background:
                      i <= strength
                        ? ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][
                            strength
                          ]
                        : "rgba(255,255,255,0.1)",
                    transition: "background 0.3s",
                  }}
                />
              );
            })}
          </div>
          <p style={{ margin: 0, fontSize: "11px", color: "#475569" }}>
            {password.length < 8
              ? "Trop court"
              : password.length < 10
                ? "Acceptable"
                : password.length < 12
                  ? "Bien"
                  : "Excellent ✓"}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || password.length < 8 || password !== confirm}
        style={btnStyle(loading)}
      >
        {loading ? (
          <>
            <Spinner />
            Réinitialisation...
          </>
        ) : (
          "✅ Réinitialiser le mot de passe"
        )}
      </button>
    </form>
  );
}

// ─── Step 4 — Success ─────────────────────────────────────────────────────────
function StepSuccess() {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
      <h2
        style={{
          margin: 0,
          fontSize: "22px",
          fontWeight: "800",
          color: "white",
          fontFamily: "Syne, sans-serif",
        }}
      >
        Mot de passe réinitialisé !
      </h2>
      <p
        style={{
          margin: "12px 0 28px",
          fontSize: "14px",
          color: "#64748b",
          fontWeight: "300",
          lineHeight: 1.6,
        }}
      >
        Votre mot de passe a été modifié avec succès.
        <br />
        Vous pouvez maintenant vous connecter.
      </p>
      <Link
        href="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 28px",
          background: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
          borderRadius: "12px",
          color: "white",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        Se connecter →
      </Link>
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: "16px",
        height: "16px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "white",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        display: "inline-block",
      }}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(0); // 0=phone, 1=otp, 2=new password, 3=success
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        input::placeholder { color: #475569; }
      `}</style>

      {/* Background orbs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle,#1a3aeb33,transparent 70%)",
            top: "-100px",
            left: "-100px",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "350px",
            height: "350px",
            background: "radial-gradient(circle,#7c3aed22,transparent 70%)",
            bottom: "0",
            right: "0",
            borderRadius: "50%",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                background: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "800",
                fontFamily: "Syne, sans-serif",
                position: "relative",
              }}
            >
              <Image
                src="/schoolflow-logo.png"
                alt="SchoolFlow"
                width={52}
                height={52}
                className="nav-logo-img"
              />
            </div>
            <div style={{ textAlign: "left" }}>
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
        </div>

        {/* Card */}
        <div
          style={{
            background: "#0f1729",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "32px 28px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          }}
        >
          {step < 3 && <Steps current={step} />}

          {step === 0 && (
            <StepPhone
              onSuccess={(p) => {
                setPhone(p);
                setStep(1);
              }}
            />
          )}
          {step === 1 && (
            <StepOTP
              phone={phone}
              onSuccess={(c) => {
                setCode(c);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <StepNewPassword
              phone={phone}
              code={code}
              onSuccess={() => setStep(3)}
            />
          )}
          {step === 3 && <StepSuccess />}
        </div>
      </div>
    </div>
  );
}
