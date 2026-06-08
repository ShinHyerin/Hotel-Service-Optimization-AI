// 💡 기획안에 맞춘 듀얼 차트 글로벌 변수 선언
let resortChart;
let cityChart;


document.addEventListener('DOMContentLoaded', () => {
    // 1. 페이지 로드 즉시 기존 canvas 두 개에 초기 0% 차트 생성
    initDualCharts();

    // 2. 입력 요소들 가져오기
    const formElement = document.getElementById('predict-form');

    // 생년월일 자동 계산 바인딩 (이전에 수정한 로직 유지)
    const birthYear = document.getElementById('birth_year');
    const birthMonth = document.getElementById('birth_month');
    const birthDay = document.getElementById('birth_day');


    const reservationDate = document.getElementById('reservation_date');

    if (reservationDate) {
        const today = new Date().toISOString().split('T')[0];

        // 과거 날짜 선택 방지
        reservationDate.min = today;
    }


    if (reservationDate) {

        reservationDate.addEventListener('change', () => {

            updatePrediction();
        });
    }



    function updateBirthDays() {
        if (!birthDay) return;
        const year = parseInt(birthYear.value);
        const month = parseInt(birthMonth.value);
        birthDay.innerHTML = '<option value="">일</option>';
        if (!year || !month) return;

        const lastDay = new Date(year, month, 0).getDate();
        for (let day = 1; day <= lastDay; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = `${day}일`;
            birthDay.appendChild(option);
        }
    }

    if (birthYear && birthMonth) {
        birthYear.addEventListener('change', () => {
            updateBirthDays();
            updatePrediction();
        });
        birthMonth.addEventListener('change', () => {
            updateBirthDays();
            updatePrediction();
        });
    }
    updateBirthDays();

    if (birthDay) {
        birthDay.value = "1";
    }

//    birthDay.value = "1";
    if (birthDay) {
        birthDay.addEventListener('change', updatePrediction);
    }

    // 3. 폼 내부의 모든 input, select 값이 변경될 때마다 실시간 예측 트리거
    if (formElement) {
        formElement.querySelectorAll('input, select, textarea').forEach(element => {
            if (element.id !== 'birth_year' && element.id !== 'birth_month' && element.id !== 'birth_day') {
                element.addEventListener('change', updatePrediction);
                element.addEventListener('input', updatePrediction);
            }
        });
    }


    const resetBtn = document.getElementById('btn-reset');

    if (resetBtn && formElement) {
        resetBtn.addEventListener('click', () => {

            formElement.reset();

            // birth day 초기화
            if (birthDay) {
                birthDay.innerHTML = '<option value="">일</option>';
            }

            // 날짜 min 다시 고정
            if (reservationDate) {
                const today = new Date().toISOString().split('T')[0];
                reservationDate.min = today;
                reservationDate.value = '';
            }

            // lead time 초기화
            const leadTimeInput =
                document.getElementById('lead_time');

            if (leadTimeInput) {
                leadTimeInput.value = 0;
            }

            // 차트 초기화
            if (resortChart) {
                resortChart.data.datasets[0].data = [0, 100];
                resortChart.update();
            }

            if (cityChart) {
                cityChart.data.datasets[0].data = [0, 100];
                cityChart.update();
            }

            document.getElementById('probability').innerText = '0.00';
            document.getElementById('prediction-text').innerText = 'WAITING INPUT...';

            const guideText =
                document.getElementById('chart-guide-text');

            if (guideText) {
                guideText.style.display = 'block';
            }
        });
    }

    const phoneInput =
        document.getElementById('phone');

    if (phoneInput) {

        phoneInput.addEventListener('input', () => {

            // 숫자 제외 전부 제거
            phoneInput.value =
                phoneInput.value.replace(/[^0-9]/g, '');

        });
    }


    const reserveBtn =
        document.getElementById('btn-reserve');

    if (reserveBtn) {

        reserveBtn.addEventListener('click', (e) => {

            e.preventDefault();

            const requiredFields = [
                'customer_name',
                'birth_year',
                'birth_month',
                'birth_day',
                'phone'
            ];

            let isValid = true;

            requiredFields.forEach(id => {

                const element =
                    document.getElementById(id);

                if (!element || !element.value.trim()) {
                    isValid = false;
                }
            });

            // 필수값 누락
            if (!isValid) {

                alert('모든 정보를 입력하셔야 예약할 수 있습니다.');

                return;
            }

            // 예약 진행
            reserveBooking();
        });
    }
    updatePrediction();

});

// ==========================================
// [초기화] 🏨 객실 및 🏢 세미나실 듀얼 차트 셋팅
// ==========================================
function initDualCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // 컨테이너 크기에 딱 맞춤
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        }
    };

    // 🏨 객실 예약 취소율 차트 초기화
    const ctxResort = document.getElementById('resortChart').getContext('2d');
    resortChart = new Chart(ctxResort, {
        type: 'doughnut',
        data: {
            labels: ['취소 확률', '정상 유지'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#A4B2A6', '#EAEAEA'], // 파스텔 톤 가미된 그린/그레이
                borderWidth: 0
            }]
        },
        options: chartOptions
    });

    // 🏢 세미나실 취소율 차트 초기화
    const ctxCity = document.getElementById('cityChart').getContext('2d');
    cityChart = new Chart(ctxCity, {
        type: 'doughnut',
        data: {
            labels: ['취소 확률', '정상 유지'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#A8C3D8', '#EAEAEA'], // 은은한 파스텔 블루 스키마 반영
                borderWidth: 0
            }]
        },
        options: chartOptions
    });
}


function reserveBooking() {

    const formElement =
        document.getElementById('predict-form');

    if (!formElement) return;

    const formData =
        new FormData(formElement);

    fetch('/api/reserve', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {

        if (data.success) {

            alert('예약이 완료되었습니다.');

        } else {

            alert('예약 실패');
        }
    })
    .catch(error => {

        console.error(error);

        alert('서버 오류 발생');
    });
}

// ==========================================
// [실시간 비동기 연동] 백엔드 결과 반영 및 그래프 애니메이션 업데이트
// ==========================================

function updatePrediction() {

    const formElement =
        document.getElementById('predict-form');

    if (!formElement) return;

    const formData = new FormData(formElement);

    // 현재 선택된 호텔 타입
    const selectedHotelType =
        formElement.querySelector('[name="hotel_type"]:checked')?.value;

    // 모델 입력용 HOTEL 컬럼 매핑
    formData.set('hotel', selectedHotelType);

    // 예약 날짜 기반 lead_time 계산
    const reservationDate =
        document.getElementById('reservation_date');

    const leadTimeInput =
        document.getElementById('lead_time');

    if (reservationDate && leadTimeInput && reservationDate.value) {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const selectedDate =
            new Date(reservationDate.value);

        const diffMs =
            selectedDate - today;

        const diffDays =
            Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        leadTimeInput.value =
            diffDays > 0 ? diffDays : 0;

        formData.set(
            'lead_time',
            leadTimeInput.value
        );
    }

    // 추가 요청사항
    const specialRequests =
        formData.get('special_requests') || '';

    const requestLength =
        specialRequests.trim().length;

    if (requestLength >= 5 && requestLength < 20) {

        formData.set(
            'total_of_special_requests',
            1
        );

    } else if (requestLength >= 20 && requestLength < 50) {

        formData.set(
            'total_of_special_requests',
            2
        );

    } else if (requestLength >= 50) {

        formData.set(
            'total_of_special_requests',
            3
        );

    } else {

        formData.set(
            'total_of_special_requests',
            0
        );
    }


    // 💡 백엔드 통신 가동
    fetch('/api/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) return;

        const prob = data.prob; // 백엔드가 연산해준 확률 (ex: 65.4)
        const remain = 100 - prob;

        // 1. 하단 텍스트 필드 및 가이드라인 문구 실시간 업데이트
        document.getElementById('probability').innerText = prob.toFixed(2);

        const guideText = document.getElementById('chart-guide-text');
        if (guideText) guideText.style.display = 'none'; // 입력이 완료되었으므로 가이드 텍스트 숨김

        // 2. 취소 확률에 기반한 일반 사용자 스토리텔링 리포트 텍스트 매핑
        const txtPrediction = document.getElementById('prediction-text');
        const txtStatusDesc = document.getElementById('insight-status-desc');
        const txtSolutionDesc = document.getElementById('insight-solution-desc');

        if (prob >= 60) {

            if (txtPrediction)
                txtPrediction.innerText =
                "HIGH RISK (취소 위험 높음)";

            if (txtStatusDesc)
                txtStatusDesc.innerText =
                `현재 입력하신 예약 조건은 취소 가능성이 높은 패턴(${prob}%)으로 분석되었습니다.`;

            if (txtSolutionDesc)
                txtSolutionDesc.innerText =
                "예약 일정 및 조건을 다시 확인해보시는 것을 권장드립니다.";

        } else {

            if (txtPrediction)
                txtPrediction.innerText =
                "STABLE STATUS (안정 상태)";

            if (txtStatusDesc)
                txtStatusDesc.innerText =
                `현재 입력하신 예약 조건은 비교적 안정적인 예약 패턴(${prob}%)으로 분석되었습니다.`;

            if (txtSolutionDesc)
                txtSolutionDesc.innerText =
                "현재 조건은 일반적인 예약 유지 패턴에 가까운 상태입니다.";
        }

        // 3. 💡 [핵심] 선택된 모드에 맞는 그래프만 타겟팅하여 dynamic하게 슥 채우기!
        // 만약 'hotel' 모드라면 Resort 차트를 채우고 City 차트는 0으로 초기화 (반대의 경우도 마찬가지)
        if (selectedHotelType === 'Resort Hotel') {
            if (resortChart) {
                resortChart.data.datasets[0].data = [prob, remain];
                resortChart.update();
            }
            if (cityChart) {
                cityChart.data.datasets[0].data = [0, 100];
                cityChart.update();
            }
        } else {
            if (cityChart) {
                cityChart.data.datasets[0].data = [prob, remain];
                cityChart.update();
            }
            if (resortChart) {
                resortChart.data.datasets[0].data = [0, 100];
                resortChart.update();
            }
        }
    })
    .catch(error => {
        console.error('AI 분석 연동 실패:', error);
    });
}