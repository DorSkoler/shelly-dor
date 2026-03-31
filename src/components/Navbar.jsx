import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  const displayName = user?.email?.split('@')[0] || ''

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">SecMCP</NavLink>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          Docs
        </NavLink>
        <NavLink to="/board" className={({ isActive }) => isActive ? 'active' : ''}>
          Board
        </NavLink>
        <span className="navbar-user">{displayName}</span>
        <button onClick={signOut} className="navbar-signout">Sign Out</button>
      </div>
    </nav>
  )
}
