import { useEffect, useCallback, useState } from "react";
import "./HeroCarousel.css";

const slides = [
  { tagline: "Your one stop shop", title: "Market Place", subtitle: "Buy from and Sell to other students" },
  { tagline: "Latest updates", title: "New Listings", subtitle: "Fresh items from students this week" },
  { tagline: "Deals & sales", title: "Save More", subtitle: "Discounted books, gear, and more" },
];

const AUTO_ADVANCE_MS = 5000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const advance = useCallback(() => {
    setIndex((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [advance, index]);

  return (
    <div className="hero-carousel-wrapper">
      <div className="hero-carousel">
        <div className="hero-carousel-inner">
          <div className="hero-text">
            <p className="hero-tagline">{slide.tagline}</p>
            <h1 className="hero-title">{slide.title}</h1>
            <p className="hero-subtitle">{slide.subtitle}</p>
          </div>
          <div className="hero-visual">
            <div className="hero-visual-placeholder">
              <span className="hero-visual-icon">📚</span>
              <span className="hero-visual-icon">🧮</span>
              <span className="hero-visual-icon">💻</span>
            </div>
          </div>
        </div>

        <button
          className="arrow left"
          type="button"
          aria-label="Previous"
          onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
        >
          ‹
        </button>
        <button
          className="arrow right"
          type="button"
          aria-label="Next"
          onClick={() => setIndex((index + 1) % slides.length)}
        >
          ›
        </button>

        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`hero-dot ${i === index ? "active" : ""}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
