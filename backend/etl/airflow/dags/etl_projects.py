from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.postgres_operator import PostgresOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
import logging

logger = logging.getLogger("etl_projects")

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "start_date": datetime(2024, 1, 1),
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
}


def extract_projects(**context):
    logger.info("Extracting projects from legacy database")
    hook = PostgresHook(postgres_conn_id="legacy_db")
    records = hook.get_records("SELECT id, name, description, status, budget_total, start_date, end_date FROM projects")
    logger.info(f"Extracted {len(records)} projects")
    return records


def transform_projects(**context):
    ti = context["ti"]
    records = ti.xcom_pull(task_ids="extract_projects")
    transformed = []
    for r in records:
        transformed.append({
            "id": r[0],
            "name": r[1],
            "description": r[2],
            "status": r[3],
            "budget_total": r[4] or 0.0,
            "start_date": r[5],
            "end_date": r[6],
        })
    logger.info(f"Transformed {len(transformed)} projects")
    return transformed


def load_projects(**context):
    ti = context["ti"]
    records = ti.xcom_pull(task_ids="transform_projects")
    hook = PostgresHook(postgres_conn_id="fin_platform_db")
    for r in records:
        hook.run(
            """
            INSERT INTO projects (id, name, description, status, budget_total, start_date, end_date, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                status = EXCLUDED.status,
                budget_total = EXCLUDED.budget_total,
                end_date = EXCLUDED.end_date
            """,
            parameters=(r["id"], r["name"], r["description"], r["status"], r["budget_total"], r["start_date"], r["end_date"]),
        )
    logger.info(f"Loaded {len(records)} projects")


with DAG(
    "etl_projects",
    default_args=default_args,
    description="ETL pipeline for projects data from legacy DB",
    schedule_interval="0 */6 * * *",
    catchup=False,
) as dag:
    extract = PythonOperator(task_id="extract_projects", python_callable=extract_projects)
    transform = PythonOperator(task_id="transform_projects", python_callable=transform_projects)
    load = PythonOperator(task_id="load_projects", python_callable=load_projects)

    extract >> transform >> load
