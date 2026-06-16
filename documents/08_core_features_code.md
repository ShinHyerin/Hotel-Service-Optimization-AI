# 🛠️ 08. 주요 기능 및 소스코드 (Core Features & Source Code)

본 문서는 Flask 백엔드 아키텍처의 핵심 엔드포인트인 실시간 취소 확률 예측 API(`/api/predict`)의 소스코드와 데이터 전처리 및 방어적 프로그래밍 구현 명세입니다.

---

## 1. 핵심 기능 및 로직 명세 (Feature Description)

프론트엔드로부터 비동기(Fetch API)로 수신된 데이터를 머신러닝 모델 추론에 적합하도록 실시간 가공하고 예외를 제어하는 핵심 서빙 아키텍처입니다.

| 핵심 로직 | 설명 (Description) |
| :--- | :--- |
| **데이터 동적 매핑** | 프론트엔드에서 전달된 정성적 요금 구간 데이터(`ADR`)를 머신러닝 모델의 학습 벤치마크 기준에 맞추어 실시간 수치화(`under_10` $\rightarrow$ `25` 등) 매핑 처리함. |
| **결측치 & 타입 방어** | 외부 입력값의 유효성을 백엔드 단에서 재검증하고, 문자열 누락 및 예외 발생 시 `to_numeric` 및 `fillna(0)`를 통해 수치형 타입 데이터의 강제 형변환 및 추론 안정성을 확보함. |
| **Unseen Data 보정** | 학습 데이터셋에 존재하지 않는 새로운 범주형 데이터(국적 등) 진입 시, 미리 로드된 라벨 인코더의 클래스 최빈값(`classes_[0]`)으로 수렴시키는 방어 로직을 설계하여 서버 런타임 에러(KeyError 등)를 원천 방지함. |
| **실시간 추론 및 반환** | 1차 및 2차 전처리가 완료된 정형 데이터프레임(`input_df`)을 활용하여 Random Forest 모델의 최종 취소 확률(`predict_proba`)을 연산하고, 이를 퍼센트(`%`) 단위의 비동기 대응용 JSON 포맷으로 최종 리턴함. |

---

## 2. 소스코드 구현 (Source Code - app.py)

```python
@app.route('/api/predict', methods=['POST'])
def api_predict():
    try:
        # 1. 요청 데이터 딕셔너리 파싱
        data = request.form.to_dict()

        # 프론트엔드 HTML 엘리먼트 또는 폼 데이터를 통해 모드 판별
        mode = data.get('PREDICT_MODE', 'hotel')

        if mode == 'hotel' and hotel_model is None:
            return jsonify({'error': '호텔 모델이 로드되지 않았습니다.'}), 500

        # 2. DataFrame 생성 및 컬럼명 대문자 맵핑 변환 (DB/Model 스키마 일치화)
        input_df = pd.DataFrame([data])
        input_df.columns = [col.upper() for col in input_df.columns]

        # 3. ADR(객실 평균 단가) 문자열 → 수치형 매핑 구간화 변환
        adr_mapping = {
            "under_10": 25,
            "10_20": 75,
            "20_30": 125,
            "30_40": 175,
            "over_40": 250
        }

        if 'ADR' in input_df.columns:
            input_df['ADR'] = input_df['ADR'].map(adr_mapping)

        # 4. 공통 수치형 데이터 타입 강제 형변환 및 결측치 방어
        numeric_cols = ['LEAD_TIME', 'PREVIOUS_CANCELLATIONS', 'ADR',
                        'REQUIRED_CAR_PARKING_SPACES', 'TOTAL_OF_SPECIAL_REQUESTS']
        for col in numeric_cols:
            if col in input_df.columns:
                input_df[col] = pd.to_numeric(input_df[col], errors='coerce').fillna(0)

        # 5. 모델 입력 대상 독립 변수(Feature) 선별
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

        # 6. 도메인 모드별 인코딩 및 추론 파이프라인 진행
        if mode == 'hotel':
            # 인코딩 처리 (호텔 전용 인코더 사전 매핑)
            for col, le in hotel_le_dict.items():
                if col in input_df.columns:
                    val = str(input_df[col].iloc[0])
                    
                    # 💡 [보정] 변환된 어레이 데이터에서 단일 스칼라 값만 꺼내오도록 [0] 인덱싱 처리 안전화
                    # 처음 보는 범주형 데이터(Unseen Data) 인입 시 예외 처리
                    if val not in le.classes_:
                        input_df[col] = le.transform([le.classes_[0]])[0]
                    else:
                        input_df[col] = le.transform([val])[0]

            # 최종 선별된 피처 순서에 맞춰 정렬
            input_df = input_df[selected_features]

            # 모델 추론 수행 (분류 결과 및 소수점 확률 추출)
            prediction = hotel_model.predict(input_df)[0]
            probability = hotel_model.predict_proba(input_df)[0][1]

        # 7. 연산 결과 데이터 타입 캐스팅 및 최종 JSON 반환
        cancel_prob = float(probability)
        return jsonify({
            'result': int(prediction),
            'prob': round(cancel_prob * 100, 2)  # 백분율 변환 및 소수점 둘째 자리 반올림
        })

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': str(e)}), 400