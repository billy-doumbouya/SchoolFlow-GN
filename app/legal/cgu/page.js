import Link from "next/link";

export const metadata = {
  title: "Conditions Générales d'Utilisation — SchoolFlow",
  description:
    "Conditions Générales d'Utilisation de SchoolFlow by G-Tech Academy",
};

const LAST_UPDATE = "1er juin 2024";
const COMPANY = "G-Tech Academy";
const APP_NAME = "SchoolFlow";
const APP_URL = "https://schoolflow.gn";
const EMAIL = "contact@gtechacademy.gn";
const WHATSAPP = "+224 623 952 011";
const ADDRESS = "Conakry, République de Guinée";

export default function CGUPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        fontFamily: "DM Sans, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        h1,h2,h3 { font-family: 'Syne', sans-serif; color: white; }
        p, li { line-height: 1.8; font-weight: 300; color: #94a3b8; }
        strong { color: #e2e8f0; font-weight: 600; }
        a { color: #93c5fd; }
      `}</style>

      {/* Navbar */}
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
        {/* Header */}
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
            Conditions Générales d'Utilisation
          </h1>
          <p style={{ margin: 0, fontSize: "14px" }}>
            Dernière mise à jour : <strong>{LAST_UPDATE}</strong> — {APP_NAME}{" "}
            by {COMPANY}
          </p>
        </div>

        <Section title="1. Présentation et acceptation">
          <p>
            Bienvenue sur <strong>{APP_NAME}</strong> (ci-après « la Plateforme
            »), un service de gestion scolaire en ligne édité par{" "}
            <strong>{COMPANY}</strong>, entreprise technologique enregistrée en
            République de Guinée, dont le siège social est situé à{" "}
            <strong>{ADDRESS}</strong>.
          </p>
          <p>
            En accédant à la Plateforme ou en l'utilisant, vous acceptez sans
            réserve les présentes Conditions Générales d'Utilisation (ci-après «
            CGU »). Si vous n'acceptez pas ces conditions, vous ne devez pas
            utiliser la Plateforme.
          </p>
          <p>
            Ces CGU constituent un contrat juridiquement contraignant entre vous
            (l'utilisateur ou l'établissement scolaire) et{" "}
            <strong>{COMPANY}</strong>. Elles s'appliquent à toute personne
            accédant à la Plateforme, qu'il s'agisse d'un administrateur
            d'école, d'un enseignant, d'un élève ou d'un parent.
          </p>
        </Section>

        <Section title="2. Description du service">
          <p>
            <strong>{APP_NAME}</strong> est une plateforme SaaS (Software as a
            Service) multi-tenant de gestion scolaire permettant aux
            établissements d'enseignement de :
          </p>
          <ul>
            <li>Gérer les inscriptions et les dossiers des élèves</li>
            <li>Administrer le personnel enseignant</li>
            <li>Organiser les classes, matières et emplois du temps</li>
            <li>Planifier et gérer les examens et les notes</li>
            <li>
              Collecter les frais de scolarité via Mobile Money (Orange Money,
              MTN MoMo) grâce à l'intégration <strong>GuinePay</strong>
            </li>
            <li>
              Communiquer avec les élèves et parents via{" "}
              <strong>WhatsApp</strong>
            </li>
            <li>Générer des rapports et statistiques académiques</li>
          </ul>
          <p>
            Le service est accessible via internet sur le site{" "}
            <a href={APP_URL}>{APP_URL}</a> et ses sous-domaines.
          </p>
        </Section>

        <Section title="3. Inscription et comptes utilisateurs">
          <p>
            <strong>3.1 Création de compte.</strong> L'accès à la Plateforme
            nécessite la création d'un compte. L'établissement scolaire (le «
            Titulaire ») crée un compte administrateur lors de l'inscription. Le
            Titulaire est responsable de la création des comptes pour ses
            enseignants et élèves.
          </p>
          <p>
            <strong>3.2 Exactitude des informations.</strong> Vous vous engagez
            à fournir des informations exactes, complètes et à jour lors de
            l'inscription. Toute fausse déclaration peut entraîner la suspension
            ou la résiliation de votre compte.
          </p>
          <p>
            <strong>3.3 Confidentialité des identifiants.</strong> Vous êtes
            seul responsable de la confidentialité de vos identifiants de
            connexion (email et mot de passe). Vous vous engagez à ne pas les
            partager et à notifier immédiatement {COMPANY} de toute utilisation
            non autorisée de votre compte.
          </p>
          <p>
            <strong>3.4 Comptes mineurs.</strong> Les comptes élèves peuvent
            être créés pour des mineurs. Dans ce cas, l'établissement scolaire
            garantit avoir obtenu le consentement des parents ou tuteurs légaux
            conformément à la législation guinéenne applicable.
          </p>
        </Section>

        <Section title="4. Architecture multi-tenant et isolation des données">
          <p>
            <strong>4.1 Isolation.</strong> Chaque établissement scolaire
            dispose d'un espace de données entièrement isolé (« tenant »).{" "}
            {COMPANY} garantit qu'aucune donnée d'un établissement n'est
            accessible par un autre établissement.
          </p>
          <p>
            <strong>4.2 Cloisonnement.</strong> L'architecture technique de la
            Plateforme impose un identifiant unique de tenant (
            <code>tenantId</code>) sur l'ensemble des données, requêtes et
            accès. Toute tentative de contournement constitue une violation des
            présentes CGU et peut faire l'objet de poursuites.
          </p>
          <p>
            <strong>4.3 Accès {COMPANY}.</strong> Les équipes de {COMPANY}{" "}
            peuvent accéder aux données des tenants uniquement à des fins de
            maintenance, de support technique ou d'obligation légale. Cet accès
            est journalisé et limité au strict nécessaire.
          </p>
        </Section>

        <Section title="5. Abonnements et paiements">
          <p>
            <strong>5.1 Plans disponibles.</strong> La Plateforme propose
            plusieurs plans d'abonnement : Free, Basic, Pro et Enterprise, dont
            les caractéristiques et tarifs sont détaillés sur la page de
            tarification accessible sur {APP_URL}.
          </p>
          <p>
            <strong>5.2 Modalités de paiement.</strong> Les abonnements payants
            sont réglables via la plateforme de paiement{" "}
            <strong>GuinePay</strong>, acceptant Orange Money, MTN MoMo et carte
            bancaire. Les paiements sont traités en{" "}
            <strong>Francs Guinéens (GNF)</strong>.
          </p>
          <p>
            <strong>5.3 Renouvellement.</strong> Les abonnements annuels sont
            renouvelables. {COMPANY} notifie le titulaire par WhatsApp au moins
            7 jours avant l'expiration de l'abonnement.
          </p>
          <p>
            <strong>5.4 Absence de remboursement.</strong> Sauf disposition
            contraire ou défaut de service imputable à {COMPANY}, les paiements
            effectués sont non remboursables. En cas de litige, contactez-nous à{" "}
            <strong>{EMAIL}</strong> dans les 30 jours suivant la transaction.
          </p>
          <p>
            <strong>5.5 Suspension pour non-paiement.</strong> En cas de
            non-renouvellement de l'abonnement, le compte passe en mode «
            lecture seule » pendant 30 jours. Les données sont conservées
            pendant 90 jours après l'expiration avant suppression définitive.
          </p>
          <p>
            <strong>5.6 Frais de scolarité.</strong> Les paiements de frais de
            scolarité collectés via la Plateforme sont des transactions entre
            l'établissement scolaire et les familles. {COMPANY} agit uniquement
            en tant qu'intermédiaire technique et n'est pas partie à ces
            transactions.
          </p>
        </Section>

        <Section title="6. Protection des données personnelles">
          <p>
            <strong>6.1 Données collectées.</strong> Dans le cadre de
            l'utilisation de la Plateforme, les données suivantes peuvent être
            collectées : nom, prénom, adresse email, numéro de téléphone
            WhatsApp, informations académiques, données de paiement (traitées
            par GuinePay).
          </p>
          <p>
            <strong>6.2 Finalités.</strong> Ces données sont utilisées
            exclusivement pour : la fourniture du service, l'envoi de
            notifications WhatsApp, la gestion des paiements, l'amélioration de
            la Plateforme et le respect des obligations légales.
          </p>
          <p>
            <strong>6.3 Sécurité.</strong> {COMPANY} met en œuvre des mesures
            techniques appropriées pour protéger vos données : chiffrement des
            mots de passe (bcrypt), transmission sécurisée (HTTPS), isolation
            des données par tenant, sauvegardes automatiques quotidiennes.
          </p>
          <p>
            <strong>6.4 Conservation.</strong> Les données personnelles sont
            conservées pendant la durée d'utilisation du service, plus 90 jours
            après la résiliation du compte. Les données de paiement sont
            conservées 5 ans conformément aux obligations comptables.
          </p>
          <p>
            <strong>6.5 Droits des utilisateurs.</strong> Conformément aux
            principes généraux de protection des données, vous disposez d'un
            droit d'accès, de rectification et de suppression de vos données.
            Pour exercer ces droits, contactez : <strong>{EMAIL}</strong>.
          </p>
          <p>
            <strong>6.6 Données des mineurs.</strong> {COMPANY} prend des
            précautions particulières concernant les données des élèves mineurs.
            Ces données ne sont jamais utilisées à des fins commerciales ou
            partagées avec des tiers non autorisés.
          </p>
          <p>
            <strong>6.7 WhatsApp.</strong> En fournissant un numéro de téléphone
            WhatsApp, vous consentez à recevoir des notifications liées au
            service (identifiants, résultats, paiements). Ces messages sont
            envoyés via la plateforme <strong>Twilio</strong> sous-traitant
            agréé, dans le respect de leurs conditions d'utilisation.
          </p>
        </Section>

        <Section title="7. Obligations de l'utilisateur">
          <p>Vous vous engagez à :</p>
          <ul>
            <li>
              Utiliser la Plateforme conformément aux présentes CGU et à la
              législation guinéenne applicable
            </li>
            <li>
              Ne pas tenter d'accéder aux données d'autres établissements
              scolaires
            </li>
            <li>
              Ne pas utiliser la Plateforme à des fins frauduleuses, illégales
              ou contraires à l'ordre public
            </li>
            <li>
              Ne pas introduire de virus, malwares ou tout code malveillant
            </li>
            <li>
              Ne pas tenter de contourner les mécanismes de sécurité ou
              d'authentification
            </li>
            <li>
              Ne pas réaliser d'opérations de reverse engineering sur la
              Plateforme
            </li>
            <li>Maintenir à jour les informations de votre compte</li>
            <li>
              Informer immédiatement {COMPANY} de tout incident de sécurité
            </li>
          </ul>
        </Section>

        <Section title="8. Propriété intellectuelle">
          <p>
            <strong>8.1 Plateforme.</strong> La Plateforme {APP_NAME}, son code
            source, son design, ses algorithmes, ses marques et logos sont la
            propriété exclusive de <strong>{COMPANY}</strong>. Toute
            reproduction, modification, distribution ou exploitation commerciale
            sans autorisation écrite est interdite.
          </p>
          <p>
            <strong>8.2 Données utilisateurs.</strong> Les données saisies par
            les établissements (informations élèves, notes, etc.) restent la
            propriété de l'établissement scolaire. {COMPANY} ne revendique aucun
            droit de propriété sur ces données.
          </p>
          <p>
            <strong>8.3 Licence d'utilisation.</strong> {COMPANY} accorde à
            l'établissement scolaire une licence d'utilisation non exclusive,
            non transférable et révocable de la Plateforme, pour la durée de
            l'abonnement.
          </p>
        </Section>

        <Section title="9. Disponibilité et maintenance">
          <p>
            <strong>9.1 Disponibilité.</strong> {COMPANY} s'efforce de maintenir
            la Plateforme disponible 99,5% du temps. Des interruptions peuvent
            survenir pour maintenance, mises à jour ou causes indépendantes de
            notre volonté.
          </p>
          <p>
            <strong>9.2 Maintenance planifiée.</strong> Les opérations de
            maintenance programmées sont communiquées à l'avance par WhatsApp
            avec un préavis minimum de 24 heures, sauf urgence.
          </p>
          <p>
            <strong>9.3 Force majeure.</strong> {COMPANY} ne saurait être tenu
            responsable des interruptions causées par des événements de force
            majeure : pannes internet, catastrophes naturelles, décisions
            gouvernementales, défaillances des opérateurs téléphoniques.
          </p>
        </Section>

        <Section title="10. Limitation de responsabilité">
          <p>
            <strong>10.1.</strong> La Plateforme est fournie « en l'état ».{" "}
            {COMPANY} ne garantit pas qu'elle sera exempte d'erreurs ou que son
            fonctionnement sera ininterrompu.
          </p>
          <p>
            <strong>10.2.</strong> {COMPANY} ne saurait être tenu responsable
            des dommages indirects, pertes de données, pertes de revenus ou
            préjudices liés à l'utilisation ou à l'impossibilité d'utiliser la
            Plateforme, sauf faute lourde ou dol.
          </p>
          <p>
            <strong>10.3.</strong> La responsabilité totale de {COMPANY} ne peut
            excéder le montant des abonnements payés par l'établissement au
            cours des 12 derniers mois précédant le dommage allégué.
          </p>
          <p>
            <strong>10.4 Transactions financières.</strong> {COMPANY} décline
            toute responsabilité quant aux erreurs de paiement imputables à
            GuinePay, Orange Money, MTN MoMo ou à tout autre prestataire de
            paiement tiers.
          </p>
        </Section>

        <Section title="11. Résiliation">
          <p>
            <strong>11.1 Par l'utilisateur.</strong> Vous pouvez résilier votre
            abonnement à tout moment depuis votre tableau de bord ou en
            contactant notre support. La résiliation prend effet à l'échéance de
            la période d'abonnement en cours.
          </p>
          <p>
            <strong>11.2 Par {COMPANY}.</strong> {COMPANY} se réserve le droit
            de suspendre ou résilier votre accès immédiatement, sans préavis, en
            cas de : violation grave des CGU, activité frauduleuse, non-paiement
            persistant, ou décision judiciaire.
          </p>
          <p>
            <strong>11.3 Effets de la résiliation.</strong> À la résiliation,
            vos données restent accessibles en lecture seule pendant 30 jours
            pour permettre l'export. Passé ce délai, elles sont définitivement
            supprimées sous 90 jours.
          </p>
        </Section>

        <Section title="12. Modifications des CGU">
          <p>
            {COMPANY} se réserve le droit de modifier les présentes CGU à tout
            moment. Les utilisateurs seront informés par notification WhatsApp
            et par une mention visible sur la Plateforme au moins 15 jours avant
            l'entrée en vigueur des modifications.
          </p>
          <p>
            La poursuite de l'utilisation de la Plateforme après notification
            constitue une acceptation des nouvelles CGU. En cas de désaccord,
            vous disposez du droit de résilier votre abonnement sans pénalité
            dans les 15 jours suivant la notification.
          </p>
        </Section>

        <Section title="13. Droit applicable et litiges">
          <p>
            <strong>13.1 Droit applicable.</strong> Les présentes CGU sont
            régies et interprétées conformément au droit de la{" "}
            <strong>République de Guinée</strong>.
          </p>
          <p>
            <strong>13.2 Règlement amiable.</strong> En cas de litige, les
            parties s'engagent à rechercher une solution amiable dans un délai
            de 30 jours avant toute action judiciaire. Vous pouvez nous
            contacter à : <strong>{EMAIL}</strong> ou sur WhatsApp :{" "}
            <strong>{WHATSAPP}</strong>.
          </p>
          <p>
            <strong>13.3 Juridiction compétente.</strong> À défaut de règlement
            amiable, tout litige sera soumis à la compétence exclusive des
            tribunaux compétents de <strong>Conakry, Guinée</strong>.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>
            Pour toute question relative aux présentes CGU ou à l'utilisation de
            la Plateforme :
          </p>
          <div
            style={{
              background: "rgba(43,80,245,0.08)",
              border: "1px solid rgba(43,80,245,0.2)",
              borderRadius: "16px",
              padding: "20px 24px",
              marginTop: "12px",
            }}
          >
            <p style={{ margin: "0 0 8px" }}>
              <strong>🏢 {COMPANY}</strong>
            </p>
            <p style={{ margin: "0 0 6px" }}>📍 {ADDRESS}</p>
            <p style={{ margin: "0 0 6px" }}>
              📧 <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>
            <p style={{ margin: "0 0 6px" }}>
              💬 WhatsApp :{" "}
              <a href={`https://wa.me/${WHATSAPP.replace(/\s/g, "")}`}>
                {WHATSAPP}
              </a>
            </p>
            <p style={{ margin: 0 }}>
              🌐 <a href={APP_URL}>{APP_URL}</a>
            </p>
          </div>
        </Section>

        {/* Footer */}
        <div
          style={{
            marginTop: "60px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>
            © {new Date().getFullYear()} {COMPANY}. Tous droits réservés.
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link
              href="/legal/privacy"
              style={{ fontSize: "13px", color: "#93c5fd" }}
            >
              Politique de confidentialité
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

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "700",
          margin: "0 0 16px",
          paddingBottom: "10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
