import { Routes, Route } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import Navbar from './components/Navbar'
import Docs from './components/Docs'
import Board from './components/Board'
import Login from './components/Login'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Login />
  }

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
