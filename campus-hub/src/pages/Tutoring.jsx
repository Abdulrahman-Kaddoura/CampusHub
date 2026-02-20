import { useMemo, useState } from "react";
import "./Tutoring.css";

const tutorListings = [
  {
    id: 1,
    name: "Ava Johnson",
    subject: "Calculus",
    course: "MATH 141",
    rate: 24,
    format: "In Person",
    availability: "Mon/Wed 4:00 PM - 6:00 PM",
    blurb: "Focuses on exam prep, derivatives, and integration strategies.",
  },
  {
    id: 2,
    name: "Liam Patel",
    subject: "Chemistry",
    course: "CHEM 121",
    rate: 22,
    format: "Online",
    availability: "Tue/Thu 7:00 PM - 9:00 PM",
    blurb: "Breaks down problem sets and lab concepts with step-by-step examples.",
  },
  {
    id: 3,
    name: "Sophia Martinez",
    subject: "Computer Science",
    course: "CMPS 201",
    rate: 30,
    format: "In Person",
    availability: "Mon/Fri 1:00 PM - 3:00 PM",
    blurb: "Helps with data structures, debugging, and coding interview basics.",
  },
  {
    id: 4,
    name: "Noah Kim",
    subject: "Physics",
    course: "PHYS 201",
    rate: 26,
    format: "Online",
    availability: "Wed/Sat 10:00 AM - 12:00 PM",
    blurb: "Specializes in mechanics, free-body diagrams, and equation setup.",
  },
  {
    id: 5,
    name: "Mia Nguyen",
    subject: "Writing",
    course: "ENGL 101",
    rate: 20,
    format: "In Person",
    availability: "Tue/Thu 11:00 AM - 1:00 PM",
    blurb: "Supports essay structure, revision, and citation formatting.",
  },
  {
    id: 6,
    name: "Ethan Rivera",
    subject: "Accounting",
    course: "ACCT 210",
    rate: 28,
    format: "Online",
    availability: "Sun 3:00 PM - 6:00 PM",
    blurb: "Guides financial statements, journal entries, and exam review.",
  },
];

function Tutoring() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [sessionFormat, setSessionFormat] = useState("Any Format");

  const subjects = useMemo(() => {
    return ["All Subjects", ...new Set(tutorListings.map((item) => item.subject))];
  }, []);

  const tutors = useMemo(() => {
    const query = search.toLowerCase();

    return tutorListings.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.course.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query);

      const matchesSubject = subject === "All Subjects" || item.subject === subject;
      const matchesFormat = sessionFormat === "Any Format" || item.format === sessionFormat;

      return matchesSearch && matchesSubject && matchesFormat;
    });
  }, [search, subject, sessionFormat]);

  return (
    <main className="tutoring-page">
      <header className="tutoring-header">
        <h1>Tutoring</h1>
        <p>Find student tutors by class, subject, and session style.</p>
      </header>

      <section className="tutoring-filters">
        <input
          type="text"
          value={search}
          placeholder="Search by tutor, course, or subject"
          onChange={(event) => setSearch(event.target.value)}
        />

        <select value={subject} onChange={(event) => setSubject(event.target.value)}>
          {subjects.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select value={sessionFormat} onChange={(event) => setSessionFormat(event.target.value)}>
          <option>Any Format</option>
          <option>In Person</option>
          <option>Online</option>
        </select>
      </section>

      <section className="tutor-grid" aria-live="polite">
        {tutors.length ? (
          tutors.map((item) => (
            <article className="tutor-card" key={item.id}>
              <h2>{item.name}</h2>
              <p className="course-tag">{item.course}</p>
              <p>
                <strong>Subject:</strong> {item.subject}
              </p>
              <p>
                <strong>Format:</strong> {item.format}
              </p>
              <p>
                <strong>Availability:</strong> {item.availability}
              </p>
              <p>
                <strong>Rate:</strong> ${item.rate}/hour
              </p>
              <p className="blurb">{item.blurb}</p>
              <button type="button">Contact Tutor</button>
            </article>
          ))
        ) : (
          <p className="no-results">No tutors match the selected filters.</p>
        )}
      </section>
    </main>
  );
}

export default Tutoring;
