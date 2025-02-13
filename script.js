document.addEventListener('DOMContentLoaded', function () {
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
        dots: null, // Will be populated after creation
        bentoGrid: document.querySelector('.bento-grid') // Add Bento Grid container
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

document.addEventListener('DOMContentLoaded', function () {
    const bentoItems = document.querySelectorAll('.bento-item');

    bentoItems.forEach(item => {
        const bentoContent = item.querySelector('.bento-content');
        const expandedView = item.querySelector('.expanded-view');
        const backButton = item.querySelector('.back-button');

        // Click to expand
        bentoContent.addEventListener('click', () => {
            item.classList.add('expanded');
            expandedView.style.display = 'flex';
        });

        // Click to collapse
        backButton.addEventListener('click', () => {
            item.classList.remove('expanded');
            expandedView.style.display = 'none';
        });
    });
});
});

// script.js
document.addEventListener('DOMContentLoaded', function () {
    const bentoItems = document.querySelectorAll('.bento-item');

    bentoItems.forEach(item => {
        const bentoContent = item.querySelector('.bento-content');
        const expandedView = item.querySelector('.expanded-view');
        const backButton = item.querySelector('.back-button');

        // Click to expand
        bentoContent.addEventListener('click', () => {
            // Collapse all other expanded items
            bentoItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('expanded')) {
                    otherItem.classList.remove('expanded');
                    otherItem.querySelector('.expanded-view').style.display = 'none';
                }
            });

            // Expand the clicked item
            item.classList.add('expanded');
            expandedView.style.display = 'flex';
        });

        // Click to collapse
        backButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the click from bubbling up to the parent
            item.classList.remove('expanded');
            expandedView.style.display = 'none';
        });
    });
});