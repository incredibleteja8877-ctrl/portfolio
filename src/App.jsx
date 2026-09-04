import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FadeInSection from './components/FadeInSection'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <main className="container">
        <FadeInSection><About /></FadeInSection>
        <FadeInSection><Skills /></FadeInSection>
        <FadeInSection><Projects /></FadeInSection>
        <FadeInSection><Contact /></FadeInSection>
      </main>
      <Footer />
    </div>
  )
}

export default App
