import time
import psycopg2

while True:
    try:
        conn = psycopg2.connect(
            host="postgres",
            dbname="jobs_db",
            user="postgres",
            password="postgres"
        )
        conn.close()
        print("✅ Database is ready!")
        break
    except psycopg2.OperationalError:
        print("⏳ Waiting for database...")
        time.sleep(2)