document.addEventListener('DOMContentLoaded', function() {
    // Get package details from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const packageName = urlParams.get('package') || 'Default Package';
    const packagePrice = urlParams.get('price') || '0';
    
    console.log("Package Name:", packageName); // Debug log
    console.log("Package Price:", packagePrice); // Debug log
    
    // Format package name for display (replace hyphens with spaces and capitalize)
    const formattedPackageName = decodeURIComponent(packageName)
        .replace(/-/g, ' ')
        .split(' ')
        .filter(word => word.length > 0) // Filter out empty strings
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    console.log("Formatted Package Name:", formattedPackageName); // Debug log
    
    // Update package details in the form
    const packageNameElement = document.querySelector('#selected-package span');
    const packagePriceElement = document.querySelector('#package-price span');
    
    if (packageNameElement) {
        packageNameElement.textContent = formattedPackageName;
    } else {
        console.error("Package name element not found");
    }
    
    if (packagePriceElement) {
        packagePriceElement.textContent = `₹${packagePrice}`;
    } else {
        console.error("Package price element not found");
    }
    
    // Set minimum date for travel date (today)
    const travelDateInput = document.getElementById('travel-date');
    if (travelDateInput) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        const yyyy = today.getFullYear();
        const todayString = yyyy + '-' + mm + '-' + dd;
        travelDateInput.min = todayString;
    }
    
    // Form validation
    const form = document.querySelector('.booking-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert("Form submitted successfully! (This is a test alert)");
            // Add your form submission logic here
        });
    } else {
        console.error("Booking form not found");
    }
    // Add this to your form submission handler in booking.js
document.querySelector('.booking-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const travelers = document.getElementById('travelers').value;
    const travelDate = document.getElementById('travel-date').value;
    const specialRequests = document.getElementById('special-requests').value;
    
    // Get package details from URL
    const urlParams = new URLSearchParams(window.location.search);
    const packageName = decodeURIComponent(urlParams.get('package') || 'Default Package');
    const price = urlParams.get('price') || '0';
    
    // Store booking data in session storage
    const bookingData = {
        packageName,
        price,
        fullName,
        email,
        phone,
        travelers,
        travelDate,
        specialRequests
    };
    
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Redirect to payment page
    window.location.href = 'payment.html';
});



// Add this to a new file: booking.js

// Initialize booking process
function initBooking() {
    const packageId = new URLSearchParams(window.location.search).get('id');
    if (!packageId) {
      window.location.href = 'packages.html';
      return;
    }
    
    fetchPackageDetails(packageId);
    setupBookingForm();
  }
  
  // Fetch package details
  async function fetchPackageDetails(packageId) {
    try {
      const response = await fetch(`http://localhost:5000/api/packages/${packageId}`);
      if (!response.ok) {
        throw new Error('Package not found');
      }
      
      const packageData = await response.json();
      displayPackageDetails(packageData);
    } catch (error) {
      console.error('Error fetching package:', error);
      document.getElementById('package-details').innerHTML = 
        '<p class="error-message">Failed to load package details. Please try again later.</p>';
    }
  }
  
  // Display package details
  function displayPackageDetails(packageData) {
    document.getElementById('package-name').textContent = packageData.name;
    document.getElementById('package-image').src = packageData.image_url;
    document.getElementById('package-description').textContent = packageData.description;
    document.getElementById('package-duration').textContent = `${packageData.duration} days`;
    document.getElementById('package-price').textContent = `₹${packageData.price} per person`;
    
    // Store package data for later use
    window.packageData = packageData;
    
    // Calculate initial price
    updateTotalPrice();
  }
  
  // Setup booking form
  function setupBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    const travelersInput = document.getElementById('travelers');
    const travelDateInput = document.getElementById('travel-date');
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    travelDateInput.min = tomorrow.toISOString().split('T')[0];
    
    // Update price when travelers change
    travelersInput.addEventListener('change', updateTotalPrice);
    
    // Form submission
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!localStorage.getItem('token')) {
        alert('Please login to book this package');
        window.location.href = `login.html?redirect=booking.html?id=${window.packageData.id}`;
        return;
      }
      
      const bookingData = {
        package_id: window.packageData.id,
        travel_date: travelDateInput.value,
        travelers: parseInt(travelersInput.value),
        total_amount: calculateTotalPrice()
      };
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Booking failed');
        }
        
        const result = await response.json();
        
        // Redirect to payment page
        window.location.href = `payment.html?booking_id=${result.booking_id}`;
      } catch (error) {
        alert(error.message);
      }
    });
  }
  
  // Calculate total price
  function calculateTotalPrice() {
    const travelers = parseInt(document.getElementById('travelers').value) || 1;
    const basePrice = window.packageData.price;
    const totalPrice = travelers * basePrice;
    
    // Add taxes (5% GST)
    const taxAmount = totalPrice * 0.05;
    
    return totalPrice + taxAmount;
  }
  
  // Update displayed total price
  function updateTotalPrice() {
    if (!window.packageData) return;
    
    const totalPrice = calculateTotalPrice();
    const travelers = parseInt(document.getElementById('travelers').value) || 1;
    const basePrice = window.packageData.price;
    
    document.getElementById('base-price').textContent = `₹${basePrice} × ${travelers} person(s) = ₹${basePrice * travelers}`;
    document.getElementById('tax-amount').textContent = `₹${(totalPrice - (basePrice * travelers)).toFixed(2)}`;
    document.getElementById('total-price').textContent = `₹${totalPrice.toFixed(2)}`;
  }
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', initBooking);
  

});