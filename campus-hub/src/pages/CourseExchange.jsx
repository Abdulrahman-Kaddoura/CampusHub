import { useMemo, useState } from "react";
import "./CourseExchange.css";

const courseExchangePosts = [
  {
    id: 1,
    studentName: "Layal N.",
    currentCourse: "CMPS 211 - Discrete Math",
    desiredCourse: "CMPS 212 - Data Structures",
    section: "A1",
    schedule: "Mon/Wed 10:00 - 11:15",
    reason: "Schedule conflict with lab",
    status: "Open",
  },
  {
    id: 2,
    studentName: "Tarek M.",
    currentCourse: "PHYS 205 - Modern Physics",
    desiredCourse: "PHYS 210 - Electricity & Magnetism",
    section: "B2",
    schedule: "Tue/Thu 8:00 - 9:15",
    reason: "Prefers afternoon section",
    status: "Matched",
  },
  {
    id: 3,
    studentName: "Hana S.",
    currentCourse: "ECON 212 - Macroeconomics",
    desiredCourse: "ECON 211 - Microeconomics",
    section: "C1",
    schedule: "Mon/Wed 1:00 - 2:15",
    reason: "Required for major pathway",
    status: "Open",
  },
  {
    id: 4,
    studentName: "Omar K.",
    currentCourse: "EECE 230 - Introduction to Programming",
    desiredCourse: "EECE 230 - Introduction to Programming",
    section: "D3",
    schedule: "Tue/Thu 3:30 - 4:45",
    reason: "Needs earlier class timing",
    status: "Open",
  },
  {
    id: 5,
    studentName: "Rita B.",
    currentCourse: "MATH 201 - Calculus II",
    desiredCourse: "MATH 202 - Linear Algebra",
    section: "E1",
    schedule: "Fri 9:00 - 11:30",
    reason: "Wants to rebalance workload",
    status: "Closed",
  },
];

function CourseExchange() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const statusOptions = useMemo(
    () => ["All Statuses", ...new Set(courseExchangePosts.map((post) => post.status))],
    []
  );

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courseExchangePosts.filter((post) => {
      const matchesSearch =
        post.currentCourse.toLowerCase().includes(query) ||
        post.desiredCourse.toLowerCase().includes(query) ||
        post.studentName.toLowerCase().includes(query);

      const matchesStatus = selectedStatus === "All Statuses" || post.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [search, selectedStatus]);

  return (
    <main className="course-exchange-page">
      <header className="course-exchange-header">
        <h1>Course Exchange</h1>
        <p>
          Find students willing to swap sections or exchange course slots. Filter by course, student,
          and exchange status to quickly discover available opportunities.
        </p>
      </header>

      <section className="course-exchange-filters" aria-label="Course exchange filters">
        <input
          type="text"
          value={search}
          placeholder="Search by current course, desired course, or student"
          onChange={(event) => setSearch(event.target.value)}
        />

        <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </section>

      <section className="course-exchange-grid" aria-live="polite">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <article className="course-exchange-card" key={post.id}>
              <div className="card-top-row">
                <h2>{post.currentCourse}</h2>
                <span className={`status-pill ${post.status.toLowerCase()}`}>{post.status}</span>
              </div>

              <p className="student-name">Posted by: {post.studentName}</p>
              <p>
                <strong>Wants:</strong> {post.desiredCourse}
              </p>
              <p>
                <strong>Section:</strong> {post.section}
              </p>
              <p>
                <strong>Schedule:</strong> {post.schedule}
              </p>
              <p>
                <strong>Reason:</strong> {post.reason}
              </p>

              <button type="button">Contact Student</button>
            </article>
          ))
        ) : (
          <p className="empty-state">No course exchange posts match your current filters.</p>
        )}
      </section>
    </main>
  );
}

export default CourseExchange;
