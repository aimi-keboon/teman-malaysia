// Testimonials Slider Component for Teman Malaysia

class TestimonialsSlider {
    constructor(container) {
        this.container = container;
        this.cards = container.querySelectorAll('.testimonial-card');
        this.dots = container.querySelectorAll('.dot');
        this.prevBtn = container.querySelector('.testimonial__prev');
        this.nextBtn = container.querySelector('.testimonial__next');
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000;
        
        this.init();
    }
    
    init() {
        if (this.cards.length === 0) return;
        
        this.bindEvents();
        this.startAutoPlay();
        this.showSlide(0);
    }
    
    bindEvents() {
        // Navigation buttons
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.next();
                this.resetAutoPlay();
            });
        }
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prev();
                this.resetAutoPlay();
            });
        }
        
        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
                this.resetAutoPlay();
            });
        });
        
        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
                this.resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                this.next();
                this.resetAutoPlay();
            }
        });
        
        // Pause on hover
        this.container.addEventListener('mouseenter', () => {
            this.pauseAutoPlay();
        });
        
        this.container.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
        
        // Touch/swipe support
        this.initTouchEvents();
    }
    
    initTouchEvents() {
        let startX = 0;
        let startY = 0;
        let distX = 0;
        let distY = 0;
        let threshold = 50;
        
        this.container.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });
        
        this.container.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const touch = e.touches[0];
            distX = touch.clientX - startX;
            distY = touch.clientY - startY;
        });
        
        this.container.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > threshold) {
                if (distX > 0) {
                    this.prev();
                } else {
                    this.next();
                }
                this.resetAutoPlay();
            }
            
            startX = 0;
            startY = 0;
            distX = 0;
            distY = 0;
        });
    }
    
    showSlide(index) {
        // Hide all slides
        this.cards.forEach(card => {
            card.classList.remove('active');
            card.setAttribute('aria-hidden', 'true');
        });
        
        // Remove active state from all dots
        this.dots.forEach(dot => {
            dot.classList.remove('active');
            dot.setAttribute('aria-pressed', 'false');
        });
        
        // Show current slide
        if (this.cards[index]) {
            this.cards[index].classList.add('active');
            this.cards[index].setAttribute('aria-hidden', 'false');
        }
        
        // Activate current dot
        if (this.dots[index]) {
            this.dots[index].classList.add('active');
            this.dots[index].setAttribute('aria-pressed', 'true');
        }
        
        this.currentIndex = index;
        
        // Update button states
        this.updateButtonStates();
    }
    
    updateButtonStates() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentIndex === 0;
            this.prevBtn.setAttribute('aria-label', 
                this.currentIndex === 0 ? 'Previous testimonial (disabled)' : 'Previous testimonial'
            );
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentIndex === this.cards.length - 1;
            this.nextBtn.setAttribute('aria-label', 
                this.currentIndex === this.cards.length - 1 ? 'Next testimonial (disabled)' : 'Next testimonial'
            );
        }
    }
    
    next() {
        const nextIndex = (this.currentIndex + 1) % this.cards.length;
        this.showSlide(nextIndex);
    }
    
    prev() {
        const prevIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        this.showSlide(prevIndex);
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.cards.length) {
            this.showSlide(index);
        }
    }
    
    startAutoPlay() {
        if (this.cards.length <= 1) return;
        
        this.autoPlayInterval = setInterval(() => {
            this.next();
        }, this.autoPlayDelay);
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    resetAutoPlay() {
        this.pauseAutoPlay();
        this.startAutoPlay();
    }
    
    destroy() {
        this.pauseAutoPlay();
        // Remove event listeners if needed
    }
}

// Initialize testimonials slider when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const testimonialsContainer = document.querySelector('.testimonials__slider');
    if (testimonialsContainer) {
        new TestimonialsSlider(testimonialsContainer);
    }
});

// Export for use in other scripts
window.TestimonialsSlider = TestimonialsSlider;