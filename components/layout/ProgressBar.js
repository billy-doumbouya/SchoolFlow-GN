'use client'
import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

// Configure NProgress
NProgress.configure({
  minimum:   0.15,
  easing:    'ease',
  speed:     300,
  showSpinner: false,
})

function ProgressBarInner() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  useEffect(() => {
    const handleStart = () => NProgress.start()
    const handleDone  = () => NProgress.done()

    // Listen for route changes
    window.addEventListener('beforeunload', handleStart)
    return () => {
      window.removeEventListener('beforeunload', handleStart)
      handleDone()
    }
  }, [])

  return (
    <style>{`
      #nprogress {
        pointer-events: none;
      }
      #nprogress .bar {
        background:  linear-gradient(to right, #1a3aeb, #7c3aed);
        position:    fixed;
        z-index:     9999;
        top:         0;
        left:        0;
        width:       100%;
        height:      3px;
        border-radius: 0 2px 2px 0;
        box-shadow:  0 0 10px #7c3aed, 0 0 5px #1a3aeb;
      }
      #nprogress .peg {
        display:    block;
        position:   absolute;
        right:      0px;
        width:      100px;
        height:     100%;
        box-shadow: 0 0 10px #7c3aed, 0 0 5px #1a3aed;
        opacity:    1;
        transform:  rotate(3deg) translate(0px, -4px);
      }
    `}</style>
  )
}

export default function ProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  )
}
