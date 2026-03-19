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
    description:
      "AUB senior focusing on vectors, multiple integrals, and exam prep sessions in Jafet Library.",
  },
  {
    tutoringId: "aub-tutor-2",
    course: "CMPS 212 - Data Structures",
    tutorName: "Maya Haddad",
    department: "Computer Science",
    format: "Hybrid",
    hourlyRate: 22,
    description:
      "Hands-on support with Java labs, linked lists, trees, and midterm problem-solving strategies.",
  },
  {
    tutoringId: "aub-tutor-3",
    course: "ECON 211 - Principles of Microeconomics",
    tutorName: "Kareem Youssef",
    department: "Economics",
    format: "Online",
    hourlyRate: 16,
    description:
      "Clear explanations of elasticity, market structures, and weekly quiz practice for AUB sections.",
  },
  {
    tutoringId: "aub-tutor-4",
    course: "CHEM 201 - Organic Chemistry",
    tutorName: "Lea Nassar",
    department: "Chemistry",
    format: "In Person",
    hourlyRate: 24,
    description:
      "Mechanism drills, reaction mapping, and focused preparation for lab reports and practical exams.",
  },
  {
    tutoringId: "aub-tutor-5",
    course: "PHYS 211 - University Physics I",
    tutorName: "Jad Salameh",
    department: "Physics",
    format: "Online",
    hourlyRate: 20,
    description:
      "Problem-by-problem practice for kinematics, Newton's laws, and energy with weekly recitation support.",
  },
  {
    tutoringId: "aub-tutor-6",
    course: "ENGL 206 - Academic English",
    tutorName: "Nour Chehab",
    department: "English",
    format: "In Person",
    hourlyRate: 14,
    description:
      "Essay outlining, thesis clarity, and grammar feedback tailored for AUB writing-heavy assignments.",
  },
  {
    tutoringId: "aub-tutor-7",
    course: "EECE 230 - Electric Circuits",
    tutorName: "Hadi Mansour",
    department: "Electrical Engineering",
    format: "Hybrid",
    hourlyRate: 26,
    description:
      "Circuit analysis walkthroughs, Thevenin/Norton shortcuts, and LTSpice simulation guidance.",
  },
  {
    tutoringId: "aub-tutor-8",
    course: "BIOL 210 - Cell Biology",
    tutorName: "Dana Fakih",
    department: "Biology",
    format: "Online",
    hourlyRate: 19,
    description:
      "Memorable study systems for cell signaling, membranes, and molecular pathways before quizzes.",
  },
  {
    tutoringId: "aub-tutor-9",
    course: "ACCT 201 - Financial Accounting",
    tutorName: "Sami Harb",
    department: "Business",
    format: "In Person",
    hourlyRate: 17,
    description:
      "Journal entries, balance sheets, and exam-style practice sets with clear solving templates.",
  },
  {
    tutoringId: "aub-tutor-10",
    course: "STAT 230 - Introduction to Statistics",
    tutorName: "Yara Abdelnour",
    department: "Statistics",
    format: "Hybrid",
    hourlyRate: 21,
    description:
      "Confidence intervals, hypothesis testing, and SPSS help for lab reports and project data analysis.",
  },
  {
    tutoringId: "aub-tutor-11",
    course: "CMPS 274 - Machine Learning",
    tutorName: "Omar Sayegh",
    department: "Computer Science",
    format: "Online",
    hourlyRate: 38,
    description:
      "Model tuning sessions for regression/classification projects with practical Python notebook reviews.",
  },
  {
    tutoringId: "aub-tutor-12",
    course: "EECE 338 - Signals and Systems",
    tutorName: "Rita Azar",
    department: "Electrical Engineering",
    format: "Hybrid",
    hourlyRate: 41,
    description:
      "Step-by-step support for Fourier transforms, convolution, and exam-style signal analysis problems.",
  },
  {
    tutoringId: "aub-tutor-13",
    course: "MATH 251 - Differential Equations",
    tutorName: "Nadim Fares",
    department: "Mathematics",
    format: "In Person",
    hourlyRate: 44,
    description:
      "Advanced coaching on linear systems, Laplace methods, and modeling word problems for upper-level exams.",
  },
  {
    tutoringId: "aub-tutor-14",
    course: "CHEM 311 - Physical Chemistry",
    tutorName: "Lina Hatem",
    department: "Chemistry",
    format: "Online",
    hourlyRate: 49,
    description:
      "Thermodynamics and kinetics deep dives, including derivation walkthroughs and graded problem set prep.",
  },
];

function Tutoring() {
  const { currentUser, token, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("All Formats");
  const [maxRate, setMaxRate] = useState("100");
  const [showRequestedOnly, setShowRequestedOnly] = useState(false);
  const [requestedTutorIds, setRequestedTutorIds] = useState([]);
  const [savedTutorIds, setSavedTutorIds] = useState([]);
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

  const getOfferId = (offer) => String(offer.tutoringId ?? `${offer.course}-${offer.tutorName}`);

  const filteredOffers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return offers.filter((offer) => {
      const matchesSearch =
        (offer.course || "").toLowerCase().includes(query) ||
        (offer.tutorName || "").toLowerCase().includes(query) ||
        (offer.department || "").toLowerCase().includes(query);

      const matchesFormat = selectedFormat === "All Formats" || offer.format === selectedFormat;
      const rateCap = Number(maxRate);
      const hasRateCap = maxRate !== "" && Number.isFinite(rateCap);
      const matchesRate = !hasRateCap || Number(offer.hourlyRate || 0) <= rateCap;
      const matchesRequest = !showRequestedOnly || requestedTutorIds.includes(getOfferId(offer));

      return matchesSearch && matchesFormat && matchesRate && matchesRequest;
    });
  }, [offers, search, selectedFormat, maxRate, showRequestedOnly, requestedTutorIds]);

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

  const toggleRequested = (offerId) => {
    setRequestedTutorIds((prev) =>
      prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId]
    );
  };

  const toggleSaved = (offerId) => {
    setSavedTutorIds((prev) =>
      prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId]
    );
  };

  return (
    <main className="tutoring-page">
      <header className="tutoring-header">
        <h1>Tutoring Hub</h1>
        <p>
          Connect with peer tutors from the American University of Beirut (AUB) for core courses.
          Browse by subject, preferred session format, and hourly rate to find the right match.
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
          Max Rate: <strong>{maxRate === "" ? "No limit" : `$${maxRate}`}</strong>/hour
        </label>
        <div className="max-rate-controls">
          <div className="max-rate-input-wrapper">
            <span aria-hidden="true">$</span>
            <input
              id="max-rate-slider"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="No limit"
              value={maxRate}
              onChange={(event) => setMaxRate(event.target.value)}
            />
          </div>
          <button type="button" className="rate-chip" onClick={() => setMaxRate("20")}>
            Under $20
          </button>
          <button type="button" className="rate-chip" onClick={() => setMaxRate("35")}>
            Under $35
          </button>
          <button type="button" className="rate-chip" onClick={() => setMaxRate("50")}>
            Under $50
          </button>
          <button type="button" className="rate-chip rate-chip-clear" onClick={() => setMaxRate("")}>
            Clear
          </button>
        </div>

        <label className="saved-only-toggle" htmlFor="requested-tutoring-toggle">
          <input
            id="requested-tutoring-toggle"
            type="checkbox"
            checked={showRequestedOnly}
            onChange={(event) => setShowRequestedOnly(event.target.checked)}
          />
          Show requested sessions only
        </label>
      </section>

      {apiError && <p className="empty-state">{apiError}</p>}

      <section className="tutoring-grid" aria-live="polite">
        {isLoading ? (
          <p className="empty-state">Loading tutoring posts...</p>
        ) : filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => {
            const offerId = getOfferId(offer);
            const isRequested = requestedTutorIds.includes(offerId);
            const isSaved = savedTutorIds.includes(offerId);

            return (
              <article className="tutoring-card" key={offerId}>
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

                <div className="card-actions-row">
                  <button
                    type="button"
                    onClick={() => toggleRequested(offerId)}
                    className={isRequested ? "is-secondary" : ""}
                  >
                    {isRequested ? "Session Requested" : "Request Session"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSaved(offerId)}
                    className={isSaved ? "is-secondary" : ""}
                  >
                    {isSaved ? "Saved" : "Save"}
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <p className="empty-state">No tutoring matches found for the selected filters.</p>
        )}
      </section>
    </main>
  );
}

export default Tutoring;
