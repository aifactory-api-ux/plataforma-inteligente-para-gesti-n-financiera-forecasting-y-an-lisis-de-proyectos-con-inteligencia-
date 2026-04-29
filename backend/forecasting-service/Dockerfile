FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/forecasting-service/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY shared /app/shared
COPY backend/shared /app/backend/shared
COPY backend/forecasting-service /app/backend/forecasting-service

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8003

CMD ["uvicorn", "backend.forecasting-service.main:app", "--host", "0.0.0.0", "--port", "8003"]
