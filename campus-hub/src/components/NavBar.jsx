import { useState } from "react";
import "./NavBar.css";
import logo from "../assets/logo.svg";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavBar() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="nav">
      <div className="navbar-container">
        <Link to="/" className="nav-logo-link" onClick={closeMenu}>
          <img className="logo" src={logo} alt="CampusHub" />
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>

        <div className={`nav-menu ${menuOpen ? "nav-menu-open" : ""}`}>
          <ul className="list">
            <li className="list-item">
              <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                Market Place
              </NavLink>
            </li>
            <li className="list-item">
              <NavLink to="/CourseExchange" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                Course Exchange
              </NavLink>
            </li>
            <li className="list-item">
              <NavLink to="/Tutoring" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                Tutoring
              </NavLink>
            </li>
            <li className="list-item">
              <NavLink to="/Housing" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                Housing
              </NavLink>
            </li>
          </ul>

          <div className="student">
            <p className="welcome">
              {isAuthenticated ? "Welcome, Student!" : "Welcome, Guest!"}
            </p>
            <div className="auth-buttons">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="auth-button link-button profile-link" onClick={closeMenu}>
                    Profile
                  </Link>
                  <button type="button" className="auth-button" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/auth" className="auth-button link-button" onClick={closeMenu}>
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
