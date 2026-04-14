import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCourseExchangePost, fetchCourseExchangePosts } from "../api/courseExchange";
import { useAuth } from "../context/AuthContext";
import { FEATURE_FLAGS } from "../config/features";
import "./CourseExchange.css";

const SAVED_POSTS_STORAGE_KEY = "courseExchange.savedPostIds";
const CONTACTED_POSTS_STORAGE_KEY = "courseExchange.contactedPostIds";

const parseStoredIds = (storageKey) => {
  const rawValue = localStorage.getItem(storageKey);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.map((value) => String(value)) : [];
  } catch (error) {
    return [];
  }
};

const FEATURED_AUB_EXCHANGES = [
  {
    courseExchangeId: "aub-exchange-2",
    currentCourse: "CMPS 211 - Discrete Mathematics (Dr. Mohammad Kobeissi)",
    desiredCourse: "CMPS 211 - Discrete Mathematics (Later section)",
    section: "Need a section after 11:00 AM",
    status: "Open",
    notes: "Trying to avoid overlap with EECE lab hours.",
  },
  {
    courseExchangeId: "aub-exchange-6",
    currentCourse: "EECE 290 - Analog Signal Processing (Dr. Rabih Jabr)",
    desiredCourse: "EECE 290 - Analog Signal Processing (Any open section)",
    section: "Trying to switch to a section on Tue/Thu",
    status: "Open",
    notes: "Posting another EECE 290 option with a different instructor.",
  },
  {
    courseExchangeId: "aub-exchange-7",
    currentCourse: "EECE 410L - System Integration Laboratory (Dr. Sara Khaddaj)",
    desiredCourse: "EECE 410L - System Integration Laboratory (Alternative section)",
    section: "Need section swap due to timetable clash",
    status: "Open",
    notes: "Interested in any compatible EECE 410L section.",
  },
  {
    courseExchangeId: "aub-exchange-8",
    currentCourse: "EECE 380 - Electromagnetics (Dr. Youssef Tawk)",
    desiredCourse: "EECE 380 - Electromagnetics (Different section)",
    section: "Looking for a later section",
    status: "Open",
    notes: "Can exchange with another EECE 380 student.",
  },
  {
    courseExchangeId: "aub-exchange-9",
    currentCourse: "EECE 380 - Electromagnetics (Dr. Joseph Costantine)",
    desiredCourse: "EECE 380 - Electromagnetics (Alternative timing)",
    section: "Seeking any other course",
    status: "Open",
    notes: "Second EECE 380 entry with a different doctor.",
  },
  {
    courseExchangeId: "aub-exchange-10",
    currentCourse: "CMPS 271 - Software Engineering (Prof. Mohammad Zalghout)",
    desiredCourse: "CMPS 271 - Software Engineering (Section with fewer lab clashes)",
    section: "Looking to switch from early section",
    status: "Open",
    notes: "Can confirm swap immediately during add/drop.",
  },
  {
    courseExchangeId: "aub-exchange-3",
    currentCourse: "MUSC 221 - Western Music History (Dr. Maya Berta Maalouf)",
    desiredCourse: "MUSC 221 - Western Music History (Any open section)",
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
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState(() => parseStoredIds(SAVED_POSTS_STORAGE_KEY));
  const [contactedPostIds, setContactedPostIds] = useState(() =>
    parseStoredIds(CONTACTED_POSTS_STORAGE_KEY)
  );
  const [interactionError, setInteractionError] = useState("");
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
    if (FEATURE_FLAGS.mockData) {
      setPosts(FEATURED_AUB_EXCHANGES);
      setIsLoading(false);
      return;
    }

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

  useEffect(() => {
    localStorage.setItem(SAVED_POSTS_STORAGE_KEY, JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  useEffect(() => {
    localStorage.setItem(CONTACTED_POSTS_STORAGE_KEY, JSON.stringify(contactedPostIds));
  }, [contactedPostIds]);

  const statusOptions = useMemo(
    () => ["All Statuses", ...new Set(posts.map((post) => post.status).filter(Boolean))],
    [posts]
  );

  const getPostId = (post) => String(post.courseExchangeId ?? `${post.currentCourse}-${post.desiredCourse}`);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesSearch =
        (post.currentCourse || "").toLowerCase().includes(query) ||
        (post.desiredCourse || "").toLowerCase().includes(query);

      const matchesStatus = selectedStatus === "All Statuses" || post.status === selectedStatus;
      const matchesSaved = !showSavedOnly || savedPostIds.includes(getPostId(post));

      return matchesSearch && matchesStatus && matchesSaved;
    });
  }, [posts, search, selectedStatus, showSavedOnly, savedPostIds]);

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

  const toggleSavedPost = (postId) => {
    if (!isAuthenticated) {
      setInteractionError("Please log in to save posts.");
      return;
    }
    setInteractionError("");
    setSavedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const markContacted = (post) => {
    if (!isAuthenticated) {
      setInteractionError("Please log in to contact students.");
      return;
    }
    setInteractionError("");
    const postId = getPostId(post);
    setContactedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    const partnerId = post.userId;
    navigate(partnerId ? `/chat?partner=${partnerId}` : "/chat");
  };

  return (
    <main className="course-exchange-page">
      <header className="course-exchange-header">
        <h1>Course Exchange</h1>
        <p>
          Find American University of Beirut (AUB) students willing to swap sections or exchange
          course slots. Filter by course and exchange status to quickly discover available
          opportunities.
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

        <label className="saved-only-toggle" htmlFor="saved-posts-toggle">
          <input
            id="saved-posts-toggle"
            type="checkbox"
            checked={showSavedOnly}
            onChange={(event) => setShowSavedOnly(event.target.checked)}
          />
          Show saved only
        </label>
      </section>

      {apiError && <p className="empty-state">{apiError}</p>}
      {interactionError && <p className="empty-state">{interactionError}</p>}

      <section className="course-exchange-grid" aria-live="polite">
        {isLoading ? (
          <p className="empty-state">Loading course exchange posts...</p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const postId = getPostId(post);
            const isSaved = savedPostIds.includes(postId);
            const isContacted = contactedPostIds.includes(postId);

            return (
              <article className="course-exchange-card" key={postId}>
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

                <div className="card-actions-row">
                  <button
                    type="button"
                    onClick={() => markContacted(post)}
                    className={isContacted ? "is-secondary" : ""}
                    aria-pressed={isContacted}
                  >
                  {isContacted ? "Message Sent" : "Contact Student"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSavedPost(postId)}
                    className={isSaved ? "is-secondary" : ""}
                    aria-pressed={isSaved}
                  >
                    {isSaved ? "Saved" : "Save"}
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <p className="empty-state">No course exchange posts match your current filters.</p>
        )}
      </section>
    </main>
  );
}

export default CourseExchange;
