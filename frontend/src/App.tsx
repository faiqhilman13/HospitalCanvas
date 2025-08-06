import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HeroPage from './components/HeroPage'
import CanvasPage from './components/CanvasPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/canvas" element={<CanvasPage />} />
      </Routes>
    </Router>
  )
}

export default App
