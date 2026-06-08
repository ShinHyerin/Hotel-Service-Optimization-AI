import oracledb

# Thick mode 초기화 (프로그램 시작 시 1회)
oracledb.init_oracle_client(
    lib_dir=r"C:\oraclexe\app\oracle\product\11.2.0\server\BIN"
)

DB_CONFIG = {
    "user": "shin_v2",
    "password": "123456",
    "dsn": "localhost:1521/xe"
}


def get_oracle_connection():
    try:
        conn = oracledb.connect(
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            dsn=DB_CONFIG["dsn"]
        )

        print("✅ Oracle 연결 성공!")
        return conn

    except Exception as e:
        print(f"❌ DB 연결 실패: {e}")
        return None