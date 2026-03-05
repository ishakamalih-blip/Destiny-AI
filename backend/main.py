from fastapi import FastAPI, HTTPException, status, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, BeforeValidator
from typing import List, Optional, Annotated
import json
import os
import random
import bcrypt
from ai_engine import PalmAI
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="BIOMETRIC AI API", description="Backend for Biological Pattern Recognition and Behavioral Modeling")

# CORS Setup
origins = [
    "http://localhost:5173",  # React port
    "http://localhost:5174",  # React alternate port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client.get_database("biometric_ai")
users_collection = db.get_collection("users")
history_collection = db.get_collection("analysis_history")

# Password Hashing
def get_password_hash(password):
    if isinstance(password, str):
        password = password.encode('utf-8')
    # bcrypt 72-byte limit
    password = password[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password, salt).decode('utf-8')

def verify_password(plain_password, hashed_password):
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    plain_password = plain_password[:72]
    try:
        return bcrypt.checkpw(plain_password, hashed_password)
    except Exception:
        return False

# Data Models
# Helper to handle ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    role: str = "user"  # user or admin

class UserUpdate(BaseModel):
    username: str # Used to identify user
    email: Optional[str] = None
    password: Optional[str] = None
    palm_data: Optional[dict] = None # Allow storing full analysis result
    profile_photo: Optional[str] = None # Base64 encoded profile photo

class PalmData(BaseModel):
    vitality_index: int # 1-10
    cognitive_index: int # 1-10
    emotional_index: int # 1-10

class ChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None

class UserDelete(BaseModel):
    username: str
    password: str

class AdminDelete(BaseModel):
    admin_username: str
    admin_password: str
    target_username: str

# Startup Event: Migration
@app.on_event("startup")
async def startup_db_client():
    # 1. Check if DB is empty, if so, migrate from JSON
    count = await users_collection.count_documents({})
    if count == 0 and os.path.exists("users.json"):
        try:
            with open("users.json", "r") as f:
                users = json.load(f)
                if users:
                    # Hash passwords before migrating
                    for user in users:
                        if "password" in user and not user["password"].startswith("$2b$"):
                            user["password"] = get_password_hash(user["password"])
                    await users_collection.insert_many(users)
                    print("Migrated users from users.json to MongoDB with hashed passwords")
        except Exception as e:
            print(f"Migration failed: {e}")
    
    # 2. Migrate history data if collection is empty
    history_count = await history_collection.count_documents({})
    if history_count == 0 and os.path.exists("history.json"):
        try:
            with open("history.json", "r") as f:
                history_data = json.load(f)
                if history_data:
                    await history_collection.insert_many(history_data)
                    print(f"Migrated {len(history_data)} history records from history.json to MongoDB")
        except Exception as e:
            print(f"History migration failed: {e}")

    # 3. Data Cleanup: Ensure all users have emails
    # Find users with no email, null email, or empty string
    async for user in users_collection.find({"$or": [{"email": None}, {"email": ""}]}):
        default_email = f"{user['username']}@biometric-ai.io"
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"email": default_email}}
        )
        print(f"Updated missing email for user: {user['username']} -> {default_email}")

    # 4. Enforce Unique Constraints
    try:
        await users_collection.create_index("username", unique=True)
        await users_collection.create_index("email", unique=True)
        print("Database unique constraints enforced")
    except Exception as e:
        print(f"Index creation failed (possible duplicates): {e}")

# Endpoints

@app.get("/admin/users")
async def get_all_users():
    users = await users_collection.find({}).to_list(100)
    for u in users:
        u["_id"] = str(u["_id"])
        # Remove sensitive data
        if "password" in u:
            del u["password"]
    return users

@app.get("/health")
async def health_check():
    try:
        # Check database connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}, 503

@app.get("/")
def read_root():
    return {"message": "Welcome to BIOMETRIC AI API"}

@app.post("/register")
async def register(user: UserRegister):
    existing_user = await users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Assign default email if not provided
    if not user.email:
        user.email = f"{user.username}@biometric-ai.io"

    new_user = user.dict()
    new_user["password"] = get_password_hash(user.password) # Secure hash
    await users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}

@app.post("/login")
async def login(user: UserLogin):
    u = await users_collection.find_one({"username": user.username})
    if u and verify_password(user.password, u["password"]):
        return {
            "message": "Login successful", 
            "role": u.get("role", "user"),
            "email": u.get("email"),
            "palm_data": u.get("palm_data"),
            "profile_photo": u.get("profile_photo")
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.put("/users/update")
async def update_user(data: UserUpdate):
    # Filter out None values and ensure email is not empty
    update_data = {}
    for k, v in data.dict().items():
        if k == "username" or v is None:
            continue
        if k == "email" and v.strip() == "":
            continue
        update_data[k] = v
    
    if not update_data:
        return {"message": "No changes provided"}
        
    result = await users_collection.update_one(
        {"username": data.username},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "Profile updated successfully"}

@app.delete("/users/delete")
async def delete_own_account(data: UserDelete):
    # 1. Verify user exists
    user = await users_collection.find_one({"username": data.username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Verify credentials using secure hash
    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # 3. Delete user
    result = await users_collection.delete_one({"_id": user["_id"]})
    if result.deleted_count == 1:
        return {"message": f"Account for {data.username} has been successfully deleted"}
    
    raise HTTPException(status_code=500, detail="Failed to delete account")

@app.delete("/admin/users/delete")
async def delete_user_admin(data: AdminDelete):
    # 1. Verify Admin exists
    admin = await users_collection.find_one({"username": data.admin_username})
    
    if not admin:
        raise HTTPException(status_code=401, detail="Admin account not found")

    # 2. Verify Admin credentials using secure hash
    if not verify_password(data.admin_password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
        
    if admin.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Permission denied: Admins only")
    
    # 2. Verify target user exists
    target = await users_collection.find_one({"username": data.target_username})
    if not target:
        raise HTTPException(status_code=404, detail=f"User {data.target_username} not found")
        
    # 3. Delete target user
    result = await users_collection.delete_one({"_id": target["_id"]})
    if result.deleted_count == 1:
        return {"message": f"User {data.target_username} has been removed by admin"}
        
    raise HTTPException(status_code=500, detail="Failed to delete user")

@app.post("/analyze")
def analyze_palm(data: PalmData):
    # Use the same logic as PalmAI for consistency
    scores = {
        'vitality_index': data.vitality_index,
        'cognitive_index': data.cognitive_index,
        'emotional_index': data.emotional_index
    }
    predictions = PalmAI.get_predictions(scores)
    
    return {
        **predictions,
        "extracted_data": scores,
        "ai_confidence": 1.0 # Manual input is 100% confident in the values provided
    }

@app.post("/analyze-image")
async def analyze_palm_image(username: str, file: UploadFile = File(...)):
    # 1. Read file
    content = await file.read()
    
    # 2. AI Processing using OpenCV
    try:
        features = PalmAI.extract_features(content)
        predictions = PalmAI.get_predictions(features)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")
    
    # 3. Save to History
    history_entry = {
        "username": username,
        "filename": file.filename,
        "features": features,
        "predictions": predictions,
        "timestamp": os.getenv("CURRENT_TIME", "2026-01-29") # In real app use datetime.now()
    }
    await history_collection.insert_one(history_entry)
    
    # 4. Update user's current palm data
    result_data = {
        **predictions,
        "extracted_data": features,
        "ai_confidence": features.get("confidence", 0.85)
    }
    
    await users_collection.update_one(
        {"username": username},
        {"$set": {"palm_data": result_data}}
    )
    
    return result_data

@app.get("/users/{username}/history")
async def get_user_history(username: str):
    history = await history_collection.find({"username": username}).sort("_id", -1).to_list(50)
    for h in history:
        h["_id"] = str(h["_id"])
    return history

@app.get("/stats")
async def get_system_stats():
    user_count = await users_collection.count_documents({})
    analysis_count = await history_collection.count_documents({})
    return {
        "total_users": user_count,
        "total_analyses": analysis_count,
        "system_status": "Operational",
        "model_version": "v1.0.2-opencv"
    }

@app.post("/feedback")
async def submit_feedback(username: str, feedback: str, rating: int):
    # Simplified feedback storage in user doc or separate collection
    await users_collection.update_one(
        {"username": username},
        {"$push": {"feedback": {"comment": feedback, "rating": rating}}}
    )
    return {"message": "Feedback received. Thank you!"}

@app.post("/chat")
def chat_with_ai(chat: ChatMessage):
    msg = chat.message.lower()
    
    # 1. Check if user has context (palm data)
    if not chat.context:
        if any(word in msg for word in ["future", "predict", "reading", "love", "career", "health", "life", "behavior", "humor", "thinking"]):
             return {"response": "SYSTEM CALIBRATION REQUIRED. \n\nI cannot provide an analysis without a biological data point. Please proceed to the ANALYSIS module and upload or capture an image of your palm. Once the biometric data is processed, I can generate your personality and behavioral profile."}
        elif "hello" in msg or "hi" in msg:
             return {"response": "GREETINGS. I am the Palm Analysis AI. I am ready to process your palm biometric data to extract your behavioral profile."}
        else:
             return {"response": "Data input missing. I need the biometric mapping of your hand to provide an analysis. Please upload your palm image."}
    
    # 2. User HAS palm data
    else:
        c = chat.context
        cog = c.get("cognitive_profile", {})
        emo = c.get("emotional_profile", {})
        beh = c.get("behavioral_profile", {})
        extracted = c.get("extracted_data", {})
        
        vitality_score = extracted.get("vitality_index", 5)
        cognitive_score = extracted.get("cognitive_index", 5)
        emotional_score = extracted.get("emotional_index", 5)
        
        if "love" in msg or "relationship" in msg:
            return {"response": f"RELATIONSHIP DYNAMICS: {emo.get('relationship_dynamic', 'Developing')}. \n\nYour biometric emotional index (Score: {emotional_score}/10) indicates an emotional profile categorized as '{emo.get('eq_level', 'Balanced')}'. The data suggests your approach to partnerships is {emo.get('relationship_dynamic', 'evolving').lower()}."}
                 
        elif "career" in msg or "work" in msg or "job" in msg:
             return {"response": f"CAREER GUIDANCE: {beh.get('career_guidance', 'Technical Operations')}. \n\nWith a cognitive mapping score of {cognitive_score}/10, the AI model identifies your primary career trajectory in {beh.get('career_guidance', 'various technical fields')}. Your thinking style is '{cog.get('thinking_ability', 'Logical')}'."}
                 
        elif "behavior" in msg or "personality" in msg:
             return {"response": f"BEHAVIORAL PROFILE: {beh.get('type', 'Adaptable')}. \n\nYour biometric signature correlates with a '{beh.get('type', 'Fluid')}' behavioral type. This is driven by your vitality index (Score: {vitality_score}/10) and cognitive processing style."}

        elif "thinking" in msg or "iq" in msg:
             return {"response": f"COGNITIVE ANALYSIS: {cog.get('thinking_ability', 'Linear')}. \n\nYour IQ type is classified as '{cog.get('iq_type', 'Practical')}' based on your cognitive clarity mapping (Score: {cognitive_score}/10)."}

        elif "humor" in msg:
             return {"response": f"SENSE OF HUMOR: {emo.get('sense_of_humor', 'Observational')}. \n\nYour emotional-cognitive overlap suggests a {emo.get('sense_of_humor', 'unique').lower()} sense of humor."}

        elif "health" in msg or "life" in msg or "vitality" in msg:
            if vitality_score > 7:
                 return {"response": f"VITALITY ANALYSIS: ROBUST. \n\nYour vitality index is strongly defined (Score: {vitality_score}/10), correlating with high physical resilience and stamina. Note: This is a behavioral observation and not a medical diagnosis."}
            else:
                 return {"response": f"VITALITY ANALYSIS: MODERATE. \n\nYour vitality index (Score: {vitality_score}/10) suggests your energy levels are best managed through consistent rest and stress reduction protocols."}
                 
        elif "future" in msg:
             return {"response": f"BEHAVIORAL PROJECTION. \n\nBased on your biometric signature:\n- Thinking Style: {cog.get('thinking_ability')}\n- EQ Level: {emo.get('eq_level')}\n- Career Path: {beh.get('career_guidance')}\n\nThe convergence of these traits suggests a period of growth. Trust your {cog.get('thinking_ability', 'reasoning').lower()} when navigating upcoming complex decisions."}
             
        else:
             return {"response": "SYSTEM READY. \n\nI have analyzed your biometric patterns. You may inquire about: 'relationships', 'career/work', 'behavior', 'thinking style/IQ', or 'sense of humor'."}

@app.post("/report")
def generate_report(data: dict):
    filename = "report.pdf"
    c = canvas.Canvas(filename, pagesize=letter)
    
    # Header
    c.setFont("Helvetica-Bold", 24)
    c.drawString(100, 750, "BIOMETRIC ANALYSIS REPORT")
    c.setLineWidth(2)
    c.line(100, 740, 500, 740)
    
    # Biometric Data
    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, 710, "1. Biometric Extraction Data")
    c.setFont("Helvetica", 12)
    c.drawString(120, 690, f"Vitality Index: {data.get('vitality_index')}/10")
    c.drawString(120, 670, f"Cognitive Mapping: {data.get('cognitive_index')}/10")
    c.drawString(120, 650, f"Emotional Intelligence: {data.get('emotional_index')}/10")
    
    # Profiles
    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, 610, "2. Behavioral & Cognitive Profiling")
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(120, 590, "Cognitive Profile:")
    c.setFont("Helvetica", 11)
    # Note: When called from frontend, data is just extracted_data. 
    # But for a full report, we might need predictions.
    # For now, let's just use what's passed or generate simple labels.
    
    # Reuse simple logic if predictions aren't passed (which they aren't in the current frontend call)
    vs = data.get('vitality_index', 5)
    cs = data.get('cognitive_index', 5)
    es = data.get('emotional_index', 5)
    
    thinking = "Abstract & Strategic" if cs > 8 else "Logical & Linear" if cs > 6 else "Intuitive"
    career = "Leadership & Strategy" if cs > 7 and vs > 7 else "Creative Arts & Design" if cs > 7 else "Technical Operations"
    relationship = "Deeply Empathetic" if es > 7 else "Communicative & Rational" if cs > 7 else "Independent & Strong-willed"
    behavior = "Proactive & Driven" if vs > 7 else "Reflective & Methodical" if cs > 7 else "Adaptable & Fluid"

    c.drawString(140, 575, f"- Thinking Style: {thinking}")
    c.drawString(140, 560, f"- Career Trajectory: {career}")
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(120, 530, "Emotional Profile:")
    c.setFont("Helvetica", 11)
    c.drawString(140, 515, f"- Relationship Dynamic: {relationship}")
    c.drawString(140, 500, f"- Behavioral Type: {behavior}")
    
    # Recommendations
    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, 460, "3. AI Recommendations")
    c.setFont("Helvetica", 11)
    c.drawString(120, 440, f"• Your {thinking.lower()} thinking style is a key asset.")
    c.drawString(120, 420, f"• Professionally, you are best suited for {career}.")
    c.drawString(120, 400, f"• In relationships, you tend to be {relationship.lower()}.")

    # Footer
    c.setFont("Helvetica-Oblique", 10)
    c.setLineWidth(1)
    c.line(100, 120, 500, 120)
    c.drawString(100, 100, "Generated by Biometric AI System. For analytical and research purposes only.")
    
    c.save()
    return FileResponse(path=filename, filename="Biometric_Analysis_Report.pdf", media_type='application/pdf')

@app.get("/admin/users")
async def get_all_users():
    users = await users_collection.find().to_list(1000)
    # Convert ObjectId to str for JSON serialization
    for user in users:
        user["_id"] = str(user["_id"])
    return users

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
