import asyncio
import motor.motor_asyncio
import os
import json
import bcrypt
from dotenv import load_dotenv

load_dotenv()

async def check_and_migrate():
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client.get_database("biometric_ai")
    users_coll = db.users
    
    # Check existing users
    count = await users_coll.count_documents({})
    print(f"Current users in DB: {count}")
    
    if count > 0:
        async for user in users_coll.find({}, {"_id": 0, "username": 1, "password": 1}):
            print(f"  - {user['username']}: {user['password'][:20]}...")
    else:
        print("No users found. Forcing migration from users.json...")
        
        # Delete index to allow re-insertion
        try:
            await users_coll.drop_index("username_1")
            await users_coll.drop_index("email_1")
        except:
            pass
        
        # Load and hash users
        def get_password_hash(password):
            if isinstance(password, str):
                password = password.encode('utf-8')
            password = password[:72]
            salt = bcrypt.gensalt()
            return bcrypt.hashpw(password, salt).decode('utf-8')
        
        with open("users.json", "r") as f:
            users = json.load(f)
            
        for user in users:
            user["password"] = get_password_hash(user["password"])
        
        result = await users_coll.insert_many(users)
        print(f"Inserted {len(result.inserted_ids)} users")
        
        for user in users:
            print(f"  - {user['username']}: {user['password'][:20]}...")
    
    client.close()

asyncio.run(check_and_migrate())
