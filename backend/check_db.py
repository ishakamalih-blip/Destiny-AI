
import asyncio
import os
import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv()

async def check_history():
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.get_database("biometric_ai")
    history_collection = db.get_collection("analysis_history")
    
    count = await history_collection.count_documents({})
    print(f"Total history records: {count}")
    
    if count > 0:
        cursor = history_collection.find().limit(5)
        async for doc in cursor:
            print(f"User: {doc.get('username')}, Date: {doc.get('timestamp')}")

if __name__ == "__main__":
    asyncio.run(check_history())
