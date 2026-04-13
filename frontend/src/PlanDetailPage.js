import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchPlansFromAPI, getCachedPlans } from "./plansData";

function PlanDetailPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(() => getCachedPlans().find(p => p.id === planId) || null);

  useEffect(() => {
    fetchPlansFromAPI()
      .then(plans => {
        const found = plans.find(p => p.id === planId);
        setPlan(found || null);
      })
      .catch(() => {}); // keep showing cached version on error
  }, [planId]);

  if (!plan) {
    return (
      <div>
        <h2 className="page-title">Plan Not Found</h2>
        <button className="btn-primary" style={{ width: "auto", marginTop: "20px" }}
          onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "680px" }}>

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", fontSize: "13px", padding: "0",
          marginBottom: "28px", display: "flex", alignItems: "center", gap: "6px"
        }}
      >
        ← Back
      </button>

      {/* Hero card */}
      <div style={{
        background: plan.color, borderRadius: "16px",
        padding: "32px 28px", marginBottom: "24px", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", right: "-20px", top: "-20px",
          fontSize: "120px", opacity: 0.12, lineHeight: 1
        }}>{plan.icon}</div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "rgba(255,255,255,0.2)", borderRadius: "20px",
          padding: "4px 12px", marginBottom: "14px"
        }}>
          <span style={{ fontSize: "11px", color: "#fff", fontWeight: 600, letterSpacing: "0.06em" }}>
            {plan.riskLevel.toUpperCase()} RISK
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: "28px", color: "#fff", marginBottom: "8px"
        }}>{plan.label}</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>{plan.tagline}</p>
      </div>

      {/* Key stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div className="result-card">
          <div className="result-card-label">💰 Annual Premium</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
            {plan.premium}
          </div>
        </div>
        <div className="result-card">
          <div className="result-card-label">🏥 Sum Insured</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
            {plan.sumInsured}
          </div>
        </div>
      </div>

      {/* Best for */}
      <div className="result-card" style={{ marginBottom: "20px" }}>
        <div className="result-card-label">👤 Best For</div>
        <p style={{ fontSize: "14px", color: "var(--text-primary)", marginTop: "6px", lineHeight: 1.6 }}>
          {plan.bestFor}
        </p>
      </div>

      {/* Highlights */}
      <div className="result-card" style={{ marginBottom: "20px" }}>
        <div className="result-card-label" style={{ marginBottom: "14px" }}>✅ What's Covered</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {plan.highlights.map((h, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "var(--text-primary)" }}>
              <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
              {h}
            </li>
          ))}
        </ul>
      </div>

      {/* Exclusions */}
      <div className="result-card" style={{ marginBottom: "28px" }}>
        <div className="result-card-label" style={{ marginBottom: "14px" }}>❌ Exclusions</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          {plan.exclusions.map((e, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "var(--text-muted)" }}>
              <span style={{ color: "#dc2626", flexShrink: 0 }}>✕</span>
              {e}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <button className="btn-primary" style={{ width: "auto" }}
        onClick={() => navigate("/form")}>
        Check If This Plan Suits Me →
      </button>
    </div>
  );
}

export default PlanDetailPage;