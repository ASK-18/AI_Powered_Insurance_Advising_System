import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function InsuranceForm() {
  const [formData, setFormData] = useState({
    age: "", bmi: "", sex: "", smoker: "", children: "", region: ""
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const setGender = (val) =>
    setFormData((prev) => ({ ...prev, sex: val }));

  const validateForm = () => {
    const { age, bmi, sex, smoker, children, region } = formData;

    // Use explicit checks instead of truthiness so "0" children passes
    if (age === "" || bmi === "" || sex === "" || smoker === "" || children === "" || region === "")
      return "Please fill in all fields";
    if (isNaN(age) || Number(age) <= 0 || Number(age) > 120)
      return "Enter a valid age (1–120)";
    if (isNaN(bmi) || Number(bmi) <= 0 || Number(bmi) > 80)
      return "Enter a valid BMI";
    if (isNaN(children) || Number(children) < 0)
      return "Enter a valid number of children";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      const payload = {
        age:      Number(formData.age),
        bmi:      Number(formData.bmi),
        sex:      formData.sex,
        smoker:   formData.smoker,
        children: Number(formData.children),
        region:   formData.region,
      };
      const response = await axios.post("http://localhost:8000/predict", payload);
      navigate("/result", { state: response.data });
    } catch {
      setError("Error connecting to backend. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h2 className="page-title">Get Your Advice</h2>
        <p className="page-subtitle">
          Fill in your details to receive a personalised insurance recommendation.
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Gender */}
        <div className="form-group">
          <label className="form-label">Gender</label>
          <div className="gender-toggle">
            {[
              { val: "male",   label: "♂ Male"   },
              { val: "female", label: "♀ Female" },
              { val: "other",  label: "◈ Other"  },
            ].map(({ val, label }) => (
              <button type="button" key={val}
                className={`gender-btn ${formData.sex === val ? "selected" : ""}`}
                onClick={() => setGender(val)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Age + BMI */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age</label>
            <input className="form-input" type="number" name="age"
              value={formData.age}
              placeholder="e.g. 32" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">BMI</label>
            <input className="form-input" type="number" name="bmi"
              value={formData.bmi}
              placeholder="e.g. 24.5" step="0.1" onChange={handleChange} />
          </div>
        </div>

        {/* Children + Smoker + Region */}
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Children</label>
            <input className="form-input" type="number" name="children"
              value={formData.children}
              placeholder="e.g. 2" min="0" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Smoker?</label>
            <select className="form-select" name="smoker"
              value={formData.smoker} onChange={handleChange}>
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Region</label>
            <select className="form-select" name="region"
              value={formData.region} onChange={handleChange}>
              <option value="">Select</option>
              <option value="southwest">Southwest</option>
              <option value="southeast">Southeast</option>
              <option value="northwest">Northwest</option>
              <option value="northeast">Northeast</option>
            </select>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Analysing your profile..." : "Get Recommendation →"}
        </button>

      </form>
    </div>
  );
}

export default InsuranceForm;