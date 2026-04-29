from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
import logging

logger = logging.getLogger("etl_execution")

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "start_date": datetime(2024, 1, 1),
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
}


def extract_execution(**context):
    logger.info("Extracting execution data from legacy database")
    hook = PostgresHook(postgres_conn_id="legacy_db")
    records = hook.get_records("""
        SELECT bi.id, bi.budget_version_id, bi.name, bi.phase,
               bi.amount_planned, bi.amount_executed, bi.deviation, bi.status
        FROM budget_items bi
    """)
    logger.info(f"Extracted {len(records)} budget items")
    return records


def transform_execution(**context):
    ti = context["ti"]
    records = ti.xcom_pull(task_ids="extract_execution")
    transformed = []
    for r in records:
        transformed.append({
            "id": r[0],
            "budget_version_id": r[1],
            "name": r[2],
            "phase": r[3],
            "amount_planned": r[4] or 0.0,
            "amount_executed": r[5] or 0.0,
            "deviation": r[6] or 0.0,
            "status": r[7],
        })
    logger.info(f"Transformed {len(transformed)} budget items")
    return transformed


def load_execution(**context):
    ti = context["ti"]
    records = ti.xcom_pull(task_ids="transform_execution")
    hook = PostgresHook(postgres_conn_id="fin_platform_db")
    for r in records:
        hook.run(
            """
            INSERT INTO budget_items (id, budget_version_id, name, phase, amount_planned, amount_executed, deviation, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (id) DO UPDATE SET
                amount_planned = EXCLUDED.amount_planned,
                amount_executed = EXCLUDED.amount_executed,
                deviation = EXCLUDED.deviation,
                status = EXCLUDED.status
            """,
            parameters=(r["id"], r["budget_version_id"], r["name"], r["phase"],
                       r["amount_planned"], r["amount_executed"], r["deviation"], r["status"]),
        )
    logger.info(f"Loaded {len(records)} budget items")

    hook = PostgresHook(postgres_conn_id="fin_platform_db")
    hook.run("UPDATE projects p SET execution_total = COALESCE((SELECT SUM(bi.amount_executed) FROM budget_items bi JOIN budget_versions bv ON bi.budget_version_id = bv.id WHERE bv.project_id = p.id), 0)")


with DAG(
    "etl_execution",
    default_args=default_args,
    description="ETL pipeline for execution data from legacy DB",
    schedule_interval="0 */6 * * *",
    catchup=False,
) as dag:
    extract = PythonOperator(task_id="extract_execution", python_callable=extract_execution)
    transform = PythonOperator(task_id="transform_execution", python_callable=transform_execution)
    load = PythonOperator(task_id="load_execution", python_callable=load_execution)

    extract >> transform >> load
