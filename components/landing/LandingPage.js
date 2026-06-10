"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import Chatbot from "./Chatbot";

// ─── AOS Init ─────────────────────────────────────────────────────────────────
function useAOS() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
    });
  }, []);
}

// ─── Animated Mesh Background ─────────────────────────────────────────────────
function MeshBackground() {
  return (
    <div className="mesh-bg" aria-hidden="true">
      <div className="mesh-orb mesh-orb-1" />
      <div className="mesh-orb mesh-orb-2" />
      <div className="mesh-orb mesh-orb-3" />
      <div className="mesh-grid" />
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Comment ça marche", href: "#how" },
    { label: "Tarifs", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo */}
        <a href="#" className="nav-logo">
          <Image
            src="/schoolflow-logo.png"
            alt="SchoolFlow"
            width={44}
            height={44}
            className="nav-logo-img"
          />
          <div className="nav-logo-text">
            <span className="nav-logo-name">SchoolFlow</span>
            <span className="nav-logo-sub">by G-Tech Academy</span>
          </div>
        </a>

        {/* Desktop links */}
        <div className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="nav-cta">
          <a
            href="https://wa.me/224623952011?text=Bonjour, je veux en savoir plus sur SchoolFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost-nav"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Nous contacter
          </a>
          <Link href="/login" className="btn-ghost-nav">
            Se connecter
          </Link>
          <Link href="/register" className="btn-primary-nav">
            Commencer gratuitement
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`ham-line ${menuOpen ? "ham-open" : ""}`} />
          <span className={`ham-line ${menuOpen ? "ham-open" : ""}`} />
          <span className={`ham-line ${menuOpen ? "ham-open" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            {l.label}
          </a>
        ))}
        <div className="mobile-cta">
          <Link
            href="/login"
            className="btn-ghost-nav"
            onClick={() => setMenuOpen(false)}
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="btn-primary-nav"
            onClick={() => setMenuOpen(false)}
          >
            Commencer gratuitement
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero-section">
      <MeshBackground />
      <div className="hero-container">
        {/* Badge */}
        <div className="hero-badge" data-aos="fade-down">
          <span className="badge-dot" />
          Plateforme #1 de gestion scolaire en Guinée
        </div>

        {/* Title */}
        <h1 className="hero-title" data-aos="fade-up" data-aos-delay="100">
          Gérez votre école
          <br />
          <span className="hero-gradient-text">intelligemment</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
          SchoolFlow digitalise entièrement votre établissement scolaire —
          élèves, enseignants, classes, notes et paiements — sur une seule
          plateforme sécurisée, conçue pour la Guinée.
        </p>

        {/* Slogan */}
        <div className="hero-slogan" data-aos="fade-up" data-aos-delay="280">
          <span>Éduquer</span>
          <span className="slogan-dot">•</span>
          <span>Connecter</span>
          <span className="slogan-dot">•</span>
          <span>Autonomiser</span>
        </div>

        {/* CTA buttons */}
        <div className="hero-cta" data-aos="fade-up" data-aos-delay="350">
          <Link href="/register" className="btn-hero-primary">
            <svg
              className="btn-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Créer mon école gratuitement
          </Link>
          <a href="#features" className="btn-hero-ghost">
            Découvrir les fonctionnalités
            <svg
              className="btn-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>

        {/* Trust badges */}
        <div className="hero-trust" data-aos="fade-up" data-aos-delay="420">
          <span className="trust-item">
            <svg
              className="trust-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Données sécurisées
          </span>
          <span className="trust-sep" />
          <span className="trust-item">
            <svg
              className="trust-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Démarrage en 5 minutes
          </span>
          <span className="trust-sep" />
          <span className="trust-item">
            <svg
              className="trust-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Paiement Mobile Money
          </span>
        </div>

        {/* Dashboard preview */}
        <div className="hero-preview" data-aos="zoom-in" data-aos-delay="500">
          <div className="preview-window">
            <div className="preview-bar">
              <span className="preview-dot red" />
              <span className="preview-dot yellow" />
              <span className="preview-dot green" />
              <span className="preview-url">app.schoolflow.gn/dashboard</span>
            </div>
            <div className="preview-content">
              {/* Mock dashboard stats */}
              <div className="mock-header">
                <div className="mock-logo-bar">
                  <div className="mock-logo-sq" />
                  <div className="mock-text-sm" style={{ width: 80 }} />
                </div>
                <div className="mock-avatar" />
              </div>
              <div className="mock-stats">
                {[
                  { label: "Élèves", val: "248", color: "#3b82f6" },
                  { label: "Enseignants", val: "24", color: "#8b5cf6" },
                  { label: "Classes", val: "12", color: "#10b981" },
                  { label: "Revenus", val: "4.2M GNF", color: "#f59e0b" },
                ].map((s) => (
                  <div key={s.label} className="mock-stat-card">
                    <div className="mock-stat-val" style={{ color: s.color }}>
                      {s.val}
                    </div>
                    <div className="mock-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mock-chart">
                {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                  <div
                    key={i}
                    className="mock-bar"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="preview-glow" />
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { value: "120+", label: "Établissements actifs", icon: "🏫" },
    { value: "45 000+", label: "Élèves inscrits", icon: "👨‍🎓" },
    { value: "3 200+", label: "Enseignants", icon: "👨‍🏫" },
    { value: "99.9%", label: "Disponibilité", icon: "⚡" },
  ];

  return (
    <section className="stats-section">
      <div className="stats-container">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="stat-item"
            data-aos="fade-up"
            data-aos-delay={i * 100}
          >
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      color: "#3b82f6",
      title: "Gestion des Élèves",
      desc: "Inscriptions, profils complets, informations parentales, suivi des présences et historique académique centralisés.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
          />
        </svg>
      ),
      color: "#8b5cf6",
      title: "Gestion des Enseignants",
      desc: "Fiches enseignants, attribution des matières et classes, suivi des qualifications et performances pédagogiques.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"
          />
        </svg>
      ),
      color: "#10b981",
      title: "Classes & Matières",
      desc: "Création des classes par niveau et année scolaire, affectation des enseignants, gestion des capacités d'accueil.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      color: "#f59e0b",
      title: "Examens & Notes",
      desc: "Planification des examens, saisie des notes en masse, calcul automatique des moyennes et attribution des mentions.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      color: "#ef4444",
      title: "Paiements GuinePay",
      desc: "Collecte des frais de scolarité via Orange Money et MTN MoMo. Suivi en temps réel, reçus automatiques, rapports financiers.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      color: "#06b6d4",
      title: "Tableaux de Bord",
      desc: "Statistiques en temps réel pour directeurs, enseignants et élèves. KPIs, graphiques, rapports exportables.",
    },
  ];

  return (
    <section className="features-section" id="features">
      <div className="section-container">
        <div className="section-header" data-aos="fade-up">
          <span className="section-badge">Fonctionnalités</span>
          <h2 className="section-title">Tout ce dont votre école a besoin</h2>
          <p className="section-subtitle">
            Une suite complète d'outils pensés pour les établissements scolaires
            guinéens, accessible depuis n'importe quel appareil.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay={i * 80}
            >
              <div
                className="feature-icon-wrap"
                style={{ "--feat-color": f.color }}
              >
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
              <div className="feature-line" style={{ background: f.color }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Créez votre école",
      desc: "Inscrivez-vous en 2 minutes. Renseignez le nom de votre établissement et créez votre compte administrateur. C'est gratuit.",
      icon: "🏫",
    },
    {
      num: "02",
      title: "Configurez & importez",
      desc: "Ajoutez vos classes, enseignants et élèves. Importation facile, mise en place rapide. Votre équipe sera opérationnelle en moins d'une heure.",
      icon: "⚙️",
    },
    {
      num: "03",
      title: "Gérez & encaissez",
      desc: "Suivez les notes, gérez les présences et collectez les frais de scolarité via Mobile Money. Tout en temps réel, depuis votre téléphone.",
      icon: "🚀",
    },
  ];

  return (
    <section className="how-section" id="how">
      <div className="how-bg" aria-hidden="true" />
      <div className="section-container">
        <div className="section-header" data-aos="fade-up">
          <span className="section-badge">Simple & Rapide</span>
          <h2 className="section-title">Démarrez en 3 étapes</h2>
          <p className="section-subtitle">
            Aucune compétence technique requise. Si vous savez utiliser
            WhatsApp, vous pouvez gérer SchoolFlow.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="step-card"
              data-aos="fade-up"
              data-aos-delay={i * 150}
            >
              <div className="step-num">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
              {i < steps.length - 1 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "Gratuit",
      price: "0",
      period: "pour toujours",
      desc: "Pour démarrer et tester la plateforme",
      features: [
        "Jusqu'à 50 élèves",
        "5 enseignants",
        "3 classes",
        "Rapports de base",
        "Support communautaire",
      ],
      cta: "Commencer gratuitement",
      href: "/register",
      highlight: false,
      badge: null,
    },
    {
      name: "Basic",
      price: "500 000",
      period: "GNF / an",
      desc: "Pour les petits établissements",
      features: [
        "Jusqu'à 200 élèves",
        "20 enseignants",
        "Classes illimitées",
        "Rapports complets",
        "Suivi des paiements",
        "Support par email",
      ],
      cta: "Choisir Basic",
      href: "/register",
      highlight: false,
      badge: null,
    },
    {
      name: "Pro",
      price: "1 500 000",
      period: "GNF / an",
      desc: "Pour les établissements en croissance",
      features: [
        "Jusqu'à 1 000 élèves",
        "100 enseignants",
        "Analytics avancés",
        "Branding personnalisé",
        "Intégration GuinePay",
        "Support prioritaire",
        "Exports PDF/Excel",
      ],
      cta: "Choisir Pro",
      href: "/register",
      highlight: true,
      badge: "⭐ Populaire",
    },
    {
      name: "Enterprise",
      price: "Sur devis",
      period: "",
      desc: "Pour les grandes institutions",
      features: [
        "Élèves illimités",
        "Enseignants illimités",
        "Support dédié 24/7",
        "Garantie SLA",
        "Intégrations custom",
        "Formation & onboarding",
        "Hébergement privé",
      ],
      cta: "Nous contacter",
      href: `https://wa.me/224623952011?text=Bonjour, je suis intéressé par SchoolFlow Enterprise`,
      highlight: false,
      badge: null,
    },
  ];

  return (
    <section className="pricing-section" id="pricing">
      <div className="section-container">
        <div className="section-header" data-aos="fade-up">
          <span className="section-badge">Tarifs</span>
          <h2 className="section-title">Des prix adaptés à la Guinée</h2>
          <p className="section-subtitle">
            Commencez gratuitement. Évoluez selon la croissance de votre
            établissement. Aucune surprise, aucun frais caché.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((p, i) => (
            <div
              key={p.name}
              className={`pricing-card ${p.highlight ? "pricing-card-highlight" : ""}`}
              data-aos="zoom-in"
              data-aos-delay={i * 100}
            >
              {p.badge && <div className="pricing-badge">{p.badge}</div>}
              <div className="pricing-header">
                <h3 className="pricing-name">{p.name}</h3>
                <p className="pricing-desc">{p.desc}</p>
                <div className="pricing-price">
                  {p.period === "" ? (
                    <span className="pricing-custom">{p.price}</span>
                  ) : (
                    <>
                      <span className="pricing-amount">{p.price}</span>
                      <span className="pricing-period"> {p.period}</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="pricing-features">
                {p.features.map((f) => (
                  <li key={f} className="pricing-feature">
                    <svg
                      className="pricing-check"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={p.href}
                target={p.href.startsWith("https") ? "_blank" : undefined}
                rel={p.href.startsWith("https") ? "noopener" : undefined}
                className={`pricing-cta ${p.highlight ? "pricing-cta-highlight" : ""}`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="pricing-note" data-aos="fade-up">
          💳 Paiements acceptés via <strong>Orange Money</strong>,{" "}
          <strong>MTN MoMo</strong> et carte bancaire grâce à GuinePay.
        </p>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      name: "Directeur Mamadou Kouyaté",
      role: "Directeur — Collège de la Paix, Conakry",
      text: "SchoolFlow a transformé notre établissement. Avant, tout était sur papier. Aujourd'hui, je consulte les notes de tous mes élèves depuis mon téléphone. Les parents paient via Orange Money sans se déplacer. C'est révolutionnaire.",
      avatar: "MK",
      color: "#3b82f6",
      stars: 5,
    },
    {
      name: "Mme Fatoumata Bah",
      role: "Directrice — École Primaire Excellence, Kindia",
      text: "La gestion des paiements était notre plus grand problème. Avec SchoolFlow, nous avons collecté 85% des frais de scolarité du premier trimestre en moins de 2 semaines. Je recommande à tous les directeurs d'école.",
      avatar: "FB",
      color: "#8b5cf6",
      stars: 5,
    },
    {
      name: "M. Ibrahima Sow",
      role: "Proviseur — Lycée Technique de Labé",
      text: "L'équipe de G-Tech Academy nous a accompagnés pas à pas. La formation a duré 30 minutes et nous étions opérationnels. Le support répond toujours rapidement sur WhatsApp. Excellent produit guinéen.",
      avatar: "IS",
      color: "#10b981",
      stars: 5,
    },
  ];

  return (
    <section className="testimonials-section">
      <div className="section-container">
        <div className="section-header" data-aos="fade-up">
          <span className="section-badge">Témoignages</span>
          <h2 className="section-title">Ils nous font confiance</h2>
          <p className="section-subtitle">
            Plus de 120 établissements à travers la Guinée utilisent SchoolFlow
            au quotidien.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="testimonial-card"
              data-aos="fade-up"
              data-aos-delay={i * 120}
            >
              {/* Stars */}
              <div className="testimonial-stars">
                {Array(t.stars)
                  .fill(null)
                  .map((_, s) => (
                    <svg
                      key={s}
                      className="star-icon"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
              </div>

              {/* Text */}
              <p className="testimonial-text">"{t.text}"</p>

              {/* Author */}
              <div className="testimonial-author">
                <div
                  className="testimonial-avatar"
                  style={{ background: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="testimonial-name">{t.name}</p>
                  <p className="testimonial-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: "Est-ce que SchoolFlow fonctionne sans connexion internet rapide ?",
      a: "Oui. SchoolFlow est optimisé pour les connexions lentes courantes en Guinée. Les pages sont légères et chargent rapidement même sur réseau 3G. Nous travaillons également sur un mode hors-ligne.",
    },
    {
      q: "Comment fonctionne le paiement des frais de scolarité ?",
      a: "L'administrateur crée un lien de paiement pour chaque élève. Ce lien est envoyé aux parents par WhatsApp ou SMS. Le parent clique, choisit Orange Money ou MTN MoMo, entre son code PIN et le paiement est confirmé instantanément.",
    },
    {
      q: "Mes données sont-elles en sécurité ?",
      a: "Absolument. Chaque école a son propre espace isolé (architecture multi-tenant). Les données sont chiffrées, hébergées sur des serveurs sécurisés en Europe, et sauvegardées automatiquement chaque jour. Aucun autre établissement ne peut accéder à vos données.",
    },
    {
      q: "Peut-on importer des données depuis notre ancien système ?",
      a: "Oui. Si vous avez vos données dans Excel ou CSV, notre équipe peut vous accompagner pour l'importation. Pour les écoles sur le plan Pro et Enterprise, l'assistance à la migration est incluse.",
    },
    {
      q: "Y a-t-il une application mobile ?",
      a: "SchoolFlow est une application web responsive — elle fonctionne parfaitement sur téléphone, tablette et ordinateur sans rien installer. Une application Android native est en développement pour 2025.",
    },
    {
      q: "Que se passe-t-il quand notre plan gratuit arrive à la limite de 50 élèves ?",
      a: "Vous recevez une notification avant d'atteindre la limite. Vous pouvez upgrader en un clic via Mobile Money. Vos données ne sont jamais supprimées — même si vous n'upgradez pas immédiatement.",
    },
    {
      q: "Proposez-vous une formation pour notre équipe ?",
      a: "Oui. Tous les plans incluent un guide de démarrage. Le plan Pro inclut une session de formation vidéo. Enterprise inclut une formation en présentiel à Conakry par l'équipe G-Tech Academy.",
    },
  ];

  return (
    <section className="faq-section" id="faq">
      <div className="section-container">
        <div className="section-header" data-aos="fade-up">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">Questions fréquentes</h2>
          <p className="section-subtitle">
            Vous ne trouvez pas la réponse ? Contactez-nous sur WhatsApp.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((f, i) => (
            <div
              key={i}
              className={`faq-item ${openIdx === i ? "faq-open" : ""}`}
              data-aos="fade-up"
              data-aos-delay={i * 60}
            >
              <button
                className="faq-question"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span>{f.q}</span>
                <span
                  className={`faq-chevron ${openIdx === i ? "faq-chevron-open" : ""}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              <div
                className={`faq-answer-wrap ${openIdx === i ? "faq-answer-open" : ""}`}
              >
                <div className="faq-answer">{f.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function CTAFinal() {
  return (
    <section className="cta-section">
      <MeshBackground />
      <div className="section-container cta-container">
        <div data-aos="zoom-in">
          <h2 className="cta-title">Prêt à digitaliser votre école ?</h2>
          <p className="cta-subtitle">
            Rejoignez les 120+ établissements qui font confiance à SchoolFlow.
            Démarrez gratuitement — aucune carte bancaire requise.
          </p>
          <div className="cta-buttons">
            <Link href="/register" className="btn-hero-primary">
              Créer mon compte gratuitement
            </Link>
            <a
              href={`https://wa.me/224623952011?text=Bonjour, je veux en savoir plus sur SchoolFlow`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="btn-icon">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Parler à un expert
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <Image
                src="/schoolflow-logo.png"
                alt="SchoolFlow"
                width={52}
                height={52}
              />
              <div>
                <p className="footer-logo-name">SchoolFlow</p>
                <p className="footer-logo-sub">
                  Smart School Management Platform
                </p>
              </div>
            </div>
            <p className="footer-brand-desc">
              La plateforme de gestion scolaire intelligente conçue pour les
              établissements guinéens. Éduquer • Connecter • Autonomiser.
            </p>
            {/* Guinea flag */}
            <div className="guinea-flag">
              <span className="flag-r" />
              <span className="flag-y" />
              <span className="flag-g" />
              <span className="flag-label">Made in Guinea 🇬🇳</span>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links-group">
            <h4 className="footer-links-title">Produit</h4>
            <a href="#features" className="footer-link">
              Fonctionnalités
            </a>
            <a href="#pricing" className="footer-link">
              Tarifs
            </a>
            <a href="#how" className="footer-link">
              Comment ça marche
            </a>
            <Link href="/register" className="footer-link">
              Commencer
            </Link>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-links-title">Accès</h4>
            <Link href="/login" className="footer-link">
              Connexion
            </Link>
            <Link href="/register" className="footer-link">
              Inscription école
            </Link>
            <a href="#faq" className="footer-link">
              FAQ
            </a>
            <Link href="/legal/cgu" className="footer-link">
              CGU
            </Link>
            <Link href="/legal/privacy" className="footer-link">
              Confidentialité
            </Link>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-links-title">Contact</h4>
            <a
              href="https://wa.me/224623952011"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link footer-whatsapp"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="footer-wa-icon"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              +224 623 952 011
            </a>
            <a href="mailto:contact@gtechacademy.gn" className="footer-link">
              contact@gtechacademy.gn
            </a>
            <p className="footer-link footer-addr">
              Conakry, République de Guinée
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>© 2024 SchoolFlow. Tous droits réservés.</p>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <a
              href="https://wa.me/224623952011?text=Bonjour, je veux en savoir plus sur SchoolFlow"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "13px",
                color: "#22c55e",
                fontWeight: "600",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <svg
                width="14"
                height="14"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Nous contacter
            </a>
          </div>
          <div className="footer-powered">
            <span>Propulsé par</span>
            <Image
              src="/gtech-logo.png"
              alt="G-Tech Academy"
              width={28}
              height={28}
              className="footer-gtech-logo"
            />
            <span className="footer-gtech-name">G-Tech Academy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── WhatsApp Floating Button ─────────────────────────────────────────────────
function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/224623952011?text=Bonjour, je veux en savoir plus sur SchoolFlow"
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float"
      aria-label="Contacter sur WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span className="wa-pulse" />
    </a>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  useAOS();

  return (
    <>
      <style>{STYLES}</style>
      <div className="landing-root">
        <Navbar />
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTAFinal />
        <Footer />
        <WhatsAppFloat />
        <Chatbot />
      </div>
    </>
  );
}

// ─── ALL STYLES ───────────────────────────────────────────────────────────────
const STYLES = `

  :root {
    --blue:    #1a3aeb;
    --blue-2:  #2b50f5;
    --violet:  #7c3aed;
    --violet-2:#6d28d9;
    --orange:  #f59e0b;
    --dark:    #0a0f1e;
    --dark-2:  #0f1729;
    --dark-3:  #151e35;
    --light:   #f0f4ff;
    --white:   #ffffff;
    --text:    #e2e8f0;
    --muted:   #94a3b8;
    --border:  rgba(255,255,255,0.08);
    --grad:    linear-gradient(135deg, var(--blue) 0%, var(--violet) 100%);
  }

  .landing-root { font-family: 'DM Sans', sans-serif; background: var(--dark); color: var(--text); overflow-x: hidden; }

  /* ── Mesh background ── */
  .mesh-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .mesh-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.35; }
  .mesh-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #1a3aeb 0%, transparent 70%); top: -200px; left: -100px; animation: orbFloat1 12s ease-in-out infinite; }
  .mesh-orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #7c3aed 0%, transparent 70%); top: 100px; right: -150px; animation: orbFloat2 15s ease-in-out infinite; }
  .mesh-orb-3 { width: 400px; height: 400px; background: radial-gradient(circle, #1a3aeb55 0%, transparent 70%); bottom: 0; left: 40%; animation: orbFloat3 10s ease-in-out infinite; }
  .mesh-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 64px 64px; }

  @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,60px) scale(1.1)} }
  @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,40px) scale(1.08)} }
  @keyframes orbFloat3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-40px)} }

  /* ── Navbar ── */
  .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 16px 0; transition: all 0.3s ease; }
  .navbar-scrolled { background: rgba(10,15,30,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); padding: 10px 0; box-shadow: 0 4px 30px rgba(0,0,0,0.3); }
  .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 32px; }
  .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
  .nav-logo-img { border-radius: 8px; object-fit: contain; }
  .nav-logo-text { display: flex; flex-direction: column; }
  .nav-logo-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: white; line-height: 1.1; }
  .nav-logo-sub { font-size: 10px; color: var(--muted); font-weight: 400; }
  .nav-links { display: flex; gap: 4px; flex: 1; justify-content: center; }
  .nav-link { padding: 8px 16px; color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 8px; transition: all 0.2s; }
  .nav-link:hover { color: white; background: rgba(255,255,255,0.06); }
  .nav-cta { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
  .btn-ghost-nav { padding: 8px 16px; color: var(--text); text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 8px; border: 1px solid var(--border); transition: all 0.2s; white-space: nowrap; }
  .btn-ghost-nav:hover { border-color: rgba(255,255,255,0.2); color: white; background: rgba(255,255,255,0.05); }
  .btn-primary-nav { padding: 8px 18px; background: var(--grad); color: white; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; transition: all 0.2s; white-space: nowrap; }
  .btn-primary-nav:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(43,80,245,0.4); }
  .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
  .ham-line { width: 24px; height: 2px; background: white; border-radius: 2px; transition: all 0.3s; }
  .mobile-menu { display: none; flex-direction: column; padding: 16px 24px 20px; background: var(--dark-2); border-top: 1px solid var(--border); gap: 4px; max-height: 0; overflow: hidden; transition: max-height 0.4s ease; }
  .mobile-menu-open { max-height: 400px; }
  .mobile-link { padding: 10px 16px; color: var(--muted); text-decoration: none; font-size: 15px; border-radius: 8px; transition: all 0.2s; }
  .mobile-link:hover { color: white; background: rgba(255,255,255,0.05); }
  .mobile-cta { display: flex; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
  .mobile-cta a { flex: 1; text-align: center; }
  @media (max-width: 900px) {
    .nav-links, .nav-cta { display: none; }
    .hamburger { display: flex; margin-left: auto; }
    .mobile-menu { display: flex; }
  }

  /* ── Hero ── */
  .hero-section { position: relative; min-height: 100vh; display: flex; align-items: center; padding: 120px 0 80px; overflow: hidden; }
  .hero-container { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; padding: 0 24px; overflow: hidden; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 24px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: rgba(43,80,245,0.15); border: 1px solid rgba(43,80,245,0.3); border-radius: 999px; font-size: 13px; color: #93c5fd; font-weight: 500; }
  .badge-dot { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: pulse 2s ease-in-out infinite; flex-shrink: 0; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.2)} }
  .hero-title { font-family: 'Syne', sans-serif; font-size: clamp(36px, 5.5vw, 72px); font-weight: 800; color: white; line-height: 1.1; letter-spacing: -1.5px; margin: 0; max-width: 800px; word-break: keep-all; }
  .hero-gradient-text { background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .hero-subtitle { font-size: clamp(15px, 1.6vw, 18px); color: var(--muted); max-width: 580px; line-height: 1.8; font-weight: 300; margin: 0; word-break: break-word; }
  .hero-slogan { display: flex; align-items: center; gap: 12px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #a78bfa; }
  .slogan-dot { color: var(--orange); font-size: 18px; }
  .hero-cta { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .btn-hero-primary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: var(--grad); color: white; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 12px; transition: all 0.3s; box-shadow: 0 8px 32px rgba(43,80,245,0.35); }
  .btn-hero-primary:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(43,80,245,0.5); }
  .btn-hero-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 14px 24px; background: rgba(255,255,255,0.06); border: 1px solid var(--border); color: var(--text); text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 12px; transition: all 0.3s; }
  .btn-hero-ghost:hover { background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.2); }
  .btn-icon { width: 18px; height: 18px; flex-shrink: 0; }
  .hero-trust { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; justify-content: center; }
  .trust-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--muted); }
  .trust-icon { width: 16px; height: 16px; color: #a78bfa; }
  .trust-sep { width: 1px; height: 16px; background: var(--border); }

  /* Preview window */
  .hero-preview { position: relative; width: 100%; max-width: 680px; margin-top: 16px; }
  .preview-window { background: var(--dark-3); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05); }
  .preview-bar { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border); }
  .preview-dot { width: 10px; height: 10px; border-radius: 50%; }
  .preview-dot.red { background: #ef4444; }
  .preview-dot.yellow { background: #f59e0b; }
  .preview-dot.green { background: #22c55e; }
  .preview-url { margin-left: 10px; font-size: 11px; color: var(--muted); font-family: monospace; background: rgba(255,255,255,0.05); padding: 2px 10px; border-radius: 4px; }
  .preview-content { padding: 20px; }
  .mock-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .mock-logo-bar { display: flex; align-items: center; gap: 8px; }
  .mock-logo-sq { width: 28px; height: 28px; background: var(--grad); border-radius: 6px; }
  .mock-text-sm { height: 10px; background: rgba(255,255,255,0.1); border-radius: 4px; }
  .mock-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); }
  .mock-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
  .mock-stat-card { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 10px; padding: 10px; text-align: center; }
  .mock-stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; }
  .mock-stat-label { font-size: 9px; color: var(--muted); margin-top: 2px; }
  .mock-chart { display: flex; align-items: flex-end; gap: 6px; height: 60px; padding: 0 4px; }
  .mock-bar { flex: 1; background: var(--grad); border-radius: 4px 4px 0 0; opacity: 0.7; animation: barGrow 1s ease-out forwards; transform-origin: bottom; }
  @keyframes barGrow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
  .preview-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at center bottom, rgba(43,80,245,0.15) 0%, transparent 60%); pointer-events: none; border-radius: 16px; }

  /* ── Stats ── */
  .stats-section { padding: 48px 0; background: var(--dark-2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .stats-container { max-width: 1000px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }
  .stat-item { text-align: center; }
  .stat-icon { font-size: 28px; margin-bottom: 8px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: white; line-height: 1; }
  .stat-label { font-size: 14px; color: var(--muted); margin-top: 4px; }
  @media (max-width: 640px) { .stats-container { grid-template-columns: repeat(2,1fr); } }

  /* ── Sections common ── */
  .section-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .section-header { text-align: center; margin-bottom: 64px; }
  .section-badge { display: inline-block; padding: 4px 14px; background: rgba(43,80,245,0.15); border: 1px solid rgba(43,80,245,0.3); border-radius: 999px; font-size: 12px; font-weight: 600; color: #93c5fd; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
  .section-title { font-family: 'Syne', sans-serif; font-size: clamp(24px, 3.5vw, 40px); font-weight: 800; color: white; margin: 0 0 16px; letter-spacing: -1px; word-break: keep-all; }
  .section-subtitle { font-size: 15px; color: var(--muted); max-width: 520px; margin: 0 auto; line-height: 1.8; font-weight: 300; word-break: break-word; }

  /* ── Features ── */
  .features-section { padding: 100px 0; background: var(--dark); }
  .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
  .feature-card { position: relative; background: var(--dark-2); border: 1px solid var(--border); border-radius: 20px; padding: 32px 28px; transition: all 0.3s; overflow: hidden; }
  .feature-card:hover { border-color: rgba(43,80,245,0.4); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
  .feature-card:hover .feature-line { width: 100%; }
  .feature-icon-wrap { width: 52px; height: 52px; border-radius: 14px; background: color-mix(in srgb, var(--feat-color) 15%, transparent); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
  .feature-icon-wrap svg { width: 26px; height: 26px; color: var(--feat-color); stroke: var(--feat-color); }
  .feature-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: white; margin: 0 0 10px; }
  .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.7; margin: 0; }
  .feature-line { position: absolute; bottom: 0; left: 0; height: 2px; width: 0; transition: width 0.4s ease; border-radius: 0 0 20px 20px; }
  @media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 600px) { .features-grid { grid-template-columns: 1fr; } }

  /* ── How it works ── */
  .how-section { position: relative; padding: 100px 0; overflow: hidden; }
  .how-bg { position: absolute; inset: 0; background: linear-gradient(180deg, var(--dark) 0%, var(--dark-2) 50%, var(--dark) 100%); }
  .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 32px; position: relative; }
  .step-card { position: relative; text-align: center; padding: 40px 28px; background: var(--dark-3); border: 1px solid var(--border); border-radius: 24px; transition: all 0.3s; }
  .step-card:hover { border-color: rgba(124,58,237,0.4); transform: translateY(-4px); }
  .step-num { font-family: 'Syne', sans-serif; font-size: 72px; font-weight: 800; color: rgba(43,80,245,0.12); line-height: 1; margin-bottom: 8px; letter-spacing: -4px; }
  .step-icon { font-size: 40px; margin-bottom: 16px; }
  .step-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: white; margin: 0 0 12px; }
  .step-desc { font-size: 14px; color: var(--muted); line-height: 1.7; margin: 0; }
  .step-arrow { position: absolute; top: 50%; right: -32px; transform: translateY(-50%); font-size: 24px; color: rgba(43,80,245,0.4); z-index: 2; }
  @media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr; } .step-arrow { display: none; } }

  /* ── Pricing ── */
  .pricing-section { padding: 100px 0; background: var(--dark); }
  .pricing-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 32px; }
  .pricing-card { position: relative; background: var(--dark-2); border: 1px solid var(--border); border-radius: 24px; padding: 32px 24px; display: flex; flex-direction: column; transition: all 0.3s; }
  .pricing-card:hover { transform: translateY(-4px); border-color: rgba(43,80,245,0.4); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
  .pricing-card-highlight { background: linear-gradient(160deg, #1a2a6e 0%, #1e1040 100%); border-color: rgba(124,58,237,0.5); box-shadow: 0 0 0 1px rgba(124,58,237,0.3), 0 20px 60px rgba(124,58,237,0.2); }
  .pricing-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--grad); color: white; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 999px; white-space: nowrap; }
  .pricing-header { margin-bottom: 28px; }
  .pricing-name { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: white; margin: 0 0 4px; }
  .pricing-desc { font-size: 13px; color: var(--muted); margin: 0 0 16px; }
  .pricing-price { display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap; }
  .pricing-amount { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: white; }
  .pricing-period { font-size: 13px; color: var(--muted); }
  .pricing-custom { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .pricing-features { list-style: none; padding: 0; margin: 0 0 28px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
  .pricing-feature { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--text); }
  .pricing-check { width: 16px; height: 16px; color: #22c55e; flex-shrink: 0; margin-top: 1px; }
  .pricing-cta { display: block; text-align: center; padding: 12px; background: rgba(255,255,255,0.06); border: 1px solid var(--border); color: white; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 12px; transition: all 0.2s; }
  .pricing-cta:hover { background: rgba(255,255,255,0.1); }
  .pricing-cta-highlight { background: var(--grad); border-color: transparent; box-shadow: 0 4px 20px rgba(43,80,245,0.4); }
  .pricing-cta-highlight:hover { opacity: 0.9; transform: translateY(-1px); }
  .pricing-note { text-align: center; font-size: 14px; color: var(--muted); background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 12px; padding: 12px 20px; display: inline-block; width: 100%; }
  @media (max-width: 1100px) { .pricing-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 600px) { .pricing-grid { grid-template-columns: 1fr; } }

  /* ── Testimonials ── */
  .testimonials-section { padding: 100px 0; background: var(--dark-2); }
  .testimonials-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
  .testimonial-card { background: var(--dark-3); border: 1px solid var(--border); border-radius: 24px; padding: 32px 28px; transition: all 0.3s; display: flex; flex-direction: column; gap: 20px; }
  .testimonial-card:hover { border-color: rgba(43,80,245,0.3); transform: translateY(-4px); }
  .testimonial-stars { display: flex; gap: 4px; }
  .star-icon { width: 18px; height: 18px; color: var(--orange); }
  .testimonial-text { font-size: 15px; color: var(--text); line-height: 1.75; font-style: italic; font-weight: 300; flex: 1; }
  .testimonial-author { display: flex; align-items: center; gap: 12px; }
  .testimonial-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: white; flex-shrink: 0; }
  .testimonial-name { font-size: 14px; font-weight: 600; color: white; }
  .testimonial-role { font-size: 12px; color: var(--muted); margin-top: 2px; }
  @media (max-width: 900px) { .testimonials-grid { grid-template-columns: 1fr; } }

  /* ── FAQ ── */
  .faq-section { padding: 100px 0; background: var(--dark); }
  .faq-list { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
  .faq-item { background: var(--dark-2); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: border-color 0.3s; }
  .faq-open { border-color: rgba(43,80,245,0.4); }
  .faq-question { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; background: none; border: none; color: white; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; text-align: left; transition: all 0.2s; }
  .faq-question:hover { color: #a78bfa; }
  .faq-chevron { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: rgba(255,255,255,0.06); border-radius: 50%; flex-shrink: 0; transition: all 0.35s cubic-bezier(0.4,0,0.2,1); }
  .faq-chevron svg { width: 16px; height: 16px; color: var(--muted); transition: color 0.2s; }
  .faq-chevron-open { background: rgba(43,80,245,0.2); transform: rotate(180deg); }
  .faq-chevron-open svg { color: #93c5fd; }
  .faq-answer-wrap { max-height: 0; overflow: hidden; transition: max-height 0.45s cubic-bezier(0.4,0,0.2,1); }
  .faq-answer-open { max-height: 300px; }
  .faq-answer { padding: 0 24px 20px; font-size: 14px; color: var(--muted); line-height: 1.8; font-weight: 300; }

  /* ── CTA Final ── */
  .cta-section { position: relative; padding: 100px 0; overflow: hidden; }
  .cta-container { position: relative; z-index: 1; text-align: center; }
  .cta-title { font-family: 'Syne', sans-serif; font-size: clamp(24px, 3.5vw, 42px); font-weight: 800; color: white; margin: 0 0 16px; letter-spacing: -1px; word-break: keep-all; }
  .cta-subtitle { font-size: 18px; color: var(--muted); max-width: 520px; margin: 0 auto 36px; line-height: 1.7; font-weight: 300; }
  .cta-buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-whatsapp { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: #25D366; color: white; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 12px; transition: all 0.3s; }
  .btn-whatsapp:hover { background: #20bd5a; transform: translateY(-3px); box-shadow: 0 12px 32px rgba(37,211,102,0.3); }

  /* ── Footer ── */
  .footer { background: var(--dark-2); border-top: 1px solid var(--border); padding: 64px 0 32px; }
  .footer-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
  .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
  .footer-brand {}
  .footer-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .footer-logo img { border-radius: 8px; object-fit: contain; }
  .footer-logo-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: white; line-height: 1.1; }
  .footer-logo-sub { font-size: 11px; color: var(--muted); }
  .footer-brand-desc { font-size: 14px; color: var(--muted); line-height: 1.7; max-width: 300px; margin-bottom: 20px; font-weight: 300; }
  .guinea-flag { display: flex; align-items: center; gap: 8px; }
  .flag-r, .flag-y, .flag-g { width: 16px; height: 16px; border-radius: 3px; }
  .flag-r { background: #CE1126; }
  .flag-y { background: #FCD116; }
  .flag-g { background: #009460; }
  .flag-label { font-size: 12px; color: var(--muted); }
  .footer-links-group { display: flex; flex-direction: column; gap: 10px; }
  .footer-links-title { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: white; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; }
  .footer-link { font-size: 14px; color: var(--muted); text-decoration: none; transition: color 0.2s; font-weight: 300; }
  .footer-link:hover { color: white; }
  .footer-addr { cursor: default; }
  .footer-whatsapp { display: flex; align-items: center; gap: 8px; color: #22c55e !important; }
  .footer-whatsapp:hover { color: #4ade80 !important; }
  .footer-wa-icon { width: 16px; height: 16px; }
  .footer-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 24px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
  .footer-bottom-left p { font-size: 13px; color: var(--muted); margin: 0; }
  .footer-powered { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
  .footer-gtech-logo { border-radius: 6px; object-fit: contain; }
  .footer-gtech-name { font-weight: 700; color: var(--orange); }
  @media (max-width: 900px) { .footer-top { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px) { .footer-top { grid-template-columns: 1fr; gap: 32px; } }

  /* ── WhatsApp Float ── */
  .wa-float { position: fixed; bottom: 28px; right: 28px; z-index: 999; width: 58px; height: 58px; background: #25D366; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(37,211,102,0.4); transition: all 0.3s; }
  .wa-float svg { width: 30px; height: 30px; color: white; }
  .wa-float:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(37,211,102,0.5); }
  .wa-pulse { position: absolute; inset: 0; border-radius: 50%; background: #25D366; animation: waPulse 2.5s ease-out infinite; z-index: -1; }
  @keyframes waPulse { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
`;
