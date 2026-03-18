import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createTutoringPost, fetchTutoringPosts } from "../api/tutoring";
import { useAuth } from "../context/AuthContext";
import { FEATURE_FLAGS } from "../config/features";
import "./Tutoring.css";

const FEATURED_AUB_TUTORING = [
  {
    tutoringId: "aub-tutor-1",
    course: "MATH 201 - Calculus III",
    tutorName: "Rami Khoury",
    department: "Mathematics",
    format: "In Person",
    hourlyRate: 18,
    description: "AUB senior focusing on vectors, multiple integrals, and exam prep sessions in Jafet Library.",
  },
  {
    tutoringId: "aub-tutor-2",
    course: "CMPS 212 - Data Structures",
    tutorName: "Maya Haddad",
    department: "Computer Science",
    format: "Hybrid",
    hourlyRate: 22,
    description: "Hands-on support with Java labs, linked lists, trees, and midterm problem-solving strategies.",
  },
  {
    tutoringId: "aub-tutor-3",
    course: "ECON 211 - Principles of Microeconomics",
    tutorName: "Kareem Youssef",
    department: "Economics",
    format: "Online",
    hourlyRate: 16,
    description: "Clear explanations of elasticity, market structures, and weekly quiz practice for AUB sections.",
  },
  {
    tutoringId: "aub-tutor-4",
    course: "CHEM 201 - Organic Chemistry",
    tutorName: "Lea Nassar",
    department: "Chemistry",
    format: "In Person",
    hourlyRate: 24,
    description: "Mechanism drills, reaction mapping, and focused preparation for lab reports and practical exams.",
  },
];



function Tutoring() {
    const { currentUser, token, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("All Formats");
  const [maxRate, setMaxRate] = useState(100);
    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [formState, setFormState] = useState({
      course: "",
      tutorName: "",
      department: "",
      format: "In Person",
      hourlyRate: "",
      description: "",
    });

    const loadTutoringPosts = async () => {
      if (FEATURE_FLAGS.mockData) {
        setOffers(FEATURED_AUB_TUTORING);
        setIsLoading(false);
        return;
      }
      try {
        setApiError("");
        const data = await fetchTutoringPosts();
        const normalized = Array.isArray(data) ? data : [];
        setOffers(normalized.length > 0 ? normalized : FEATURED_AUB_TUTORING);
      } catch (error) {
        setApiError(error.message);
        setOffers(FEATURED_AUB_TUTORING);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      loadTutoringPosts();
    }, []);

  const formatOptions = useMemo(
    () => ["All Formats", ...new Set(offers.map((offer) => offer.format).filter(Boolean))],
        [offers]
  );

  const filteredOffers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return offers.filter((offer) => {
      const matchesSearch =
        (offer.course || "").toLowerCase().includes(query) ||
                (offer.tutorName || "").toLowerCase().includes(query) ||
                (offer.department || "").toLowerCase().includes(query);

      const matchesFormat = selectedFormat === "All Formats" || offer.format === selectedFormat;
      const matchesRate = Number(offer.hourlyRate || 0) <= maxRate;

      return matchesSearch && matchesFormat && matchesRate;
    });
  }, [offers, search, selectedFormat, maxRate]);

    const handleCreateTutoring = async (event) => {
      event.preventDefault();
      if (!currentUser?.id) {
        setSubmitError("You must be logged in to create a tutoring post.");
        return;
      }

      setIsSubmitting(true);
      setSubmitError("");

      try {
        await createTutoringPost(
          {
            ...formState,
            hourlyRate: Number(formState.hourlyRate),
            userId: currentUser.id,
          },
          token
        );
        setFormState({
          course: "",
          tutorName: "",
          department: "",
          format: "In Person",
          hourlyRate: "",
          description: "",
        });
        setIsFormOpen(false);
        setIsLoading(true);
        await loadTutoringPosts();
      } catch (error) {
        setSubmitError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <main className="tutoring-page">
      <header className="tutoring-header">
        <h1>Tutoring Hub</h1>
        <p>
          Connect with peer tutors from the American University of Beirut (AUB) for core courses. Browse by subject, preferred session
          format, and hourly rate to find the right match.
        </p>
        {isAuthenticated ? (
                  <button type="button" onClick={() => setIsFormOpen((v) => !v)}>
                    {isFormOpen ? "Cancel" : "Add Tutoring Post"}
                  </button>
                ) : (
                  <Link className="add-item" to="/auth">
                    Login to Add Tutoring Post
                  </Link>
                )}
      </header>

      {isFormOpen && (
              <form className="tutoring-filters" onSubmit={handleCreateTutoring}>
                <input
                  type="text"
                  placeholder="Course"
                  required
                  value={formState.course}
                  onChange={(event) => setFormState((prev) => ({ ...prev, course: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Tutor Name"
                  required
                  value={formState.tutorName}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, tutorName: event.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Department"
                  required
                  value={formState.department}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, department: event.target.value }))
                  }
                />
                <select
                  value={formState.format}
                  onChange={(event) => setFormState((prev) => ({ ...prev, format: event.target.value }))}
                >
                  <option value="In Person">In Person</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Hourly Rate"
                  required
                  value={formState.hourlyRate}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, hourlyRate: event.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Post"}
                </button>
                {submitError && <p className="empty-state">{submitError}</p>}
              </form>
            )}

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
          min="0"
                    max="200"
          step="1"
          value={maxRate}
          onChange={(event) => setMaxRate(Number(event.target.value))}
        />
      </section>

      {apiError && <p className="empty-state">{apiError}</p>}

      <section className="tutoring-grid" aria-live="polite">
        {isLoading ? (
                  <p className="empty-state">Loading tutoring posts...</p>
                ) : filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => (
            <article className="tutoring-card" key={offer.tutoringId}>
              <h2>{offer.course}</h2>
              <p className="tutoring-tutor">Tutor: {offer.tutorName}</p>

              <p>
                <strong>Department:</strong> {offer.department}
              </p>
              <p>
                <strong>Format:</strong> {offer.format}
              </p>
              <p>
                <strong>Rate:</strong> ${offer.hourlyRate} / hour
              </p>
              {offer.description && (
                              <p>
                                <strong>Description:</strong> {offer.description}
                              </p>
                            )}

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
