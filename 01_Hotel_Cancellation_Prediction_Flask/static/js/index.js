document.addEventListener('DOMContentLoaded', () => {

    console.log('index.js loaded');

    // ==========================================
    // FULL PAGE SCROLL
    // ==========================================

    const container = document.getElementById('main-scroll-container');

    const sections = document.querySelectorAll('.main-section');

    const navItems = document.querySelectorAll('.nav-item');

    const sideNav = document.querySelector('.side-nav');

    const indicator = document.querySelector('.nav-indicator');

    const header = document.getElementById('main-header');

    let currentSection = 0;

    let isScrolling = false;

    const totalSections = sections.length;

    const itemHeight = 60;

    // 초기 테마

    if (sideNav) {
        sideNav.classList.add('dark-nav');
    }

    if (header) {
        header.classList.add('dark-header');
    }

    // ==========================================
    // UI 업데이트
    // ==========================================

    function updateUI(index) {

        navItems.forEach((item, idx) => {

            item.classList.remove('active');

            if (idx === index) {

                item.classList.add('active');

                if (indicator) {
                    indicator.style.transform =
                        `translateY(${idx * itemHeight}px)`;
                }
            }
        });

        // 어두운 섹션
        const darkSections = [0, 3];

        if (darkSections.includes(index)) {

            sideNav?.classList.add('dark-nav');
            sideNav?.classList.remove('light-nav');

            header?.classList.add('dark-header');
            header?.classList.remove('light-header');

        } else {

            sideNav?.classList.add('light-nav');
            sideNav?.classList.remove('dark-nav');

            header?.classList.add('light-header');
            header?.classList.remove('dark-header');
        }
    }

    // ==========================================
    // 섹션 이동
    // ==========================================

    function scrollToSection(index) {

        if (index < 0 || index >= totalSections) return;

        isScrolling = true;

        currentSection = index;

        container.style.transform =
            `translateY(-${index * 100}vh)`;

        updateUI(index);

        setTimeout(() => {

            isScrolling = false;

        }, 900);
    }

    // ==========================================
    // 휠 스크롤
    // ==========================================
    window.addEventListener('wheel', (e) => {

        if (isScrolling) return;

        // 🎯 [수정] 배경이 아니라, 오직 흰색 'feature-card' 내부에서 굴릴 때만 전체 스크롤을 차단합니다!
        if (e.target.closest('.feature-card')) {
            return;
        }

        if (e.deltaY > 0) {
            if (currentSection < totalSections - 1) {
                scrollToSection(currentSection + 1);
            }
        } else {
            if (currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
        }

    }, { passive: true });

    // ==========================================
    // 네비게이션 클릭
    // ==========================================

    navItems.forEach((item, index) => {

        item.addEventListener('click', (e) => {

            e.preventDefault();

            scrollToSection(index);
        });
    });


});