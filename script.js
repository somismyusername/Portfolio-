document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sections = document.querySelectorAll('section');
    const navbar = document.getElementById('navbar');
    let currentSection = 0;
    let isScrolling = false;

    // Smooth Scroll Configuration
    const scrollConfig = {
        duration: 1000,  // Duration of scroll animation
        easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)', // Smooth easing function
        offset: 100 // Offset for navbar height
    };

    // Initialize ScrollTrigger
    function initScrollTrigger() {
        document.addEventListener('wheel', handleScroll, { passive: false });
        document.addEventListener('keydown', handleKeyPress);
    }

    // Handle mouse wheel scroll
    function handleScroll(e) {
        e.preventDefault();
        
        if (isScrolling) return;

        const direction = e.deltaY > 0 ? 1 : -1;
        scrollToSection(currentSection + direction);
    }

    // Handle keyboard navigation
    function handleKeyPress(e) {
        if (isScrolling) return;

        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            scrollToSection(currentSection + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scrollToSection(currentSection - 1);
        }
    }

    // Smooth scroll to section
    function scrollToSection(index) {
        if (index < 0 || index >= sections.length || isScrolling) return;

        isScrolling = true;
        currentSection = index;

        const targetSection = sections[index];
        const start = window.pageYOffset;
        const target = targetSection.offsetTop - scrollConfig.offset;
        const distance = target - start;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / scrollConfig.duration, 1);
            
            // Easing function for smooth transition
            const ease = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            
            window.scrollTo(0, start + (distance * ease(progress)));

            if (timeElapsed < scrollConfig.duration) {
                requestAnimationFrame(animation);
            } else {
                isScrolling = false;
                updateNavigation();
            }
        }

        requestAnimationFrame(animation);
    }

    // Update navigation dots/indicators
    function updateNavigation() {
        const dots = document.querySelectorAll('.section-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSection);
        });
    }

    // Create navigation dots
    function createNavigationDots() {
        const nav = document.createElement('div');
        nav.className = 'section-navigation';
        
        sections.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'section-dot';
            dot.addEventListener('click', () => scrollToSection(index));
            nav.appendChild(dot);
        });

        document.body.appendChild(nav);
    }

    // Add this CSS for the navigation dots
    const style = document.createElement('style');
    style.textContent = `
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
            padding-top: 100px; /* Ensure title is visible */
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
    document.head.appendChild(style);

    // Initialize
    initScrollTrigger();
    createNavigationDots();
    updateNavigation();

    // Handle smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = Array.from(sections).findIndex(
                section => section.id === targetId
            );
            if (targetSection >= 0) {
                scrollToSection(targetSection);
            }
        });
    });

    // Update section visibility on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                currentSection = Array.from(sections).indexOf(entry.target);
                updateNavigation();
            }
        });
    }, {
        threshold: 0.5
    });

    sections.forEach(section => observer.observe(section));
});