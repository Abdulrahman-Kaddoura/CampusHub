import './App.css'
import { Routes, Route, useLocation } from "react-router-dom";
import MarketPlace from './pages/MarketPlace/MarketPlace';
import MarketPlaceCategory from './pages/MarketPlace/MarketPlaceCategory';
import CourseExchange from './pages/CourseExchange';
import Housing from './pages/Housing';
import Tutoring from './pages/Tutoring';
import NavBar from './components/NavBar';
import AuthPage from './pages/Auth/AuthPage';
import ProfilePage from './pages/Profile/ProfilePage';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  return (
    <>
      {!isAuthPage && <NavBar />}
      <Routes>
        <Route path="/" element={<MarketPlace />} />
        <Route path="/marketplace/category/:categoryName" element={<MarketPlaceCategory />} />
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
