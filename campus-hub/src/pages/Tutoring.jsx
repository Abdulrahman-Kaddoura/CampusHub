import { useMemo, useState } from "react";
import "./Tutoring.css";

const tutoringOffers = [
  {
    id: 1,
    tutorName: "Maya Khoury",
    course: "MATH 201 - Calculus II",
    department: "Mathematics",
    level: "Undergraduate",
    format: "In Person",
    rateUsd: 20,
    availability: "Mon & Wed · 5:00 PM - 7:00 PM",
    tags: ["Exam Prep", "Homework Help"],
  },
  {
    id: 2,
    tutorName: "Karim Haddad",
    course: "CMPS 211 - Discrete Math",
    department: "Computer Science",
    level: "Undergraduate",
    format: "Hybrid",
    rateUsd: 25,
    availability: "Tue & Thu · 6:00 PM - 8:00 PM",
    tags: ["Projects", "Coding Interviews"],
  },
  {
    id: 3,
    tutorName: "Lina Nassar",
    course: "ECON 212 - Macroeconomics",
    department: "Economics",
    level: "Undergraduate",
    format: "Online",
    rateUsd: 18,
    availability: "Weekdays · 4:00 PM - 6:00 PM",
    tags: ["Concept Review", "Problem Sets"],
  },
  {
    id: 4,
    tutorName: "Rami Saab",
    course: "PHYS 205 - Modern Physics",
    department: "Physics",
    level: "Undergraduate",
    format: "In Person",
    rateUsd: 22,
    availability: "Sat · 10:00 AM - 1:00 PM",
    tags: ["Lab Reports", "Exam Prep"],
  },
  {
    id: 5,
    tutorName: "Nour El-Hage",
    course: "ENGL 203 - Academic Writing",
    department: "English",
    level: "Undergraduate",
    format: "Online",
    rateUsd: 16,
    availability: "Sun - Thu · 7:00 PM - 9:00 PM",
    tags: ["Essay Feedback", "Presentations"],
  },
  {
    id: 6,
    tutorName: "Sami Daher",
    course: "EECE 230 - Introduction to Programming",
    department: "Engineering",
    level: "Undergraduate",
    format: "Hybrid",
    rateUsd: 28,
    availability: "Fri · 3:00 PM - 6:00 PM",
    tags: ["Quizzes", "Past Papers"],
  },
];

function Tutoring() {
  const [search, setSearch] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("All Formats");
  const [maxRate, setMaxRate] = useState(30);

  const formatOptions = useMemo(
    () => ["All Formats", ...new Set(tutoringOffers.map((offer) => offer.format))],
    []
  );

  const filteredOffers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tutoringOffers.filter((offer) => {
      const matchesSearch =
        offer.course.toLowerCase().includes(query) ||
        offer.tutorName.toLowerCase().includes(query) ||
        offer.department.toLowerCase().includes(query);

      const matchesFormat = selectedFormat === "All Formats" || offer.format === selectedFormat;
      const matchesRate = offer.rateUsd <= maxRate;

      return matchesSearch && matchesFormat && matchesRate;
    });
  }, [search, selectedFormat, maxRate]);

  return (
    <main className="tutoring-page">
      <header className="tutoring-header">
        <h1>Tutoring Hub</h1>
        <p>
          Connect with AUB peer tutors for core courses. Browse by subject, preferred session
          format, and hourly rate to find the right match.
        </p>
      </header>

      <section className="tutoring-filters" aria-label="Tutoring filters">
        <input
          type="text"
          value={search}
          placeholder="Search by course, tutor name, or department"
          onChange={(event) => setSearch(event.target.value)}
        />

        <select value={selectedFormat} onChange={(event) => setSelectedFormat(event.target.value)}>
          {formatOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label htmlFor="max-rate-slider">
          Max Rate: <strong>${maxRate}</strong>/hour
        </label>
        <input
          id="max-rate-slider"
          type="range"
          min="10"
          max="35"
          step="1"
          value={maxRate}
          onChange={(event) => setMaxRate(Number(event.target.value))}
        />
      </section>

      <section className="tutoring-grid" aria-live="polite">
        {filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => (
            <article className="tutoring-card" key={offer.id}>
              <h2>{offer.course}</h2>
              <p className="tutoring-tutor">Tutor: {offer.tutorName}</p>

              <p>
                <strong>Department:</strong> {offer.department}
              </p>
              <p>
                <strong>Level:</strong> {offer.level}
              </p>
              <p>
                <strong>Format:</strong> {offer.format}
              </p>
              <p>
                <strong>Rate:</strong> ${offer.rateUsd} / hour
              </p>
              <p>
                <strong>Availability:</strong> {offer.availability}
              </p>

              <div className="tutoring-tags">
                {offer.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <button type="button">Request Session</button>
            </article>
          ))
        ) : (
          <p className="empty-state">No tutoring matches found for the selected filters.</p>
        )}
      </section>
    </main>
  );
}

export default Tutoring;
