import { useState } from "react";
import "./HeroCarousel.css";
import book1 from "../assets/book.jpg";
import book2 from "../assets/book2.jpg";
import book3 from "../assets/book3.webp";

export const HeroCarousel = () => {
  const banners = [book1, book2, book3];
  const [current, setCurrent] = useState(0);

  const prevSlide = () =>
    setCurrent(current === 0 ? banners.length - 1 : current - 1);
  const nextSlide = () =>
    setCurrent(current === banners.length - 1 ? 0 : current + 1);

  return (
    <div className="hero-carousel">
      <img src={banners[current]} alt="banner" className="banner-image" />
      <button className="arrow left" onClick={prevSlide}>
        &lt;
      </button>
      <button className="arrow right" onClick={nextSlide}>
        &gt;
      </button>
      <div className="hero-text">
        <h1>Market Place</h1>
        <p>Buy from and sell to other students</p>
      </div>
    </div>
  );
};
