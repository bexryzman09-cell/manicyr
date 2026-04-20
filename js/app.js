document.addEventListener('DOMContentLoaded', () => {
    // 1. ГЛОБАЛЬНЫЙ ОБРАБОТЧИК КЛИКОВ (Делегирование)
    // Оживляет все кнопки, ссылки и data-link сразу
    document.addEventListener('click', (e) => {
        const targetEl = e.target.closest('[data-link], .btn, .btn-main, .btn-outline, .header__btn, .hero__btn, .cta__btn, .info__btn, .features__btn');
        if (!targetEl) return;

        const url = targetEl.getAttribute('data-link');
        let finalUrl = url;

        // Если у элемента нет data-link, ищем по тексту (как было в твоем коде)
        if (!url) {
            const text = targetEl.textContent.toLowerCase().trim();
            const routes = {
                'узнать больше': 'about.html',
                'подробнее': 'about.html',
                'наши услуги': 'servis.html',
                'смотреть услуги': 'servis.html',
                'записаться': 'contact.html',
                'записаться на приём': 'contact.html'
            };
            finalUrl = routes[text];
        }

        // Принудительные переходы для специфических классов
        if (targetEl.classList.contains('btn-main')) finalUrl = 'learn.html';
        if (targetEl.classList.contains('btn-outline')) finalUrl = 'servis.html';

        if (finalUrl) {
            e.preventDefault();
            if (finalUrl === 'social.html') {
                window.open(finalUrl, '_blank');
            } else {
                window.location.href = finalUrl;
            }
        }
    });

    // 2. ПЛАВНЫЙ СКРОЛЛ ДЛЯ ЯКОРЕЙ (href="#")
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 3. ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ (Intersection Observer)
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 4. СЛАЙДЕР ДО/ПОСЛЕ (Исправлено)
    const overlay = document.getElementById('beforeAfterFull');
    const slides = document.querySelectorAll('.ba-slide');
    let currentSlide = 0;

    if (overlay && slides.length > 0) {
        const showSlide = (n) => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (n + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
        };

        // Кнопки навигации внутри модалки
        const prevBtn = document.querySelector('.prev, .ba-slider__btn:first-of-type');
        const nextBtn = document.querySelector('.next, .ba-slider__btn:last-of-type');

        if (prevBtn) prevBtn.onclick = (e) => { e.preventDefault(); showSlide(currentSlide - 1); };
        if (nextBtn) nextBtn.onclick = (e) => { e.preventDefault(); showSlide(currentSlide + 1); };

        // Закрытие
        const closeBtn = document.getElementById('closeFull') || document.querySelector('.ba-modal-full__close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            };
        }

        // Появление модалки при скролле секции услуг (1 раз)
        const servicesSection = document.querySelector('.services');
        const handlePopupScroll = () => {
            if (servicesSection && !localStorage.getItem('ba_popup_permanent')) {
                const rect = servicesSection.getBoundingClientRect();
                if (rect.bottom < 0) {
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    localStorage.setItem('ba_popup_permanent', 'true');
                    window.removeEventListener('scroll', handlePopupScroll);
                }
            }
        };
        window.addEventListener('scroll', handlePopupScroll);
    }

    // 5. ПАРАЛЛАКС И КУРСОР (Оптимизировано через rAF)
    const heroImg = document.querySelector('.img-frame img') || document.querySelector('.hero__index img');
    const glow = document.querySelector('.cursor-glow');

    let ticking = false;
    window.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (heroImg) {
                    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
                    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
                    heroImg.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
                }
                if (glow) {
                    glow.style.left = e.clientX + 'px';
                    glow.style.top = e.clientY + 'px';
                }
                ticking = false;
            });
            ticking = true;
        }
    });
});

//! (function() {
// !   document.addEventListener('contextmenu', e => e.preventDefault());
//!   document.onkeydown = function(e) {
//     if (e.keyCode == 123 || 
//        (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) || 
//        (e.ctrlKey && e.keyCode == 85)) {
//       return false;
//     }
//   };

//   // 3. "Бесконечный дебаггер" — вешает консоль при открытии
//   setInterval(function() {
//     (function(a) {
//       return (function(a) {
//         return (Function('Function(arguments[0])(arguments[1])')(a, a));
//       })(function(a) {
//         if (a === 'debugger') return true;
//         return false;
//       });
//     })('debugger');
//   }, 50);

//   // 4. Защита от выделения текста (через JS для надежности)
//   document.addEventListener('selectstart', e => e.preventDefault());

//   // 5. Постоянная очистка консоли
//   setInterval(() => { console.clear(); }, 500);
// })();

const track = document.querySelector('.carousel-track');
const nextBtn = document.querySelector('.btn-next');
const prevBtn = document.querySelector('.btn-prev');

let index = 0;

function updateCarousel() {
    const cardWidth = document.querySelector('.review-card').offsetWidth + 20;
    track.style.transform = `translateX(${-index * cardWidth}px)`;
}

nextBtn.addEventListener('click', () => {
    const cards = document.querySelectorAll('.review-card');
    // Ограничиваем индекс, чтобы не листать в пустоту
    if (index < cards.length - 1) {
        index++;
    } else {
        index = 0; // Зацикливание (возврат в начало)
    }
    updateCarousel();
});

prevBtn.addEventListener('click', () => {
    if (index > 0) {
        index--;
    }
    updateCarousel();
});

// Автоматическая прокрутка каждые 5 секунд
setInterval(() => {
    nextBtn.click();
}, 5000);









window.addEventListener('load', function () {
    const loader = document.getElementById('super-cool-loader');
    setTimeout(() => {
        loader.classList.add('is-hidden');
    }, 1500); 
});