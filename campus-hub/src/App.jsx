import './App.css'
import {Routes, Route } from "react-router-dom";
import MarketPlace from './pages/MarketPlace/MarketPlace';
import CourseExchange from './pages/CourseExchange';
import Housing from './pages/Housing';
import Tutoring from './pages/Tutoring';
import NavBar from './components/NavBar';
import AuthPage from './pages/Auth/AuthPage';
import ProfilePage from './pages/Profile/ProfilePage';

function App() {
  return (
    <>
      <NavBar/>
      <Routes>
        <Route path="/" element={<MarketPlace />} />
        <Route path="/tutoring" element={<Tutoring />} />
        <Route path="/housing" element={<Housing />} />
        <Route path="/courseexchange" element={<CourseExchange />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  )
}

export default App
