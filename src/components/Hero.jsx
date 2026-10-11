import { Suspense, lazy, useEffect, useRef, useState } from 'react'

const TechOrbit3D = lazy(() => import('./TechOrbit3D'))

// Timestamp (seconds) in hero-fire-bg.mp4 where the trees are well alight --
// name/role/summary/actions reveal together at this point, then stay visible
// even as the background video keeps looping behind them.
const FIRE_REVEAL_AT = 2.2
// Safety net in case autoplay is blocked or metadata stalls -- content must
// never stay hidden just because the video didn't play.
const FIRE_REVEAL_FALLBACK_MS = 2400

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Hero() {
  const videoRef = useRef(null)
  const [reducedMotion] = useState(prefersReducedMotion)
  const [isLit, setIsLit] = useState(() => prefersReducedMotion())

  useEffect(() => {
    if (reducedMotion) return

    let revealed = false
    const video = videoRef.current

    const onTimeUpdate = () => {
      if (revealed || !video) return
      if (video.currentTime >= FIRE_REVEAL_AT) {
        revealed = true
        setIsLit(true)
        video.removeEventListener('timeupdate', onTimeUpdate)
      }
    }

    video?.addEventListener('timeupdate', onTimeUpdate)
    const fallback = setTimeout(() => {
      if (revealed) return
      revealed = true
      setIsLit(true)
    }, FIRE_REVEAL_FALLBACK_MS)

    return () => {
      video?.removeEventListener('timeupdate', onTimeUpdate)
      clearTimeout(fallback)
    }
  }, [reducedMotion])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`hero${isLit ? ' is-lit' : ''}`}>
      {reducedMotion ? (
        <img src="/hero-fire-poster.jpg" alt="" className="hero-fire-bg" aria-hidden="true" />
      ) : (
        <video
          ref={videoRef}
          className="hero-fire-bg"
          src="/hero-fire-bg.mp4"
          poster="/hero-fire-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      )}
      <div className="hero-fire-overlay" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-avatar-stage">
          <Suspense fallback={null}>
            <TechOrbit3D />
          </Suspense>
          <img src="/profile-photo.jpg" alt="Vissakodeti Sai Teja" className="hero-avatar" />
        </div>
        <p className="hero-eyebrow hero-anim" style={{ '--d': '0s' }}>Hyderabad, India</p>
        <h1 className="hero-gated hero-anim" style={{ '--d': '0s' }}>
          <span className="fire-text">
            Vissakodeti Sai Teja
            <span className="fire-text-cracks" aria-hidden="true">Vissakodeti Sai Teja</span>
          </span>
        </h1>
        <p className="hero-role hero-gated hero-anim" style={{ '--d': '0.14s' }}>
          Flutter Mobile Developer &amp; Freelance React Web Developer
        </p>
        <p className="hero-summary hero-gated hero-anim" style={{ '--d': '0.26s' }}>
          I build mobile apps with Flutter — clean architecture, full test coverage,
          offline handling — and freelance web apps with React, Firebase, and CI/CD.
        </p>
        <div className="hero-actions hero-gated hero-anim" style={{ '--d': '0.38s' }}>
          <button className="btn-primary" onClick={() => scrollTo('projects')}>
            View Projects
          </button>
          <button className="btn-secondary" onClick={() => scrollTo('contact')}>
            Get in Touch
          </button>
        </div>
      </div>
    </header>
  )
}

export default Hero
