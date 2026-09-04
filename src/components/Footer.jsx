import { LinkedInIcon, GitHubIcon, MailIcon } from './Icons'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-socials">
        <a href="https://linkedin.com/in/vissakodeti-sai-teja" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <LinkedInIcon width={18} height={18} />
        </a>
        <a href="https://github.com/incredibleteja8877-ctrl" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <GitHubIcon width={18} height={18} />
        </a>
        <a href="mailto:incredibleteja8877@gmail.com" aria-label="Email">
          <MailIcon width={18} height={18} />
        </a>
      </div>
      <p>&copy; {new Date().getFullYear()} Vissakodeti Sai Teja</p>
    </footer>
  )
}

export default Footer
