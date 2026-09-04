import { MobileIcon, CodeIcon, CheckShieldIcon, LayersIcon } from './Icons'
import SectionHeading from './SectionHeading'

const groups = [
  {
    title: 'Mobile',
    icon: MobileIcon,
    items: ['Flutter', 'Dart', 'Clean Architecture', 'State Management', 'REST API Integration'],
  },
  {
    title: 'Web',
    icon: CodeIcon,
    items: ['React', 'JavaScript', 'Vite', 'Firebase / Firestore'],
  },
  {
    title: 'Testing & CI/CD',
    icon: CheckShieldIcon,
    items: ['Flutter Test', 'Vitest', 'React Testing Library', 'GitHub Actions'],
  },
  {
    title: 'Fundamentals',
    icon: LayersIcon,
    items: ['Object-Oriented Programming', 'Git', 'Security-Conscious Design'],
  },
]

function Skills() {
  return (
    <section id="skills" className="section">
      <SectionHeading number="02" title="Skills" />
      <div className="skills-grid">
        {groups.map((group) => (
          <div className="skills-card" key={group.title}>
            <div className="skills-card-icon">
              <group.icon width={20} height={20} />
            </div>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
