import Link from "next/link";

export const metadata = {
  title: "Politique de Confidentialité — SchoolFlow",
};

export default function PrivacyPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        fontFamily: "DM Sans, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <style>{` * { box-sizing: border-box; } h1,h2,h3{font-family:'Syne',sans-serif;color:white;} p,li{line-height:1.8;font-weight:300;color:#94a3b8;} strong{color:#e2e8f0;font-weight:600;} a{color:#93c5fd;}`}</style>

      <nav
        style={{
          background: "rgba(10,15,30,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(20px)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg,#1a3aeb,#7c3aed)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "800",
              fontSize: "12px",
              fontFamily: "Syne, sans-serif",
            }}
          >
            SF
          </div>
          <span
            style={{
              color: "white",
              fontWeight: "700",
              fontSize: "15px",
              fontFamily: "Syne, sans-serif",
            }}
          >
            SchoolFlow
          </span>
        </Link>
        <Link
          href="/"
          style={{ fontSize: "13px", color: "#94a3b8", textDecoration: "none" }}
        >
          ← Retour à l'accueil
        </Link>
      </nav>

      <div
        style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}
      >
        <div
          style={{
            marginBottom: "48px",
            paddingBottom: "32px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              background: "rgba(43,80,245,0.15)",
              border: "1px solid rgba(43,80,245,0.3)",
              borderRadius: "999px",
              fontSize: "12px",
              color: "#93c5fd",
              fontWeight: "600",
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Document légal
          </div>
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "36px",
              letterSpacing: "-1px",
            }}
          >
            Politique de Confidentialité
          </h1>
          <p style={{ margin: 0, fontSize: "14px" }}>
            Dernière mise à jour : <strong>1er juin 2024</strong> — SchoolFlow
            by G-Tech Academy
          </p>
        </div>

        {[
          {
            title: "1. Responsable du traitement",
            content: (
              <p>
                <strong>G-Tech Academy</strong>, Conakry, République de Guinée —{" "}
                <a href="mailto:contact@gtechacademy.gn">
                  contact@gtechacademy.gn
                </a>
              </p>
            ),
          },
          {
            title: "2. Données collectées",
            content: (
              <>
                <p>
                  Nous collectons : nom, prénom, email, numéro de téléphone
                  WhatsApp, données académiques (notes, classes), données de
                  connexion (IP, navigateur), données de paiement (traitées par
                  GuinePay — nous ne stockons pas les numéros de carte).
                </p>
              </>
            ),
          },
          {
            title: "3. Finalités du traitement",
            content: (
              <ul>
                <li>Fourniture et amélioration du service</li>
                <li>
                  Envoi de notifications WhatsApp (identifiants, résultats,
                  paiements)
                </li>
                <li>Gestion des abonnements et paiements</li>
                <li>Sécurité et prévention des fraudes</li>
                <li>Obligations légales et comptables</li>
              </ul>
            ),
          },
          {
            title: "4. Base légale",
            content: (
              <p>
                Le traitement est fondé sur : l'exécution du contrat (CGU),
                votre consentement (notifications WhatsApp), notre intérêt
                légitime (sécurité) et nos obligations légales.
              </p>
            ),
          },
          {
            title: "5. Partage des données",
            content: (
              <>
                <p>
                  Vos données ne sont jamais vendues. Elles peuvent être
                  partagées avec :
                </p>
                <ul>
                  <li>
                    <strong>Twilio</strong> — pour les messages WhatsApp
                  </li>
                  <li>
                    <strong>GuinePay</strong> — pour les paiements
                  </li>
                  <li>
                    <strong>Neon</strong> — hébergeur base de données (UE)
                  </li>
                  <li>Autorités légales si requis par la loi</li>
                </ul>
              </>
            ),
          },
          {
            title: "6. Sécurité",
            content: (
              <p>
                Mots de passe chiffrés (bcrypt), transmission HTTPS, isolation
                des données par établissement, sauvegardes quotidiennes, accès
                restreint au personnel autorisé.
              </p>
            ),
          },
          {
            title: "7. Conservation",
            content: (
              <p>
                Données actives : durée de l'abonnement. Après résiliation : 30
                jours lecture seule + 90 jours avant suppression. Données de
                paiement : 5 ans (obligation légale).
              </p>
            ),
          },
          {
            title: "8. Vos droits",
            content: (
              <>
                <p>Vous disposez des droits suivants :</p>
                <ul>
                  <li>
                    <strong>Accès</strong> — obtenir une copie de vos données
                  </li>
                  <li>
                    <strong>Rectification</strong> — corriger des données
                    inexactes
                  </li>
                  <li>
                    <strong>Suppression</strong> — demander l'effacement de vos
                    données
                  </li>
                  <li>
                    <strong>Portabilité</strong> — recevoir vos données dans un
                    format lisible
                  </li>
                  <li>
                    <strong>Opposition</strong> — vous opposer à certains
                    traitements
                  </li>
                </ul>
                <p>
                  Contact :{" "}
                  <a href="mailto:contact@gtechacademy.gn">
                    contact@gtechacademy.gn
                  </a>{" "}
                  ou WhatsApp :{" "}
                  <a href="https://wa.me/224623952011">+224 623 952 011</a>
                </p>
              </>
            ),
          },
          {
            title: "9. Cookies",
            content: (
              <p>
                La Plateforme utilise uniquement un cookie de session sécurisé (
                <code>sf_token</code>) pour maintenir votre connexion. Aucun
                cookie publicitaire ou de tracking tiers n'est utilisé.
              </p>
            ),
          },
          {
            title: "10. Modifications",
            content: (
              <p>
                Toute modification substantielle sera notifiée par WhatsApp 15
                jours avant entrée en vigueur.
              </p>
            ),
          },
        ].map((s) => (
          <div key={s.title} style={{ marginBottom: "36px" }}>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "700",
                margin: "0 0 12px",
                paddingBottom: "8px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {s.title}
            </h2>
            {s.content}
          </div>
        ))}

        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
            © {new Date().getFullYear()} G-Tech Academy. Tous droits réservés.
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link
              href="/legal/cgu"
              style={{ fontSize: "13px", color: "#93c5fd" }}
            >
              CGU
            </Link>
            <Link href="/" style={{ fontSize: "13px", color: "#64748b" }}>
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
