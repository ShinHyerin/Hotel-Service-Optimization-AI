# 🏨 Hotel-Service-Optimization-AI
> **AI 기술을 활용하여 호텔 및 공유 공간(공유오피스/세미나실)의 예약 취소율을 예측하고, 실시간 노쇼(No-Show)를 감지하여 공간 운영 효율성을 극대화하는 통합 스마트 관리 시스템입니다.**

---

## 📌 프로젝트 기획 배경
예약 기반 서비스 산업에서 **취소 및 노쇼(No-Show)**는 막대한 자원 낭비와 매출 손실을 야기합니다. 본 프로젝트는 이러한 문제를 데이터와 AI 기술로 해결하고자 두 가지 핵심 도메인을 연계하여 시스템을 구축했습니다.
1. **사전 방지 (Predictive AI):** 투숙 전 정형 데이터를 분석해 호텔 예약 취소 확률을 선제적으로 파악합니다.
2. **실시간 대응 (Computer Vision AI):** 예약된 세미나실/공유오피스의 실제 이용 여부를 실시간으로 모니터링하여 미사용 공간을 빠르게 재배치합니다.

---

## 📂 주요 기능 및 폴더 구조

### 1. 📊 호텔 예약 취소율 예측 웹 서비스 (`/01_Hotel_Cancellation_Prediction_Flask`)
- **목적:** 고객 데이터를 기반으로 실시간 예약 취소 가능성을 예측하여 노쇼 손실을 사전 방지합니다.
- **주요 기능:** 대시보드를 통한 취소 확률 시각화 및 머신러닝 Inference 웹 UI 제공
- **기술 스택:** Python, Flask, Scikit-learn, Pandas, HTML/CSS
- **상세 보기:** [👉 프로젝트 1 상세 README 바로가기](./01_Hotel_Cancellation_Prediction_Flask/README.md)

### 2. 🪑 세미나실/공유오피스 실시간 노쇼 감지 시스템 (`/02_Office_Noshow_Detection_YOLOv11`)
- **목적:** 최신 객체 탐지 모델을 활용하여 예약된 공유 공간 내 사람의 유무를 실시간으로 판별하고 노쇼를 감지합니다.
- **주요 기능:** CCTV/카메라 피드를 통한 공간 내 인원 탐지, 예약 시간 대조 후 빈 방 전환 알림 트리거
- **기술 스택:** Python, PyTorch, YOLOv11, Roboflow, OpenCV
- **상세 보기:** [👉 프로젝트 2 상세 README 바로가기](./02_Office_Noshow_Detection_YOLOv11/README.md)

### 3. 💬 [Up-coming] 공간 이용 안내 및 고객 응대 시스템 (`/03_Space_Assistant_SLM`)
- **목적:** 이용객의 편의를 돕고 예약을 유연하게 관리하기 위한 경량화 언어 모델(SLM) 기반의 맞춤형 상담 서비스입니다.

---

## 🛠️ 공통 개발 환경 및 설정
- **Language:** Python 3.x
- **Environment:** Windows / Linux (ASUS Hybrid GPU 환경 최적화 완료)
- 각 하위 프로젝트는 독립된 의존성을 가집니다. 구체적인 실행 방법 및 패키지 설치는 각 폴더 내의 `requirements.txt`와 `README.md`를 참고해 주세요.

---
## 👥 개발 멤버 및 역할
- **신해린 (Shin Hye Rin):** - 통합 시스템 아키텍처 설계
  - 호텔 예약 취소 데이터 전처리 및 머신러닝 모델링, Flask 웹 애플리케이션 개발
  - 공유오피스 데이터셋 라벨링(Roboflow) 및 YOLOv11 기반 실시간 객체 탐지 모델 학습/검증
