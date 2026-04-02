import { useEffect, useMemo, useState } from "react";
import "./NavBar.css";
import logo from "../assets/logo.svg";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FEATURE_FLAGS } from "../config/features";

function NavBar() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = useMemo(() => {
    if (!isAuthenticated || !currentUser) return "Guest";
    const nameCandidate = currentUser.firstName ?? currentUser.name ?? currentUser.email;
    if (!nameCandidate) return "Student";
    if (nameCandidate.includes("@")) {
      return nameCandidate.split("@")[0];
    }
    return nameCandidate;
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="nav" aria-label="Primary navigation">
      <div className="navbar-container">
        <Link to="/" className="nav-logo-link" onClick={closeMenu}>
          <img className="logo" src={logo} alt="CampusHub" />
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>

        <div id="mobile-nav-menu" className={`nav-menu ${menuOpen ? "nav-menu-open" : ""}`}>
          <ul className="list">
            <li className="list-item">
              <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                Market Place
              </NavLink>
            </li>
            {FEATURE_FLAGS.courseExchange ? (
              <li className="list-item">
                <NavLink to="/courseexchange" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                  Course Exchange
                </NavLink>
              </li>
            ) : null}
            {FEATURE_FLAGS.tutoring ? (
              <li className="list-item">
                <NavLink to="/tutoring" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                  Tutoring
                </NavLink>
              </li>
            ) : null}
            {FEATURE_FLAGS.housing ? (
              <li className="list-item">
                <NavLink to="/housing" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                  Housing
                </NavLink>
              </li>
            ) : null}
            {FEATURE_FLAGS.auth ? (
              <li className="list-item">
                <NavLink to="/chat" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeMenu}>
                  Chat
                </NavLink>
              </li>
            ) : null}
          </ul>

          <div className="student">
            <p className="welcome">
              {isAuthenticated ? `Welcome back, ${displayName}!` : "Welcome, Guest!"}
            </p>
            <div className="auth-buttons">
              {FEATURE_FLAGS.auth && isAuthenticated ? (
                <>
                  <Link to="/cart" className="auth-button link-button" onClick={closeMenu}>
                    Cart
                  </Link>
                  <Link to="/profile" className="auth-button link-button profile-link" onClick={closeMenu}>
                    Profile
                  </Link>
                  <button type="button" className="auth-button" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : FEATURE_FLAGS.auth ? (
                <Link to="/auth" className="auth-button link-button" onClick={closeMenu}>
                  Login / Register
                </Link>
              ) : (
                <p className="welcome">Auth unavailable</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {menuOpen ? <button type="button" className="nav-backdrop" onClick={closeMenu} aria-label="Close menu overlay" /> : null}
    </nav>
  );
}

export default NavBar;
