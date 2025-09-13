// 스크롤 애니메이션
document.addEventListener('DOMContentLoaded', function() {
    // 부드러운 스크롤
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 헤더 스크롤 효과
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
        }
        
        lastScroll = currentScroll;
    });
    
    // 요소 등장 애니메이션
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 애니메이션 적용할 요소들
    const animatedElements = document.querySelectorAll('.feature-card, .step, .pricing-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // 카운터 애니메이션
    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    };
    
    // 통계 숫자 애니메이션
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const text = stat.textContent;
                    if (text === '50 π') {
                        stat.textContent = '0 π';
                        setTimeout(() => {
                            animateCounter({
                                textContent: '0',
                                set textContent(val) {
                                    stat.textContent = val + ' π';
                                }
                            }, 50);
                        }, 300);
                    }
                });
                entry.target.dataset.animated = 'true';
            }
        });
    }, { threshold: 0.5 });
    
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }
    
    // 모바일 메뉴 토글 (모바일 대응)
    const createMobileMenu = () => {
        const navbar = document.querySelector('.navbar .container');
        const navMenu = document.querySelector('.nav-menu');
        
        // 모바일 메뉴 버튼 생성
        const menuToggle = document.createElement('button');
        menuToggle.innerHTML = '☰';
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.style.cssText = `
            display: none;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-dark);
        `;
        
        // 768px 이하에서만 표시
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        const handleMobileMenu = (e) => {
            if (e.matches) {
                menuToggle.style.display = 'block';
                navMenu.style.cssText = `
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    flex-direction: column;
                    padding: 20px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                    display: none;
                `;
            } else {
                menuToggle.style.display = 'none';
                navMenu.style.cssText = '';
            }
        };
        
        mediaQuery.addListener(handleMobileMenu);
        handleMobileMenu(mediaQuery);
        
        // 메뉴 토글 이벤트
        menuToggle.addEventListener('click', () => {
            if (navMenu.style.display === 'none' || !navMenu.style.display) {
                navMenu.style.display = 'flex';
                menuToggle.innerHTML = '✕';
            } else {
                navMenu.style.display = 'none';
                menuToggle.innerHTML = '☰';
            }
        });
        
        navbar.appendChild(menuToggle);
    };
    
    createMobileMenu();
    
    // CTA 버튼 클릭 이벤트
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                alert('🎉 파이코인 마켓이 곧 오픈합니다!\n가입하시면 50 π-coin을 즉시 드립니다!');
            }
        });
    });
    
    // 구매 버튼 클릭 이벤트
    const purchaseButtons = document.querySelectorAll('.pricing-card button');
    purchaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.pricing-card');
            const amount = card.querySelector('.amount').textContent;
            alert(`${amount} π-coin 구매 페이지로 이동합니다.\n안전한 결제 시스템을 통해 구매하실 수 있습니다.`);
        });
    });
    
    // 폰 목업 애니메이션
    const phoneScreen = document.querySelector('.phone-screen');
    if (phoneScreen) {
        // 제품 목록 자동 스크롤 시뮬레이션
        const productList = phoneScreen.querySelector('.product-list');
        if (productList) {
            setInterval(() => {
                productList.style.transform = 'translateY(-5px)';
                setTimeout(() => {
                    productList.style.transform = 'translateY(0)';
                }, 500);
            }, 3000);
        }
    }
    
    // 로딩 완료 후 페이드인 효과
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });
    
    // 타이핑 효과 (히어로 타이틀)
    const typeWriter = (element, text, speed = 50) => {
        let i = 0;
        element.textContent = '';
        
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        
        type();
    };
    
    // 페이지 로드시 타이핑 효과 적용
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        
        setTimeout(() => {
            heroTitle.innerHTML = originalText;
            heroTitle.style.opacity = '0';
            heroTitle.style.animation = 'fadeIn 1s ease forwards';
        }, 500);
    }
    
    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
            }
        }
        
        .btn-primary {
            animation: pulse 2s infinite;
        }
        
        .btn-primary:hover {
            animation: none;
        }
    `;
    document.head.appendChild(style);
    
    // 스크롤 진행 표시기
    const createProgressBar = () => {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #FF6F0F 0%, #FFA500 100%);
            z-index: 10000;
            transition: width 0.2s ease;
        `;
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    };
    
    createProgressBar();
    
    console.log('🥕 파이코인 마켓 페이지가 성공적으로 로드되었습니다!');
});