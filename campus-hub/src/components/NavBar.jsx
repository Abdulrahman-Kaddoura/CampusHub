import './NavBar.css';
import logo from "../assets/logo.svg";
import { NavLink } from "react-router-dom";


function NavBar() {
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
                <h3 className='welcome'>Welcome Student Name!</h3>
                <p className='uni-name'>American University of Beirut</p>
            </div>
        </div>
    </nav>
  );
}

export default NavBar;
