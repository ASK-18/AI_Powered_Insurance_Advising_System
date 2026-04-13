import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPlansFromAPI, API_BASE } from "../plansData";

const EMPTY_PLAN = {
  id: "", label: "", icon: "🛡", iconClass: "icon-orange",
  tagline: "", riskLevel: "Low", premium: "", sumInsured: "",
  bestFor: "", highlights: [""], exclusions: [""], color: "#e8500a",
};

const RISK_COLOR = { Low: "#16a34a", Medium: "#d97706", High: "#dc2626" };

function AdminPage() {
  const navigate = useNavigate();
  const email    = localStorage.getItem("userEmail") || "Admin";

  const [plans,    setPlans]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [isNew,    setIsNew]    = useState(false);
  const [form,     setForm]     = useState(null);
  const [toast,    setToast]    = useState(null);

  // ── Load plans from MongoDB on mount ───────────────────────────────────────
  useEffect(() => {
    fetchPlansFromAPI()
      .then(setPlans)
      .catch(() => showToast("Could not load plans from server", "error"))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goDetail    = (plan) => { setSelected(plan); setView("detail"); };
  const goDashboard = ()     => { setSelected(null); setView("dashboard"); };

  const goEdit = (plan) => {
    setForm({ ...plan, highlights: [...plan.highlights], exclusions: [...plan.exclusions] });
    setIsNew(false);
    setView("edit");
  };

  const goNew = () => {
    setForm({ ...EMPTY_PLAN, highlights: [""], exclusions: [""] });
    setIsNew(true);
    setView("edit");
  };

  const cancelEdit = () => {
    setView(isNew ? "dashboard" : "detail");
    setForm(null);
  };

  // ── Form handlers ──────────────────────────────────────────────────────────
  const hf         = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const hList      = (k, i, v) => setForm(f => { const a=[...f[k]]; a[i]=v; return {...f,[k]:a}; });
  const addItem    = (k) => setForm(f => ({ ...f, [k]: [...f[k], ""] }));
  const removeItem = (k, i) => setForm(f => ({ ...f, [k]: f[k].filter((_,j)=>j!==i) }));

  // ── Save (Add or Edit) → POST or PUT to MongoDB ────────────────────────────
  const handleSave = async () => {
    if (!form.label.trim())   { showToast("Plan name is required", "error"); return; }
    if (!form.premium.trim()) { showToast("Premium is required", "error"); return; }

    const cleaned = {
      ...form,
      id:         form.id || form.label.toLowerCase().replace(/\s+/g, "-"),
      highlights: form.highlights.filter(Boolean),
      exclusions: form.exclusions.filter(Boolean),
    };

    try {
      if (isNew) {
        const res = await fetch(`${API_BASE}/plans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleaned),
        });
        if (!res.ok) {
          const err = await res.json();
          showToast(err.detail || "Failed to add plan", "error");
          return;
        }
        setPlans(p => [...p, cleaned]);
        showToast(`"${cleaned.label}" added successfully`);
        setView("dashboard");
      } else {
        const res = await fetch(`${API_BASE}/plans/${cleaned.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleaned),
        });
        if (!res.ok) {
          const err = await res.json();
          showToast(err.detail || "Failed to update plan", "error");
          return;
        }
        setPlans(p => p.map(x => x.id === cleaned.id ? cleaned : x));
        showToast(`"${cleaned.label}" updated successfully`);
        setSelected(cleaned);
        setView("detail");
      }
    } catch {
      showToast("Network error. Is the backend running?", "error");
    }
    setForm(null);
  };

  // ── Delete → DELETE to MongoDB ─────────────────────────────────────────────
  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete "${plan.label}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/plans/${plan.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.detail || "Failed to delete plan", "error");
        return;
      }
      setPlans(p => p.filter(x => x.id !== plan.id));
      showToast(`"${plan.label}" deleted`, "error");
      goDashboard();
    } catch {
      showToast("Network error. Is the backend running?", "error");
    }
  };

  const listBtn = (onClick, color="#dc2626", label="✕") => (
    <button onClick={onClick} style={{
      background:"none", border:"none", cursor:"pointer",
      color, fontSize:"17px", padding:"0 4px", lineHeight:1, flexShrink:0
    }}>{label}</button>
  );

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ display:"flex", width:"100vw", height:"100vh", overflow:"hidden",
      fontFamily:"'DM Sans', sans-serif", background:"#f2efe9" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside style={{
        width:"256px", minWidth:"256px", height:"100vh", background:"#141414",
        display:"flex", flexDirection:"column", borderRight:"1px solid #222",
        overflow:"hidden",
      }}>
        <div style={{ padding:"24px 22px 20px", borderBottom:"1px solid #222" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
            <div style={{ width:"38px", height:"38px", background:"#e8500a",
              borderRadius:"10px", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:"18px", flexShrink:0 }}>🛡</div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700,
                fontSize:"16px", color:"#fff", lineHeight:1 }}>InsureAI</div>
              <div style={{ fontSize:"9px", color:"#555", letterSpacing:"0.13em",
                textTransform:"uppercase", marginTop:"3px" }}>Admin Panel</div>
            </div>
          </div>
          <div style={{ marginTop:"14px", padding:"8px 12px",
            background:"rgba(232,80,10,0.12)", borderRadius:"8px",
            border:"1px solid rgba(232,80,10,0.2)" }}>
            <div style={{ fontSize:"9px", color:"#666", fontWeight:700,
              letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"3px" }}>
              Signed in as
            </div>
            <div style={{ fontSize:"12.5px", color:"#f87c45", fontWeight:600,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {email}
            </div>
          </div>
        </div>

        <div style={{ padding:"14px 12px 8px" }}>
          <button onClick={goDashboard} style={{
            width:"100%", padding:"10px 14px", borderRadius:"9px", border:"none",
            cursor:"pointer", textAlign:"left", fontSize:"13.5px",
            fontFamily:"inherit", fontWeight:500, transition:"background 0.15s",
            background: view==="dashboard" ? "rgba(232,80,10,0.18)" : "none",
            color: view==="dashboard" ? "#fff" : "#a0a0a0",
            display:"flex", alignItems:"center", gap:"10px",
          }}>
            <span>📋</span> Plan Management
          </button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"4px 12px",
          scrollbarWidth:"thin", scrollbarColor:"#2a2a2a transparent" }}>
          <div style={{ fontSize:"9.5px", fontWeight:700, letterSpacing:"0.13em",
            textTransform:"uppercase", color:"#3a3a3a", padding:"10px 2px 7px",
            display:"flex", alignItems:"center", gap:"8px" }}>
            Plans
            <span style={{ flex:1, height:"1px", background:"#222" }} />
          </div>

          {plans.map(plan => {
            const isActive = selected?.id === plan.id && view !== "dashboard";
            return (
              <button key={plan.id} onClick={() => goDetail(plan)} style={{
                width:"100%", padding:"9px 12px", borderRadius:"8px", border:"none",
                cursor:"pointer", textAlign:"left", fontFamily:"inherit",
                background: isActive ? "rgba(232,80,10,0.16)" : "none",
                color: isActive ? "#fff" : "#a0a0a0",
                display:"flex", alignItems:"center", gap:"10px",
                marginBottom:"2px", transition:"background 0.15s",
              }}>
                <span style={{ fontSize:"15px", flexShrink:0 }}>{plan.icon}</span>
                <span style={{ display:"flex", flexDirection:"column", gap:"1px", minWidth:0 }}>
                  <span style={{ fontSize:"13px", fontWeight:500, lineHeight:1.25,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {plan.label}
                  </span>
                  <span style={{ fontSize:"10px", fontWeight:700,
                    color: isActive ? "rgba(255,255,255,0.6)" : RISK_COLOR[plan.riskLevel] }}>
                    {plan.riskLevel} Risk
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ padding:"14px 14px 18px", borderTop:"1px solid #222",
          display:"flex", flexDirection:"column", gap:"8px" }}>
          <button onClick={goNew} style={{
            width:"100%", padding:"11px", background:"#e8500a", border:"none",
            borderRadius:"9px", color:"#fff", fontSize:"13.5px", fontWeight:600,
            fontFamily:"inherit", cursor:"pointer",
          }}>+ Add New Plan</button>
          <button onClick={logout} style={{
            width:"100%", padding:"10px", background:"none",
            border:"1px solid #2a2a2a", borderRadius:"9px", color:"#555",
            fontSize:"12.5px", fontFamily:"inherit", cursor:"pointer",
          }}>↩ Sign Out</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ flex:1, height:"100vh", overflowY:"auto", padding:"44px 52px" }}>

        {/* Loading state */}
        {loading && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
            height:"60vh", flexDirection:"column", gap:"16px" }}>
            <div style={{ fontSize:"32px" }}>⏳</div>
            <p style={{ color:"#9a9490", fontSize:"15px" }}>Loading plans from database...</p>
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {!loading && view === "dashboard" && (
          <div>
            <div style={{ marginBottom:"32px" }}>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
                fontSize:"36px", color:"#0f0f0f", letterSpacing:"-0.02em",
                marginBottom:"8px" }}>Plan Management</h1>
              <p style={{ fontSize:"14.5px", color:"#6b6661", maxWidth:"520px", lineHeight:1.65 }}>
                Click any plan to view details, or use <strong>+ Add New Plan</strong> to create one.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
              gap:"14px", marginBottom:"36px" }}>
              {[
                { label:"Total Plans",  val:plans.length,                                      color:"#0f0f0f" },
                { label:"Low Risk",     val:plans.filter(p=>p.riskLevel==="Low").length,    color:RISK_COLOR.Low },
                { label:"Medium Risk",  val:plans.filter(p=>p.riskLevel==="Medium").length, color:RISK_COLOR.Medium },
                { label:"High Risk",    val:plans.filter(p=>p.riskLevel==="High").length,   color:RISK_COLOR.High },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background:"#fff", border:"1px solid #e4dfd8",
                  borderRadius:"14px", padding:"20px 22px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.1em",
                    textTransform:"uppercase", color:"#9a9490", marginBottom:"10px" }}>{label}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"32px",
                    fontWeight:800, color, lineHeight:1 }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize:"11px", fontWeight:700, letterSpacing:"0.12em",
              textTransform:"uppercase", color:"#9a9490", marginBottom:"16px",
              display:"flex", alignItems:"center", gap:"12px" }}>
              All Plans
              <span style={{ flex:1, height:"1px", background:"#e4dfd8" }} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"18px" }}>
              {plans.map((plan, idx) => (
                <div key={plan.id} onClick={() => goDetail(plan)}
                  style={{ background:"#fff", border:"1px solid #e4dfd8",
                    borderRadius:"16px", overflow:"hidden", cursor:"pointer",
                    boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
                    transition:"box-shadow 0.2s, transform 0.18s",
                    animation:`fadeUp 0.35s ease ${idx*0.06}s both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,0.1)"; e.currentTarget.style.transform="translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.05)"; e.currentTarget.style.transform="none"; }}>
                  <div style={{ background:plan.color, padding:"22px 22px 18px",
                    position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", right:"-10px", top:"-10px",
                      fontSize:"72px", opacity:0.1, lineHeight:1, pointerEvents:"none" }}>
                      {plan.icon}
                    </div>
                    <div style={{ display:"inline-block", background:"rgba(255,255,255,0.2)",
                      borderRadius:"20px", padding:"3px 11px", marginBottom:"10px",
                      fontSize:"10px", color:"#fff", fontWeight:700, letterSpacing:"0.07em" }}>
                      {plan.riskLevel.toUpperCase()} RISK
                    </div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700,
                      fontSize:"17px", color:"#fff", lineHeight:1.2 }}>{plan.label}</div>
                    <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.7)",
                      marginTop:"4px" }}>{plan.tagline}</div>
                  </div>
                  <div style={{ padding:"16px 20px 18px" }}>
                    <div style={{ fontSize:"13px", color:"#6b6661", marginBottom:"4px" }}>
                      💰 {plan.premium}
                    </div>
                    <div style={{ fontSize:"13px", color:"#6b6661", marginBottom:"14px" }}>
                      🏥 {plan.sumInsured}
                    </div>
                    <div style={{ display:"flex", gap:"8px" }}>
                      <span style={{ fontSize:"11px", background:"#f0fdf4", color:"#16a34a",
                        borderRadius:"20px", padding:"3px 10px", fontWeight:600 }}>
                        ✅ {plan.highlights.length} covered
                      </span>
                      <span style={{ fontSize:"11px", background:"#fef2f2", color:"#dc2626",
                        borderRadius:"20px", padding:"3px 10px", fontWeight:600 }}>
                        ❌ {plan.exclusions.length} excluded
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DETAIL VIEW ── */}
        {!loading && view === "detail" && selected && (
          <div style={{ maxWidth:"740px" }}>
            <button onClick={goDashboard} style={{
              background:"none", border:"none", cursor:"pointer", color:"#9a9490",
              fontSize:"13px", padding:0, marginBottom:"24px", fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:"6px",
            }}>← All Plans</button>

            <div style={{ background:selected.color, borderRadius:"18px",
              padding:"34px 30px", marginBottom:"20px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:"-10px", top:"-10px",
                fontSize:"130px", opacity:0.1, lineHeight:1 }}>{selected.icon}</div>
              <div style={{ display:"inline-block", background:"rgba(255,255,255,0.22)",
                borderRadius:"20px", padding:"4px 13px", marginBottom:"12px",
                fontSize:"10.5px", color:"#fff", fontWeight:700, letterSpacing:"0.08em" }}>
                {selected.riskLevel.toUpperCase()} RISK
              </div>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
                fontSize:"30px", color:"#fff", marginBottom:"6px" }}>{selected.label}</h1>
              <p style={{ color:"rgba(255,255,255,0.76)", fontSize:"14px", margin:0 }}>
                {selected.tagline}
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
              gap:"14px", marginBottom:"18px" }}>
              {[
                { label:"💰 Annual Premium", val:selected.premium },
                { label:"🏥 Sum Insured",    val:selected.sumInsured },
                { label:"👤 Best For",       val:selected.bestFor },
              ].map(({ label, val }) => (
                <div key={label} style={{ background:"#fff", border:"1px solid #e4dfd8",
                  borderRadius:"12px", padding:"16px 18px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.1em",
                    textTransform:"uppercase", color:"#9a9490", marginBottom:"6px" }}>{label}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"14px",
                    fontWeight:700, color:"#0f0f0f", lineHeight:1.35 }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
              gap:"14px", marginBottom:"22px" }}>
              {[
                { title:"✅ What's Covered", items:selected.highlights, dot:selected.color, textColor:"#0f0f0f" },
                { title:"❌ Exclusions",     items:selected.exclusions, dot:"#dc2626",      textColor:"#6b6661" },
              ].map(({ title, items, dot, textColor }) => (
                <div key={title} style={{ background:"#fff", border:"1px solid #e4dfd8",
                  borderRadius:"12px", padding:"20px 22px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:"12px", fontWeight:700, color:"#0f0f0f", marginBottom:"14px" }}>{title}</div>
                  <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"9px" }}>
                    {items.map((item, i) => (
                      <li key={i} style={{ display:"flex", gap:"8px", fontSize:"13px",
                        color:textColor, alignItems:"flex-start", lineHeight:1.5 }}>
                        <span style={{ color:dot, fontWeight:700, flexShrink:0 }}>
                          {dot===selected.color ? "✓" : "✕"}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={() => goEdit(selected)} style={{
                padding:"12px 24px", background:"#e8500a", border:"none",
                borderRadius:"10px", color:"#fff", fontSize:"14px", fontWeight:600,
                fontFamily:"inherit", cursor:"pointer",
              }}>✏️ Edit Plan</button>
              <button onClick={() => handleDelete(selected)} style={{
                padding:"12px 22px", background:"rgba(239,68,68,0.08)",
                border:"1.5px solid rgba(239,68,68,0.25)", borderRadius:"10px",
                color:"#dc2626", fontSize:"14px", fontWeight:600,
                fontFamily:"inherit", cursor:"pointer",
              }}>🗑 Delete</button>
            </div>
          </div>
        )}

        {/* ── EDIT / ADD FORM ── */}
        {!loading && view === "edit" && form && (
          <div style={{ maxWidth:"680px" }}>
            <div style={{ display:"flex", alignItems:"flex-start",
              justifyContent:"space-between", marginBottom:"28px" }}>
              <div>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
                  fontSize:"30px", color:"#0f0f0f", marginBottom:"6px" }}>
                  {isNew ? "Add New Plan" : `Edit: ${form.label || "Plan"}`}
                </h1>
                <p style={{ fontSize:"14px", color:"#6b6661", margin:0 }}>
                  {isNew ? "Fill in the details below to create a new plan."
                    : "Update the fields and save your changes."}
                </p>
              </div>
              <button onClick={cancelEdit} style={{
                padding:"9px 18px", background:"none", border:"1.5px solid #e4dfd8",
                borderRadius:"9px", color:"#6b6661", fontSize:"13px",
                fontFamily:"inherit", cursor:"pointer", flexShrink:0, marginTop:"4px",
              }}>Cancel</button>
            </div>

            {/* Live preview */}
            <div style={{ background:form.color, borderRadius:"14px",
              padding:"22px 24px", marginBottom:"24px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:"-6px", top:"-6px",
                fontSize:"70px", opacity:0.1, lineHeight:1 }}>{form.icon}</div>
              <div style={{ fontSize:"10px", fontWeight:700, color:"#fff",
                background:"rgba(255,255,255,0.2)", borderRadius:"20px",
                padding:"3px 10px", display:"inline-block", marginBottom:"8px", letterSpacing:"0.06em" }}>
                {(form.riskLevel||"Low").toUpperCase()} RISK — PREVIEW
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700,
                fontSize:"20px", color:"#fff" }}>{form.label || "Plan Name"}</div>
              <div style={{ fontSize:"12.5px", color:"rgba(255,255,255,0.7)", marginTop:"4px" }}>
                {form.tagline || "Tagline preview"}
              </div>
            </div>

            <div style={{ background:"#fff", border:"1px solid #e4dfd8",
              borderRadius:"16px", padding:"28px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>

              {[
                { label:"Plan Name *", key:"label",   ph:"e.g. Basic Shield Plan" },
                { label:"Tagline",     key:"tagline",  ph:"Short description" },
                { label:"Best For",    key:"bestFor",  ph:"Target demographic" },
              ].map(({ label, key, ph }) => (
                <div key={key} style={{ marginBottom:"18px" }}>
                  <label style={{ display:"block", fontSize:"12.5px", fontWeight:600,
                    color:"#0f0f0f", marginBottom:"6px" }}>{label}</label>
                  <input className="form-input" value={form[key]}
                    onChange={e => hf(key, e.target.value)} placeholder={ph} />
                </div>
              ))}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"18px" }}>
                <div>
                  <label style={{ display:"block", fontSize:"12.5px", fontWeight:600,
                    color:"#0f0f0f", marginBottom:"6px" }}>Risk Level</label>
                  <select className="form-select" value={form.riskLevel}
                    onChange={e => hf("riskLevel", e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:"12.5px", fontWeight:600,
                    color:"#0f0f0f", marginBottom:"6px" }}>Banner Color</label>
                  <input className="form-input" type="color" value={form.color}
                    onChange={e => hf("color", e.target.value)}
                    style={{ height:"44px", padding:"4px 8px", cursor:"pointer" }} />
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"18px" }}>
                {[
                  { label:"Annual Premium *", key:"premium",    ph:"₹3,000 – ₹6,000 / year" },
                  { label:"Sum Insured",       key:"sumInsured", ph:"Up to ₹5 Lakhs" },
                ].map(({ label, key, ph }) => (
                  <div key={key}>
                    <label style={{ display:"block", fontSize:"12.5px", fontWeight:600,
                      color:"#0f0f0f", marginBottom:"6px" }}>{label}</label>
                    <input className="form-input" value={form[key]}
                      onChange={e => hf(key, e.target.value)} placeholder={ph} />
                  </div>
                ))}
              </div>

              {[
                { label:"✅ What's Covered", key:"highlights", ph:"Highlight" },
                { label:"❌ Exclusions",     key:"exclusions", ph:"Exclusion" },
              ].map(({ label, key, ph }) => (
                <div key={key} style={{ marginBottom:"20px" }}>
                  <label style={{ display:"block", fontSize:"12.5px", fontWeight:600,
                    color:"#0f0f0f", marginBottom:"8px" }}>{label}</label>
                  {form[key].map((item, i) => (
                    <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"7px" }}>
                      <input className="form-input" value={item} style={{ margin:0 }}
                        onChange={e => hList(key, i, e.target.value)}
                        placeholder={`${ph} ${i+1}`} />
                      {form[key].length > 1 && listBtn(() => removeItem(key, i))}
                    </div>
                  ))}
                  <button onClick={() => addItem(key)} style={{
                    background:"none", border:"none", cursor:"pointer",
                    color:"#e8500a", fontSize:"13px", fontWeight:600,
                    fontFamily:"inherit", padding:"4px 0",
                  }}>+ Add {ph.toLowerCase()}</button>
                </div>
              ))}

              <div style={{ display:"flex", gap:"10px", paddingTop:"20px",
                borderTop:"1px solid #e4dfd8", marginTop:"8px" }}>
                <button onClick={handleSave} style={{
                  padding:"12px 26px", background:"#e8500a", border:"none",
                  borderRadius:"10px", color:"#fff", fontSize:"14px", fontWeight:600,
                  fontFamily:"inherit", cursor:"pointer",
                }}>{isNew ? "✅ Add Plan" : "💾 Save Changes"}</button>
                <button onClick={cancelEdit} style={{
                  padding:"12px 22px", background:"none", border:"1.5px solid #e4dfd8",
                  borderRadius:"10px", color:"#6b6661", fontSize:"14px",
                  fontFamily:"inherit", cursor:"pointer",
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", bottom:"28px", right:"28px",
          background:"#1a1a1a", color:"#fff", padding:"12px 20px",
          borderRadius:"10px", fontSize:"13.5px", fontWeight:500,
          boxShadow:"0 20px 60px rgba(0,0,0,0.2)", zIndex:9999,
          borderLeft:`3px solid ${toast.type==="error" ? "#ef4444" : "#22c55e"}`,
          animation:"fadeUp 0.25s ease",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default AdminPage;