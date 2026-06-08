// 1. 사용할 데이터 정의 (여기에 2번째, 3번째 정보가 다 있습니다)
const featureData = [
    {
        img: "/static/images/feature_1.jpg",
        title: "Lead Time",
        subtitle: "예약 선행 기간",
        text: "예약 시점과 체크인 날짜 사이의 기간은 중요한 예측 요소입니다. 일반적으로 예약 기간이 길수록 예약 변동 가능성이 높아지는 경향을 보입니다."
    },
    {
        img: "/static/images/feature_2.jpg",
        title: "Country",
        subtitle: "국적",
        text: "고객의 국적에 따라 예약 패턴과 취소 경향에 차이가 나타날 수 있습니다. 내국인은 상대적으로 높은 취소 비율을 보이기도 합니다."
    },
    {
        img: "/static/images/feature_3.jpg",
        title: "Market Segment",
        subtitle: "예약 경로",
        text: "예약 유형에 따라 서로 다른 예약 패턴이 나타납니다. 오프라인 여행사와 단체 예약은 비교적 높은 취소율과 연관되는 경우가 많습니다."
    },
    {
        img: "/static/images/feature_4.jpg",
        title: "ADR",
        subtitle: "평균 객실 요금",
        text: "객실 요금 수준은 고객의 예약 유지 여부와 연관될 수 있습니다. 비교적 높은 요금의 예약은 취소 가능성이 함께 증가하는 경향을 보입니다."
    },
    {
        img: "/static/images/feature_5.jpg",
        title: "Special Requests",
        subtitle: "추가 요청 사항",
        text: "추가 요청 사항을 남긴 고객은 실제 투숙 의사가 뚜렷한 경우가 많습니다. 이러한 예약은 전반적으로 안정적인 패턴을 보이는 경향이 있습니다."
    }
];



let currentIndex = 0;
let wheelLocked = false;

// =========================
// 화면 업데이트
// =========================
function updateFeature(index) {
    const data = featureData[index];

    const bg = document.getElementById('feature-bg');
    const cardImg = document.getElementById('card-img');

    if (bg) {
        bg.style.backgroundImage = `url('${data.img}')`;
    }

    if (cardImg) {
        cardImg.src = data.img;
    }

    document.getElementById('card-title').innerText = data.title;
    document.getElementById('card-subtitle').innerText = data.subtitle;
    document.getElementById('card-text').innerText = data.text;

    // 점 활성화
    const dots = document.querySelectorAll('.indicator-dots .dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    // 버튼 비활성화 처리
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
        prevBtn.disabled = index === 0;
    }
    if (nextBtn) {
        nextBtn.disabled = index === featureData.length - 1;
    }
}

// =========================
// 다음
// =========================
function nextFeature() {
    if (currentIndex >= featureData.length - 1) return;
    currentIndex++;
    updateFeature(currentIndex);
}

// =========================
// 이전
// =========================
function prevFeature() {
    if (currentIndex <= 0) return;
    currentIndex--;
    updateFeature(currentIndex);
}

// =========================
// 연속 스크롤 방지용 헬퍼 함수
// =========================
function lockWheel() {
    wheelLocked = true;
    setTimeout(() => { wheelLocked = false; }, 500);
}

// =========================
// 최초 실행 및 이벤트 리스너 바인딩
// =========================
document.addEventListener('DOMContentLoaded', () => {
    // 첫 로드 시 데이터 바인딩
    updateFeature(currentIndex);

    // 🎯 [수정] 이벤트 대상을 배경 전체 대신 딱 '흰색 카드' 엘리먼트로 변경합니다.
    const featureCard = document.querySelector('.feature-card');
    if (!featureCard) return;

    // 오직 흰색 카드 위에서만 휠 스크롤 캐러셀 제어 작동
    featureCard.addEventListener('wheel', (e) => {
        // 아래로 스크롤 (다음 카드)
        if (e.deltaY > 0) {
            if (currentIndex < featureData.length - 1) {
                if (wheelLocked) return;
                lockWheel();
                e.preventDefault(); // 카드 위에서는 스크롤이 아래로 내려가지 않게 락
                nextFeature();
            }
        }
        // 위로 스크롤 (이전 카드)
        else {
            if (currentIndex > 0) {
                if (wheelLocked) return;
                lockWheel();
                e.preventDefault(); // 카드 위에서는 스크롤이 위로 올라가지 않게 락
                prevFeature();
            }
        }
    }, { passive: false });
});

// =========================
// 전역 윈도우 바인딩 (HTML onclick 호출 보장)
// =========================
window.nextFeature = nextFeature;
window.prevFeature = prevFeature;