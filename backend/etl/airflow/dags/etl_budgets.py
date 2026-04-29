from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
import logging

logger = logging.getLogger("etl_budgets")

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "start_date": datetime(2024, 1, 1),
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
}


def extract_budgets(**context):
    logger.info("Extracting budgets from legacy database")
    hook = PostgresHook(postgres_conn_id="legacy_db")
    records = hook.get_records("""
        SELECT id, project_id, version, is_baseline, created_at
        FROM budget_versions
    """)
    logger.info(f"Extracted {len(records)} budget versions")
    return records


def transform_budgets(**context):
    ti = context["ti"]
    records = ti.xcom_pull(task_ids="extract_budgets")
    transformed = []
    for r in records:
        transformed.append({
            "id": r[0],
            "project_id": r[1],
            "version": r[2],
            "is_baseline": r[3],
            "created_at": r[4],
        })
    logger.info(f"Transformed {len(transformed)} budget versions")
    return transformed


def load_budgets(**context):
    ti = context["ti"]
    records = ti.xcom_pull(task_ids="transform_budgets")
    hook = PostgresHook(postgres_conn_id="fin_platform_db")
    for r in records:
        hook.run(
            """
            INSERT INTO budget_versions (id, project_id, version, is_baseline, created_at)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                version = EXCLUDED.version,
                is_baseline = EXCLUDED.is_baseline
            """,
            parameters=(r["id"], r["project_id"], r["version"], r["is_baseline"], r["created_at"]),
        )
    logger.info(f"Loaded {len(records)} budget versions")


with DAG(
    "etl_budgets",
    default_args=default_args,
    description="ETL pipeline for budget data from legacy DB",
    schedule_interval="0 */6 * * *",
    catchup=False,
) as dag:
    extract = PythonOperator(task_id="extract_budgets", python_callable=extract_budgets)
    transform = PythonOperator(task_id="transform_budgets", python_callable=transform_budgets)
    load = PythonOperator(task_id="load_budgets", python_callable=load_budgets)

    extract >> transform >> load
