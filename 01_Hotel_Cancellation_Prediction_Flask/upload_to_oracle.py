import pandas as pd
from db_config import get_oracle_connection


def load_hotel_to_oracle(csv_path):
    print(f"🚀 Reading Hotel Data...")
    df = pd.read_csv(csv_path)

    # 필요한 컬럼만 필터링
    target_columns = [
        'hotel', 'lead_time', 'country',
        'market_segment', 'previous_cancellations',
        'customer_type', 'required_car_parking_spaces',
        'total_of_special_requests', 'is_canceled'
    ]
    df_final = df[target_columns].fillna({'country': 'Unknown'})

    # 💡 오라클 변환 에러 방지: 정수형 컬럼들의 타입을 확실하게 int로 지정
    int_columns = ['lead_time', 'previous_cancellations', 'required_car_parking_spaces', 'total_of_special_requests',
                   'is_canceled']
    for col in int_columns:
        if col in df_final.columns:
            df_final[col] = df_final[col].fillna(0).astype(int)

    # DB 연결 (사용자님의 Thick 모드 함수 사용)
    conn = get_oracle_connection()
    if not conn:
        return

    cursor = conn.cursor()

    # 데이터 삽입 SQL
    insert_sql = f"""
        INSERT INTO BOOKINGS (
            {', '.join(target_columns)}
        ) VALUES (
            {', '.join([':' + str(i + 1) for i in range(len(target_columns))])}
        )
    """

    data_tuples = [tuple(x) for x in df_final.values]

    try:
        # 기존 데이터 비우기 (테이블이 있을 때만)
        try:
            cursor.execute("TRUNCATE TABLE BOOKINGS")
        except:
            pass

        cursor.executemany(insert_sql, data_tuples)
        conn.commit()
        print(f"✨ Successfully loaded {len(data_tuples)} rows to Oracle (shin_v2)!")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    load_hotel_to_oracle('data/hotel_bookings.csv')