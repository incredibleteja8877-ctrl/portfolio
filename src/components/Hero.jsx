import { Suspense, lazy } from 'react'
import BurnReveal from './BurnReveal'

const TechOrbit3D = lazy(() => import('./TechOrbit3D'))

function Hero() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="hero">
      <div className="hero-avatar-stage">
        <Suspense fallback={null}>
          <TechOrbit3D />
        </Suspense>
        <img src="/profile-photo.jpg" alt="Vissakodeti Sai Teja" className="hero-avatar" />
      </div>
      <p className="hero-eyebrow hero-anim" style={{ '--d': '0s' }}>Hyderabad, India</p>
      <h1>
        <BurnReveal>Vissakodeti Sai Teja</BurnReveal>
      </h1>
      <p className="hero-role hero-anim" style={{ '--d': '0.16s' }}>
        Flutter Mobile Developer &amp; Freelance React Web Developer
      </p>
      <p className="hero-summary hero-anim" style={{ '--d': '0.24s' }}>
        I build mobile apps with Flutter — clean architecture, full test coverage,
        offline handling — and freelance web apps with React, Firebase, and CI/CD.
      </p>
      <div className="hero-actions hero-anim" style={{ '--d': '0.32s' }}>
        <button className="btn-primary" onClick={() => scrollTo('projects')}>
          View Projects
        </button>
        <button className="btn-secondary" onClick={() => scrollTo('contact')}>
          Get in Touch
        </button>
      </div>
    </header>
  )
}

export default Hero
