import './NavBar.css';
import logo from "../assets/logo.svg";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavBar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className = "nav">
        <div className = "navbar-container">
            <a href="#"><img className= 'logo' src={logo} alt="logo" /></a>

            <ul className = "list">
                <li className = "list-item">
                    <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Market Place</NavLink>
                </li>
                <li className = "list-item">
                    <NavLink to="/CourseExchange" className={({ isActive }) => isActive ? "active" : ""}>Course Exchange</NavLink>
                </li>
                <li className = "list-item">
                    <NavLink to="/Tutoring" className={({ isActive }) => isActive ? "active" : ""}>Tutoring</NavLink>
                </li>
                <li className = "list-item">
                    <NavLink to="/Housing" className={({ isActive }) => isActive ? "active" : ""}>Housing</NavLink>
                </li>
            </ul>

            <div className="student">
                <h3 className='welcome'>
                  {isAuthenticated ? 'Welcome Student!' : 'Welcome Guest!'}
                </h3>
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="auth-button link-button profile-link">Profile</Link>
                    <button type="button" className="auth-button" onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <Link to="/auth" className="auth-button link-button">Login / Register</Link>
                )}
            </div>
        </div>
    </nav>
  );
}

export default NavBar;
