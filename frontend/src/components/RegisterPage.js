import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RegisterPage() {
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const validateEmail = (e) => /@(gmail\.com|yahoo\.com|hotmail\.com)$/.test(e);
  const validatePassword = (p) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(p);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password)      { setError("Please fill all fields"); return; }
    if (!validateEmail(email))    { setError("Email must be Gmail, Yahoo or Hotmail"); return; }
    if (!validatePassword(password)) {
      setError("Password: 8+ chars, uppercase, lowercase, number & special character");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/register", {
        email, password,
        admin_key: adminKey || "",
      });
      alert("Account created successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-split">

        {/* Left panel */}
        <div className="auth-panel-left">
          <div className="auth-brand">
            <div className="auth-brand-icon">🛡</div>
            <span className="auth-brand-name">InsureAI</span>
          </div>
          <div className="auth-left-body">
            <h2 className="auth-left-title">Smart insurance,<br />made simple.</h2>
            <p className="auth-left-sub">
              ML-powered risk scoring and AI-generated explanations help you
              find the right plan instantly.
            </p>
            <div className="auth-features">
              {["Personalised risk assessment","AI plan recommendations",
                "Transparent explanations","Privacy-first design"].map(f => (
                <div className="auth-feature-item" key={f}>
                  <div className="auth-feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div className="auth-left-footer">
            Predictions are estimates. Consult a licensed advisor.
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-panel-right">
          <h2 className="page-title">Create account</h2>
          <p className="auth-tagline">Join InsureAI for smart insurance advice</p>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email"
                placeholder="you@gmail.com"
                onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password"
                placeholder="Min 8 chars, upper, lower, number, symbol"
                onChange={(e) => setPassword(e.target.value)} />
            </div>

            {/* Admin key — unlabelled as "admin", looks like an optional access code */}
            <div className="form-group admin-key-field">
              <p className="admin-key-hint">
                Have an organisation access code? Enter it below (optional).
              </p>
              <label className="form-label">Access Code</label>
              <input className="form-input" type="password"
                placeholder="Leave blank if not applicable"
                onChange={(e) => setAdminKey(e.target.value)} />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <button className="auth-link" onClick={() => navigate("/login")}>
            Already have an account? Sign in
          </button>
        </div>

      </div>
    </div>
  );
}

export default RegisterPage;