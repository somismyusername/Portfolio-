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

    // Generate Bento Grid
    const projects = [
        {
            title: "UI/UX Intern",
            company: "American Health Care Academy",
            image: "ahca.png",
            link: "#",
        },
        {
            title: "Brand Designer",
            company: "Mandara Dairy",
            image: "Mandara.png",
            link: "#",
        },
        {
            title: "Product Designer",
            company: "Minervaa",
            image: "minervaa.png",
            link: "#",
        },
        {
            title: "Brand Designer",
            company: "Mandara Milk",
            image: "soilsenses.png",
            link: "#",
        },
        // Add more projects here
    ];

    if (DOM.bentoGrid) {
        projects.forEach((project) => {
            const bentoItem = document.createElement('div');
            bentoItem.classList.add('bento-item');

            bentoItem.innerHTML = `
                <div class="bento-content">
                    <img src="${project.image}" alt="${project.title}">
                    <div class="bento-info">
                        <h3>${project.title}</h3>
                        <p>${project.company}</p>
                        <button class="view-project">View Project</button>
                    </div>
                </div>
            `;

            DOM.bentoGrid.appendChild(bentoItem);
        });
    }

    // Initialize Smooth Scroll
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
        .bento-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 20px;
        }
        .bento-item {
            position: relative;
            overflow: hidden;
            border-radius: 12px;
            background: #f5f5f5;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .bento-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        .bento-content img {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 12px;
        }
        .bento-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 0 0 12px 12px;
            transform: translateY(100%);
            transition: transform 0.3s ease;
        }
        .bento-item:hover .bento-info {
            transform: translateY(0);
        }
        .bento-info h3 {
            margin: 0;
            font-size: 1.2rem;
        }
        .bento-info p {
            margin: 5px 0 0;
            font-size: 0.9rem;
        }
        .bento-info .view-project {
            margin-top: 10px;
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        .bento-info .view-project:hover {
            background: #0056b3;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
});