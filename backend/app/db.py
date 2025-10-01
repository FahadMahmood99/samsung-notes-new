from motor.motor_asyncio import AsyncIOMotorClient
from .core.config import settings
from pymongo.server_api import ServerApi

from pymongo.server_api import ServerApi

client = AsyncIOMotorClient(
    settings.MONGODB_URI,
    server_api=ServerApi('1')
)
db = client.get_database("samsung-notes")

async def get_db():
    return db