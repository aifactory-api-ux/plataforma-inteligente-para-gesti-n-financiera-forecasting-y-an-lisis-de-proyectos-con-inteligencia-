import logging
from datetime import datetime
from typing import Optional, List
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from shared.models import (
    ChatMessageDB, ChatMessageCreate,
    ProjectDB,
)
from shared.config import OPENAI_API_KEY, LLAMA3_API_URL, LLM_PROVIDER

logger = logging.getLogger("assistant-service")


class AssistantService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_project(self, project_id: int) -> Optional[ProjectDB]:
        result = await self.session.execute(select(ProjectDB).where(ProjectDB.id == project_id))
        return result.scalar_one_or_none()

    async def list_messages(self, project_id: int) -> List[ChatMessageDB]:
        result = await self.session.execute(
            select(ChatMessageDB)
            .where(ChatMessageDB.project_id == project_id)
            .order_by(ChatMessageDB.timestamp)
        )
        return list(result.scalars().all())

    async def create_message(self, project_id: int, message: str, sender: str = "user") -> ChatMessageDB:
        msg = ChatMessageDB(
            project_id=project_id,
            sender=sender,
            message=message,
            timestamp=datetime.utcnow(),
        )
        self.session.add(msg)
        await self.session.flush()
        await self.session.refresh(msg)
        return msg

    async def generate_response(self, project_id: int, user_message: str) -> str:
        project = await self.get_project(project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")

        history = await self.list_messages(project_id)
        context = self._build_context(project, history)

        if LLM_PROVIDER == "openai" and OPENAI_API_KEY:
            return await self._call_openai(user_message, context)
        else:
            return self._generate_fallback_response(user_message, project)

    def _build_context(self, project: ProjectDB, history: List[ChatMessageDB]) -> str:
        context = f"Project: {project.name}\n"
        if project.description:
            context += f"Description: {project.description}\n"
        context += f"Budget Total: {project.budget_total}\n"
        context += f"Execution Total: {project.execution_total}\n"
        context += f"Deviation: {project.deviation}\n"
        context += "\nRecent conversation:\n"
        for msg in history[-10:]:
            context += f"{msg.sender}: {msg.message}\n"
        return context

    async def _call_openai(self, message: str, context: str) -> str:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are FinSight, an AI assistant for project financial management and forecasting."},
                    {"role": "system", "content": f"Context:\n{context}"},
                    {"role": "user", "content": message},
                ],
                max_tokens=500,
            )
            return response.choices[0].message.content or "I apologize, I couldn't generate a response."
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return self._generate_fallback_response(message, None)

    def _generate_fallback_response(self, message: str, project: Optional[ProjectDB]) -> str:
        msg_lower = message.lower()
        if "budget" in msg_lower or "presupuesto" in msg_lower:
            if project:
                return f"Based on the current data for {project.name}, the total budget is €{project.budget_total:,.2f} with €{project.execution_total:,.2f} executed ({project.deviation:.1f}% deviation)."
            return "The budget information is not available at the moment."
        elif "risk" in msg_lower or "riesgo" in msg_lower:
            return "I recommend reviewing the risk panel for current risks. High-impact, high-probability risks should be prioritized for mitigation."
        elif "forecast" in msg_lower or "pronóstico" in msg_lower:
            return "I can help generate forecasts. Please use the forecasting section to create scenario simulations with optimism, expected, or critical parameters."
        elif "recommend" in msg_lower or "recomend" in msg_lower:
            return "Based on AI analysis, I recommend focusing on cost control and schedule adherence to minimize deviation. Regular budget reviews are advised."
        else:
            return "I'm here to help with project financial management, forecasting, risks, and recommendations. How can I assist you today?"
