import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: "🛡", iconClass: "icon-orange", title: "ML Risk Prediction",
    desc: "Gradient Boosting model trained on medical cost data predicts your estimated annual insurance charges." },
  { icon: "🔰", iconClass: "icon-blue",   title: "Smart Plan Recommendation",
    desc: "Rule-based decision layer maps risk scores to appropriate insurance plans and premium ranges." },
  { icon: "⚡", iconClass: "icon-yellow", title: "AI Explanations",
    desc: "Natural-language explanations generated from model output so users understand the reasoning behind recommendations." },
  { icon: "💬", iconClass: "icon-purple", title: "Insurance Chatbot",
    desc: "Interactive assistant answers common insurance queries about plans, premiums, claims, and more." },
  { icon: "📊", iconClass: "icon-green",  title: "Analytics Dashboard",
    desc: "Visual insights on risk distribution, plan usage, and factor impact drawn from training data." },
  { icon: "🔒", iconClass: "icon-red",    title: "Privacy First",
    desc: "All predictions run locally on your infrastructure. No user data is stored or shared externally." },
];

function AboutPage() {
  const navigate   = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <div style={{
      minHeight: "100vh", background: "var(--main-bg)",
      padding: "44px 56px",
    }}>

      {/* Back button */}
      <button className="btn-ghost"
        style={{ padding: "7px 16px", fontSize: "13px", marginBottom: "32px" }}
        onClick={() => navigate("/")}>
        ← Back
      </button>

      {/* Title + subtitle */}
      <div style={{ marginBottom: "32px" }}>
        <h1 className="page-title">About InsureAI</h1>
        <p className="page-subtitle">
          An intelligent insurance advisor that combines Machine Learning for risk prediction
          and Generative AI for explainable insights — helping users make informed,
          data-driven insurance decisions.
        </p>
      </div>

   

      {/* Key Features */}
      <div className="section-label">Key Features</div>

      <div className="cards-grid">
        {FEATURES.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className={`card-icon-wrap ${f.iconClass}`}>{f.icon}</div>
            <div className="card-title">{f.title}</div>
            <p className="card-desc">{f.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default AboutPage;