import "./App.css";
import { useState, useEffect } from "react";
import RegisterPage  from "./components/RegisterPage";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import WelcomePage   from "./components/WelcomePage";
import LoginPage     from "./components/LoginPage";
import InsuranceForm from "./components/InsuranceForm";
import ResultPage    from "./components/ResultPage";
import AboutPage     from "./components/AboutPage";
import PlanDetailPage from "./PlanDetailPage";
import AdminPage     from "./components/AdminPage";
import { fetchPlansFromAPI, getCachedPlans } from "./plansData";
import ChatWindow from "./components/ChatWindow";
import "./Chatbot.css";
import FloatingChatbot from "./components/FloatingChatbot";
const NAV_ITEMS = [
  { label: "Get Advice", icon: "🛡", path: "/form"   },
  { label: "Dashboard",  icon: "📊", path: "/result" },
];

function getRiskColor(risk) {
  return { Low: "#4ade80", Medium: "#fbbf24", High: "#f87171" }[risk] || "#aaa";
}

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Hooks must come BEFORE any early return ──
  const [plans, setPlans] = useState(() => getCachedPlans());

  useEffect(() => {
    fetchPlansFromAPI()
      .then(setPlans)
      .catch(() => {}); // keep showing cached plans on error
  }, [location.pathname]); // re-fetch on navigation to pick up admin changes

  const noSidebarPaths = ["/", "/login", "/register", "/about", "/admin"];
  if (noSidebarPaths.includes(location.pathname)) return null;

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const isPlanModal = location.pathname.startsWith("/plans/");

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🛡</div>
        <div className="logo-text">
          <span className="logo-name">InsureAI</span>
          <span className="logo-sub">Smart Advisor</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button key={item.path}
            className={`nav-item ${!isPlanModal && location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="sidebar-section-label">Our Plans</div>
        {plans.map((plan) => {
          const path     = `/plans/${plan.id}`;
          const isActive = location.pathname === path;
          return (
            <button key={plan.id}
              className={`nav-item nav-plan-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(path)}>
              <span className="nav-icon" style={{ fontSize: "12px" }}>{plan.icon}</span>
              <span className="nav-plan-label">
                {plan.label}
                <span className="nav-plan-risk"
                  style={{ color: isActive ? "#fff" : getRiskColor(plan.riskLevel) }}>
                  {plan.riskLevel} Risk
                </span>
              </span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="badge-ml">✦ ML + GenAI Powered</div>
        <p className="sidebar-disclaimer">
          Predictions are estimates. Consult a licensed advisor for final decisions.
        </p>
        <button className="btn-logout" onClick={handleLogout}>
          <span>↩</span> Sign Out
        </button>
      </div>
    </aside>
  );
}

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin    = localStorage.getItem("userRole") === "admin";
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin)    return <Navigate to="/form"  replace />;
  return children;
}

function AppShell() {
  const location = useLocation();

  if (location.pathname === "/about") return <AboutPage />;

  return (
    <>
      <Sidebar />

      <div className="main-content">
        <Routes>
          <Route path="/"         element={<WelcomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about"    element={<AboutPage />} />



          <Route
            path="/form"
            element={<ProtectedRoute><InsuranceForm /></ProtectedRoute>}
          />

          <Route
            path="/result"
            element={<ProtectedRoute><ResultPage /></ProtectedRoute>}
          />

          <Route
            path="/plans/:planId"
            element={<ProtectedRoute><PlanDetailPage /></ProtectedRoute>}
          />

          <Route
            path="/admin"
            element={<AdminRoute><AdminPage /></AdminRoute>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <FloatingChatbot />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
