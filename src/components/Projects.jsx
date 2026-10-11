import SectionHeading from './SectionHeading'

const projects = [
  {
    name: 'Maega',
    tag: 'Flutter · Mobile App · Professional',
    stack: ['Flutter', 'Dart', 'Firebase Auth', 'Cloud Firestore', 'Provider'],
    description:
      'A Flutter service-marketplace app for on-demand technicians, built professionally at Quantum Works with a real Firebase backend. I built the UI directly from Figma designs, including animations, and integrated Firebase Authentication and Cloud Firestore for real-time data sync.',
    highlights: [
      'Real Firebase Authentication and Cloud Firestore backend',
      'UI built directly from Figma designs, including animations',
      'Job-tracking workflow with status tabs and an earnings dashboard',
      'Reactive state management with Provider, persisted theming',
    ],
    link: 'https://github.com/incredibleteja8877-ctrl/maega',
    linkLabel: 'View on GitHub',
    screenshotStyle: 'phone',
    screenshots: [
      { src: '/screenshots/maega-jobs.jpg', alt: 'Maega active jobs screen with status tabs and booking details' },
      { src: '/screenshots/maega-earnings.jpg', alt: 'Maega earnings and wallet dashboard with weekly analytics' },
    ],
  },
  {
    name: 'TaskFlow',
    tag: 'Flutter · Mobile App',
    stack: ['Flutter', 'Dart', 'Clean Architecture', 'Unit + Integration Tests'],
    description:
      "A task-management app built to a full technical spec: three-layer clean architecture, 104 passing unit tests plus an integration test, offline mode with a simulated network layer, and role-based authorization enforced in the business logic layer — not just hidden UI buttons.",
    highlights: [
      'Clean architecture with dependencies pointing inward',
      '104 unit tests, 1 integration test, all passing',
      'Offline mode and simulated server-error handling',
      'Admin/member authorization enforced in usecases',
    ],
    link: 'https://github.com/incredibleteja8877-ctrl/taskflow',
    linkLabel: 'View on GitHub',
    badge: {
      src: 'https://github.com/incredibleteja8877-ctrl/taskflow/actions/workflows/ci.yml/badge.svg',
      link: 'https://github.com/incredibleteja8877-ctrl/taskflow/actions',
      alt: 'Analyze and Test status',
    },
    screenshots: [
      { src: '/screenshots/taskflow-dashboard.jpg', alt: 'TaskFlow home dashboard showing task status summary and assigned tasks' },
      { src: '/screenshots/taskflow-project.jpg', alt: 'TaskFlow project detail screen with task list, status and priority chips' },
    ],
  },
  {
    name: 'SSD Yogashala & Kalakshetra',
    tag: 'React · Firebase · Freelance',
    stack: ['React', 'Firebase', 'Firestore', 'Vitest', 'GitHub Actions'],
    description:
      'A live, production website built and shipped for a real yoga and classical dance studio — class booking with Firestore, email notifications, and a fully automated test and deploy pipeline.',
    highlights: [
      'Class booking and enquiry forms backed by Firestore',
      'Email notifications via EmailJS',
      'Vitest test suite + GitHub Actions CI/CD to Firebase Hosting',
    ],
    link: 'https://ssd-yogashala.web.app',
    linkLabel: 'View Live Site',
    secondaryLink: 'https://github.com/incredibleteja8877-ctrl/Freelance',
    secondaryLabel: 'View Code',
    badge: {
      src: 'https://github.com/incredibleteja8877-ctrl/Freelance/actions/workflows/deploy.yml/badge.svg',
      link: 'https://github.com/incredibleteja8877-ctrl/Freelance/actions',
      alt: 'Build, Test, and Deploy status',
    },
    screenshots: [
      { src: '/screenshots/yogashala-home.jpg', alt: 'SSD Yogashala and Kalakshetra homepage, live site' },
    ],
  },
]

function Projects() {
  return (
    <section id="projects" className="section">
      <SectionHeading number="03" title="Projects" />
      <div className="projects-list">
        {projects.map((project) => (
          <div className="project-card" key={project.name}>
            {project.screenshots && (
              <div className={`project-screenshots${project.screenshotStyle === 'phone' ? ' phone-screens' : ''}`}>
                {project.screenshots.map((shot) => (
                  <img key={shot.src} src={shot.src} alt={shot.alt} loading="lazy" />
                ))}
              </div>
            )}
            <div className="project-tag-row">
              <p className="project-tag">{project.tag}</p>
              {project.badge && (
                <a href={project.badge.link} target="_blank" rel="noopener noreferrer" className="ci-badge">
                  <img src={project.badge.src} alt={project.badge.alt} />
                </a>
              )}
            </div>
            <h3>{project.name}</h3>
            <p className="project-description">{project.description}</p>
            <ul className="project-highlights">
              {project.highlights.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className="project-stack">
              {project.stack.map((tech) => (
                <span className="stack-pill" key={tech}>{tech}</span>
              ))}
            </div>
            <div className="project-links">
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                {project.linkLabel} &rarr;
              </a>
              {project.secondaryLink && (
                <a href={project.secondaryLink} target="_blank" rel="noopener noreferrer">
                  {project.secondaryLabel} &rarr;
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Projects
