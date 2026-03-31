import { NavLink } from 'react-router-dom'

export default function Navbar() {
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
      </div>
    </nav>
  )
}
