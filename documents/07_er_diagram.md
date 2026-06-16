erDiagram
    %% 1. AI 학습용 원본 데이터 테이블
    BOOKINGS {
        VARCHAR2_50 hotel "호텔 타입"
        NUMBER lead_time "예약 선행 기간"
        VARCHAR2_50 country "국적"
        VARCHAR2_50 market_segment "예약 경로"
        NUMBER previous_cancellations "이전 취소 이력"
        VARCHAR2_50 customer_type "고객 유형"
        NUMBER adr "1박 평균 요금"
        NUMBER required_car_parking_spaces "주차 공간 필요성"
        NUMBER total_of_special_requests "추가 요청 사항 개수"
        NUMBER is_canceled "취소 여부 (정답 레이블)"
    }

    %% 2. 실시간 웹 서비스 연동 마스터 테이블
    USER_BOOKINGS {
        NUMBER id PK "고객 고유 번호 (Sequence 자동 할당)"
        VARCHAR2_100 customer_name "고객 이름"
        NUMBER birth_year "출생 연도"
        NUMBER birth_month "출생 월"
        NUMBER birth_day "출생 일"
        VARCHAR2_50 hotel_type "선택 호텔 종류"
        VARCHAR2_50 country "국적 여부"
        VARCHAR2_30 phone "연락처 (숫자형 문자열)"
        NUMBER lead_time "계산된 예약 선행일"
        VARCHAR2_30 adr "평균 객실 요금 등급"
        NUMBER previous_cancellations "이전 취소 횟수 (Default: 0)"
        VARCHAR2_100 market_segment "예약 경로 채널"
        VARCHAR2_100 customer_type "소비자 유형 카테고리"
        NUMBER required_car_parking_spaces "차량 주차 필요 여부"
        NUMBER total_of_special_requests "텍스트 분석 기반 요청 가중치"
        DATE created_at "예약 생성 일시 (DEFAULT: SYSDATE)"
        VARCHAR2_30 reservation_status "현재 예약 상태 (예약완료 / 예약취소됨)"
    }