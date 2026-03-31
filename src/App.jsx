import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Docs from './components/Docs'
import Board from './components/Board'

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Docs />} />
          <Route path="/board" element={<Board />} />
        </Routes>
      </div>
    </>
  )
}
