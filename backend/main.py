from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from ml_model import predict_insurance
from auth import register_user, login_user
from database import get_plans_collection
from rag_engine import get_retriever
from pydantic import BaseModel
from huggingface_hub import InferenceClient
import os
app = FastAPI(title="Insurance Recommendation API", version="1.0.0")
PDF_PATH = os.path.join(os.path.dirname(__file__), "data", "insurance.pdf")

# ✅ Load retriever once at startup
retriever = get_retriever(PDF_PATH)
class ChatRequest(BaseModel):
    message: str
HF_TOKEN = os.getenv("HF_TOKEN")
client = InferenceClient(token=HF_TOKEN)
# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Auth Schemas ─────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email:     str
    password:  str
    admin_key: Optional[str] = ""

class LoginRequest(BaseModel):
    email:    str
    password: str

# ─── Register ─────────────────────────────────────────────────────────────────
@app.post("/register")
def register(data: RegisterRequest):
    result = register_user(data.email, data.password, data.admin_key or "")
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "Registered successfully", "role": result["role"]}

# ─── Login ────────────────────────────────────────────────────────────────────
@app.post("/login")
def login(data: LoginRequest):
    result = login_user(data.email, data.password)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return {"message": "Login successful", "role": result["role"]}
@app.post("/chat")
def chat(req: ChatRequest):
    user_msg = req.message.lower().strip()
    clean_msg = user_msg.replace("?", "").strip()

    # 1️⃣ Greetings
    greetings = ["hello", "hi", "hey", "good morning", "good evening"]
    if clean_msg in greetings:
        return {
            "answer": "Hello! 👋 I'm your AI Insurance Advisor. How can I help you today?"
        }

    # 2️⃣ FAQ answers
    faq = {
        "what is insurance": "Insurance is a legal agreement where you pay a premium and receive financial protection.",
        "what is a policy": "An insurance policy is a contract outlining coverage, exclusions, and benefits.",
        "how to claim": "To claim insurance, notify your insurer, submit required documents, and follow their claim process."
    }

    if clean_msg in faq:
        return {"answer": faq[clean_msg]}

    # 3️⃣ RAG + Hugging Face (PDF-based answers)
    try:
        docs = retriever.invoke(req.message)
        context = "\n\n".join(doc.page_content for doc in docs)

        response = client.chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Answer only using the context below. "
                        "If unsure, say you don't know.\n\n"
                        f"Context:\n{context}"
                    )
                },
                {"role": "user", "content": req.message}
            ],
            model="meta-llama/Meta-Llama-3-8B-Instruct",
            max_tokens=150,
            temperature=0.1,
        )

        answer = response.choices[0].message.content.strip()
        return {"answer": answer}

    except Exception as e:
        print("Chatbot error:", e)
        return {
            "answer": (
                "I’m having trouble accessing my advanced AI engine right now. "
                "I can still help with basic insurance questions."
            )
        }
# ─── Predict ──────────────────────────────────────────────────────────────────
class InsuranceRequest(BaseModel):
    age:      float
    bmi:      float
    sex:      str        # "male" | "female" | "other"
    smoker:   str
    children: int
    region:   str

class InsuranceResponse(BaseModel):
    predicted_charges: float
    risk:              str
    plan:              str
    explanation:       str

@app.post("/predict", response_model=InsuranceResponse)
def predict(data: InsuranceRequest):
    result = predict_insurance(
        age=data.age, bmi=data.bmi, sex=data.sex,
        smoker=data.smoker, children=data.children, region=data.region,
    )
    return result

@app.get("/health")
def health_check():
    return {"status": "ok"}


# ─── Default plans to seed MongoDB if empty ───────────────────────────────────
DEFAULT_PLANS = [
    {
        "id": "basic-shield",
        "label": "Basic Shield Plan",
        "icon": "🛡",
        "iconClass": "icon-orange",
        "tagline": "Essential coverage for low-risk individuals",
        "riskLevel": "Low",
        "premium": "₹3,000 – ₹6,000 / year",
        "sumInsured": "Up to ₹3 Lakhs",
        "bestFor": "Young, healthy individuals with no dependents",
        "highlights": [
            "Hospitalisation cover up to ₹3 Lakhs",
            "Pre & post hospitalisation (30/60 days)",
            "Day-care procedures covered",
            "No-claim bonus: 10% per year (max 50%)",
            "Free annual health check-up",
        ],
        "exclusions": [
            "Pre-existing diseases (first 2 years)",
            "Cosmetic or dental treatment",
            "Self-inflicted injuries",
        ],
        "color": "#e8500a",
    },
    {
        "id": "secure-plus",
        "label": "SecurePlus Plan",
        "icon": "🔰",
        "iconClass": "icon-blue",
        "tagline": "Balanced coverage for mid-risk profiles",
        "riskLevel": "Medium",
        "premium": "₹8,000 – ₹14,000 / year",
        "sumInsured": "Up to ₹10 Lakhs",
        "bestFor": "Families and individuals with moderate health risks",
        "highlights": [
            "Hospitalisation cover up to ₹10 Lakhs",
            "Critical illness rider available",
            "Maternity cover (after 2-year waiting period)",
            "Ambulance charges covered",
            "Pre & post hospitalisation (60/90 days)",
            "No-claim bonus: 15% per year (max 75%)",
        ],
        "exclusions": [
            "Pre-existing diseases (first 1 year)",
            "Experimental treatments",
            "War or nuclear hazard injuries",
        ],
        "color": "#3b82f6",
    },
    {
        "id": "premium-care",
        "label": "PremiumCare Plan",
        "icon": "💎",
        "iconClass": "icon-purple",
        "tagline": "Comprehensive coverage for high-risk profiles",
        "riskLevel": "High",
        "premium": "₹18,000 – ₹35,000 / year",
        "sumInsured": "Up to ₹50 Lakhs",
        "bestFor": "Smokers, seniors, and individuals with chronic conditions",
        "highlights": [
            "Hospitalisation cover up to ₹50 Lakhs",
            "Critical illness cover included",
            "International emergency cover",
            "Mental health treatment covered",
            "OPD expenses covered",
            "Pre & post hospitalisation (90/180 days)",
            "No-claim bonus: 20% per year (max 100%)",
            "Annual wellness benefits worth ₹5,000",
        ],
        "exclusions": [
            "Intentional self-harm",
            "Alcohol or substance abuse treatment",
            "Elective cosmetic procedures",
        ],
        "color": "#8b5cf6",
    },
]

# ─── Plans Schema ─────────────────────────────────────────────────────────────
class PlanModel(BaseModel):
    id:         str
    label:      str
    icon:       Optional[str] = "🛡"
    iconClass:  Optional[str] = "icon-orange"
    tagline:    Optional[str] = ""
    riskLevel:  str
    premium:    str
    sumInsured: Optional[str] = ""
    bestFor:    Optional[str] = ""
    highlights: List[str] = []
    exclusions: List[str] = []
    color:      Optional[str] = "#e8500a"

# ─── GET /plans ───────────────────────────────────────────────────────────────
@app.get("/plans")
def get_plans():
    col = get_plans_collection()
    if col.count_documents({}) == 0:
        col.insert_many([{**p} for p in DEFAULT_PLANS])
    return list(col.find({}, {"_id": 0}))

# ─── POST /plans ──────────────────────────────────────────────────────────────
@app.post("/plans")
def create_plan(plan: PlanModel):
    col = get_plans_collection()
    if col.find_one({"id": plan.id}):
        raise HTTPException(status_code=400, detail="A plan with this ID already exists")
    col.insert_one(plan.dict())
    return {"message": "Plan created successfully"}

# ─── PUT /plans/{plan_id} ─────────────────────────────────────────────────────
@app.put("/plans/{plan_id}")
def update_plan(plan_id: str, plan: PlanModel):
    col = get_plans_collection()
    result = col.update_one({"id": plan_id}, {"$set": plan.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"message": "Plan updated successfully"}

# ─── DELETE /plans/{plan_id} ──────────────────────────────────────────────────
@app.delete("/plans/{plan_id}")
def delete_plan(plan_id: str):
    col = get_plans_collection()
    result = col.delete_one({"id": plan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"message": "Plan deleted successfully"}
