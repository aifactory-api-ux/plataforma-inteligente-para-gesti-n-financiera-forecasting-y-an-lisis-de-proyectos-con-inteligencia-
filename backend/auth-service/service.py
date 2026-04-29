import logging
from datetime import datetime, timedelta
from typing import Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt

from shared.models import UserDB, User, UserCreate, UserUpdate, LoginRequest, LoginResponse, LogoutResponse
from shared.config import JWT_SECRET, JWT_EXPIRE_MINUTES
from shared.auth import hash_password, verify_password, create_access_token, decode_access_token
from backend.shared.db import get_db_session

logger = logging.getLogger("auth-service")


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def authenticate_user(self, email: str, password: str) -> Optional[UserDB]:
        result = await self.session.execute(select(UserDB).where(UserDB.email == email))
        user = result.scalar_one_or_none()
        if user and verify_password(password, user.hashed_password):
            return user
        return None

    async def create_user(self, user_data: UserCreate) -> UserDB:
        hashed = hash_password(user_data.password)
        user = UserDB(
            email=user_data.email,
            hashed_password=hashed,
            full_name=user_data.full_name,
            role=user_data.role,
        )
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def get_user_by_id(self, user_id: int) -> Optional[UserDB]:
        result = await self.session.execute(select(UserDB).where(UserDB.id == user_id))
        return result.scalar_one_or_none()

    async def get_user_by_email(self, email: str) -> Optional[UserDB]:
        result = await self.session.execute(select(UserDB).where(UserDB.email == email))
        return result.scalar_one_or_none()

    async def list_users(self) -> list[UserDB]:
        result = await self.session.execute(select(UserDB))
        return list(result.scalars().all())

    async def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[UserDB]:
        user = await self.get_user_by_id(user_id)
        if not user:
            return None
        if user_data.full_name is not None:
            user.full_name = user_data.full_name
        if user_data.role is not None:
            user.role = user_data.role
        if user_data.is_active is not None:
            user.is_active = user_data.is_active
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def delete_user(self, user_id: int) -> bool:
        user = await self.get_user_by_id(user_id)
        if not user:
            return False
        await self.session.delete(user)
        return True

    def generate_token(self, user: UserDB) -> str:
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value if hasattr(user.role, 'value') else user.role,
            "full_name": user.full_name,
        }
        return create_access_token(payload)
