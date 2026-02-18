import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AuthPage.css";

const initialRegisterState = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
};

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [formState, setFormState] = useState(initialRegisterState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (mode === "login") {
        await login({ username: formState.username, password: formState.password });
      } else {
        await register({
          ...formState,
          phoneNumber: formState.phoneNumber.trim() || null,
        });
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p>Use your CampusHub account to create listings and manage your activity.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            name="username"
            value={formState.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />

          {mode === "register" ? (
            <>
              <input
                name="firstName"
                value={formState.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
              <input
                name="lastName"
                value={formState.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
              <input
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
              <input
                name="phoneNumber"
                value={formState.phoneNumber}
                onChange={handleChange}
                placeholder="Phone number (optional)"
              />
            </>
          ) : null}

          <input
            name="password"
            type="password"
            value={formState.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>

          {error ? <p className="auth-error">{error}</p> : null}
        </form>

        <button
          className="auth-switch"
          type="button"
          onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
