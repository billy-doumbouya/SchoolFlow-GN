'use client'
import { useState } from 'react'
import { useFetch, useApi, usePagination } from '@/hooks'

const TYPE_CONFIG = {
  SUCCESS: { icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.2)',  label: 'Succès' },
  DANGER:  { icon: '🚨', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.2)',  label: 'Alerte' },
  WARNING: { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',border: 'rgba(245,158,11,0.2)', label: 'Attention' },
  INFO:    { icon: 'ℹ️', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)', label: 'Info' },
}

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const day = Math.floor(h / 24)
  if (day > 0) return `il y a ${day} jour${day > 1 ? 's' : ''}`
  if (h > 0)   return `il y a ${h}h`
  if (m > 0)   return `il y a ${m} min`
  return "à l'instant"
}

export default function NotificationsPage() {
  const [filter, setFilter]   = useState('all')
  const [toast,  setToast]    = useState(null)
  const { page, setPage, queryString } = usePagination(1, 15)

  const url = `/api/notifications?${queryString}`
  const { data, loading, refetch } = useFetch(url, [page])
  const { put, del, loading: acting } = useApi()

  const allNotifs  = data?.notifications ?? []
  const unread     = data?.unreadCount ?? 0
  const pagination = data?.pagination ?? null

  const filtered = filter === 'unread' ? allNotifs.filter((n) => !n.isRead) : allNotifs

  const notify = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  async function handleMarkRead(id) {
    await fetch(`/api/notifications/${id}`, { method: 'PUT' })
    refetch()
  }

  async function handleMarkAll() {
    await fetch('/api/notifications', { method: 'PUT' })
    notify('Toutes les notifications marquées comme lues')
    refetch()
  }

  async function handleDelete(id) {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
    refetch()
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '24px', zIndex: 9999,
          background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
          color: '#22c55e', padding: '12px 20px', borderRadius: '12px',
          fontSize: '13px', fontWeight: '600', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'white', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px' }}>
            Notifications
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '300' }}>
            {unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            style={{
              padding: '9px 18px', background: 'rgba(43,80,245,0.15)',
              border: '1px solid rgba(43,80,245,0.3)', borderRadius: '10px',
              color: '#93c5fd', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
            }}
          >
            ✓ Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { key: 'all',    label: 'Toutes' },
          { key: 'unread', label: `Non lues ${unread > 0 ? `(${unread})` : ''}` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '7px 16px',
              background: filter === f.key ? 'linear-gradient(135deg,#1a3aeb,#7c3aed)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === f.key ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '8px', color: filter === f.key ? 'white' : '#94a3b8',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid rgba(43,80,245,0.3)', borderTopColor: '#2b50f5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'white', fontFamily: 'Syne, sans-serif' }}>
              {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#475569', fontWeight: '300' }}>
              Les notifications apparaîtront ici automatiquement
            </p>
          </div>
        ) : (
          filtered.map((n, i) => {
            const t = TYPE_CONFIG[n.type] || TYPE_CONFIG.INFO
            return (
              <div
                key={n.id}
                style={{
                  display: 'flex', gap: '16px', padding: '18px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: n.isRead ? 'transparent' : 'rgba(43,80,245,0.04)',
                  transition: 'background 0.2s', cursor: n.link ? 'pointer' : 'default',
                  position: 'relative',
                }}
                onClick={() => { if (!n.isRead) handleMarkRead(n.id); if (n.link) window.location.href = n.link }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(43,80,245,0.04)'}
              >
                {/* Icon */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: t.bg, border: `1px solid ${t.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0,
                }}>{t.icon}</div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: n.isRead ? '500' : '700', color: 'white', lineHeight: 1.4 }}>
                      {n.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {!n.isRead && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                      )}
                      <span style={{
                        padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '600',
                        background: t.bg, color: t.color, border: `1px solid ${t.border}`,
                        whiteSpace: 'nowrap',
                      }}>{t.label}</span>
                    </div>
                  </div>
                  <p style={{ margin: '4px 0 6px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, fontWeight: '300' }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '11px', color: '#475569' }}>{timeAgo(n.createdAt)}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  {!n.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id) }}
                      style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '11px', cursor: 'pointer', fontWeight: '600', fontFamily: 'DM Sans, sans-serif', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap' }}
                    >Marquer lu</button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id) }}
                    style={{ background: 'none', border: 'none', color: '#475569', fontSize: '11px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', padding: '2px 4px', borderRadius: '4px' }}
                  >Supprimer</button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: p === page ? 'linear-gradient(135deg,#1a3aeb,#7c3aed)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${p === page ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                color: p === page ? 'white' : '#64748b', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >{p}</button>
          ))}
        </div>
      )}
    </div>
  )
}
