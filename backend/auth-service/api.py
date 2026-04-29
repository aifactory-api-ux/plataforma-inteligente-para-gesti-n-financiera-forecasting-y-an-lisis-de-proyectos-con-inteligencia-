import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from shared.models import LoginRequest, LoginResponse, LogoutResponse, User, UserCreate, UserUpdate
from backend.shared.db import get_db_session
from backend.shared.auth import get_current_user
from service import AuthService

logger = logging.getLogger("auth-service")
router = APIRouter(prefix="/auth", tags=["auth"])


async def get_auth_service(session: AsyncSession = Depends(get_db_session)) -> AuthService:
    return AuthService(session)


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    logger.info(f"Login attempt for: {request.email}")
    user = await auth_service.authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )
    token = auth_service.generate_token(user)
    user_model = User(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )
    logger.info(f"Login successful for: {request.email}")
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user_model,
    )


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    current_user: dict = Depends(get_current_user),
):
    logger.info(f"Logout for user: {current_user.get('email')}")
    return LogoutResponse(success=True)


@router.get("/me", response_model=User)
async def get_me(
    current_user: dict = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    user_id = int(current_user.get("sub"))
    user = await auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return User(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )


user_router = APIRouter(prefix="/users", tags=["users"])


@user_router.get("/", response_model=list[User])
async def list_users(
    current_user: dict = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    users = await auth_service.list_users()
    return [
        User(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role.value if hasattr(u.role, 'value') else u.role,
            is_active=u.is_active,
            created_at=u.created_at,
        )
        for u in users
    ]


@user_router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: dict = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    existing = await auth_service.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = await auth_service.create_user(user_data)
    return User(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@user_router.patch("/{user_id}", response_model=User)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    user = await auth_service.update_user(user_id, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return User(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, 'value') else user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@user_router.delete("/{user_id}", response_model=LogoutResponse)
async def delete_user(
    user_id: int,
    current_user: dict = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    success = await auth_service.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return LogoutResponse(success=True)
