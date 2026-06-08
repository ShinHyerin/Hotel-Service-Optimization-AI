from db_config import get_oracle_connection

conn = get_oracle_connection()

if conn:
    print("연결 완료")
    conn.close()
