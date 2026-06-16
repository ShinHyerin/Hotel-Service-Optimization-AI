# 🛠️ 03. 사용 기술 및 경험 (Tech Stack & Experiences)

본 통합 솔루션을 구현하기 위해 활용한 기술 스택과 각 프로젝트별 핵심 기술 경험(Deep Dive) 정리입니다.

---

## 1. 사용 기술 목록 (Tech Stack & Versions)

| 분류 | 기술 및 라이브러리 | 버전 (Version) | 용도 및 핵심 역할 |
| :---: | :--- | :---: | :--- |
| **Languages &<br>Frameworks** | • Python<br>• Flask<br>• HTML5 / CSS3 / JavaScript | v3.11.9<br>v3.0.3<br>- | • 메인 개발 언어 및 백엔드 파이프라인 구축<br>• B2C 실시간 예측 웹 서비스 구현<br>• 비동기 프론트엔드 UI/UX 구현 |
| **Database &<br>Connectors** | • Oracle Database XE<br>• Oracle Instant Client<br>• oracledb (Python Lib)<br>• SQL Developer | 11g R2<br>v19.25.0.0<br>v1.4.2<br>v19.2.1 | • 대용량 예약 데이터 적재 및 사용자 데이터 관리<br>• Thick Mode 연동 및 Python-Oracle 커넥션 제어<br>• SQL 쿼리 검증 및 DB 데이터베이스 객체 관리 |
| **Data Science &<br>Machine Learning** | • scikit-learn<br>• pandas<br>• numpy<br>• scipy<br>• joblib | v1.8.0<br>v3.0.3<br>v2.4.4<br>v1.17.1<br>v1.5.3 | • 랜덤 포레스트 분류 모델 구축 및 평가<br>• 대용량 정형 데이터셋 로드, 정제 및 전처리<br>• 수치 계산 및 과학적 통계 연산 수행<br>• 최적화 모델 객체 직렬화 및 웹 서버 서빙 |
| **Development<br>Tools** | • PyCharm Professional<br>• JDK | v2025.3.3<br>v11.0.23 | • 통합 개발 환경(IDE) 및 디버깅 수행<br>• SQL Developer 구동을 위한 자바 환경 구성 |

---

## 2. 프로젝트별 주요 기술 경험 (Deep Dive)

### 📊 [1/3] Machine Learning & Web System Integration (Flask)

#### 🟦 Machine Learning & Data Science
* **Supervised Learning (지도학습)**
  * **RandomForestClassifier:** 여러 개의 결정 트리(Decision Tree)를 결합한 앙상블 모델을 활용하여 호텔 예약 취소 여부(`is_canceled`) 분류 모델 구축. 오버피팅(과적합)을 방지하고 정형 데이터 예측의 안정성 확보.
* **Preprocessing (데이터 전처리)**
  * **Feature Importance (변수 중요도 분석):** 모델링 과정에서 각 변수(`lead_time`, `country` 등)가 취소율 예측 성능에 기여하는 중요도를 산출. 기여도가 현저히 낮거나 노이즈가 되는 불필요한 변수를 제거하여 모델 경량화 및 예측 속도 향상 (`train.py`).
* **Data Manipulation & Analytics (데이터 핸들링)**
  * **pandas / numpy / scipy:** Kaggle의 대용량 *Hotel booking demand* 원본 데이터셋 로드 및 결측치 처리. 모델 학습 및 DB 적재에 적합한 데이터 타입 변환 및 1차 전처리 수행.
  * **joblib:** 학습이 완료된 최적의 랜덤 포레스트 모델 객체를 직렬화하여 파일로 저장하고, Flask 백엔드 서버에서 실시간으로 로드(Serve)할 수 있도록 연동.

#### 🟦 Database & Web System Integration
* **Database Operations (Oracle 11g)**
  * **Oracle Instant Client (Thick Mode):** 안정적인 Oracle 11g Express Edition 환경 호환을 위해 Thick 모드 클라이언트 환경을 활성화하여 연동 인프라 구축.
  * **oracledb:** Python 환경에서 오라클 데이터베이스와 유기적으로 커넥션을 맺고 제어. 가공된 전처리 데이터셋을 최초 적재(`upload_to_oracle.py`)하고, 유저 인터페이스와 DB 간의 데이터 동기화 수행.
* **Web Backend Architecture (Flask)**
  * **Flask Router (`@app.route`) & API 구현:** `app.py` 내에 라우트 엔드포인트를 설계하여 프론트엔드와 백엔드 간의 데이터 송수신 아키텍처 구축.
    * `/api/chart-data (GET)`: 데이터베이스에서 실시간으로 축적된 누적 취소 통계 데이터를 계산하여 반환하는 로직 구현.
    * `/api/predict (POST)`: 사용자가 입력한 7가지 Feature 값을 모델에 주입하여 취소 발생 확률을 실시간 서빙.
    * `/api/reserve (POST)`: 확정된 예약 정보를 테이블에 `INSERT`하는 비즈니스 로직 처리.
* **Asynchronous Frontend Action (비동기 통신)**
  * **JavaScript Fetch API:** 페이지 전체를 새로고침(Refresh)하지 않고, 사용자의 입력 조건 변화나 버튼 클릭 이벤트를 감지하여 Flask 서버와 백엔드 API 간의 실시간 비동기 데이터 통신 구현.
  * **Dynamic Chart.js (시각화):** Fetch API를 통해 수신한 AI 예측 확률 데이터와 DB 누적 통계 데이터를 매핑하여 화면에 동적으로 요동치는 그래프 레이아웃 구현.
* **Python Core Development (파일 입출력 및 환경 관리)**
  * `db_config.py` / `upload_to_oracle.py`: 데이터베이스 접속 정보를 모듈화하여 관리하고, 파일 입출력 스트림을 통해 초기 대용량 데이터를 오라클 서버에 안정적으로 파싱 및 업로드하는 독립 스크립트 작성.

---

### 📷 [2/3] Computer Vision & Deep Learning (YOLOv11)

#### 🟦 Deep Learning & Computer Vision
* **Neural Networks (신경망 구조)**
  * **CNN (Convolutional Neural Network):** 이미지 및 영상 데이터의 공간적 특징(Spatial Features)을 유기적으로 추출하는 딥러닝 기반 이미지 처리 메커니즘 이해.
  * **YOLOv11 (You Only Look Once v11):** 최신 Single-Stage Object Detection 아키텍처를 활용한 고속 실시간 객체 탐지 환경 구축. 한 번의 추론(Inference)으로 다중 객체의 바운딩 박스(Bounding Box)와 클래스 확률을 동시에 계산.
* **Multi-Class Detection (다중 객체 인식)**
  * **Person, Laptop, Bag 동시 인식:** 공유오피스/세미나실 공간 내에 존재하는 사람과 주요 소지품 개체를 독립된 클래스로 동시에 식별 및 추론.

#### 🟦 Business Logic & Server Integration
* **Conditional Recognition Logic (조건부 인지 로직)**
  * **객체 간 관계 분석 알고리즘 설계:** 단순 객체 카운팅을 넘어 탐지된 객체 간의 조합을 통해 현장 상태를 정의하는 규칙 기반(Rule-based) 로직 구현.
    * **노쇼(No-Show):** 예약 시간 내 `[사람 = 0, 소지품 = 0]` 상태 인지.
    * **자리비움:** `[사람 = 0]` 이지만 `[노트북/가방 > 0]`인 일시적 부재 상태를 판별하여 오탐 패널티 제외.
    * **이용률 저조:** 예약 인원수 대비 실제 탐지된 `[사람]` 수의 비율을 계산하여 자원 효율성 측정.
* **Backend Infrastructure & Communication (네트워크 및 통신)**
  * **RESTful API 아키텍처:** CCTV 영상 스트리밍 단(클라이언트)과 YOLOv11 추론 엔진(서버) 간의 독립적인 분리 구조 설계. 객체 탐지 결과 및 공간 상태 데이터를 정형화된 JSON 포맷으로 실시간 송수신.
  * **Scalable Architecture (확장성 설계):** 향후 다중 공간(Room ID) 확장이 용이하도록 엔드포인트를 모듈화하여 설계 구조 확보.

#### 🟦 Performance Optimization (비기능 성능)
* **실시간성 확보 (Latency Control)**
  * **1초 이내 지연 시간(Latency < 1s) 달성:** 이미지 분석 요청, 추론 엔진 구동, 결과 반환 및 프론트엔드 UI 업데이트까지의 전체 파이프라인 속도 최적화.

---

### 💬 [3/3] Natural Language Processing & Generative AI (SLM)

#### 🟦 Natural Language Processing & Generative AI
* **LLM & Applications (대형 언어 모델 및 응용)**
  * **SLM (Small Language Model / 소형 언어 모델):** 매개변수(Parameter) 크기를 최적화하여 고가의 다중 GPU 인프라 없이도 구동 가능한 경량화 언어 모델 아키텍처 활용. 단일 GPU 또는 로컬 개발 PC 환경에서 3초 이내의 빠른 추론 속도($Latency < 3s$) 및 자원 효율성 달성.
  * **Hugging Face Transformers:** 오픈소스 허브(Hugging Face)의 프리트레인(Pre-trained) 언어 모델 라이브러리를 활용한 커스텀 자연어 추론 환경 구축.
* **NLP Pipeline (자연어 처리 파이프라인)**
  * **NER (Named Entity Recognition / 개체명 인식):** 사용자의 비정형 구어체 및 대화체 문장 속에서 핵심 엔티티(장소: 수영장, 물품: 모자 등)를 정밀하게 추출 및 분류.
  * **QnA (Question Answering) System:** 추출된 의도(Intent)와 엔티티를 기반으로 질의의 맥락을 파악하고 정답 후보군을 도출하는 질의응답 시스템 설계.

#### 🟦 Safety & Security Engineering (신뢰성 및 보안)
* **Hallucination Control (환각 현상 제어)**
  * **규정 기반 팩트 체킹 (Fact Checking):** AI가 학습 데이터 외에 허위 정보를 지어내는 환각(Hallucination) 현상을 방지하기 위해, 사내 운영 매뉴얼 문서 데이터 범위 내에서만 정답을 도출하도록 제어 로직 적용.
  * **방어형 예외 처리 (Exception Handling):** 매뉴얼 범위를 벗난 일상적 질의 또는 도메인 외 질문(예: 맛집 추천, 날씨 등) 인지 시, 지정된 고정 템플릿 답변(*"해당 정보는 매뉴얼에 등록되어 있지 않습니다..."*)을 출력하도록 규정 기반 필터링 구축.
* **Data Sovereignty (데이터 독립성 및 보안)**
  * **On-Premise / 로컬 환경 추론:** 프롬프트 주입(Prompt Injection) 및 임베딩 과정에서 외부 오픈소스 Open API 서버를 거치지 않고 완전히 로컬 인프라 내부에서 데이터가 처리되도록 파이프라인 보안 강화. 호텔 자산인 사내 운영 규정 및 민감 내부 데이터의 유출 가능성을 원천 차단.
* **Context Management (대화 흐름 관리)**
  * **가벼운 컨텍스트 유지 기능:** 사용자와 챗봇 간의 직전 대화 턴(Turn)의 이력을 기억하여, 대화의 맥락이 자연스럽게 이어질 수 있도록 가벼운 메모리 버퍼 레이어 설계.