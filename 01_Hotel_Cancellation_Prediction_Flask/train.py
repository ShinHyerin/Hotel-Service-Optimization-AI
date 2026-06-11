import pandas as pd
import os
import joblib
import numpy as np
from db_config import get_oracle_connection
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report


def train_model():
    # 1. 데이터 로드
    print("🚀 Oracle에서 데이터를 불러오는 중...")
    conn = get_oracle_connection()
    if not conn: return
    query = "SELECT * FROM BOOKINGS"
    df = pd.read_sql(query, conn)
    conn.close()

    # 컬럼명 대문자 통일
    df.columns = [col.upper() for col in df.columns]

    # 2. 전처리: 불필요한 단가(ADR) 필터링 대신 피처 자체를 나중에 제외함
    # 데이터 정제 (기본적인 것만 유지)
    df['COUNTRY'] = df['COUNTRY'].apply(lambda x: 'PRT' if x == 'PRT' else 'Foreign')
    main_segments = ['Corporate', 'Direct', 'Groups', 'Offline TA/TO', 'Online TA']
    df['MARKET_SEGMENT'] = df['MARKET_SEGMENT'].apply(lambda x: x if x in main_segments else 'Other')

    # 3. 💡 피처 선택 (ADR 제거, HOTEL 추가)
    selected_features = [
        'HOTEL',  # City Hotel vs Resort Hotel 구분 핵심
        'LEAD_TIME',
        'COUNTRY',
        'MARKET_SEGMENT',
        'PREVIOUS_CANCELLATIONS',
        'CUSTOMER_TYPE',
        'ADR',
        'REQUIRED_CAR_PARKING_SPACES',
        'TOTAL_OF_SPECIAL_REQUESTS'
    ]

    X = df[selected_features].copy()
    y = df['IS_CANCELED']

    # 4. 데이터 분할
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 5. 💡 인코딩 (HOTEL 포함)
    le_dict = {}
    cat_cols = ['HOTEL', 'COUNTRY', 'MARKET_SEGMENT', 'CUSTOMER_TYPE']
    for col in cat_cols:
        le = LabelEncoder()
        X_train[col] = le.fit_transform(X_train[col].astype(str))

        # 테스트 데이터 세트의 UNKNOWN 처리 로직
        X_test[col] = X_test[col].astype(str).apply(lambda x: x if x in le.classes_ else 'UNKNOWN')
        if 'UNKNOWN' not in le.classes_:
            le.classes_ = np.append(le.classes_, 'UNKNOWN')
        X_test[col] = le.transform(X_test[col])

        le_dict[col] = le

    # 6. 모델 생성 및 학습
    print("🧠 [통합 모델] 학습을 시작합니다...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        class_weight='balanced'
    )

    model.fit(X_train, y_train)

    # 7. 성능 검증 및 중요도 출력
    y_pred = model.predict(X_test)
    print(f"✅ 학습 완료! 정확도: {accuracy_score(y_test, y_pred):.4f}")

    print("\n[상세 성능 지표]")
    print(classification_report(y_test, y_pred))

    # 피처 중요도 출력
    importance_df = pd.DataFrame({
        'Feature': selected_features,
        'Importance': model.feature_importances_
    }).sort_values(by='Importance', ascending=False)

    print("\n📌 Feature Importance")
    print(importance_df)

    # 8. 파일 저장
    model_dir = 'models'
    if not os.path.exists(model_dir): os.makedirs(model_dir)

    # 파일명은 그대로 유지하여 Flask 로직 호환성 유지
    joblib.dump(model, os.path.join(model_dir, 'hotel_model.pkl'))
    joblib.dump(le_dict, os.path.join(model_dir, 'label_encoders.pkl'))
    print(f"\n✨ 통합 모델 저장 완료!")


if __name__ == "__main__":
    train_model()