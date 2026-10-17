
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  CalendarCheck,
  Briefcase,
  LogOut,
} from 'lucide-react'
import './Navbar.css'
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate()
  const { setUser } = useAuth();

  async function handleLogout() {
    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/logout',
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Logout failed. Please try again.')
      }

      setUser(null);
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      alert(error.message || 'Unable to connect to server.')
    }
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo">
        <span className="logo-campus">CAMPUS</span>
        <span className="logo-flow">Flow</span>
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/" end>
          <LayoutDashboard size={17} strokeWidth={2.2} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/subjects">
          <BookOpen size={17} strokeWidth={2.2} />
          <span>Subjects</span>
        </NavLink>

        <NavLink to="/tasks">
          <CheckSquare size={17} strokeWidth={2.2} />
          <span>Tasks</span>
        </NavLink>

        <NavLink to="/attendance">
          <CalendarCheck size={17} strokeWidth={2.2} />
          <span>Attendance</span>
        </NavLink>

        <NavLink to="/placement">
          <Briefcase size={17} strokeWidth={2.2} />
          <span>Placement</span>
        </NavLink>

        <button
          type="button"
          className="navbar-logout"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
