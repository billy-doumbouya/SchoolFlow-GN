'use client'

export default function GlobalError({ error, reset }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: '#0a0f1e', fontFamily: 'sans-serif' }}>
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column', gap: '16px', color: 'white', textAlign: 'center', padding: '24px',
        }}>
          <div style={{ fontSize: '48px' }}>🚨</div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Erreur critique</h1>
          <p style={{ margin: 0, color: '#64748b', maxWidth: '400px', lineHeight: 1.6 }}>
            Une erreur inattendue s'est produite. Veuillez rafraîchir la page.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '10px 24px', background: '#1a3aeb', border: 'none',
              borderRadius: '10px', color: 'white', fontSize: '14px',
              fontWeight: '600', cursor: 'pointer',
            }}
          >
            Rafraîchir la page
          </button>
        </div>
      </body>
    </html>
  )
}
