function SectionHeading({ number, title }) {
  return (
    <div className="section-heading">
      <span className="section-number">{number}</span>
      <h2>{title}</h2>
    </div>
  )
}

export default SectionHeading
