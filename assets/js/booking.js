// Booking form management (Frontend only)
class BookingManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.serviceData = {
            'health-appointments': {
                name: 'Health Appointments',
                packages: {
                    'hourly': { name: 'Hourly Rate', price: 70, description: 'RM35/hour (min 2 hours)' },
                    'package1': { name: 'Package 1', price: 132, description: '4 hours session' },
                    'package2': { name: 'Package 2', price: 186, description: '6 hours session' }
                }
            },
            'dialysis': {
                name: 'Dialysis Support',
                packages: {
                    'hourly': { name: 'Hourly Rate', price: 35, description: 'RM35/hour' },
                    'package1': { name: 'Package 1', price: 186, description: '6 hours (3 sessions)' },
                    'package2': { name: 'Package 2', price: 720, description: '24 hours (12 sessions)' },
                    'companion': { name: 'Companion Service', price: 30, description: 'RM30/hour during treatment' }
                }
            },
            'home-package': {
                name: 'Home Care Package',
                packages: {
                    'package1': { name: 'Package 1', price: 1680, description: '4 hrs/day, 20 sessions' },
                    'package2': { name: 'Package 2', price: 2280, description: '6 hrs/day, 20 sessions' },
                    'package3': { name: 'Package 3', price: 2880, description: '8 hrs/day, 20 sessions' },
                    'package4': { name: 'Package 4', price: 3500, description: '10 hrs/day, 20 sessions' }
                }
            },
            'home-plus-package': {
                name: 'Home Care (Plus) Package',
                packages: {
                    'package1': { name: 'Package 1', price: 2000, description: '4 hrs/day, 20 sessions' },
                    'package2': { name: 'Package 2', price: 2650, description: '6 hrs/day, 20 sessions' },
                    'package3': { name: 'Package 3', price: 3350, description: '8 hrs/day, 20 sessions' },
                    'package4': { name: 'Package 4', price: 4000, description: '10 hrs/day, 20 sessions' }
                }
            },
            'custom-activities': {
                name: 'Custom Activities',
                packages: {
                    'basic': { name: 'Basic Package', price: 70, description: '2 hours session' }
                }
            }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgressSteps();
        this.setMinDate();
        
        // Initialize service selection handlers
        this.initServiceHandlers();
    }

    bindEvents() {
        // Form submission
        const form = document.getElementById('booking-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processBooking();
            });
        }

        // Service selection changes
        document.querySelectorAll('input[name="service"]').forEach(input => {
            input.addEventListener('change', this.handleServiceChange.bind(this));
        });

        // Package selection changes
        document.addEventListener('change', (e) => {
            if (e.target.name && e.target.name.includes('_package')) {
                this.updateSummary();
            }
        });

        // Form input changes for real-time validation and summary updates
        document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.updateSummary.bind(this));
        });

        // Phone number formatting
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', this.formatPhoneInput.bind(this));
        });
    }

    initServiceHandlers() {
        // Handle service selection to show/hide pricing options
        document.querySelectorAll('input[name="service"]').forEach(input => {
            input.addEventListener('change', (e) => {
                // Hide all pricing sections
                document.querySelectorAll('.service-pricing').forEach(pricing => {
                    pricing.style.display = 'none';
                });

                // Show pricing for selected service
                const selectedService = e.target.closest('.service-option');
                const pricingSection = selectedService.querySelector('.service-pricing');
                if (pricingSection) {
                    pricingSection.style.display = 'block';
                }

                // Clear previous package selections
                document.querySelectorAll('input[name$="_package"]').forEach(pkg => {
                    pkg.checked = false;
                });

                this.updateSummary();
            });
        });
    }

    setMinDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dateInput = document.getElementById('preferred-date');
        if (dateInput) {
            dateInput.min = tomorrow.toISOString().split('T')[0];
        }
    }

    handleServiceChange(e) {
        const serviceType = e.target.value;
        this.updateSummary();
    }

    formatPhoneInput(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Malaysian phone number formatting
        if (value.startsWith('60')) {
            value = '+' + value;
        } else if (value.startsWith('01')) {
            value = '+6' + value;
        } else if (value.startsWith('1') && value.length > 1) {
            value = '+60' + value;
        }
        
        // Format display
        if (value.startsWith('+601')) {
            const formatted = value.replace(/(\+60)(\d{1,2})(\d{0,3})(\d{0,4})/, (match, p1, p2, p3, p4) => {
                let result = p1 + ' ' + p2;
                if (p3) result += '-' + p3;
                if (p4) result += ' ' + p4;
                return result;
            });
            e.target.value = formatted;
        } else {
            e.target.value = value;
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepDisplay();
                this.updateProgressSteps();
                
                if (this.currentStep === 3) {
                    this.updateSummary();
                }
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateProgressSteps();
        }
    }

    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateProgressSteps() {
        document.querySelectorAll('.progress-steps .step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateServiceSelection();
            case 2:
                return this.validatePersonalDetails();
            case 3:
                return this.validateFinalStep();
            default:
                return true;
        }
    }

    validateServiceSelection() {
        const serviceSelected = document.querySelector('input[name="service"]:checked');
        if (!serviceSelected) {
            this.showError('Please select a service');
            return false;
        }

        const serviceType = serviceSelected.value;
        const packageFieldName = serviceType.replace('-', '_') + '_package';
        const packageSelected = document.querySelector(`input[name="${packageFieldName}"]:checked`);
        
        if (!packageSelected) {
            this.showError('Please select a package for your chosen service');
            return false;
        }

        return true;
    }

    validatePersonalDetails() {
        const requiredFields = ['full_name', 'phone', 'email', 'address', 'preferred_date', 'preferred_time'];
        let isValid = true;

        requiredFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (!field || !field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Validate email format
        const emailField = document.querySelector('[name="email"]');
        if (emailField && emailField.value && !this.isValidEmail(emailField.value)) {
            this.showFieldError(emailField, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate phone format
        const phoneField = document.querySelector('[name="phone"]');
        if (phoneField && phoneField.value && !this.isValidPhone(phoneField.value)) {
            this.showFieldError(phoneField, 'Please enter a valid phone number');
            isValid = false;
        }

        return isValid;
    }

    validateFinalStep() {
        const termsAgreed = document.querySelector('input[name="terms_agreed"]');
        if (!termsAgreed || !termsAgreed.checked) {
            this.showError('Please agree to the terms and conditions');
            return false;
        }
        return true;
    }

    validateField(e) {
        const field = e.target;
        const value = field.value.trim();

        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            this.showFieldError(field, 'Please enter a valid phone number');
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        // Remove all non-digits and check Malaysian phone format
        const cleaned = phone.replace(/\D/g, '');
        return /^(60)?1[0-46-9][0-9]{7,8}$/.test(cleaned);
    }

    showFieldError(field, message) {
        if (!field) return;
        
        this.clearFieldError(field);
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        if (!field) return;
        
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    showError(message) {
        if (window.TemanMalaysia && window.TemanMalaysia.showToast) {
            window.TemanMalaysia.showToast('error', message);
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (window.TemanMalaysia && window.TemanMalaysia.showToast) {
            window.TemanMalaysia.showToast('success', message);
        } else {
            alert(message);
        }
    }

    updateSummary() {
        const serviceInput = document.querySelector('input[name="service"]:checked');
        if (!serviceInput) return;

        const serviceType = serviceInput.value;
        const serviceData = this.serviceData[serviceType];
        
        if (!serviceData) return;

        const packageFieldName = serviceType.replace('-', '_') + '_package';
        const packageInput = document.querySelector(`input[name="${packageFieldName}"]:checked`);
        if (!packageInput) return;

        const packageData = serviceData.packages[packageInput.value];
        const amount = packageData.price;

        // Update service details
        this.updateElement('summary-service', serviceData.name);
        this.updateElement('summary-package', `${packageData.name} - ${packageData.description}`);
        this.updateElement('summary-total', this.formatCurrency(amount));

        // Update personal details if available
        this.updateSummaryField('summary-name', 'full_name');
        this.updateSummaryField('summary-phone', 'phone');
        this.updateSummaryField('summary-email', 'email');
        this.updateSummaryField('summary-address', 'address');

        // Update date and time
        const dateField = document.querySelector('[name="preferred_date"]');
        const timeField = document.querySelector('[name="preferred_time"]');
        if (dateField && dateField.value && timeField && timeField.value) {
            const date = new Date(dateField.value).toLocaleDateString('en-MY');
            this.updateElement('summary-datetime', `${date} at ${timeField.value}`);
        }

        // Store current selection
        this.formData.selectedService = serviceType;
        this.formData.selectedPackage = packageInput.value;
        this.formData.amount = amount;
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || '-';
        }
    }

    updateSummaryField(summaryId, fieldName) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field && field.value) {
            this.updateElement(summaryId, field.value);
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR'
        }).format(amount);
    }

    collectFormData() {
        const formData = new FormData(document.getElementById('booking-form'));
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Add calculated fields
        data.total_amount = this.formData.amount;
        data.service_name = this.serviceData[this.formData.selectedService]?.name;
        data.package_name = this.serviceData[this.formData.selectedService]?.packages[this.formData.selectedPackage]?.name;
        data.booking_reference = this.generateBookingReference();
        data.submission_date = new Date().toISOString();
        
        return data;
    }

    generateBookingReference() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        return `TM${timestamp}${random}`;
    }

    async processBooking() {
        try {
            const submitButton = document.getElementById('submit-booking-btn');
            const originalText = submitButton.innerHTML;
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            const bookingData = this.collectFormData();
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // In a real implementation, you would send this data to your backend
            console.log('Booking Data:', bookingData);
            
            // Show success modal
            this.showBookingSuccess(bookingData.booking_reference);
            
            // Reset form
            document.getElementById('booking-form').reset();
            this.currentStep = 1;
            this.updateStepDisplay();
            this.updateProgressSteps();
            
        } catch (error) {
            console.error('Booking submission error:', error);
            this.showError('Failed to submit booking. Please try again.');
        } finally {
            const submitButton = document.getElementById('submit-booking-btn');
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Booking Request';
        }
    }

    showBookingSuccess(bookingRef) {
        const modal = document.getElementById('booking-success-modal');
        const refElement = document.getElementById('booking-ref-number');
        
        if (modal && refElement) {
            refElement.textContent = bookingRef;
            modal.style.display = 'flex';
            modal.classList.add('show');
        }
    }
}

// Global functions for navigation
function nextStep() {
    if (window.bookingManager) {
        window.bookingManager.nextStep();
    }
}

function prevStep() {
    if (window.bookingManager) {
        window.bookingManager.prevStep();
    }
}

function closeModal() {
    const modal = document.getElementById('booking-success-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

// Initialize booking manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on booking page
    if (document.getElementById('booking-form')) {
        window.bookingManager = new BookingManager();
        console.log('Booking Manager initialized');
    }
});

// Handle page refresh/navigation warning
window.addEventListener('beforeunload', (e) => {
    if (window.bookingManager && window.bookingManager.currentStep > 1) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your booking progress will be lost.';
        return e.returnValue;
    }
});