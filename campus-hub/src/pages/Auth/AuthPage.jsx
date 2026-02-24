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

const initialVerificationState = {
  email: "",
  token: "",
};

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [formState, setFormState] = useState(initialRegisterState);
  const [verificationState, setVerificationState] = useState(initialVerificationState);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerificationChange = (event) => {
    const { name, value } = event.target;
    setVerificationState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    clearMessages();

    try {
      if (mode === "login") {
        await login({ email: formState.email, password: formState.password });
        navigate("/");
        return;
      }

      const response =
        mode === "register"
          ? await register({
              ...formState,
              phoneNumber: formState.phoneNumber.trim() || null,
            })
          : await verifyEmail({
              email: verificationState.email,
              token: verificationState.token,
            });

      setSuccessMessage(
        response?.message ||
          (mode === "register"
            ? "Registration successful. Please verify your email."
            : "Email verified successfully. You can now log in.")
      );

      if (mode === "register") {
        setVerificationState({
          email: formState.email,
          token: "",
        });
        setMode("verify");
      } else {
        setMode("login");
      }

      setFormState((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationState.email) {
      setError("Enter your email to resend a verification code.");
      return;
    }

    setIsSubmitting(true);
    clearMessages();

    try {
      const response = await resendVerification({ email: verificationState.email });
      setSuccessMessage(response?.message || "Verification email resent.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>
          {mode === "login"
            ? "Welcome back"
            : mode === "register"
              ? "Create account"
              : "Verify your email"}
        </h1>
        <p>Use your CampusHub account to create listings and manage your activity.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "verify" ? (
            <>
              <input
                name="email"
                type="email"
                value={verificationState.email}
                onChange={handleVerificationChange}
                placeholder="Email"
                required
              />
              <input
                name="token"
                value={verificationState.token}
                onChange={handleVerificationChange}
                placeholder="Verification code"
                required
              />
            </>
          ) : (
            <>
              <input
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />

              {mode === "register" ? (
                <>
                  <input
                    name="username"
                    value={formState.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                  />
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
            </>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : mode === "register"
                  ? "Register"
                  : "Verify email"}
          </button>

          {mode === "verify" ? (
            <button
              type="button"
              className="auth-secondary-button"
              onClick={handleResendVerification}
              disabled={isSubmitting}
            >
              Resend verification code
            </button>
          ) : null}

          {error ? <p className="auth-error">{error}</p> : null}
          {successMessage ? <p>{successMessage}</p> : null}
        </form>

        <div className="auth-actions">
          <button
            className="auth-switch"
            type="button"
            onClick={() => {
              clearMessages();
              setMode((prev) => (prev === "login" ? "register" : "login"));
            }}
          >
            {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
          </button>

          {mode !== "verify" ? (
            <button
              className="auth-switch"
              type="button"
              onClick={() => {
                clearMessages();
                setMode("verify");
                setVerificationState((prev) => ({
                  ...prev,
                  email: prev.email || formState.email,
                }));
              }}
            >
              Already have a code? Verify email
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
