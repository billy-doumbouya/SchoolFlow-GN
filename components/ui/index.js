"use client";
// ─── SchoolFlow Dark Design System ───────────────────────────────────────────
// All components follow the brand: #0f1623 bg, Syne titles, DM Sans body
// Blue→Violet gradient for primary actions

// ─── cn helper ────────────────────────────────────────────────────────────────
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// ─── Design tokens ────────────────────────────────────────────────────────────
export const tokens = {
  bg: "#0f1623",
  bgCard: "#131c2e",
  bgInput: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(43,80,245,0.4)",
  text: "#e2e8f0",
  muted: "#94a3b8",
  faint: "#475569",
  grad: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
  gradHover: "linear-gradient(135deg,#1530d0,#6d28d9)",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

const T = tokens;

// ─── Button ───────────────────────────────────────────────────────────────────
const btnVariants = {
  primary: {
    background: T.grad,
    color: "white",
    border: "none",
    boxShadow: "0 4px 20px rgba(43,80,245,0.3)",
  },
  secondary: {
    background: "rgba(255,255,255,0.06)",
    color: T.text,
    border: `1px solid ${T.border}`,
  },
  danger: {
    background: "rgba(239,68,68,0.15)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.3)",
  },
  ghost: {
    background: "transparent",
    color: T.muted,
    border: "none",
  },
  outline: {
    background: "transparent",
    color: T.text,
    border: `1px solid ${T.border}`,
  },
};
const btnSizes = {
  sm: {
    height: "32px",
    padding: "0 12px",
    fontSize: "12px",
    borderRadius: "8px",
  },
  md: {
    height: "38px",
    padding: "0 16px",
    fontSize: "13px",
    borderRadius: "10px",
  },
  lg: {
    height: "44px",
    padding: "0 24px",
    fontSize: "15px",
    borderRadius: "12px",
  },
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  loading,
  style,
  ...props
}) {
  const v = btnVariants[variant] || btnVariants.primary;
  const s = btnSizes[size] || btnSizes.md;
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontWeight: "600",
        fontFamily: "DM Sans, sans-serif",
        cursor: loading || props.disabled ? "not-allowed" : "pointer",
        opacity: loading || props.disabled ? 0.5 : 1,
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        ...v,
        ...s,
        ...style,
      }}
      disabled={loading || props.disabled}
      onMouseEnter={(e) => {
        if (!loading && !props.disabled)
          e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ className, children, style, hover, ...props }) {
  return (
    <div
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: "20px",
        transition: "all 0.3s",
        ...style,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              e.currentTarget.style.borderColor = T.borderHover;
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.transform = "translateY(0)";
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, style }) {
  return (
    <div
      style={{
        padding: "20px 24px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, style }) {
  return (
    <h3
      style={{
        margin: 0,
        fontSize: "15px",
        fontWeight: "700",
        color: "white",
        fontFamily: "Syne, sans-serif",
        ...style,
      }}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, style }) {
  return <div style={{ padding: "20px 24px", ...style }}>{children}</div>;
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeStyles = {
  default: {
    bg: "rgba(148,163,184,0.12)",
    color: "#94a3b8",
    border: "rgba(148,163,184,0.2)",
  },
  success: {
    bg: "rgba(34,197,94,0.12)",
    color: "#22c55e",
    border: "rgba(34,197,94,0.25)",
  },
  warning: {
    bg: "rgba(245,158,11,0.12)",
    color: "#f59e0b",
    border: "rgba(245,158,11,0.25)",
  },
  danger: {
    bg: "rgba(239,68,68,0.12)",
    color: "#ef4444",
    border: "rgba(239,68,68,0.25)",
  },
  info: {
    bg: "rgba(59,130,246,0.12)",
    color: "#60a5fa",
    border: "rgba(59,130,246,0.25)",
  },
  brand: {
    bg: "rgba(43,80,245,0.15)",
    color: "#93c5fd",
    border: "rgba(43,80,245,0.3)",
  },
};

export function Badge({ variant = "default", children, style }) {
  const b = badgeStyles[variant] || badgeStyles.default;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: "600",
        background: b.bg,
        color: b.color,
        border: `1px solid ${b.border}`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, required, style, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: T.muted,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
          {required && (
            <span style={{ color: T.danger, marginLeft: "3px" }}>*</span>
          )}
        </label>
      )}
      <input
        style={{
          height: "40px",
          background: T.bgInput,
          border: `1px solid ${error ? "rgba(239,68,68,0.5)" : T.border}`,
          borderRadius: "10px",
          padding: "0 14px",
          color: "white",
          fontSize: "14px",
          outline: "none",
          width: "100%",
          fontFamily: "DM Sans, sans-serif",
          transition: "border-color 0.2s",
          boxSizing: "border-box",
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#2b50f5";
          e.target.style.boxShadow = "0 0 0 3px rgba(43,80,245,0.15)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "rgba(239,68,68,0.5)" : T.border;
          e.target.style.boxShadow = "none";
        }}
        {...props}
      />
      {error && (
        <p style={{ margin: 0, fontSize: "12px", color: T.danger }}>{error}</p>
      )}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, required, children, style, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: T.muted,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
          {required && (
            <span style={{ color: T.danger, marginLeft: "3px" }}>*</span>
          )}
        </label>
      )}
      <select
        style={{
          height: "40px",
          background: "#131c2e",
          border: `1px solid ${error ? "rgba(239,68,68,0.5)" : T.border}`,
          borderRadius: "10px",
          padding: "0 14px",
          color: "white",
          fontSize: "14px",
          outline: "none",
          width: "100%",
          fontFamily: "DM Sans, sans-serif",
          cursor: "pointer",
          transition: "border-color 0.2s",
          boxSizing: "border-box",
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#2b50f5";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = T.border;
        }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p style={{ margin: 0, fontSize: "12px", color: T.danger }}>{error}</p>
      )}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, error, style, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: T.muted,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </label>
      )}
      <textarea
        style={{
          minHeight: "80px",
          background: T.bgInput,
          border: `1px solid ${error ? "rgba(239,68,68,0.5)" : T.border}`,
          borderRadius: "10px",
          padding: "10px 14px",
          color: "white",
          fontSize: "14px",
          outline: "none",
          width: "100%",
          fontFamily: "DM Sans, sans-serif",
          resize: "vertical",
          transition: "border-color 0.2s",
          boxSizing: "border-box",
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#2b50f5";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = T.border;
        }}
        {...props}
      />
      {error && (
        <p style={{ margin: 0, fontSize: "12px", color: T.danger }}>{error}</p>
      )}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ children }) {
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}
      >
        {children}
      </table>
    </div>
  );
}
export function TableHead({ children }) {
  return (
    <thead
      style={{
        background: "rgba(255,255,255,0.03)",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <tr>{children}</tr>
    </thead>
  );
}
export function Th({ children, style }) {
  return (
    <th
      style={{
        padding: "12px 16px",
        textAlign: "left",
        fontSize: "11px",
        fontWeight: "700",
        color: T.faint,
        textTransform: "uppercase",
        letterSpacing: "0.6px",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </th>
  );
}
export function TableBody({ children }) {
  return <tbody style={{ divide: `1px solid ${T.border}` }}>{children}</tbody>;
}
export function Tr({ children, onClick, style }) {
  return (
    <tr
      style={{
        borderBottom: `1px solid rgba(255,255,255,0.04)`,
        transition: "background 0.15s",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}
export function Td({ children, style }) {
  return (
    <td
      style={{
        padding: "13px 16px",
        color: T.text,
        verticalAlign: "middle",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
const modalSizes = { sm: "400px", md: "520px", lg: "680px", xl: "860px" };

export function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          background: T.bgCard,
          border: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: "24px",
          width: "100%",
          maxWidth: modalSizes[size],
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "modalIn 0.2s ease",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(-12px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "700",
              color: "white",
              fontFamily: "Syne, sans-serif",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              color: T.muted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.15)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = T.muted;
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const avatarSizes = {
  xs: { width: "24px", height: "24px", fontSize: "9px" },
  sm: { width: "32px", height: "32px", fontSize: "11px" },
  md: { width: "40px", height: "40px", fontSize: "14px" },
  lg: { width: "56px", height: "56px", fontSize: "18px" },
  xl: { width: "72px", height: "72px", fontSize: "24px" },
};
const avatarColors = [
  "linear-gradient(135deg,#1a3aeb,#7c3aed)",
  "linear-gradient(135deg,#059669,#10b981)",
  "linear-gradient(135deg,#d97706,#f59e0b)",
  "linear-gradient(135deg,#db2777,#ec4899)",
  "linear-gradient(135deg,#7c3aed,#a855f7)",
];

export function Avatar({ name, src, size = "md", style }) {
  const s = avatarSizes[size] || avatarSizes.md;
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";
  const color = avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

  if (src)
    return (
      <img
        src={src}
        alt={name}
        style={{ ...s, borderRadius: "50%", objectFit: "cover", ...style }}
      />
    );
  return (
    <div
      style={{
        ...s,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "700",
        fontFamily: "Syne, sans-serif",
        flexShrink: 0,
        ...style,
      }}
    >
      {initials}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
const statColors = {
  blue: {
    icon: "rgba(59,130,246,0.15)",
    text: "#60a5fa",
    glow: "rgba(59,130,246,0.2)",
  },
  green: {
    icon: "rgba(34,197,94,0.15)",
    text: "#4ade80",
    glow: "rgba(34,197,94,0.2)",
  },
  purple: {
    icon: "rgba(139,92,246,0.15)",
    text: "#a78bfa",
    glow: "rgba(139,92,246,0.2)",
  },
  amber: {
    icon: "rgba(245,158,11,0.15)",
    text: "#fbbf24",
    glow: "rgba(245,158,11,0.2)",
  },
  pink: {
    icon: "rgba(236,72,153,0.15)",
    text: "#f472b6",
    glow: "rgba(236,72,153,0.2)",
  },
};

export function StatCard({ title, value, icon, trend, color = "blue", style }) {
  const c = statColors[color] || statColors.blue;
  return (
    <div
      style={{
        background: T.bgCard,
        border: `1px solid ${T.border}`,
        borderRadius: "20px",
        padding: "20px",
        transition: "all 0.3s",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = c.glow;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "12px",
              color: T.faint,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "800",
              color: "white",
              fontFamily: "Syne, sans-serif",
              lineHeight: 1,
            }}
          >
            {value}
          </p>
          {trend && (
            <p style={{ margin: "6px 0 0", fontSize: "11px", color: T.faint }}>
              {trend}
            </p>
          )}
        </div>
        <div
          style={{
            width: "44px",
            height: "44px",
            background: c.icon,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: c.text,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ title, description, action, icon }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${T.border}`,
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          fontSize: "24px",
        }}
      >
        {icon || "📭"}
      </div>
      <h3
        style={{
          margin: "0 0 6px",
          fontSize: "15px",
          fontWeight: "700",
          color: "white",
          fontFamily: "Syne, sans-serif",
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: "0 0 20px",
            fontSize: "13px",
            color: T.faint,
            maxWidth: "300px",
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = [];
  for (let i = 1; i <= Math.min(5, totalPages); i++) pages.push(i);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <p style={{ margin: 0, fontSize: "12px", color: T.faint }}>
        {start}–{end} sur {total}
      </p>
      <div style={{ display: "flex", gap: "4px" }}>
        <PageBtn
          onClick={() => onPageChange(page - 1)}
          disabled={!pagination.hasPrev}
        >
          ‹
        </PageBtn>
        {pages.map((p) => (
          <PageBtn key={p} onClick={() => onPageChange(p)} active={p === page}>
            {p}
          </PageBtn>
        ))}
        <PageBtn
          onClick={() => onPageChange(page + 1)}
          disabled={!pagination.hasNext}
        >
          ›
        </PageBtn>
      </div>
    </div>
  );
}
function PageBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "8px",
        border: "none",
        background: active ? T.grad : "rgba(255,255,255,0.04)",
        color: active ? "white" : T.muted,
        fontSize: "12px",
        fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.3 : 1,
        transition: "all 0.15s",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {children}
    </button>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = "md" }) {
  const s = { sm: "14px", md: "20px", lg: "32px" }[size];
  return (
    <div
      style={{
        width: s,
        height: s,
        border: "2.5px solid rgba(43,80,245,0.2)",
        borderTopColor: "#2b50f5",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "300px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Spinner size="lg" />
        <p style={{ margin: 0, fontSize: "13px", color: T.faint }}>
          Chargement...
        </p>
      </div>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action, back }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "28px",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div>
        {back && (
          <a
            href={back}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: T.faint,
              textDecoration: "none",
              marginBottom: "8px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#93c5fd")}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.faint)}
          >
            ← Retour
          </a>
        )}
        <h1
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: "800",
            color: "white",
            fontFamily: "Syne, sans-serif",
            letterSpacing: "-0.5px",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: T.faint,
              fontWeight: "300",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

// ─── SectionBadge ─────────────────────────────────────────────────────────────
export function SectionBadge({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 12px",
        background: "rgba(43,80,245,0.15)",
        border: "1px solid rgba(43,80,245,0.3)",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: "600",
        color: "#93c5fd",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
      }}
    >
      {children}
    </span>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────
export function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher...",
  style,
}) {
  return (
    <div style={{ position: "relative", maxWidth: "320px", ...style }}>
      <svg
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "15px",
          height: "15px",
          color: "#475569",
        }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          height: "38px",
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${T.border}`,
          borderRadius: "10px",
          paddingLeft: "36px",
          paddingRight: "14px",
          color: "white",
          fontSize: "13px",
          outline: "none",
          fontFamily: "DM Sans, sans-serif",
          transition: "border-color 0.2s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#2b50f5")}
        onBlur={(e) => (e.target.style.borderColor = T.border)}
      />
    </div>
  );
}

// ─── FilterTabs ───────────────────────────────────────────────────────────────
export function FilterTabs({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            border: `1px solid ${value === o.value ? "transparent" : T.border}`,
            background: value === o.value ? T.grad : "rgba(255,255,255,0.03)",
            color: value === o.value ? "white" : T.muted,
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmer",
  confirmVariant = "danger",
  loading,
}) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p
        style={{
          margin: "0 0 24px",
          fontSize: "14px",
          color: T.muted,
          lineHeight: 1.7,
        }}
      >
        {message}
      </p>
      <div style={{ display: "flex", gap: "10px" }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
          Annuler
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          loading={loading}
          style={{ flex: 1 }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
