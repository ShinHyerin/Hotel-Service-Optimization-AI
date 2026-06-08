document.addEventListener('DOMContentLoaded', () => {

    const slides = document.querySelectorAll('.carousel-item');
    const indicatorsContainer = document.getElementById('carousel-indicators');

    if (!slides.length) return;

    let currentSlide = 0;
    let autoSlide;

    let startX = 0;
    let endX = 0;

    const threshold = 80;

    // =========================
    // 슬라이드 업데이트
    // =========================
    function updateSlides() {

        slides.forEach((slide, index) => {

            slide.classList.remove('active', 'prev');

            if (index === currentSlide) {
                slide.classList.add('active');
            }

            else if (
                index === currentSlide - 1 ||
                (currentSlide === 0 && index === slides.length - 1)
            ) {
                slide.classList.add('prev');
            }
        });

        renderIndicators();
    }

    // =========================
    // 인디케이터
    // =========================
    function renderIndicators() {

        if (!indicatorsContainer) return;

        indicatorsContainer.innerHTML = '';

        slides.forEach((_, index) => {

            const el = document.createElement('div');

            el.className =
                index === currentSlide
                    ? 'indicator-bar'
                    : 'indicator-dot';

            el.addEventListener('click', () => {
                gotoSlide(index);
            });

            indicatorsContainer.appendChild(el);
        });
    }

    // =========================
    // 이동 함수
    // =========================
    function gotoSlide(index) {

        currentSlide = index;

        updateSlides();

        restartAutoSlide();
    }

    function nextSlide() {

        currentSlide++;

        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        updateSlides();
    }

    function prevSlide() {

        currentSlide--;

        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }

        updateSlides();
    }

    // =========================
    // 자동 슬라이드
    // =========================
    function startAutoSlide() {

        autoSlide = setInterval(() => {
            nextSlide();
        }, 5000);
    }

    function restartAutoSlide() {

        clearInterval(autoSlide);

        startAutoSlide();
    }

    // =========================
    // 드래그
    // =========================
    function dragStart(x) {
        startX = x;
    }

    function dragEnd(x) {

        endX = x;

        const movedBy = endX - startX;

        if (movedBy < -threshold) {
            nextSlide();
        }

        else if (movedBy > threshold) {
            prevSlide();
        }

        restartAutoSlide();
    }

    // =========================
    // 마우스
    // =========================
    window.addEventListener('mousedown', (e) => {
        dragStart(e.pageX);
    });

    window.addEventListener('mouseup', (e) => {
        dragEnd(e.pageX);
    });

    // =========================
    // 터치
    // =========================
    window.addEventListener('touchstart', (e) => {
        dragStart(e.touches[0].pageX);
    });

    window.addEventListener('touchend', (e) => {
        dragEnd(e.changedTouches[0].pageX);
    });

    // =========================
    // 최초 실행
    // =========================
    updateSlides();

    startAutoSlide();
});

