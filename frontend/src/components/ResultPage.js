import { useLocation, useNavigate } from "react-router-dom";

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    return (
      <div>
        <h2 className="page-title">No Data Found</h2>
        <p className="page-subtitle">Please go back and submit the form.</p>
        <button className="btn-primary" style={{ width: "auto", marginTop: "20px" }}
          onClick={() => navigate("/form")}>← Back to Form</button>
      </div>
    );
  }

  const riskClass = data.risk?.toLowerCase();

  // Format as USD with commas
  const formattedCharges = Number(data.predicted_charges).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Your Result</h2>
        <p className="page-subtitle">
          Here's your personalised insurance recommendation based on your profile.
        </p>
      </div>

      <div className="result-grid">
        <div className="result-card">
          <div className="result-card-label">💰 Estimated Annual Charges</div>
          <div className="result-card-value">${formattedCharges}</div>
        </div>

        <div className="result-card">
          <div className="result-card-label">⚠️ Risk Level</div>
          <div className={`result-card-value ${riskClass}`}>{data.risk}</div>
        </div>

        <div className="result-card" style={{ gridColumn: "1 / -1" }}>
          <div className="result-card-label">📋 Recommended Plan</div>
          <div className="result-card-value" style={{ fontSize: "18px" }}>{data.plan}</div>
        </div>
      </div>

      <div className="result-explanation">
        <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "8px" }}>
          💡 Why this recommendation?
        </strong>
        {data.explanation}
      </div>

      <button className="btn-primary" style={{ width: "auto", marginTop: "24px" }}
        onClick={() => navigate("/form")}>
        ← Try Again
      </button>
    </div>
  );
}

export default ResultPage;