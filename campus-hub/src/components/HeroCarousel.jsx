import { useState } from "react";
import "./HeroCarousel.css";
import banner1 from "../assets/banner1.jpg"; // replace with your own images
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";

export const HeroCarousel = () => {
  const banners = [banner1, banner2, banner3];
  const [current, setCurrent] = useState(0);

  const prevSlide = () =>
    setCurrent(current === 0 ? banners.length - 1 : current - 1);
  const nextSlide = () =>
    setCurrent(current === banners.length - 1 ? 0 : current + 1);

  return (
    <div className="hero-carousel">
      <img src={banners[current]} alt="banner" className="banner-image" />
      <button className="arrow left" onClick={prevSlide}>&lt;</button>
      <button className="arrow right" onClick={nextSlide}>&gt;</button>
      <div className="hero-text">
        <h1>Market Place</h1>
        <p>Buy from and sell to other students</p>
      </div>
    </div>
  );
};
