import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createCourseExchangePost, fetchCourseExchangePosts } from "../api/courseExchange";
import { useAuth } from "../context/AuthContext";
import "./CourseExchange.css";

const FEATURED_AUB_EXCHANGES = [
  {
    courseExchangeId: "aub-exchange-1",
    currentCourse: "CMPS 271 - Software Engineering (Prof. Mohammad Zalghout)",
    desiredCourse: "CMPS 271 - Software Engineering (Section with fewer lab clashes)",
    section: "Looking to switch from early section",
    status: "Open",
    notes: "Can confirm swap immediately during add/drop.",
  },
  {
    courseExchangeId: "aub-exchange-2",
    currentCourse: "CMPS 211 - Discrete Mathematics (Dr. Mohammad Kobeissi)",
    desiredCourse: "CMPS 211 - Discrete Mathematics (Later section)",
    section: "Need a section after 11:00 AM",
    status: "Open",
    notes: "Trying to avoid overlap with EECE lab hours.",
  },
  {
    courseExchangeId: "aub-exchange-3",
    currentCourse: "MUSC 221 - Music Appreciation (Dr. Maya Berta Maalouf)",
    desiredCourse: "MUSC 221 - Music Appreciation (Any open section)",
    section: "Open to all available section timings",
    status: "Open",
    notes: "Flexible on days, mainly swapping for a better time slot.",
  },
  {
    courseExchangeId: "aub-exchange-4",
    currentCourse: "EECE 334 - Programming Languages (Prof. Khaled El Dassouki)",
    desiredCourse: "EECE 334 - Programming Languages (Alternative section)",
    section: "Section change requested before drop deadline",
    status: "Open",
    notes: "Can exchange with anyone enrolled in another EECE 334 section.",
  },
  {
    courseExchangeId: "aub-exchange-5",
    currentCourse: "EECE 290 - Analog Signal Processing (Dr. Karim Kabalan)",
    desiredCourse: "EECE 290 - Analog Signal Processing (Different timing)",
    section: "Looking for an afternoon section",
    status: "Open",
    notes: "Prioritizing swaps that avoid lab overlap.",
  },
];

function CourseExchange() {

    const { currentUser, token, isAuthenticated } = useAuth();
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All Statuses");
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [formState, setFormState] = useState({
      currentCourse: "",
      desiredCourse: "",
      section: "",
      status: "Open",
      notes: "",
    });

    const loadPosts = async () => {
      try {
        setApiError("");
        const data = await fetchCourseExchangePosts();
        const normalized = Array.isArray(data) ? data : [];
        setPosts(normalized.length > 0 ? normalized : FEATURED_AUB_EXCHANGES);
      } catch (error) {
        setApiError(error.message);
        setPosts(FEATURED_AUB_EXCHANGES);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      loadPosts();
    }, []);

  const statusOptions = useMemo(
    () => ["All Statuses", ...new Set(posts.map((post) => post.status).filter(Boolean))],
        [posts]
  );

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesSearch =
        (post.currentCourse || "").toLowerCase().includes(query) ||
                (post.desiredCourse || "").toLowerCase().includes(query);

      const matchesStatus = selectedStatus === "All Statuses" || post.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [posts, search, selectedStatus]);

    const handleCreatePost = async (event) => {
      event.preventDefault();
      if (!currentUser?.id) {
        setSubmitError("You must be logged in to create a post.");
        return;
      }

      setIsSubmitting(true);
      setSubmitError("");

      try {
        await createCourseExchangePost(
          {
            ...formState,
            userId: currentUser.id,
          },
          token
        );

        setFormState({
          currentCourse: "",
          desiredCourse: "",
          section: "",
          status: "Open",
          notes: "",
        });
        setIsFormOpen(false);
        setIsLoading(true);
        await loadPosts();
      } catch (error) {
        setSubmitError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <main className="course-exchange-page">
      <header className="course-exchange-header">
        <h1>Course Exchange</h1>
        <p>
          Find American University of Beirut (AUB) students willing to swap sections or exchange course slots. Filter by course and
                    exchange status to quickly discover available opportunities.
        </p>
        {isAuthenticated ? (
                  <button type="button" onClick={() => setIsFormOpen((v) => !v)}>
                    {isFormOpen ? "Cancel" : "Add Exchange Post"}
                  </button>
                ) : (
                  <Link className="add-item" to="/auth">
                    Login to Add Exchange Post
                  </Link>
                )}
      </header>

      {isFormOpen && (
              <form className="course-exchange-filters" onSubmit={handleCreatePost}>
                <input
                  type="text"
                  placeholder="Current course"
                  required
                  value={formState.currentCourse}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, currentCourse: event.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Desired course"
                  required
                  value={formState.desiredCourse}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, desiredCourse: event.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Section (optional)"
                  value={formState.section}
                  onChange={(event) => setFormState((prev) => ({ ...prev, section: event.target.value }))}
                />
                <select
                  value={formState.status}
                  onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="Open">Open</option>
                  <option value="Matched">Matched</option>
                  <option value="Closed">Closed</option>
                </select>
                <input
                  type="text"
                  placeholder="Notes / reason"
                  value={formState.notes}
                  onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Post"}
                </button>
                {submitError && <p className="empty-state">{submitError}</p>}
              </form>
            )}

      <section className="course-exchange-filters" aria-label="Course exchange filters">
        <input
          type="text"
          value={search}
          placeholder="Search by current or desired course"
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

      {apiError && <p className="empty-state">{apiError}</p>}

      <section className="course-exchange-grid" aria-live="polite">
        {isLoading ? (
                  <p className="empty-state">Loading course exchange posts...</p>
                ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <article className="course-exchange-card" key={post.courseExchangeId}>
              <div className="card-top-row">
                <h2>{post.currentCourse}</h2>
                <span className={`status-pill ${(post.status || "open").toLowerCase()}`}>
                                   {post.status}
                                 </span>
              </div>

              <p>
                <strong>Wants:</strong> {post.desiredCourse}
              </p>
              {post.section && (
                              <p>
                                <strong>Section:</strong> {post.section}
                              </p>
                            )}
                            {post.notes && (
                              <p>
                                <strong>Notes:</strong> {post.notes}
                              </p>
                            )}

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
