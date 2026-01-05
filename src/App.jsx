import './App.css'

function App() {
  return (
    <div className="app-container">
      <div className="glow-orb" style={{ top: '-10%', left: '-10%' }} />
      <div className="glow-orb" style={{ bottom: '-10%', right: '-10%', background: '#3b82f6' }} />
      
      <main className="hero-content">
        <h1 className="title">Novigraph</h1>
        <p className="subtitle">
          Visualize your data with elegance. A modern approach to graph analytics.
        </p>
        <button className="cta-button">
          Get Started
        </button>
      </main>
    </div>
  )
}

export default App
