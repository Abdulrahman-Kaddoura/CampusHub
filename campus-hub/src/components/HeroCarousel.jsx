import { useState } from "react";
import "./HeroCarousel.css";
import banner1 from "../assets/book.jpg";
import banner2 from "../assets/book2.jpg";
import banner3 from "../assets/book3.webp";

const banners = [banner1, banner2, banner3];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  return (
    <div className="hero-carousel">
      <img src={banners[index]} alt="banner" />

      <button
        className="arrow left"
        onClick={() => setIndex((index - 1 + banners.length) % banners.length)}
      >
        ‹
      </button>

      <button
        className="arrow right"
        onClick={() => setIndex((index + 1) % banners.length)}
      >
        ›
      </button>
    </div>
  );
}
