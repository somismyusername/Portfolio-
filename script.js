document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements and define constants
    const CONFIG = {
        duration: 1000,
        easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        offset: 100,
        threshold: 0.5
    };

    const DOM = {
        sections: document.querySelectorAll('section'),
        navbar: document.getElementById('navbar'),
        dots: null // Will be populated after creation
    };

    let state = {
        currentSection: 0,
        isScrolling: false
    };

    // Utility functions
    const utils = {
        ease: t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // Core scroll functionality
    class SmoothScroll {
        constructor() {
            this.bindEvents();
            this.createNavigation();
        }

        bindEvents() {
            // Throttled scroll handler
            const wheelHandler = utils.debounce((e) => {
                e.preventDefault();
                if (state.isScrolling) return;
                const direction = e.deltaY > 0 ? 1 : -1;
                this.scrollToSection(state.currentSection + direction);
            }, 50);

            document.addEventListener('wheel', wheelHandler, { passive: false });
            document.addEventListener('keydown', this.handleKeyPress.bind(this));
        }

        handleKeyPress(e) {
            if (state.isScrolling) return;

            const keyActions = {
                'ArrowDown': 1,
                'PageDown': 1,
                'ArrowUp': -1,
                'PageUp': -1
            };

            const direction = keyActions[e.key];
            if (direction) {
                e.preventDefault();
                this.scrollToSection(state.currentSection + direction);
            }
        }

        scrollToSection(index) {
            if (index < 0 || index >= DOM.sections.length || state.isScrolling) return;

            state.isScrolling = true;
            state.currentSection = index;

            const targetSection = DOM.sections[index];
            const start = window.pageYOffset;
            const target = targetSection.offsetTop - CONFIG.offset;
            const distance = target - start;
            let startTime = null;

            const animate = (currentTime) => {
                if (!startTime) startTime = currentTime;
                const progress = Math.min((currentTime - startTime) / CONFIG.duration, 1);
                
                window.scrollTo(0, start + (distance * utils.ease(progress)));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    state.isScrolling = false;
                    this.updateNavigation();
                }
            };

            requestAnimationFrame(animate);
        }

        createNavigation() {
            const nav = document.createElement('div');
            nav.className = 'section-navigation';
            
            DOM.sections.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'section-dot';
                dot.addEventListener('click', () => this.scrollToSection(index));
                nav.appendChild(dot);
            });

            document.body.appendChild(nav);
            DOM.dots = document.querySelectorAll('.section-dot');
        }

        updateNavigation() {
            DOM.dots?.forEach((dot, index) => {
                dot.classList.toggle('active', index === state.currentSection);
            });
        }
    }

    // Initialize
    const smoothScroll = new SmoothScroll();

    // Intersection Observer setup
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                state.currentSection = Array.from(DOM.sections).indexOf(entry.target);
                smoothScroll.updateNavigation();
            }
        });
    }, { threshold: CONFIG.threshold });

    DOM.sections.forEach(section => observer.observe(section));

    // Add styles
    const styles = `
        .section-navigation {
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .section-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .section-dot.active {
            background: #000;
            transform: scale(1.5);
        }
        section {
            min-height: 100vh;
            position: relative;
            overflow: hidden;
        }
        .work {
            padding-top: 100px;
        }
        .work h2 {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s ease;
        }
        .work.visible h2 {
            opacity: 1;
            transform: translateY(0);
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
});