import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from shared.models import ChatMessage, ChatMessageCreate
from backend.shared.db import get_db_session
from backend.shared.auth import get_current_user
from service import AssistantService

logger = logging.getLogger("assistant-service")
router = APIRouter(prefix="/projects/{project_id}/chat", tags=["chat"])


async def get_assistant_service(session: AsyncSession = Depends(get_db_session)) -> AssistantService:
    return AssistantService(session)


@router.get("/", response_model=list[ChatMessage])
async def list_chat_messages(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    service: AssistantService = Depends(get_assistant_service),
):
    messages = await service.list_messages(project_id)
    return [
        ChatMessage(
            id=m.id,
            project_id=m.project_id,
            sender=m.sender.value if hasattr(m.sender, 'value') else m.sender,
            message=m.message,
            timestamp=m.timestamp,
        )
        for m in messages
    ]


@router.post("/", response_model=ChatMessage, status_code=status.HTTP_201_CREATED)
async def create_chat_message(
    project_id: int,
    message_data: ChatMessageCreate,
    current_user: dict = Depends(get_current_user),
    service: AssistantService = Depends(get_assistant_service),
):
    try:
        user_msg = await service.create_message(project_id, message_data.message, "user")
        response_text = await service.generate_response(project_id, message_data.message)
        assistant_msg = await service.create_message(project_id, response_text, "assistant")
        return ChatMessage(
            id=assistant_msg.id,
            project_id=assistant_msg.project_id,
            sender=assistant_msg.sender.value if hasattr(assistant_msg.sender, 'value') else assistant_msg.sender,
            message=assistant_msg.message,
            timestamp=assistant_msg.timestamp,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
