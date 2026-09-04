import { MailIcon, PhoneIcon, LinkedInIcon, GitHubIcon, DownloadIcon } from './Icons'
import SectionHeading from './SectionHeading'

const EMAIL = 'incredibleteja8877@gmail.com'
const PHONE = '+91 80742 97473'
const PHONE_LINK = 'tel:+918074297473'
const LINKEDIN = 'https://linkedin.com/in/vissakodeti-sai-teja'
const GITHUB = 'https://github.com/incredibleteja8877-ctrl'

function Contact() {
  return (
    <section id="contact" className="section">
      <SectionHeading number="04" title="Get in Touch" />
      <p className="contact-intro">
        Open to full-time Flutter/mobile roles and freelance web or mobile work.
      </p>
      <div className="contact-links">
        <a href={`mailto:${EMAIL}`}><MailIcon width={17} height={17} /> {EMAIL}</a>
        <a href={PHONE_LINK}><PhoneIcon width={17} height={17} /> {PHONE}</a>
        <a href={LINKEDIN} target="_blank" rel="noopener noreferrer"><LinkedInIcon width={17} height={17} /> LinkedIn</a>
        <a href={GITHUB} target="_blank" rel="noopener noreferrer"><GitHubIcon width={17} height={17} /> GitHub</a>
      </div>
      <a href="/Sai_Teja_Resume.pdf" target="_blank" rel="noopener noreferrer" className="resume-link">
        <DownloadIcon width={17} height={17} /> Download Resume
      </a>
    </section>
  )
}

export default Contact
