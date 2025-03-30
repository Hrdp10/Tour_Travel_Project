document.addEventListener('DOMContentLoaded', function() {
    // Retrieve booking data from session storage
    const bookingDataString = sessionStorage.getItem('bookingData');
    if (!bookingDataString) {
        window.location.href = 'package.html';
        return;
    }
    
    const bookingData = JSON.parse(bookingDataString);
    
    // Format date for display
    const travelDate = new Date(bookingData.travelDate);
    const formattedDate = travelDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Calculate prices
    const basePrice = parseInt(bookingData.price) * parseInt(bookingData.travelers);
    const taxes = Math.round(basePrice * 0.18); // 18% tax
    const totalPrice = basePrice + taxes;
    
    // Update summary details
    document.getElementById('summary-package').textContent = bookingData.packageName;
    document.getElementById('summary-date').textContent = formattedDate;
    document.getElementById('summary-travelers').textContent = bookingData.travelers;
    document.getElementById('summary-base-price').textContent = `₹${basePrice.toLocaleString('en-IN')}`;
    document.getElementById('summary-taxes').textContent = `₹${taxes.toLocaleString('en-IN')}`;
    document.getElementById('summary-total').textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    
    // Payment method switching
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const paymentDetails = document.querySelectorAll('.payment-details');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all payment details
            paymentDetails.forEach(detail => detail.classList.remove('active'));
            
            // Show selected payment details
            document.getElementById(`${this.value}-details`).classList.add('active');
        });
    });
    
    // Credit card number formatting
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue.substring(0, 19); // Limit to 16 digits + 3 spaces
        });
    }
    
    // Expiry date formatting
    const expiryDateInput = document.getElementById('expiry-date');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                const month = parseInt(value.substring(0, 2));
                if (month > 12) {
                    value = '12' + value.substring(2);
                }
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            
            e.target.value = value.substring(0, 5); // MM/YY format
        });
    }
    
    // Form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get selected payment method
            const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
            
            // Validate based on payment method
            if (!validatePaymentDetails(selectedMethod)) {
                return;
            }
            
            // Check terms agreement
            if (!document.getElementById('terms').checked) {
                showError('terms', 'Please agree to the Terms and Conditions');
                return;
            }
            
            // Disable submit button and show processing state
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Processing Payment...';
            
            // Simulate payment processing
            setTimeout(() => {
                // Store confirmation data
                const confirmationData = {
                    ...bookingData,
                    paymentMethod: selectedMethod,
                    basePrice: basePrice,
                    taxes: taxes,
                    totalPrice: totalPrice,
                    paymentDate: new Date().toISOString(),
                    confirmationNumber: generateConfirmationNumber()
                };
                
                sessionStorage.setItem('confirmationData', JSON.stringify(confirmationData));
                
                // Redirect to confirmation page
                window.location.href = 'confirmation.html';
            }, 2000);
        });
    }
});

// Validation functions
function validatePaymentDetails(method) {
    switch (method) {
        case 'credit-card':
            return validateCreditCard();
        case 'upi':
            return validateUPI();
        case 'net-banking':
            return validateNetBanking();
        default:
            return false;
    }
}

function validateCreditCard() {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    const cardName = document.getElementById('card-name').value.trim();
    
    if (cardNumber.length !== 16) {
        showError('card-number', 'Please enter a valid 16-digit card number');
        return false;
    }
    
    if (!expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
        showError('expiry-date', 'Please enter a valid expiry date (MM/YY)');
        return false;
    }
    
    if (cvv.length !== 3) {
        showError('cvv', 'Please enter a valid 3-digit CVV');
        return false;
    }
    
    if (cardName.length < 3) {
        showError('card-name', 'Please enter the name as it appears on your card');
        return false;
    }
    
    return true;
}

function validateUPI() {
    const upiId = document.getElementById('upi-id').value.trim();
    if (!upiId.includes('@')) {
        showError('upi-id', 'Please enter a valid UPI ID');
        return false;
    }
    return true;
}

function validateNetBanking() {
    const bank = document.getElementById('bank-select').value;
    if (!bank) {
        showError('bank-select', 'Please select your bank');
        return false;
    }
    return true;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    
    // Remove existing error
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
    
    // Highlight field
    field.classList.add('error-input');
    
    // Remove error on focus
    field.addEventListener('focus', function() {
        field.classList.remove('error-input');
        const error = field.parentElement.querySelector('.error-message');
        if (error) {
            error.remove();
        }
    });
}

function generateConfirmationNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'WL-PAY-';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
// Add this to payment.js

// Initialize payment page
async function initPaymentPage() {
    const bookingId = new URLSearchParams(window.location.search).get('booking_id');
    if (!bookingId) {
      window.location.href = 'user-profile.html';
      return;
    }
    
    await fetchBookingDetails(bookingId);
    setupPaymentForm();
  }
  
  // Fetch booking details
  async function fetchBookingDetails(bookingId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Booking not found');
      }
      
      const bookingData = await response.json();
      displayBookingDetails(bookingData);
      
      // Store booking data for later use
      window.bookingData = bookingData;
    } catch (error) {
      console.error('Error fetching booking:', error);
      document.getElementById('booking-details').innerHTML = 
        '<p class="error-message">Failed to load booking details. Please try again later.</p>';
    }
  }
  
  // Display booking details
  function displayBookingDetails(booking) {
    document.getElementById('package-name').textContent = booking.package_name;
    document.getElementById('booking-id').textContent = booking.booking_id;
    document.getElementById('travel-date').textContent = new Date(booking.travel_date).toLocaleDateString();
    document.getElementById('travelers').textContent = booking.travelers;
    document.getElementById('total-amount').textContent = `₹${booking.total_amount}`;
  }
  
  // Setup payment form
  function setupPaymentForm() {
    const paymentForm = document.getElementById('payment-form');
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    
    // Show/hide payment method details
    paymentMethods.forEach(method => {
      method.addEventListener('change', () => {
        const methodId = method.value;
        document.querySelectorAll('.payment-method-details').forEach(el => {
          el.style.display = 'none';
        });
        document.getElementById(`${methodId}-details`).style.display = 'block';
      });
    });
    
    // Form submission
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
      let paymentDetails = {};
      
      // Validate and collect payment details based on method
      switch (selectedMethod) {
        case 'credit-card':
          const cardNumber = document.getElementById('card-number').value;
          const cardName = document.getElementById('card-name').value;
          const expiry = document.getElementById('card-expiry').value;
          const cvv = document.getElementById('card-cvv').value;
          
          // Basic validation
          if (!validateCardNumber(cardNumber)) {
            alert('Please enter a valid card number');
            return;
          }
          
          if (!validateExpiry(expiry)) {
            alert('Please enter a valid expiry date (MM/YY)');
            return;
          }
          
          if (!validateCVV(cvv)) {
            alert('Please enter a valid CVV');
            return;
          }
          
          paymentDetails = { cardNumber, cardName, expiry, cvv };
          break;
          
        case 'upi':
          const upiId = document.getElementById('upi-id').value;
          
          if (!validateUPI(upiId)) {
            alert('Please enter a valid UPI ID');
            return;
          }
          
          paymentDetails = { upiId };
          break;
          
        case 'net-banking':
          const bank = document.getElementById('bank-select').value;
          
          if (!bank) {
            alert('Please select a bank');
            return;
          }
          
          paymentDetails = { bank };
          break;
      }
      
      // Process payment
      processPayment(selectedMethod, paymentDetails);
    });
  }
  
  // Validate card number (basic Luhn algorithm)
  function validateCardNumber(cardNumber) {
    const sanitized = cardNumber.replace(/\D/g, '');
    if (sanitized.length < 13 || sanitized.length > 19) return false;
    
    let sum = 0;
    let double = false;
    
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i));
      
      if (double) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      double = !double;
    }
    
    return sum % 10 === 0;
  }
  
  // Validate expiry date
  function validateExpiry(expiry) {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiry)) return false;
    
    const [month, year] = expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
    const today = new Date();
    
    return expiryDate > today;
  }
  
  // Validate CVV
  function validateCVV(cvv) {
    return /^[0-9]{3,4}$/.test(cvv);
  }
  
  // Validate UPI ID
  function validateUPI(upiId) {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId);
  }
  
  // Process payment
  async function processPayment(method, details) {
    try {
      // Show loading state
      document.getElementById('payment-button').disabled = true;
      document.getElementById('payment-button').textContent = 'Processing...';
      
      // In a real application, you would integrate with a payment gateway here
      // For this example, we'll simulate a payment process
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentData = {
        booking_id: window.bookingData.booking_id,
        amount: window.bookingData.total_amount,
        method: method,
        // Don't send sensitive details to your server in a real app
        // This is just for demonstration
        transaction_id: 'TXN' + Math.floor(Math.random() * 1000000)
      };
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) {
        throw new Error('Payment failed');
      }
      
      // Redirect to success page
      window.location.href = `booking-confirmation.html?booking_id=${window.bookingData.booking_id}`;
    } catch (error) {
      alert(error.message);
      // Reset button
      document.getElementById('payment-button').disabled = false;
      document.getElementById('payment-button').textContent = 'Complete Payment';
    }
  }
  
  // Format card number as user types
  function setupCardFormatting() {
    const cardInput = document.getElementById('card-number');
    cardInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 16) value = value.substr(0, 16);
      
      // Add spaces every 4 digits
      let formattedValue = '';
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      
      e.target.value = formattedValue;
    });
  }
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    initPaymentPage();
    setupCardFormatting();
  });
  