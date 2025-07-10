// Main JavaScript for Teman Malaysia Website

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileNavigation();
    initScrollEffects();
    initContactForms();
    initAnimations();
    initToastNotifications();
    
    console.log('Teman Malaysia website loaded successfully!');
});

// ===== MOBILE NAVIGATION =====
function initMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
            
            // Toggle hamburger icon
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('show')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });

        // Close menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('show');
                const icon = navToggle.querySelector('i');
                icon.className = 'fas fa-bars';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('show');
                const icon = navToggle.querySelector('i');
                icon.className = 'fas fa-bars';
            }
        });
    }
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    const header = document.getElementById('header');
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== CONTACT FORMS =====
function initContactForms() {
    const forms = document.querySelectorAll('form[data-form-type]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this);
        });
    });
}

function handleFormSubmission(form) {
    const formType = form.getAttribute('data-form-type');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Collect form data
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Validate form
    if (!validateForm(form)) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
        return;
    }
    
    // Simulate form submission (replace with actual submission logic)
    setTimeout(() => {
        // Reset form
        form.reset();
        
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
        
        // Show success message
        showToast('success', 'Message sent successfully! We\'ll get back to you soon.');
        
        // Log data (for development)
        console.log('Form submitted:', { type: formType, data });
        
    }, 2000);
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
            
            // Additional validation
            if (field.type === 'email' && !isValidEmail(field.value)) {
                showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            }
            
            if (field.type === 'tel' && !isValidPhone(field.value)) {
                showFieldError(field, 'Please enter a valid phone number');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    // Malaysian phone number format
    return /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/.test(phone.replace(/\s/g, ''));
}

// ===== ANIMATIONS =====
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Add animation to elements
    const animateElements = document.querySelectorAll('.card, .feature-item, .testimonial-card');
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

// ===== TOAST NOTIFICATIONS =====
function initToastNotifications() {
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
}

function showToast(type, message, duration = 5000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Toast types: success, error, warning, info
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <i class="${icons[type]}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles for close button
    const style = toast.querySelector('.toast-close').style;
    style.background = 'none';
    style.border = 'none';
    style.color = 'inherit';
    style.marginLeft = 'auto';
    style.cursor = 'pointer';
    style.padding = '0 0 0 10px';
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

// ===== UTILITY FUNCTIONS =====

// Debounce function for performance
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Format currency for Malaysian Ringgit
function formatCurrency(amount) {
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR'
    }).format(amount);
}

// Format phone number
function formatPhoneNumber(phone) {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format Malaysian phone numbers
    if (cleaned.startsWith('60')) {
        return `+${cleaned}`;
    } else if (cleaned.startsWith('01')) {
        return `+6${cleaned}`;
    } else if (cleaned.startsWith('1')) {
        return `+60${cleaned}`;
    }
    
    return phone;
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('success', 'Copied to clipboard!');
    }).catch(() => {
        showToast('error', 'Failed to copy to clipboard');
    });
}

// Generate unique ID
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ===== GLOBAL ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    // In production, you might want to send this to an error tracking service
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

// ===== EXPORT FUNCTIONS (for use in other scripts) =====
window.TemanMalaysia = {
    showToast,
    formatCurrency,
    formatPhoneNumber,
    copyToClipboard,
    generateId,
    validateForm,
    isValidEmail,
    isValidPhone
};