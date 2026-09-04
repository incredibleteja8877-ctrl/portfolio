import { useRef, useState, useEffect } from 'react'

function FadeInSection({ children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`fade-in-section ${visible ? 'is-visible' : ''}`}>
      {children}
    </div>
  )
}

export default FadeInSection
