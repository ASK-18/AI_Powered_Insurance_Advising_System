import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com)$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) { setError("Enter a valid email (gmail / yahoo / hotmail)"); return; }
    if (!password)             { setError("Enter your password"); return; }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/login", { email, password });

      // Store session info
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail",  email);
      localStorage.setItem("userRole",   res.data.role || "user");

      // ── Admin → Admin panel | Regular user → Form ──
      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/form");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="page-title">Welcome back</h2>
        <p className="auth-tagline">Sign in to your InsureAI account</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@gmail.com"
              onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <button className="auth-link" onClick={() => navigate("/register")}>
          New user? Create an account
        </button>
      </div>
    </div>
  );
}

export default LoginPage;