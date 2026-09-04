import SectionHeading from './SectionHeading'

function About() {
  return (
    <section id="about" className="section">
      <SectionHeading number="01" title="About" />
      <p>
        I'm a mobile developer specializing in Flutter, with experience building
        production apps that go beyond a demo — clean layered architecture, offline
        state handling, and role-based authorization enforced in the business logic
        rather than hidden in the UI. Alongside that, I do freelance web development
        in React, having built and shipped a live site with Firebase, automated
        testing, and CI/CD.
      </p>
      <p>
        I care about code that's actually tested and actually maintainable — not
        just code that demos well. Currently looking for full-time mobile developer
        opportunities, and open to freelance web/mobile work in the meantime.
      </p>
    </section>
  )
}

export default About
