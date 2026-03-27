import { useEffect } from "react";
import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import MarketPlace from "./pages/MarketPlace/MarketPlace";
import MarketPlaceCategory from "./pages/MarketPlace/MarketPlaceCategory";
import CourseExchange from "./pages/CourseExchange";
import Housing from "./pages/Housing";
import Tutoring from "./pages/Tutoring";
import NavBar from "./components/NavBar";
import AuthPage from "./pages/Auth/AuthPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import ChatPage from "./pages/Chat/ChatPage";
import { FEATURE_FLAGS } from "./config/features";

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {(!isAuthPage || !FEATURE_FLAGS.auth) && <NavBar />}
      <main id="main-content" className="app-main">
        <Routes>
          <Route path="/" element={<MarketPlace />} />
          <Route path="/marketplace/category/:categoryName" element={<MarketPlaceCategory />} />
          <Route path="/tutoring" element={FEATURE_FLAGS.tutoring ? <Tutoring /> : <Navigate to="/" replace />} />
          <Route path="/housing" element={FEATURE_FLAGS.housing ? <Housing /> : <Navigate to="/" replace />} />
          <Route path="/courseexchange" element={FEATURE_FLAGS.courseExchange ? <CourseExchange /> : <Navigate to="/" replace />} />
          <Route path="/auth" element={FEATURE_FLAGS.auth ? <AuthPage /> : <Navigate to="/" replace />} />
          <Route path="/profile" element={FEATURE_FLAGS.auth ? <ProfilePage /> : <Navigate to="/" replace />} />
          <Route path="/chat" element={FEATURE_FLAGS.chat && FEATURE_FLAGS.auth ? <ChatPage /> : <Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
