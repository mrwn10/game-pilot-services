// Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-menu .nav-link'); // Only get menu links, not logo

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', navToggle.classList.contains('active'));
});

// Close mobile menu when clicking on a nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        
        // Update active state
        navLinks.forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');
    });
});

// Update active nav link based on scroll position
function updateActiveNavLink() {
    const fromTop = window.scrollY + 100;
    
    navLinks.forEach(link => {
        const section = document.querySelector(link.getAttribute('href'));
        if (section) {
            if (
                section.offsetTop <= fromTop &&
                section.offsetTop + section.offsetHeight > fromTop
            ) {
                navLinks.forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });
    
    // Handle home section separately
    const homeSection = document.querySelector('#home');
    const homeLink = document.querySelector('.nav-menu a[href="#home"]');
    if (homeSection && homeLink) {
        if (window.scrollY < 100) {
            navLinks.forEach(nav => nav.classList.remove('active'));
            homeLink.classList.add('active');
        }
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Update active state for navigation menu links only
            if (this.classList.contains('nav-link') && this.closest('.nav-menu')) {
                navLinks.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(10, 10, 20, 0.98)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = 'rgba(10, 10, 20, 0.95)';
    }
    
    // Update active nav link on scroll
    updateActiveNavLink();
});

// Video background handling
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('bg-video');
    
    // Ensure video plays and loops properly
    video.addEventListener('loadeddata', function() {
        video.play();
    });
    
    // Fallback in case video doesn't load
    setTimeout(function() {
        if (video.readyState < 3) {
            console.log('Video might not be loading properly');
        }
    }, 3000);
});

// Stats Carousel with Infinite Loop
class StatsCarousel {
    constructor() {
        this.carouselTrack = document.getElementById('carousel-track');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.indicatorsContainer = document.getElementById('carousel-indicators');
        
        this.slides = [];
        this.currentSlide = 0;
        this.totalSlides = 8; // flex1.png to flex8.png
        this.isTransitioning = false;
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    init() {
        this.createSlides();
        this.createIndicators();
        this.setupEventListeners();
        this.updateCarousel();
        this.startAutoPlay();
    }
    
    createSlides() {
        const statsData = [
            { title: "Union Level 80 Pilot", description: "Experienced and battle-proven with top-tier game knowledge and mastery." },
            { title: "Master Explorer", description: "Fully unlocked regions, hidden routes, and secret challenges across the map." },
            { title: "Precision Builder", description: "Optimized characters with the best Echo sets, stats, and synergy combinations." },
            { title: "Tactical Combat Expert", description: "Executes advanced rotations and team strategies for maximum DPS output." },
            { title: "Efficient Grinder", description: "Completes resource runs and Echo farming with exceptional time efficiency." },
            { title: "Event Completionist", description: "Cleared all limited-time and seasonal events with 100% success rate." },
            { title: "Secure Account Handler", description: "Manual-only piloting with full privacy, safety, and transparency guaranteed." },
            { title: "Endgame Veteran", description: "Dominates all mythic and high-difficulty challenges with consistent performance." }
        ];
        
        for (let i = 1; i <= this.totalSlides; i++) {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `
                <img src="img/flex${i}.png" alt="Stats ${i}" class="carousel-image">
                <div class="carousel-caption">
                    <h3>${statsData[i-1].title}</h3>
                    <p>${statsData[i-1].description}</p>
                </div>
            `;
            this.slides.push(slide);
            this.carouselTrack.appendChild(slide);
        }
    }
    
    createIndicators() {
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
            indicator.setAttribute('data-slide', i);
            indicator.addEventListener('click', () => this.goToSlide(i));
            this.indicatorsContainer.appendChild(indicator);
        }
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Pause auto-play on hover
        this.carouselTrack.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.carouselTrack.addEventListener('mouseleave', () => this.startAutoPlay());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
        
        // Touch/swipe support
        let startX = 0;
        let endX = 0;
        
        this.carouselTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.carouselTrack.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
        });
    }
    
    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }
    
    nextSlide() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }
    
    prevSlide() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }
    
    goToSlide(slideIndex) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.currentSlide = slideIndex;
        this.updateCarousel();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }
    
    updateCarousel() {
        const translateX = -this.currentSlide * 100;
        this.carouselTrack.style.transform = `translateX(${translateX}%)`;
        
        // Update indicators
        document.querySelectorAll('.carousel-indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 4000); // Change slide every 4 seconds
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Add animation to elements when they come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize stats carousel
    new StatsCarousel();
    
    // Set initial active state for home link
    const homeLink = document.querySelector('.nav-menu a[href="#home"]');
    if (homeLink && window.scrollY < 100) {
        navLinks.forEach(nav => nav.classList.remove('active'));
        homeLink.classList.add('active');
    }
    
    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll('.game-card, .step, .highlight-item, .contact-method, .carousel-container');
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
});

// Footer social icons interaction
document.addEventListener('DOMContentLoaded', () => {
    const socialIcons = document.querySelectorAll('.social-icon');
    
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.1)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Add loading animation for better user experience
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Enhanced smooth scrolling with offset for footer links
document.querySelectorAll('.footer-column a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offsetPosition = targetElement.offsetTop - 100;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});