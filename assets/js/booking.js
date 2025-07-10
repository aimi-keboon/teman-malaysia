// Booking form management (Frontend only) - Updated for Teman Malaysia 2025
class BookingManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.serviceData = {
            'health-appointments': {
                name: 'TEMAN to Health Appointments',
                packages: {
                    'hourly': { name: 'Nett Price', price: 35, description: 'RM35/hour (min 2 hours)', hourly: true },
                    'package1': { name: 'Package 1', price: 132, description: '4 hours session' },
                    'package2': { name: 'Package 2', price: 186, description: '6 hours session' }
                }
            },
            'dialysis': {
                name: 'TEMAN to Dialysis Treatments',
                packages: {
                    'hourly': { name: 'Nett Price', price: 35, description: 'RM35/hour', hourly: true },
                    'package1': { name: 'Package', price: 186, description: '6 hours (3 dialysis sessions)' },
                    'companion': { name: 'Companion Service', price: 30, description: 'RM30/hour during treatment', hourly: true }
                }
            },
            'home-package': {
                name: 'TEMAN at Home Package',
                packages: {
                    'package1': { name: 'Package 1', price: 2800, description: '4 hrs/day, 20 sessions' },
                    'package2': { name: 'Package 2', price: 3780, description: '6 hrs/day, 20 sessions' },
                    'package3': { name: 'Package 3', price: 4720, description: '8 hrs/day, 20 sessions' }
                }
            },
            'custom-activities': {
                name: 'TEMAN Customised Activities',
                packages: {
                    'basic': { name: 'Nett Price', price: 35, description: 'RM35/hour (min 2 hours)', hourly: true }
                }
            }
        };

        this.packageFieldMapping = {
            'health-appointments': 'health_package',
            'dialysis': 'dialysis_package',
            'home-package': 'home_package',
            'custom-activities': 'custom_package'
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgressSteps();
        this.setMinDate();
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
        const serviceInputs = document.querySelectorAll('input[name="service"]');
        serviceInputs.forEach(input => {
            input.addEventListener('change', this.handleServiceChange.bind(this));
        });

        // Package selection changes
        document.addEventListener('change', (e) => {
            if (e.target.name && e.target.name.includes('_package')) {
                this.updateSummary();
            }
        });

        // Form input changes for real-time validation and summary updates
        const formInputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.debounce(() => this.updateSummary(), 300));
        });

        // Phone number formatting
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', this.formatPhoneInput.bind(this));
        });
    }

    initServiceHandlers() {
        // Handle service selection to show/hide pricing options
        const serviceInputs = document.querySelectorAll('input[name="service"]');
        serviceInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                // Hide all pricing sections
                const allPricingSections = document.querySelectorAll('.service-pricing');
                allPricingSections.forEach(pricing => {
                    pricing.style.display = 'none';
                });

                // Show pricing for selected service
                const selectedService = e.target.closest('.service-option');
                if (selectedService) {
                    const pricingSection = selectedService.querySelector('.service-pricing');
                    if (pricingSection) {
                        pricingSection.style.display = 'block';
                    }
                }

                // Clear previous package selections and hour selections
                const packageInputs = document.querySelectorAll('input[name$="_package"]');
                packageInputs.forEach(pkg => {
                    pkg.checked = false;
                });

                // Hide all hour selections and reset values
                const hourSelections = document.querySelectorAll('.hours-selection');
                hourSelections.forEach(selection => {
                    selection.style.display = 'none';
                    const select = selection.querySelector('select');
                    if (select) select.value = '';
                });

                this.updateSummary();
            });
        });

        // Handle package selection to show/hide hour selection
        document.addEventListener('change', (e) => {
            if (e.target.name && e.target.name.includes('_package')) {
                // Hide all hour selections first
                const hourSelections = document.querySelectorAll('.hours-selection');
                hourSelections.forEach(selection => {
                    selection.style.display = 'none';
                    const select = selection.querySelector('select');
                    if (select) select.value = '';
                });

                // Show hour selection for hourly packages
                if (e.target.value === 'hourly' || e.target.value === 'basic' || e.target.value === 'companion') {
                    const hourSelection = e.target.closest('.price-option').querySelector('.hours-selection');
                    if (hourSelection) {
                        hourSelection.style.display = 'block';
                    }
                }

                this.updateSummary();
            }

            // Handle hour selection changes
            if (e.target.name && e.target.name.includes('_hours')) {
                console.log('Hours selected:', e.target.value); // Debug log
                this.updateSummary();
            }
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
        const allSteps = document.querySelectorAll('.form-step');
        allSteps.forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateProgressSteps() {
        const progressSteps = document.querySelectorAll('.progress-steps .step');
        progressSteps.forEach((step, index) => {
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
        const packageFieldName = this.packageFieldMapping[serviceType];
        
        if (!packageFieldName) {
            this.showError('Invalid service type selected');
            return false;
        }
        
        const packageSelected = document.querySelector(`input[name="${packageFieldName}"]:checked`);
        
        if (!packageSelected) {
            this.showError(`Please select a package option for ${this.serviceData[serviceType].name}`);
            return false;
        }

        // Check if hourly package requires hour selection
        const packageData = this.serviceData[serviceType].packages[packageSelected.value];
        if (packageData && packageData.hourly) {
            const hoursFieldName = this.getHoursFieldName(serviceType, packageSelected.value);
            const hoursSelected = document.querySelector(`[name="${hoursFieldName}"]`);
            
            if (!hoursSelected || !hoursSelected.value) {
                this.showError('Please select the number of hours for this service');
                this.showFieldError(hoursSelected, 'Please select number of hours');
                return false;
            }
        }

        // Special validation for custom activities
        if (serviceType === 'custom-activities') {
            const activitiesField = document.querySelector('[name="custom_activities_list"]');
            if (!activitiesField || !activitiesField.value.trim()) {
                this.showError('Please describe the activities you would like assistance with');
                this.showFieldError(activitiesField, 'This field is required for custom activities');
                return false;
            }
        }

        return true;
    }

    getHoursFieldName(serviceType, packageType) {
        if (serviceType === 'health-appointments') return 'health_hours';
        if (serviceType === 'dialysis' && packageType === 'hourly') return 'dialysis_hours';
        if (serviceType === 'dialysis' && packageType === 'companion') return 'companion_hours';
        if (serviceType === 'custom-activities') return 'custom_hours';
        return null;
    }

    validatePersonalDetails() {
        const requiredFields = [
            'full_name', 'phone', 'email', 'address', 'postcode', 'city', 'state',
            'preferred_date', 'preferred_time', 'transportation_mode'
        ];
        let isValid = true;

        // Check required fields
        requiredFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (!field || (field.type === 'radio' ? !document.querySelector(`[name="${fieldName}"]:checked`) : !field.value.trim())) {
                if (field.type === 'radio') {
                    this.showError(`Please select a ${fieldName.replace('_', ' ')}`);
                } else {
                    this.showFieldError(field, 'This field is required');
                }
                isValid = false;
            } else if (field.type !== 'radio') {
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

        // Validate postcode format (Malaysian postcode)
        const postcodeField = document.querySelector('[name="postcode"]');
        if (postcodeField && postcodeField.value && !this.isValidPostcode(postcodeField.value)) {
            this.showFieldError(postcodeField, 'Please enter a valid 5-digit postcode');
            isValid = false;
        }

        // Validate date is not in the past
        const dateField = document.querySelector('[name="preferred_date"]');
        if (dateField && dateField.value && !this.isValidDate(dateField.value)) {
            this.showFieldError(dateField, 'Please select a date from tomorrow onwards');
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

    isValidPostcode(postcode) {
        return /^[0-9]{5}$/.test(postcode.trim());
    }

    isValidDate(dateString) {
        const selectedDate = new Date(dateString);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        return selectedDate >= tomorrow;
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
            // Fallback toast notification
            this.createToast('error', message);
        }
    }

    showSuccess(message) {
        if (window.TemanMalaysia && window.TemanMalaysia.showToast) {
            window.TemanMalaysia.showToast('success', message);
        } else {
            // Fallback toast notification
            this.createToast('success', message);
        }
    }

    createToast(type, message) {
        // Create toast if TemanMalaysia toast system isn't available
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        if (type === 'error') {
            toast.style.background = '#ef4444';
        } else if (type === 'success') {
            toast.style.background = '#10b981';
        }
        
        toast.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}" style="margin-right: 8px;"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    updateSummary() {
        try {
            const serviceInput = document.querySelector('input[name="service"]:checked');
            if (!serviceInput) return;

            const serviceType = serviceInput.value;
            const serviceData = this.serviceData[serviceType];
            
            if (!serviceData) return;

            const packageFieldName = this.packageFieldMapping[serviceType];
            const packageInput = document.querySelector(`input[name="${packageFieldName}"]:checked`);
            if (!packageInput) return;

            const packageData = serviceData.packages[packageInput.value];
            let amount = packageData.price;
            let packageDescription = packageData.description;

            // Handle hourly pricing - extract price from dropdown selection
            if (packageData.hourly) {
                const hoursFieldName = this.getHoursFieldName(serviceType, packageInput.value);
                const hoursField = document.querySelector(`[name="${hoursFieldName}"]`);
                
                if (hoursField && hoursField.value) {
                    const hours = parseInt(hoursField.value);
                    
                    // Calculate amount based on hourly rate and selected hours
                    let hourlyRate = packageData.price; // This is the base hourly rate
                    amount = hourlyRate * hours;
                    packageDescription = `${packageData.name} - ${hours} hours`;
                } else {
                    packageDescription = `${packageData.name} - Please select hours`;
                    amount = 0;
                }
            }

            // Update service details
            this.updateElement('summary-service', serviceData.name);
            this.updateElement('summary-package', packageDescription);
            this.updateElement('summary-total', amount > 0 ? this.formatCurrency(amount) : 'Please complete selection');

            // Handle custom activities summary
            this.handleCustomActivitiesSummary(serviceType);

            // Update transportation mode
            this.updateTransportationSummary();

            // Update personal details if available
            this.updatePersonalDetailsSummary();
            
            // Update date and time
            this.updateDateTimeSummary();

            // Store current selection
            this.formData.selectedService = serviceType;
            this.formData.selectedPackage = packageInput.value;
            this.formData.amount = amount;
        } catch (error) {
            console.error('Error updating summary:', error);
        }
    }

    handleCustomActivitiesSummary(serviceType) {
        const customActivitiesSummary = document.getElementById('custom-activities-summary');
        if (!customActivitiesSummary) return;

        if (serviceType === 'custom-activities') {
            const activitiesField = document.querySelector('[name="custom_activities_list"]');
            if (activitiesField && activitiesField.value) {
                this.updateElement('summary-activities', activitiesField.value);
                customActivitiesSummary.style.display = 'flex';
            } else {
                customActivitiesSummary.style.display = 'none';
            }
        } else {
            customActivitiesSummary.style.display = 'none';
        }
    }

    updateTransportationSummary() {
        const transportationInput = document.querySelector('input[name="transportation_mode"]:checked');
        if (transportationInput) {
            const transportationLabels = {
                'client-provided': 'Provided by Client',
                'teman-provided': 'Provided by Teman Malaysia',
                'e-hailing': 'E-Hailing (Taxi, Grab)',
                'not-required': 'Not Required'
            };
            this.updateElement('summary-transportation', transportationLabels[transportationInput.value] || transportationInput.value);
        }
    }

    updatePersonalDetailsSummary() {
        this.updateSummaryField('summary-name', 'full_name');
        this.updateSummaryField('summary-phone', 'phone');
        this.updateSummaryField('summary-email', 'email');
        this.updateAddressSummary();
    }

    updateDateTimeSummary() {
        const dateField = document.querySelector('[name="preferred_date"]');
        const timeField = document.querySelector('[name="preferred_time"]');
        if (dateField && dateField.value && timeField && timeField.value) {
            const date = new Date(dateField.value).toLocaleDateString('en-MY');
            this.updateElement('summary-datetime', `${date} at ${timeField.value}`);
        }
    }

    updateAddressSummary() {
        const addressField = document.querySelector('[name="address"]');
        const cityField = document.querySelector('[name="city"]');
        const postcodeField = document.querySelector('[name="postcode"]');
        const stateField = document.querySelector('[name="state"]');
        
        let addressSummary = '';
        
        if (addressField && addressField.value) {
            addressSummary = addressField.value;
            
            // Add city, postcode, state if available
            const locationParts = [];
            if (cityField && cityField.value) locationParts.push(cityField.value);
            if (postcodeField && postcodeField.value) locationParts.push(postcodeField.value);
            if (stateField && stateField.value) {
                const stateText = stateField.options[stateField.selectedIndex].text;
                locationParts.push(stateText);
            }
            
            if (locationParts.length > 0) {
                addressSummary += `, ${locationParts.join(', ')}`;
            }
        }
        
        this.updateElement('summary-address', addressSummary);
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
        
        // Handle regular form fields
        for (let [key, value] of formData.entries()) {
            if (key.endsWith('[]')) {
                // Handle checkbox arrays (like mobility_needs[])
                const arrayKey = key.slice(0, -2);
                if (!data[arrayKey]) data[arrayKey] = [];
                data[arrayKey].push(value);
            } else {
                data[key] = value;
            }
        }

        // Add calculated fields
        data.total_amount = this.formData.amount;
        data.service_name = this.serviceData[this.formData.selectedService]?.name;
        data.package_name = this.serviceData[this.formData.selectedService]?.packages[this.formData.selectedPackage]?.name;
        data.booking_reference = this.generateBookingReference();
        data.submission_date = new Date().toISOString();
        
        // Add additional computed fields
        data.full_address = this.buildFullAddress(data);
        data.patient_info = this.buildPatientInfo(data);
        data.companion_preferences = this.buildCompanionPreferences(data);
        
        return data;
    }

    buildFullAddress(data) {
        const parts = [
            data.address,
            data.city,
            data.postcode,
            data.state
        ].filter(part => part && part.trim());
        
        return parts.join(', ');
    }

    buildPatientInfo(data) {
        const info = {};
        if (data.patient_name) info.name = data.patient_name;
        if (data.patient_age) info.age = data.patient_age;
        if (data.patient_gender) info.gender = data.patient_gender;
        if (data.patient_language) info.preferred_language = data.patient_language;
        if (data.relationship) info.relationship_to_contact = data.relationship;
        
        return Object.keys(info).length > 0 ? info : null;
    }

    buildCompanionPreferences(data) {
        const prefs = {};
        if (data.companion_gender) prefs.gender = data.companion_gender;
        if (data.companion_language) prefs.language = data.companion_language;
        if (data.companion_experience) prefs.experience_level = data.companion_experience;
        if (data.companion_age) prefs.age_range = data.companion_age;
        
        return Object.keys(prefs).length > 0 ? prefs : null;
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
            const form = document.getElementById('booking-form');
            if (form) {
                form.reset();
            }
            this.currentStep = 1;
            this.updateStepDisplay();
            this.updateProgressSteps();
            
        } catch (error) {
            console.error('Booking submission error:', error);
            this.showError('Failed to submit booking. Please try again.');
        } finally {
            const submitButton = document.getElementById('submit-booking-btn');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Booking Request';
            }
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

    // Utility function for debouncing
    debounce(func, wait) {
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
        try {
            window.bookingManager = new BookingManager();
            console.log('Booking Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Booking Manager:', error);
        }
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