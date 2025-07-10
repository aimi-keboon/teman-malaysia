// Contact Form Handler for Teman Malaysia

class ContactFormHandler {
    constructor(form) {
        this.form = form;
        this.submitButton = form.querySelector('button[type="submit"]');
        this.originalButtonText = this.submitButton ? this.submitButton.innerHTML : '';
        this.isSubmitting = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupValidation();
    }
    
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
        
        // Phone number formatting
        const phoneInput = this.form.querySelector('input[type="tel"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
    }
    
    setupValidation() {
        // Add required attributes and validation rules
        const emailInput = this.form.querySelector('input[type="email"]');
        if (emailInput) {
            emailInput.setAttribute('pattern', '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}');
        }
    
        const phoneInput = this.form.querySelector('input[type="tel"]');
        if (phoneInput) {
            phoneInput.setAttribute('pattern', '^(\\+?6?01)[0-46-9]-?[0-9]{7,8}$');
        }
    }
    
    
    async handleSubmit() {
        if (this.isSubmitting) return;
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        this.isSubmitting = true;
        this.showLoadingState();
        
        try {
            const formData = this.collectFormData();
            
            // Simulate API call (replace with actual endpoint)
            await this.submitForm(formData);
            
            this.showSuccessState();
            this.resetForm();
            
        } catch (error) {
            this.showErrorState(error.message);
        } finally {
            this.isSubmitting = false;
            this.resetButtonState();
        }
    }
    
    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const isRequired = field.hasAttribute('required');
        
        // Clear previous errors
        this.clearFieldError(field);
        
        // Required field validation
        if (isRequired && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        // Skip further validation if field is empty and not required
        if (!value && !isRequired) {
            return true;
        }
        
        // Email validation
        if (fieldType === 'email' && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        // Phone validation
        if (fieldType === 'tel' && !this.isValidPhone(value)) {
            this.showFieldError(field, 'Please enter a valid Malaysian phone number');
            return false;
        }
        
        // Text length validation
        if (field.minLength && value.length < field.minLength) {
            this.showFieldError(field, `Minimum ${field.minLength} characters required`);
            return false;
        }
        
        if (field.maxLength && value.length > field.maxLength) {
            this.showFieldError(field, `Maximum ${field.maxLength} characters allowed`);
            return false;
        }
        
        return true;
    }
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        field.parentNode.appendChild(errorDiv);
        
        // Focus on first error field
        if (!this.form.querySelector('.error:focus')) {
            field.focus();
        }
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add timestamp and additional metadata
        data.timestamp = new Date().toISOString();
        data.source = 'website_contact_form';
        data.user_agent = navigator.userAgent;
        data.page_url = window.location.href;
        
        return data;
    }
    
    async submitForm(data) {
        // Simulate API call - replace with actual endpoint
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                if (Math.random() > 0.1) { // 90% success rate
                    console.log('Form submitted successfully:', data);
                    resolve({ success: true, message: 'Form submitted successfully' });
                } else {
                    reject(new Error('Failed to submit form. Please try again.'));
                }
            }, 2000);
        });
        
        /* 
        // Actual implementation would look like this:
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
        */
    }
    
    showLoadingState() {
        if (this.submitButton) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        }
    }
    
    showSuccessState() {
        // Show success toast
        if (window.TemanMalaysia && window.TemanMalaysia.showToast) {
            window.TemanMalaysia.showToast('success', 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.');
        }
        
        // Scroll to top of form
        this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showErrorState(message) {
        // Show error toast
        if (window.TemanMalaysia && window.TemanMalaysia.showToast) {
            window.TemanMalaysia.showToast('error', message || 'Failed to send message. Please try again.');
        }
    }
    
    resetButtonState() {
        if (this.submitButton) {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = this.originalButtonText;
        }
    }
    
    resetForm() {
        this.form.reset();
        
        // Clear all field errors
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => {
            this.clearFieldError(field);
        });
        
        // Focus on first input
        const firstInput = this.form.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }
    
    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        // Malaysian phone number formatting
        if (value.startsWith('60')) {
            value = '+' + value;
        } else if (value.startsWith('01')) {
            value = '+6' + value;
        } else if (value.startsWith('1') && value.length > 1) {
            value = '+60' + value;
        }
        
        // Format display for Malaysian numbers
        if (value.startsWith('+601')) {
            const formatted = value.replace(/(\+60)(\d{1,2})(\d{0,3})(\d{0,4})/, (match, p1, p2, p3, p4) => {
                let result = p1 + ' ' + p2;
                if (p3) result += '-' + p3;
                if (p4) result += ' ' + p4;
                return result;
            });
            input.value = formatted;
        } else {
            input.value = value;
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isValidPhone(phone) {
        // Remove all non-digits and check Malaysian phone format
        const cleaned = phone.replace(/\D/g, '');
        const malaysianPhoneRegex = /^(60)?1[0-46-9][0-9]{7,8}$/;
        return malaysianPhoneRegex.test(cleaned);
    }
}

// Auto-initialize contact forms when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        new ContactFormHandler(contactForm);
    }
    
    // Initialize any other forms with contact-form class
    const additionalForms = document.querySelectorAll('.contact-form');
    additionalForms.forEach(form => {
        if (form.id !== 'contact-form') { // Avoid double initialization
            new ContactFormHandler(form);
        }
    });
});

// Export for use in other scripts
window.ContactFormHandler = ContactFormHandler;