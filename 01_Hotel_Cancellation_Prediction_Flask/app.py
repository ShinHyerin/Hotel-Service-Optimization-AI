from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
import os
from db_config import get_oracle_connection

app = Flask(__name__)

# ==========================================
# 1. 모델/인코더 로드 파트
# ==========================================
MODELS_DIR = 'models'

hotel_model_path = os.path.join(MODELS_DIR, 'hotel_model.pkl')
hotel_encoder_path = os.path.join(MODELS_DIR, 'label_encoders.pkl')

# 호텔 모델 로드
if os.path.exists(hotel_model_path):
    hotel_model = joblib.load(hotel_model_path)
    hotel_le_dict = joblib.load(hotel_encoder_path)
    print("✅ 호텔 예측 AI 모델 로드 완료!")
else:
    print("❌ 호텔 모델 파일 없음")
    hotel_model, hotel_le_dict = None, None


# ==========================================
# 2. 페이지 라우팅 패키지
# ==========================================
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict')
def predict():
    return render_template('predict.html')


@app.route('/search')
def search_page():
    return render_template('search.html')


# ==========================================
# 3. 통합 API 처리 함수 (실시간 취소 확률 분석)
# ==========================================
@app.route('/api/predict', methods=['POST'])
def api_predict():
    try:
        data = request.form.to_dict()

        # 프론트엔드 HTML 엘리먼트 또는 폼 데이터를 통해 모드 판별
        mode = data.get('PREDICT_MODE', 'hotel')

        if mode == 'hotel' and hotel_model is None:
            return jsonify({'error': '호텔 모델이 로드되지 않았습니다.'}), 500

        # DataFrame 생성 및 컬럼명 대문자 맵핑 변환
        input_df = pd.DataFrame([data])
        input_df.columns = [col.upper() for col in input_df.columns]

        # ADR 문자열 → 숫자 변환
        adr_mapping = {
            "under_10": 25,
            "10_20": 75,
            "20_30": 125,
            "30_40": 175,
            "over_40": 250
        }

        if 'ADR' in input_df.columns:
            input_df['ADR'] = input_df['ADR'].map(adr_mapping)

        # 공통 수치형 데이터 타입 강제 형변환
        numeric_cols = ['LEAD_TIME', 'PREVIOUS_CANCELLATIONS', 'ADR',
                        'REQUIRED_CAR_PARKING_SPACES', 'TOTAL_OF_SPECIAL_REQUESTS']
        for col in numeric_cols:
            if col in input_df.columns:
                input_df[col] = pd.to_numeric(input_df[col], errors='coerce').fillna(0)


        selected_features = [
            'HOTEL',
            'LEAD_TIME',
            'COUNTRY',
            'MARKET_SEGMENT',
            'PREVIOUS_CANCELLATIONS',
            'CUSTOMER_TYPE',
            'ADR',
            'REQUIRED_CAR_PARKING_SPACES',
            'TOTAL_OF_SPECIAL_REQUESTS'
        ]

        if mode == 'hotel':
            # 인코딩 처리 (호텔 전용 인코더 사전 매핑)
            for col, le in hotel_le_dict.items():
                if col in input_df.columns:
                    val = str(input_df[col].iloc[0])
                    # 💡 [보정] 변환된 어레이 데이터에서 단일 스칼라 값만 꺼내오도록 [0] 인덱싱 처리 안전화
                    if val not in le.classes_:
                        input_df[col] = le.transform([le.classes_[0]])[0]
                    else:
                        input_df[col] = le.transform([val])[0]

            input_df = input_df[selected_features]

            # print(input_df)

            prediction = hotel_model.predict(input_df)[0]
            probability = hotel_model.predict_proba(input_df)[0][1]

            # print(prediction)
            # print(probability)

        # 연산 결과 최종 리턴
        cancel_prob = float(probability)
        return jsonify({
            'result': int(prediction),
            'prob': round(cancel_prob * 100, 2)
        })

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': str(e)}), 400


# ==========================================
# 4. 예약 처리 펑션 (DB 인서트 연동)
# ==========================================
@app.route('/api/reserve', methods=['POST'])
def reserve():
    try:
        data = request.form.to_dict()
        conn = get_oracle_connection()

        if not conn:
            return jsonify({'error': 'DB 연결 실패'}), 500

        cursor = conn.cursor()

        insert_sql = """
            INSERT INTO USER_BOOKINGS (
                CUSTOMER_NAME,
                BIRTH_YEAR,
                BIRTH_MONTH,
                BIRTH_DAY,
                HOTEL_TYPE,
                COUNTRY,
                PHONE,
                LEAD_TIME,
                PREVIOUS_CANCELLATIONS,
                MARKET_SEGMENT,
                CUSTOMER_TYPE,
                ADR,
                REQUIRED_CAR_PARKING_SPACES,
                TOTAL_OF_SPECIAL_REQUESTS
            )
            VALUES (
                :1, :2, :3, :4,
                :5, :6, :7, :8,
                :9, :10, :11, :12,
                :13, :14
            )
        """

        values = (
            data.get('customer_name'),
            data.get('birth_year'),
            data.get('birth_month'),
            data.get('birth_day'),
            data.get('hotel_type'),
            data.get('country'),
            data.get('phone'),
            data.get('lead_time'),
            data.get('previous_cancellations'),
            data.get('market_segment'),
            data.get('customer_type'),
            data.get('adr'),
            data.get('required_car_parking_spaces'),
            data.get('total_of_special_requests')
        )

        cursor.execute(insert_sql, values)
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': '예약 완료'
        })

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400


# ==========================================
# 5. [수정 완료] 예약 이력 및 현황 조회 (JSON 반환 구조 통합)
# ==========================================
@app.route('/search_booking', methods=['POST'])
def search_booking():
    try:
        customer_name = request.form.get('customer_name')
        birth_year = request.form.get('birth_year')
        birth_month = request.form.get('birth_month')
        birth_day = request.form.get('birth_day')
        phone = request.form.get('phone')

        conn = get_oracle_connection()
        if not conn:
            return jsonify({'error': '데이터베이스 연결에 실패했습니다.'}), 500

        cursor = conn.cursor()

        sql = """
            SELECT
                ID,
                CUSTOMER_NAME,
                HOTEL_TYPE,
                PHONE,
                LEAD_TIME,
                MARKET_SEGMENT,
                CUSTOMER_TYPE,
                CREATED_AT,
                RESERVATION_STATUS
            FROM USER_BOOKINGS
            WHERE CUSTOMER_NAME = :1
            AND BIRTH_YEAR = :2
            AND BIRTH_MONTH = :3
            AND BIRTH_DAY = :4
            AND PHONE = :5
            ORDER BY CREATED_AT DESC
        """

        cursor.execute(sql, (customer_name, birth_year, birth_month, birth_day, phone))
        rows = cursor.fetchall()

        booking_list = []
        for row in rows:
            booking_list.append({
                'id': row[0],
                'customer_name': row[1],
                'hotel_type': row[2],
                'phone': row[3],
                'lead_time': row[4],
                'market_segment': row[5],
                'customer_type': row[6],
                'created_at': str(row[7]) if row[7] else '',  # 데이트 타임 문자열 안전화
                'status': row[8]
            })

        cursor.close()
        conn.close()

        # 💡 [정정] 통합 search.js 플러그인이 데이터를 수신할 수 있도록 오직 순수 JSON 데이터만 반환합니다!
        return jsonify({
            'success': True,
            'booking_list': booking_list
        })

    except Exception as e:
        print(f"Search Error: {e}")
        return jsonify({'error': '조회 중 서버 오류가 발생했습니다.'}), 500


# ==========================================
# 6. 예약 취소 시스템 단독 펑션
# ==========================================
@app.route('/cancel_booking/<int:booking_id>', methods=['POST'])
def cancel_booking(booking_id):

    conn = get_oracle_connection()
    cursor = conn.cursor()

    sql = """
        UPDATE USER_BOOKINGS
        SET
            RESERVATION_STATUS = '예약취소됨',
            PREVIOUS_CANCELLATIONS =
                NVL(PREVIOUS_CANCELLATIONS, 0) + 1
        WHERE ID = :1
    """

    cursor.execute(sql, (booking_id,))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'success': True})

# ==========================================
# 6-1. 전체 예약 취소율 통계 API
# ==========================================
@app.route('/api/chart-data')
def chart_data():

    try:
        conn = get_oracle_connection()

        if not conn:
            return jsonify({'error': 'DB 연결 실패'}), 500

        query = """
            SELECT
                HOTEL_TYPE,
                LEAD_TIME,
                COUNTRY,
                MARKET_SEGMENT,
                PREVIOUS_CANCELLATIONS,
                CUSTOMER_TYPE,
                ADR,
                REQUIRED_CAR_PARKING_SPACES,
                TOTAL_OF_SPECIAL_REQUESTS
            FROM USER_BOOKINGS
        """

        df = pd.read_sql(query, conn)

        conn.close()

        if df.empty:
            return jsonify({
                'resort_rate': 0,
                'city_rate': 0
            })

        # 모델 컬럼명 맞추기
        df.columns = [
            'HOTEL',
            'LEAD_TIME',
            'COUNTRY',
            'MARKET_SEGMENT',
            'PREVIOUS_CANCELLATIONS',
            'CUSTOMER_TYPE',
            'ADR',
            'REQUIRED_CAR_PARKING_SPACES',
            'TOTAL_OF_SPECIAL_REQUESTS'
        ]

        # 숫자형 변환
        numeric_cols = [
            'LEAD_TIME',
            'PREVIOUS_CANCELLATIONS',
            'ADR',
            'REQUIRED_CAR_PARKING_SPACES',
            'TOTAL_OF_SPECIAL_REQUESTS'
        ]

        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        # 인코딩
        for col, le in hotel_le_dict.items():

            if col in df.columns:

                df[col] = df[col].apply(
                    lambda x:
                    le.transform([str(x)])[0]
                    if str(x) in le.classes_
                    else le.transform([le.classes_[0]])[0]
                )

        # Resort 평균 확률
        resort_df = df[df['HOTEL'] == hotel_le_dict['HOTEL'].transform(['Resort Hotel'])[0]]

        # City 평균 확률
        city_df = df[df['HOTEL'] == hotel_le_dict['HOTEL'].transform(['City Hotel'])[0]]

        resort_rate = 0
        city_rate = 0

        if not resort_df.empty:

            probs = hotel_model.predict_proba(resort_df)[:, 1]

            resort_rate = round(probs.mean() * 100, 2)

        if not city_df.empty:

            probs = hotel_model.predict_proba(city_df)[:, 1]

            city_rate = round(probs.mean() * 100, 2)

        return jsonify({
            'resort_rate': resort_rate,
            'city_rate': city_rate
        })

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)