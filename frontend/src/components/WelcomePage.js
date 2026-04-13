import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-hero">
        <h1 className="page-title">Your Smart<br />Insurance Advisor</h1>
        <p className="page-subtitle">
          Powered by Machine Learning and Generative AI — get personalised insurance
          recommendations, risk assessments, and plain-English explanations in seconds.
        </p>

        <div className="welcome-chips">
          <span className="chip">🤖 ML Risk Scoring</span>
          <span className="chip">📋 Plan Matching</span>
          <span className="chip">💡 AI Explanations</span>
          <span className="chip">🔒 Privacy First</span>
        </div>

        <div className="btn-row">
          <button className="btn-primary" style={{ width: "auto", marginTop: 0 }}
            onClick={() => navigate("/login")}>
            Get Started →
          </button>
          <button className="btn-secondary" onClick={() => navigate("/about")}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;