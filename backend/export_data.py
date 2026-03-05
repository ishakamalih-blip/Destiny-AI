
import asyncio
import os
import json
import motor.motor_asyncio
from datetime import datetime
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

# Custom JSON Encoder for MongoDB types
class MongoEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

async def export_data():
    print("Connecting to database...")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.get_database("biometric_ai")
    
    # 1. Export Users
    print("Fetching users...")
    users_collection = db.get_collection("users")
    users = await users_collection.find({}).to_list(None)
    print(f"Found {len(users)} users.")

    # 2. Export History
    print("Fetching analysis history...")
    history_collection = db.get_collection("analysis_history")
    history = await history_collection.find({}).to_list(None)
    print(f"Found {len(history)} history records.")

    # Combine data
    export_data = {
        "export_date": datetime.now().isoformat(),
        "users": users,
        "analysis_history": history
    }

    # Save to file in the project root (one level up)
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database_export.json")
    
    print(f"Writing to {output_path}...")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(export_data, f, cls=MongoEncoder, indent=2)
    
    print("✅ Export complete!")
    print(f"You can now open 'database_export.json' in VS Code to view all your data.")

if __name__ == "__main__":
    asyncio.run(export_data())
