# 🛠️ 10. 소프트웨어 아키텍처 (Software Architecture)

### 🌐 System Architecture

```mermaid
graph LR
    subgraph Client [프론트엔드 - Browser]
        UI[HTML / CSS] <--> JS[JavaScript / Fetch API]
        JS --> Chart[Chart.js / 실시간 시각화]
    end

    subgraph Server [백엔드 - Python Flask]
        Route[@app.route] <--> Controller[API 컨트롤러 로직]
        Controller <--> ModelLoader[joblib / ML 모델 로드]
    end

    subgraph AI [AI 추론 엔진]
        ModelLoader <--> ML[Scikit-learn Model]
    end

    subgraph DB [데이터베이스]
        Oracle[(Oracle 11g)] <--> Seq[Sequence / Trigger]
    end

    %% 데이터 흐름 연결
    JS <-->|비동기 JSON 통신| Route
    Controller <-->|정형 데이터 적재/조회| Oracle
```

---

## 📊 2. 우측 영역: 핵심 기술 요약 (Description)


| 항목 | 핵심 설명 (Description) |
| :--- | :--- |
| **비동기 데이터 레이어 분리** | 브라우저 새로고침 없이 실시간으로 AI 분석 결과를 갱신하기 위해, 화면 라우팅과 데이터 연동 API 영역(`/api/...`)을 철저히 분리한 **RESTful 기반 아키텍처** 설계. |
| **백엔드 중심 가벼운 클라이언트** | 프론트엔드는 UI 렌더링과 사용자 입력 수집만 담당하고, 복잡한 데이터 전처리(Data Mapping) 및 머신러닝 추론 연산은 **Flask 백엔드 서버에 집중(Thick Server - Thin Client)**시켜 보안성과 성능을 최적화함. |
| **ML 파이프라인 직렬화 연동** | 학습이 완료된 Scikit-learn 모델과 LabelEncoder 객체를 `joblib` 파일(`pkl`) 형태로 직렬화하여 백엔드 구동 즉시 메모리에 로드, **실시간 비동기 추론 요청에 $1\text{초}$ 미만으로 즉각 응답**하는 파이프라인 구축. |
| **DB 트리거 기반 무결성 보장** | 웹 서버의 부담을 줄이기 위해 오라클 데이터베이스 내부에 `SEQUENCE`와 `BEFORE INSERT TRIGGER`를 구축하여, **데이터 적재 시 고유 식별자(PK) 생성을 데이터베이스 엔진 단에서 원천 자동화.** |

---

