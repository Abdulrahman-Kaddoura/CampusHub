import { useMemo, useState } from "react";
import "./CourseExchange.css";

const sampleCourses = [
  {
    id: 1,
    code: "CMPS 201",
    title: "Introduction to Programming",
    credits: 3,
    department: "Computer Science and Engineering",
    seatsOpen: 4,
    schedule: "Mon/Wed/Fri 9:00 AM - 9:50 AM",
    instructor: "Dr. N. El Hajj",
  },
  {
    id: 2,
    code: "MATH 203",
    title: "Calculus for Engineering",
    credits: 4,
    department: "Mathematics",
    seatsOpen: 2,
    schedule: "Tue/Thu 11:00 AM - 12:15 PM",
    instructor: "Prof. R. Saba",
  },
  {
    id: 3,
    code: "ENGL 203",
    title: "Academic English",
    credits: 3,
    department: "English",
    seatsOpen: 6,
    schedule: "Tue/Thu 1:00 PM - 2:15 PM",
    instructor: "Dr. M. Khoury",
  },
  {
    id: 4,
    code: "BIOL 210",
    title: "General Biology",
    credits: 4,
    department: "Biology",
    seatsOpen: 1,
    schedule: "Mon/Wed 2:00 PM - 3:15 PM",
    instructor: "Dr. L. Zein",
  },
  {
    id: 5,
    code: "HIST 214",
    title: "Modern Middle East",
    credits: 3,
    department: "History",
    seatsOpen: 5,
    schedule: "Mon/Wed 12:30 PM - 1:45 PM",
    instructor: "Prof. D. Saab",
  },
  {
    id: 6,
    code: "PHYS 211",
    title: "Physics I",
    credits: 4,
    department: "Physics",
    seatsOpen: 3,
    schedule: "Tue/Thu 3:30 PM - 4:45 PM",
    instructor: "Dr. A. Hitti",
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
          Browse AUB classes, filter by department, and find sections that fit your weekly schedule.
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
