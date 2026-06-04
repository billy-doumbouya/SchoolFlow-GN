"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  PageHeader,
} from "@/components/ui";
import { LogoUpload } from "@/components/ui/AvatarUpload";
import { useAuth } from "@/hooks";

export default function SchoolSettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    logoUrl: "",
    academicYear: "",
  });

  useEffect(() => {
    if (user?.tenant) {
      setForm({
        name: user.tenant.name || "",
        email: user.tenant.email || "",
        phone: user.tenant.phone || "",
        address: user.tenant.address || "",
        logoUrl: user.tenant.logoUrl || "",
        academicYear:
          user.tenant.academicYear ||
          `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      });
    }
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/school/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Paramètres enregistrés");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  function Field({ children }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "32px",
        fontFamily: "DM Sans, sans-serif",
        maxWidth: "800px",
      }}
    >
      <PageHeader
        title="Paramètres de l'école"
        subtitle="Informations et configuration de votre établissement"
      />

      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {/* School identity */}
        <Card>
          <CardHeader>
            <CardTitle>🏫 Identité de l'établissement</CardTitle>
          </CardHeader>
          <CardContent
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Input
                label="Nom de l'école"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="École Excellence Conakry"
              />
              <Input
                label="Email officiel"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@ecole.gn"
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Input
                label="Téléphone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+224 6XX XXX XXX"
              />
              <Input
                label="Année scolaire active"
                value={form.academicYear}
                onChange={(e) =>
                  setForm({ ...form, academicYear: e.target.value })
                }
                placeholder="2024-2025"
              />
            </div>
            <Input
              label="Adresse"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Kaloum, Conakry, Guinée"
            />
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>🖼️ Logo de l'école</CardTitle>
          </CardHeader>
          <CardContent
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <Input
              label="URL du logo"
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://votre-ecole.gn/logo.png"
            />
            {form.logoUrl && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <img
                  src={form.logoUrl}
                  alt="Logo"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "12px",
                    objectFit: "contain",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "4px",
                  }}
                  onError={(e) => (e.target.style.display = "none")}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "300",
                  }}
                >
                  Aperçu du logo affiché dans l'application
                </p>
              </div>
            )}
            <div
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.15)",
                borderRadius: "10px",
                padding: "12px 14px",
              }}
            >
              <p style={{ margin: 0, fontSize: "12px", color: "#fbbf24" }}>
                💡 Hébergez votre logo sur un service comme Cloudinary, Imgur ou
                votre serveur web, puis collez l'URL ici.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logo with upload */}
        <Card>
          <CardHeader>
            <CardTitle>🖼️ Logo de l'établissement</CardTitle>
          </CardHeader>
          <CardContent
            style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}
          >
            <LogoUpload
              currentUrl={form.logoUrl}
              schoolName={form.name}
              onUpload={(url) => setForm({ ...form, logoUrl: url })}
            />
            <div style={{ flex: 1 }}>
              <Input
                label="URL du logo (optionnel)"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="Ou collez une URL directement"
              />
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "11px",
                  color: "#475569",
                  fontWeight: "300",
                  lineHeight: 1.6,
                }}
              >
                Uploadez votre logo directement ou collez une URL. Le logo
                apparaît dans la sidebar et les documents.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card
          style={{
            border: "1px solid rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.04)",
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: "#ef4444" }}>
              ⚠️ Zone de danger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: "13px",
                color: "#94a3b8",
                fontWeight: "300",
              }}
            >
              Ces actions sont irréversibles. Contactez le support avant de
              procéder.
            </p>
            <button
              type="button"
              disabled
              style={{
                padding: "8px 16px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px",
                color: "#ef4444",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "not-allowed",
                opacity: 0.5,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Supprimer toutes les données — contacter support
            </button>
          </CardContent>
        </Card>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" loading={saving} size="lg">
            Enregistrer les paramètres
          </Button>
        </div>
      </form>
    </div>
  );
}
