// Booking form management and Billplz integration
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
                    'package2': { name: 'Package 2', price: 720, description: '24 hours (12 sessions)' }
                }
            },
            'home-package': {
                name: 'Home Care Package',
                packages: {
                    'package1': { name: 'Package 1', price: 1680, description: '4 hrs/day, 20 sessions' },
                    'package2': { name: 'Package 2', price: 2280, description: '6 hrs/day, 20 sessions' },
                    'package3': { name: 'Package 3', price: 2880, description: '8 hrs/day, 20 sessions' }
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
    }

    bindEvents() {
        // Form submission
        document.getElementById('booking-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });

        // Service selection changes
        document.querySelectorAll('input[name="service"]').forEach(input => {
            input.addEventListener('change', this.handleServiceChange.bind(this));
        });

        // Package selection changes
        document.addEventListener('change', (e) => {
            if (e.target.name.includes('_package')) {
                this.updateSummary();
            }
        });

        // Form input changes for real-time validation
        document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.updateSummary.bind(this));
        });
    }

    setMinDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dateInput = document.getElementById('preferred-date');
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }

    handleServiceChange(e) {
        const serviceType = e.target.value;
        const serviceOptions = document.querySelectorAll('.service-option');
        
        // Hide all package options first
        serviceOptions.forEach(option => {
            const packageOptions = option.querySelectorAll('.service-pricing');
            packageOptions.forEach(pkg => pkg.style.display = 'none');
        });

        // Show selected service package options
        const selectedOption = document.querySelector(`[data-service="${serviceType}"]`);
        if (selectedOption) {
            const packageOptions = selectedOption.querySelector('.service-pricing');
            if (packageOptions) {
                packageOptions.style.display = 'block';
            }
        }

        this.updateSummary();
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
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.add('active');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateProgressSteps() {
        document.querySelectorAll('.step').forEach((step, index) => {
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
                return this.validatePaymentDetails();
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
        const packageSelected = document.querySelector(`input[name="${serviceType.replace('-', '_')}_package"]:checked`);
        
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
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Validate email format
        const emailField = document.querySelector('[name="email"]');
        if (emailField.value && !this.isValidEmail(emailField.value)) {
            this.showFieldError(emailField, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate phone format
        const phoneField = document.querySelector('[name="phone"]');
        if (phoneField.value && !this.isValidPhone(phoneField.value)) {
            this.showFieldError(phoneField, 'Please enter a valid phone number');
            isValid = false;
        }

        return isValid;
    }

    validatePaymentDetails() {
        const termsAgreed = document.querySelector('input[name="terms_agreed"]').checked;
        if (!termsAgreed) {
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
        return /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/.test(phone.replace(/\s/g, ''));
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast toast--error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast--success';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    updateSummary() {
        const serviceInput = document.querySelector('input[name="service"]:checked');
        if (!serviceInput) return;

        const serviceType = serviceInput.value;
        const serviceData = this.serviceData[serviceType];
        
        if (!serviceData) return;

        const packageInput = document.querySelector(`input[name="${serviceType.replace('-', '_')}_package"]:checked`);
        if (!packageInput) return;

        const packageData = serviceData.packages[packageInput.value];
        const amount = packageData.price;

        // Update service details
        document.getElementById('summary-service').textContent = serviceData.name;
        document.getElementById('summary-package').textContent = `${packageData.name} - ${packageData.description}`;
        document.getElementById('summary-total').textContent = `RM ${amount.toLocaleString()}`;

        // Update personal details if available
        const nameField = document.querySelector('[name="full_name"]');
        const phoneField = document.querySelector('[name="phone"]');
        const emailField = document.querySelector('[name="email"]');
        const dateField = document.querySelector('[name="preferred_date"]');
        const timeField = document.querySelector('[name="preferred_time"]');

        if (nameField && nameField.value) {
            document.getElementById('summary-name').textContent = nameField.value;
        }
        if (phoneField && phoneField.value) {
            document.getElementById('summary-phone').textContent = phoneField.value;
        }
        if (emailField && emailField.value) {
            document.getElementById('summary-email').textContent = emailField.value;
        }
        if (dateField && dateField.value && timeField && timeField.value) {
            const date = new Date(dateField.value).toLocaleDateString('en-MY');
            document.getElementById('summary-datetime').textContent = `${date} at ${timeField.value}`;
        }

        // Store current selection for payment processing
        this.formData.selectedService = serviceType;
        this.formData.selectedPackage = packageInput.value;
        this.formData.amount = amount;
    }

    collectFormData() {
        const formData = new FormData(document.getElementById('booking-form'));
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Add calculated fields
        data.total_amount = this.formData.amount;
        data.service_name = this.serviceData[this.formData.selectedService].name;
        data.package_name = this.serviceData[this.formData.selectedService].packages[this.formData.selectedPackage].name;
        
        return data;
    }

    async processPayment() {
        try {
            this.showLoading(true);
            
            const bookingData = this.collectFormData();
            
            // Create Billplz bill
            const billData = await this.createBillplzBill(bookingData);
            
            if (billData.url) {
                // Redirect to Billplz payment page
                window.location.href = billData.url;
            } else {
                throw new Error('Failed to create payment link');
            }
            
        } catch (error) {
            console.error('Payment processing error:', error);
            this.showError('Payment processing failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async createBillplzBill(bookingData) {
        // This function creates a Billplz bill via your backend API
        // Since we're using GitHub Pages (static hosting), we'll use a serverless function
        
        const billplzData = {
            collection_id: 'your_billplz_collection_id', // Replace with your actual collection ID
            description: `Teman Malaysia - ${bookingData.service_name}`,
            email: bookingData.email,
            name: bookingData.full_name,
            amount: Math.round(bookingData.total_amount * 100), // Convert to cents
            callback_url: `${window.location.origin}/payment-success.html`,
            redirect_url: `${window.location.origin}/payment-success.html`,
            reference_1_label: 'Service',
            reference_1: bookingData.service_name,
            reference_2_label: 'Package',
            reference_2: bookingData.package_name
        };

        // For GitHub Pages, you'll need to use a serverless function (Netlify, Vercel, etc.)
        // or a simple backend service to handle Billplz API calls
        const response = await fetch('/.netlify/functions/create-billplz-bill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ billplzData, bookingData })
        });

        if (!response.ok) {
            throw new Error('Failed to create payment bill');
        }

        return await response.json();
    }

    showLoading(show) {
        const modal = document.getElementById('loading-modal');
        const payButton = document.getElementById('pay-now-btn');
        
        if (show) {
            modal.style.display = 'flex';
            payButton.disabled = true;
            payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        } else {
            modal.style.display = 'none';
            payButton.disabled = false;
            payButton.innerHTML = '<i class="fas fa-lock"></i> Pay Now Securely';
        }
    }
}

// Global functions for navigation
function nextStep() {
    window.bookingManager.nextStep();
}

function prevStep() {
    window.bookingManager.prevStep();
}

// Initialize booking manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.bookingManager = new BookingManager();
});

// Handle page refresh/navigation warning
window.addEventListener('beforeunload', (e) => {
    if (window.bookingManager && window.bookingManager.currentStep > 1) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your booking progress will be lost.';
        return e.returnValue;
    }
});