import asyncio
import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def reset_db():
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.get_database("biometric_ai")
    
    # Drop users collection to force re-migration from users.json
    await db.users.drop()
    print("✅ Dropped users collection")
    
    client.close()

asyncio.run(reset_db())
