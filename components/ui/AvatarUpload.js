'use client'
import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'

const MAX_SIZE   = 400 * 1024 // 400KB
const FORMATS    = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// ─── Image compression before upload ─────────────────────────────────────────
async function compressImage(file, maxWidth = 400, quality = 0.85) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx    = canvas.getContext('2d')
    const img    = new Image()
    const url    = URL.createObjectURL(file)

    img.onload = () => {
      const ratio  = Math.min(maxWidth / img.width, maxWidth / img.height, 1)
      canvas.width  = img.width  * ratio
      canvas.height = img.height * ratio
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality
      )
    }
    img.src = url
  })
}

// ─── Upload directly to Cloudinary ───────────────────────────────────────────
async function uploadToCloudinary(file, type = 'avatar') {
  // 1. Get signature from our API
  const sigRes  = await fetch('/api/upload/signature', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ type }),
  })
  const sigData = await sigRes.json()
  if (!sigRes.ok) throw new Error(sigData.error || 'Signature failed')

  const { signature, timestamp, folder, public_id, eager, apiKey, cloudName, allowed_formats, eager_async } = sigData.data

  // 2. Build FormData for Cloudinary
  const formData = new FormData()
  formData.append('file',            file)
  formData.append('api_key',         apiKey)
  formData.append('timestamp',       timestamp)
  formData.append('signature',       signature)
  formData.append('folder',          folder)
  formData.append('public_id',       public_id)
  formData.append('eager',           eager)
  formData.append('eager_async',     eager_async)
  formData.append('allowed_formats', allowed_formats)
  formData.append('overwrite',       'true')

  // 3. Upload direct to Cloudinary (bypasses our server)
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  )
  const uploadData = await uploadRes.json()
  if (!uploadRes.ok) throw new Error(uploadData.error?.message || 'Upload failed')

  // Return the secure optimized URL
  return {
    url:      uploadData.secure_url,
    publicId: uploadData.public_id,
  }
}

// ─── AvatarUpload Component ───────────────────────────────────────────────────
export function AvatarUpload({ currentUrl, name, onUpload, type = 'avatar', size = 'md' }) {
  const [uploading, setUploading] = useState(false)
  const [preview,   setPreview]   = useState(currentUrl || null)
  const [dragOver,  setDragOver]  = useState(false)
  const inputRef = useRef(null)

  const sizes = {
    sm: { container: '60px',  font: '20px' },
    md: { container: '88px',  font: '28px' },
    lg: { container: '110px', font: '36px' },
  }
  const s = sizes[size] || sizes.md

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleFile = useCallback(async (file) => {
    if (!file) return

    // Validate format
    if (!FORMATS.includes(file.type)) {
      toast.error('Format non supporté — utilisez JPG, PNG ou WebP')
      return
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    setUploading(true)
    try {
      // Compress if too large
      let fileToUpload = file
      if (file.size > MAX_SIZE) {
        toast.loading('Compression de l\'image...', { id: 'compress' })
        fileToUpload = await compressImage(file)
        toast.dismiss('compress')
      }

      toast.loading('Upload en cours...', { id: 'upload' })
      const { url, publicId } = await uploadToCloudinary(fileToUpload, type)
      toast.dismiss('upload')

      setPreview(url)
      URL.revokeObjectURL(objectUrl)
      onUpload(url, publicId)
      toast.success('Image mise à jour ✅')
    } catch (err) {
      toast.dismiss('upload')
      toast.error(err.message || 'Erreur lors de l\'upload')
      setPreview(currentUrl || null)
      URL.revokeObjectURL(objectUrl)
    } finally {
      setUploading(false)
    }
  }, [currentUrl, type, onUpload])

  function onInputChange(e) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = '' // reset so same file can be re-selected
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      {/* Avatar circle */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          position:       'relative',
          width:          s.container,
          height:         s.container,
          borderRadius:   '50%',
          cursor:         uploading ? 'wait' : 'pointer',
          transition:     'all 0.2s',
          border:         `2px solid ${dragOver ? '#2b50f5' : 'rgba(255,255,255,0.1)'}`,
          boxShadow:      dragOver ? '0 0 0 4px rgba(43,80,245,0.2)' : 'none',
        }}
      >
        {/* Avatar image or initials */}
        {preview ? (
          <img
            src={preview}
            alt={name}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width:           '100%',
            height:          '100%',
            borderRadius:    '50%',
            background:      'linear-gradient(135deg,#1a3aeb,#7c3aed)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            fontSize:        s.font,
            fontWeight:      '800',
            color:           'white',
            fontFamily:      'Syne, sans-serif',
          }}>
            {initials}
          </div>
        )}

        {/* Overlay on hover */}
        <div style={{
          position:       'absolute',
          inset:          0,
          borderRadius:   '50%',
          background:     uploading ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          transition:     'background 0.2s',
        }}
        onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.background = 'rgba(0,0,0,0.45)' }}
        onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.background = 'rgba(0,0,0,0)' }}
        >
          {uploading ? (
            <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <svg style={{ width: '22px', height: '22px', color: 'white', opacity: 0 }} className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          div:hover .upload-icon { opacity: 1 !important; transition: opacity 0.2s; }
        `}</style>
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          style={{
            background:   'rgba(43,80,245,0.1)',
            border:       '1px solid rgba(43,80,245,0.25)',
            borderRadius: '8px',
            padding:      '5px 14px',
            color:        '#93c5fd',
            fontSize:     '12px',
            fontWeight:   '600',
            cursor:       uploading ? 'not-allowed' : 'pointer',
            fontFamily:   'DM Sans, sans-serif',
            transition:   'all 0.2s',
          }}
          onMouseEnter={(e) => { if (!uploading) { e.currentTarget.style.background = 'rgba(43,80,245,0.2)' } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(43,80,245,0.1)' }}
        >
          {uploading ? 'Upload...' : 'Changer la photo'}
        </button>
        <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#475569', fontWeight: '300' }}>
          JPG, PNG ou WebP · max 400KB
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={onInputChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}

// ─── LogoUpload — rectangular variant for school logo ────────────────────────
export function LogoUpload({ currentUrl, schoolName, onUpload }) {
  const [uploading, setUploading] = useState(false)
  const [preview,   setPreview]   = useState(currentUrl || null)
  const inputRef = useRef(null)

  const handleFile = useCallback(async (file) => {
    if (!FORMATS.includes(file.type)) {
      toast.error('Format non supporté — JPG, PNG ou WebP uniquement')
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)
    try {
      let fileToUpload = file
      if (file.size > MAX_SIZE) {
        toast.loading('Compression...', { id: 'compress-logo' })
        fileToUpload = await compressImage(file, 600, 0.9)
        toast.dismiss('compress-logo')
      }
      toast.loading('Upload du logo...', { id: 'upload-logo' })
      const { url } = await uploadToCloudinary(fileToUpload, 'logo')
      toast.dismiss('upload-logo')
      setPreview(url)
      URL.revokeObjectURL(objectUrl)
      onUpload(url)
      toast.success('Logo mis à jour ✅')
    } catch (err) {
      toast.dismiss('upload-logo')
      toast.error(err.message || 'Erreur lors de l\'upload')
      setPreview(currentUrl || null)
      URL.revokeObjectURL(objectUrl)
    } finally {
      setUploading(false)
    }
  }, [currentUrl, onUpload])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Logo preview box */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          width:          '120px',
          height:         '80px',
          background:     'rgba(255,255,255,0.04)',
          border:         '2px dashed rgba(255,255,255,0.12)',
          borderRadius:   '14px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          cursor:         uploading ? 'wait' : 'pointer',
          overflow:       'hidden',
          transition:     'all 0.2s',
          position:       'relative',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(43,80,245,0.5)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
      >
        {preview ? (
          <img src={preview} alt={schoolName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <svg width="24" height="24" fill="none" stroke="#475569" viewBox="0 0 24 24" style={{ display: 'block', margin: '0 auto 4px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p style={{ margin: 0, fontSize: '10px', color: '#475569' }}>Logo</p>
          </div>
        )}
        {uploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => !uploading && inputRef.current?.click()}
        disabled={uploading}
        style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}
      >
        {uploading ? 'Upload...' : 'Changer le logo'}
      </button>

      <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} style={{ display: 'none' }} />
    </div>
  )
}
