'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const TYPE_ICON = {
  SUCCESS: { icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  DANGER:  { icon: '🚨', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  WARNING: { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  INFO:    { icon: 'ℹ️', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0)  return `il y a ${d}j`
  if (h > 0)  return `il y a ${h}h`
  if (m > 0)  return `il y a ${m}min`
  return 'à l\'instant'
}

export function NotificationBell() {
  const [open,        setOpen]        = useState(false)
  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [markingAll,  setMarkingAll]  = useState(false)
  const dropdownRef = useRef(null)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/notifications?limit=10')
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch {}
    finally { setLoading(false) }
  }, [])

  // Poll every 30s
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleMarkRead(id) {
    await fetch(`/api/notifications/${id}`, { method: 'PUT' })
    setData((prev) => prev ? {
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, (prev.unreadCount || 0) - 1),
    } : prev)
  }

  async function handleMarkAllRead() {
    setMarkingAll(true)
    await fetch('/api/notifications', { method: 'PUT' })
    setData((prev) => prev ? {
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    } : prev)
    setMarkingAll(false)
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
    setData((prev) => prev ? {
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
      unreadCount: prev.notifications.find((n) => n.id === id && !n.isRead)
        ? Math.max(0, (prev.unreadCount || 0) - 1)
        : prev.unreadCount,
    } : prev)
  }

  const unread       = data?.unreadCount ?? 0
  const notifications = data?.notifications ?? []

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications() }}
        style={{
          position:     'relative',
          width:        '38px',
          height:       '38px',
          borderRadius: '10px',
          background:   open ? 'rgba(43,80,245,0.15)' : 'rgba(255,255,255,0.05)',
          border:       `1px solid ${open ? 'rgba(43,80,245,0.4)' : 'rgba(255,255,255,0.08)'}`,
          cursor:       'pointer',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          transition:   'all 0.2s',
        }}
        aria-label="Notifications"
      >
        <svg width="18" height="18" fill="none" stroke={open ? '#93c5fd' : '#94a3b8'} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span style={{
            position:     'absolute',
            top:          '-4px',
            right:        '-4px',
            minWidth:     '18px',
            height:       '18px',
            background:   'linear-gradient(135deg,#ef4444,#dc2626)',
            borderRadius: '999px',
            fontSize:     '10px',
            fontWeight:   '700',
            color:        'white',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            padding:      '0 4px',
            border:       '2px solid #0a0f1e',
            lineHeight:   '1',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:    'absolute',
          top:         '46px',
          right:       0,
          width:       '360px',
          background:  '#0f1729',
          border:      '1px solid rgba(255,255,255,0.1)',
          borderRadius:'20px',
          boxShadow:   '0 24px 80px rgba(0,0,0,0.6)',
          zIndex:      1000,
          overflow:    'hidden',
          animation:   'dropIn 0.2s ease',
        }}>
          <style>{`@keyframes dropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Header */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '16px 20px',
            borderBottom:   '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: 'white', fontFamily: 'Syne, sans-serif' }}>
                Notifications
              </span>
              {unread > 0 && (
                <span style={{
                  background:   'rgba(43,80,245,0.2)',
                  color:        '#93c5fd',
                  border:       '1px solid rgba(43,80,245,0.3)',
                  borderRadius: '999px',
                  fontSize:     '11px',
                  fontWeight:   '600',
                  padding:      '1px 8px',
                }}>{unread} non lues</span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                style={{
                  background: 'none',
                  border:     'none',
                  color:      '#93c5fd',
                  fontSize:   '12px',
                  cursor:     'pointer',
                  fontWeight: '500',
                  padding:    '4px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                }}
              >
                {markingAll ? '...' : 'Tout marquer lu'}
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔔</div>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Aucune notification</p>
              </div>
            ) : (
              notifications.map((n) => {
                const t = TYPE_ICON[n.type] || TYPE_ICON.INFO
                return (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.isRead) handleMarkRead(n.id); if (n.link) window.location.href = n.link }}
                    style={{
                      display:    'flex',
                      gap:        '12px',
                      padding:    '14px 20px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: n.isRead ? 'transparent' : 'rgba(43,80,245,0.05)',
                      cursor:     'pointer',
                      transition: 'background 0.2s',
                      position:   'relative',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(43,80,245,0.05)'}
                  >
                    {/* Icon */}
                    <div style={{
                      width:        '36px',
                      height:       '36px',
                      borderRadius: '10px',
                      background:   t.bg,
                      display:      'flex',
                      alignItems:   'center',
                      justifyContent: 'center',
                      fontSize:     '16px',
                      flexShrink:   0,
                    }}>
                      {t.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: n.isRead ? '500' : '600', color: n.isRead ? '#e2e8f0' : 'white', lineHeight: 1.4 }}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: '4px' }} />
                        )}
                      </div>
                      <p style={{ margin: '3px 0 4px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, fontWeight: '300' }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{timeAgo(n.createdAt)}</span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDelete(n.id, e)}
                      style={{
                        position:   'absolute',
                        top:        '10px',
                        right:      '12px',
                        background: 'none',
                        border:     'none',
                        color:      '#475569',
                        cursor:     'pointer',
                        padding:    '2px',
                        borderRadius: '4px',
                        fontSize:   '14px',
                        opacity:    0,
                        transition: 'opacity 0.2s',
                      }}
                      className="notif-delete"
                    >×</button>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <a href="/dashboard/notifications" style={{ fontSize: '13px', color: '#93c5fd', textDecoration: 'none', fontWeight: '500' }}>
                Voir toutes les notifications →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
