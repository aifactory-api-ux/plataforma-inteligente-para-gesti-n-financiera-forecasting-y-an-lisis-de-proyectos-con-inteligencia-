FROM apache/airflow:2.9.3

WORKDIR /app

COPY backend/etl/airflow/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY backend/etl/airflow/dags /app/dags

ENV PYTHONPATH=/app
ENV AIRFLOW__CORE__SQL_ALCHEMY_CONN=postgresql+psycopg2://admin:secretpw@postgres:5432/fin_platform
ENV AIRFLOW__CORE__FERNET_KEY=ZmFyMDEza2V5MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=
ENV AIRFLOW__API__AUTH_BACKEND=airflow.api.auth.backend.basic_auth

EXPOSE 8080

CMD ["airflow", "webserver"]
