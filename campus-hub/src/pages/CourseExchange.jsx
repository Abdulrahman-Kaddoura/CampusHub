import { useMemo, useState } from "react";
import "./CourseExchange.css";

const sampleCourses = [
  {
    id: 1,
    code: "CMPS 101",
    title: "Introduction to Computer Science",
    credits: 3,
    department: "Computer Science",
    seatsOpen: 4,
    schedule: "Mon/Wed 10:00 AM - 11:15 AM",
    instructor: "Dr. Chen",
  },
  {
    id: 2,
    code: "MATH 141",
    title: "Calculus II",
    credits: 4,
    department: "Mathematics",
    seatsOpen: 2,
    schedule: "Tue/Thu 1:30 PM - 2:45 PM",
    instructor: "Prof. Ramirez",
  },
  {
    id: 3,
    code: "ENGL 201",
    title: "Advanced Composition",
    credits: 3,
    department: "English",
    seatsOpen: 6,
    schedule: "Mon/Wed/Fri 9:00 AM - 9:50 AM",
    instructor: "Dr. Patel",
  },
  {
    id: 4,
    code: "BIOL 130",
    title: "General Biology",
    credits: 4,
    department: "Biology",
    seatsOpen: 1,
    schedule: "Tue/Thu 8:00 AM - 9:15 AM",
    instructor: "Dr. Kim",
  },
  {
    id: 5,
    code: "HIST 110",
    title: "World History",
    credits: 3,
    department: "History",
    seatsOpen: 5,
    schedule: "Tue/Thu 3:00 PM - 4:15 PM",
    instructor: "Prof. Alvarez",
  },
  {
    id: 6,
    code: "PHYS 201",
    title: "Physics I",
    credits: 4,
    department: "Physics",
    seatsOpen: 3,
    schedule: "Mon/Wed 2:00 PM - 3:15 PM",
    instructor: "Dr. Morgan",
  },
];

function CourseExchange() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [maxCredits, setMaxCredits] = useState(4);

  const departments = useMemo(() => {
    const options = sampleCourses.map((course) => course.department);
    return ["All Departments", ...new Set(options)];
  }, []);

  const visibleCourses = useMemo(() => {
    const query = search.toLowerCase();

    return sampleCourses.filter((course) => {
      const matchesSearch =
        course.code.toLowerCase().includes(query) ||
        course.title.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query);

      const matchesDepartment =
        department === "All Departments" || course.department === department;

      const matchesCreditFilter = course.credits <= maxCredits;

      return matchesSearch && matchesDepartment && matchesCreditFilter;
    });
  }, [search, department, maxCredits]);

  return (
    <main className="course-exchange-page">
      <section className="course-exchange-hero">
        <h1>Course Exchange</h1>
        <p>
          Browse open classes, filter by department, and find a section that fits your schedule.
        </p>
      </section>

      <section className="course-filters">
        <input
          type="text"
          value={search}
          placeholder="Search by course code, title, or instructor"
          onChange={(event) => setSearch(event.target.value)}
        />

        <select value={department} onChange={(event) => setDepartment(event.target.value)}>
          {departments.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label htmlFor="credit-slider">
          Max Credits: <strong>{maxCredits}</strong>
        </label>
        <input
          id="credit-slider"
          type="range"
          min="1"
          max="4"
          value={maxCredits}
          onChange={(event) => setMaxCredits(Number(event.target.value))}
        />
      </section>

      <section className="course-grid" aria-live="polite">
        {visibleCourses.length ? (
          visibleCourses.map((course) => (
            <article key={course.id} className="course-card">
              <div className="course-code">{course.code}</div>
              <h2>{course.title}</h2>
              <p>
                <strong>Instructor:</strong> {course.instructor}
              </p>
              <p>
                <strong>Schedule:</strong> {course.schedule}
              </p>
              <p>
                <strong>Credits:</strong> {course.credits}
              </p>
              <p>
                <strong>Seats Open:</strong> {course.seatsOpen}
              </p>
              <button type="button">Request Swap</button>
            </article>
          ))
        ) : (
          <p className="empty-state">No courses match your filters.</p>
        )}
      </section>
    </main>
  );
}

export default CourseExchange;
