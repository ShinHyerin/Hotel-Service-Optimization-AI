let resortChart;
let cityChart;

document.addEventListener('DOMContentLoaded', () => {

    loadChartData();
    initCharts();

    const birthYear = document.getElementById('birth_year');
    const birthMonth = document.getElementById('birth_month');
    const birthDay = document.getElementById('birth_day');
    const btnSearch = document.getElementById('btn-search');
    const searchForm = document.getElementById('search-form');
    const resultArea = document.getElementById('search-result-area');
    const listContainer = document.getElementById('booking-list-container');
    const resultUserName = document.getElementById('result-user-name');

    // ==========================================
    // 1. 생년월일 일수 자동 계산 (윤년 대응)
    // ==========================================
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
        birthYear.addEventListener('change', updateBirthDays);
        birthMonth.addEventListener('change', updateBirthDays);
    }

    updateBirthDays();

    birthDay.value = "1";

    // ==========================================
    // 2. 비동기 예약 내역 조회 (Fetch API)
    // ==========================================
    if (btnSearch && searchForm) {
        btnSearch.addEventListener('click', () => {

            // 필수 유효성 검증
            const nameInput = searchForm.querySelector('[name="customer_name"]');
            const phoneInput = searchForm.querySelector('[name="phone"]');

            if (!nameInput.value.trim() || !birthYear.value || !birthMonth.value || !birthDay.value || !phoneInput.value.trim()) {
                alert('조회할 개인정보 항목을 완전히 입력해 주세요.');
                return;
            }

            const formData = new FormData(searchForm);

            // app.py의 /search_booking 코드가 JSON 데이터를 반환하도록 고치기 전에,
            // 기존 라우트 주소로 비동기 요청을 전송합니다.
            fetch('/search_booking', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                // 만약 app.py가 여전히 html을 통째로 주면 처리가 안 되므로,
                // 백엔드가 데이터(JSON) 형식을 리턴하도록 조율되어야 합니다.
                return response.json();
            })
            .then(data => {
                // 컨테이너 초기화
                listContainer.innerHTML = '';

                if (data.error) {
                    alert(data.error);
                    return;
                }

                // 💡 [수정] DB에 데이터가 없거나 booking_list가 비어있는 경우 경고창 처리
                if (!data.booking_list || data.booking_list.length === 0) {
                    alert('일치하는 예약 내역이 없습니다.');
                    resultArea.style.display = 'none'; // 이전에 조회했던 내역이 있다면 가려줌
                    return;
                }

                // 💡 데이터가 존재할 때만 아래쪽 결과창을 활성화하고 카드를 생성합니다.
                resultUserName.innerText = nameInput.value.trim();
                resultArea.style.display = 'block';

                // 카드를 루프 돌며 동적 생성
                data.booking_list.forEach(booking => {
                    const isCanceled = booking.status === '예약취소됨';
                    const badgeClass = isCanceled ? 'status-badge canceled' : 'status-badge';

                    const cardHtml = `
                        <div class="booking-card">
                            <div class="booking-header">
                                <h3>${booking.hotel_type}</h3>
                                <span class="${badgeClass}">${booking.status}</span>
                            </div>
                            <div class="booking-body">
                                <p><strong>전화번호:</strong> ${booking.phone}</p>
                                <p><strong>예약 선행기간:</strong> ${booking.lead_time}일</p>
                                <p><strong>예약 경로:</strong> ${booking.market_segment}</p>
                                <p><strong>고객 유형:</strong> ${booking.customer_type}</p>
                                <p><strong>예약 생성일:</strong> ${booking.created_at || '-'}</p>
                            </div>
                            ${!isCanceled ? `
                            <div class="booking-footer">
                                <button class="cancel-btn" data-id="${booking.id}">예약취소</button>
                            </div>
                            ` : ''}
                        </div>
                    `;
                    listContainer.insertAdjacentHTML('beforeend', cardHtml);
                });

                // 생성된 취소 버튼들에 이벤트 바인딩
                bindCancelEvents();
            })
            .catch(error => {
                console.error('Search Error:', error);
                alert('내역을 불러오는 중 오류가 발생했습니다.');
            });
        });
    }

    // ==========================================
    // 3. 동적 생성된 취소 버튼 이벤트 결합
    // ==========================================
    function bindCancelEvents() {
        const cancelButtons = listContainer.querySelectorAll('.cancel-btn');
        cancelButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bookingId = e.target.getAttribute('data-id');
                const result = confirm('정말 예약을 취소하시겠습니까?');

                if (!result) return;

                fetch(`/cancel_booking/${bookingId}`, {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('예약이 성공적으로 취소되었습니다.');
                        // 새로고침 없이 화면에서 리포트 새로 고침 트리거 실행
                        btnSearch.click();

                        loadChartData();
                    }
                })
                .catch(err => console.error('Cancel Error:', err));
            });
        });
    }

    function initCharts() {

        const resortCtx =
            document.getElementById('resortChart');

        const cityCtx =
            document.getElementById('cityChart');

        resortChart = new Chart(resortCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['#A4B2A6', '#EAEAEA'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '75%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        cityChart = new Chart(cityCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['#A8C3D8', '#EAEAEA'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '75%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    function loadChartData() {

        fetch('/api/chart-data')
        .then(response => response.json())
        .then(data => {

            const resortRate = data.resort_rate;
            const cityRate = data.city_rate;

            document.getElementById('resortRateText').innerText =
                resortRate;

            document.getElementById('cityRateText').innerText =
                cityRate;

            resortChart.data.datasets[0].data =
                [resortRate, 100 - resortRate];

            cityChart.data.datasets[0].data =
                [cityRate, 100 - cityRate];

            resortChart.update();
            cityChart.update();
        })
        .catch(error => {
            console.error(error);
        });
    }

});