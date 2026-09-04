function Hero() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="hero">
      <img src="/profile-photo.jpg" alt="Vissakodeti Sai Teja" className="hero-avatar" />
      <p className="hero-eyebrow">Hyderabad, India</p>
      <h1>Vissakodeti Sai Teja</h1>
      <p className="hero-role">Flutter Mobile Developer &amp; Freelance React Web Developer</p>
      <p className="hero-summary">
        I build mobile apps with Flutter — clean architecture, full test coverage,
        offline handling — and freelance web apps with React, Firebase, and CI/CD.
      </p>
      <div className="hero-actions">
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
