FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/assistant-service/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY shared /app/shared
COPY backend/shared /app/backend/shared
COPY backend/assistant-service /app/backend/assistant-service

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8004

CMD ["uvicorn", "backend.assistant-service.main:app", "--host", "0.0.0.0", "--port", "8004"]
