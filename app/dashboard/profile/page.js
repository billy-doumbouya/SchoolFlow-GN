'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { changePasswordSchema } from '@/schemas'
import { useAuth } from '@/hooks'
import { toast } from 'sonner'
import { AvatarUpload } from '@/components/ui/AvatarUpload'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, PageHeader } from '@/components/ui'

const ROLE_INFO = {
  SUPER_ADMIN:  { label: 'Super Admin',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  SCHOOL_ADMIN: { label: 'Admin École',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)' },
  TEACHER:      { label: 'Enseignant',     color: '#a78bfa', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
  STUDENT:      { label: 'Élève',          color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)' },
  PARENT:       { label: 'Parent',         color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)' },
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [phone,     setPhone]     = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving,    setSaving]    = useState(false)
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName   || '')
      setPhone(user.phone         || '')
      setAvatarUrl(user.avatarUrl || '')
    }
  }, [user])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(changePasswordSchema),
  })

  async function handleProfileSave(e) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) { toast.error('Prénom et nom requis'); return }
    setSaving(true)
    try {
      const res  = await fetch('/api/auth/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), phone, avatarUrl }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Profil mis à jour ✅')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  async function handleAvatarUpload(url) {
    setAvatarUrl(url)
    // Auto-save avatar immediately
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, avatarUrl: url }),
      })
    } catch {}
  }

  async function handlePasswordChange(data) {
    try {
      const res  = await fetch('/api/auth/password', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || (json.details ? json.details.join(', ') : 'Erreur'))
      toast.success('🔐 Mot de passe modifié avec succès')
      reset()
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: '28px', height: '28px', border: '3px solid rgba(43,80,245,0.2)', borderTopColor: '#2b50f5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const fullName = `${firstName} ${lastName}`.trim() || user?.email
  const roleInfo = ROLE_INFO[user?.role] || ROLE_INFO.STUDENT

  return (
    <div style={{ padding: '32px', maxWidth: '860px', fontFamily: 'DM Sans, sans-serif' }}>
      <PageHeader title="Mon profil" subtitle="Gérez vos informations et la sécurité de votre compte" />

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Left card — Identity ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Card>
            <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', paddingTop: '28px', paddingBottom: '28px' }}>
              {/* Avatar upload */}
              <AvatarUpload
                currentUrl={avatarUrl}
                name={fullName}
                onUpload={handleAvatarUpload}
                type="avatar"
                size="lg"
              />

              {/* Name + role */}
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: 'white', fontFamily: 'Syne, sans-serif' }}>{fullName}</h3>
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b' }}>{user?.email}</p>
                <span style={{
                  display: 'inline-block', padding: '3px 12px', borderRadius: '999px',
                  fontSize: '11px', fontWeight: '700',
                  background: roleInfo.bg, color: roleInfo.color, border: `1px solid ${roleInfo.border}`,
                }}>{roleInfo.label}</span>
              </div>

              {/* School */}
              {user?.tenant && (
                <div style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>École</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>{user.tenant.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account info */}
          <Card>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Statut', value: user?.isActive ? 'Actif' : 'Inactif', color: user?.isActive ? '#22c55e' : '#ef4444' },
                { label: 'Membre depuis', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-GN', { month: 'long', year: 'numeric' }) : '—' },
              ].map((item, i) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: item.color || '#e2e8f0' }}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── Right — Forms ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Personal info form */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '32px', height: '32px', background: 'rgba(43,80,245,0.15)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>👤</span>
                  Informations personnelles
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Input label="Prénom" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Mamadou" />
                  <Input label="Nom" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Diallo" />
                </div>

                {/* Email — readonly */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adresse email</label>
                  <div style={{ height: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="14" height="14" fill="none" stroke="#475569" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span style={{ fontSize: '13px', color: '#475569' }}>{user?.email}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#334155', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '5px' }}>Non modifiable</span>
                  </div>
                </div>

                <Input
                  label="Téléphone WhatsApp"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+224 6XX XXX XXX"
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" loading={saving}>Enregistrer les modifications</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password change form */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '32px', height: '32px', background: 'rgba(124,58,237,0.15)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🔐</span>
                  Sécurité du compte
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handlePasswordChange)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <PwdInput label="Mot de passe actuel" name="currentPassword" show={showPwd.current} onToggle={() => setShowPwd(p => ({ ...p, current: !p.current }))} register={register} error={errors.currentPassword?.message} />

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

                <PwdInput label="Nouveau mot de passe" name="newPassword" show={showPwd.new} onToggle={() => setShowPwd(p => ({ ...p, new: !p.new }))} register={register} error={errors.newPassword?.message} />
                <PwdInput label="Confirmer le nouveau mot de passe" name="confirmPassword" show={showPwd.confirm} onToggle={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))} register={register} error={errors.confirmPassword?.message} />

                {/* Password rules */}
                <div style={{ padding: '10px 14px', background: 'rgba(43,80,245,0.06)', border: '1px solid rgba(43,80,245,0.14)', borderRadius: '10px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: '#93c5fd' }}>Règles</p>
                  {['Minimum 8 caractères', 'Une majuscule recommandée', 'Un chiffre recommandé'].map((r) => (
                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#475569', flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '300' }}>{r}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" loading={isSubmitting}>Modifier le mot de passe</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PwdInput({ label, name, show, onToggle, register, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label} <span style={{ color: '#ef4444' }}>*</span></label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          placeholder="••••••••"
          style={{ height: '40px', width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '0 40px 0 14px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          onFocus={(e) => { e.target.style.borderColor = '#2b50f5'; e.target.style.boxShadow = '0 0 0 3px rgba(43,80,245,0.12)' }}
          onBlur={(e) => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
          {...register(name)}
        />
        <button type="button" onClick={onToggle} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          {show
            ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
        </button>
      </div>
      {error && <p style={{ margin: 0, fontSize: '12px', color: '#ef4444' }}>{error}</p>}
    </div>
  )
}
