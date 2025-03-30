document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize user profile
    initializeProfile(currentUser);
    loadUserBookings(currentUser);
    setupEventListeners();
});

function initializeProfile(user) {
    // Set user initial in avatar
    document.getElementById('user-initial').textContent = user.name.charAt(0).toUpperCase();
    
    // Set display name and email
    document.getElementById('display-name').textContent = user.name;
    document.getElementById('display-email').textContent = user.email;
    
    // Set form values
    document.getElementById('full-name').value = user.name;
    document.getElementById('email').value = user.email;
    document.getElementById('phone').value = user.phone || '';
}

function loadUserBookings(user) {
    // Get bookings from localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const userBookings = bookings.filter(booking => booking.userId === user.id);
    
    const bookingsContainer = document.getElementById('bookings-container');
    bookingsContainer.innerHTML = '';
    
    if (userBookings.length === 0) {
        bookingsContainer.innerHTML = '<p>No bookings found.</p>';
        return;
    }
    
    userBookings.forEach(booking => {
        const bookingCard = createBookingCard(booking);
        bookingsContainer.appendChild(bookingCard);
    });
}

function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'booking-card';
    
    const formattedDate = new Date(booking.travelDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    card.innerHTML = `
        <h4>${booking.packageName}</h4>
        <div class="booking-details">
            <p><strong>Travel Date:</strong> ${formattedDate}</p>
            <p><strong>Travelers:</strong> ${booking.travelers}</p>
            <p><strong>Total Amount:</strong> ₹${booking.totalPrice.toLocaleString('en-IN')}</p>
            <p><strong>Status:</strong> <span class="status-${booking.status.toLowerCase()}">${booking.status}</span></p>
        </div>
    `;
    
    return card;
}

function setupEventListeners() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    // Password form submission
    const passwordForm = document.getElementById('password-form');
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updatePassword();
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Navigation
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
}

function updateProfile() {
    const name = document.getElementById('full-name').value;
    const phone = document.getElementById('phone').value;
    
    // Validate inputs
    if (!name || name.length < 3) {
        showError('full-name', 'Name must be at least 3 characters long');
        return;
    }
    
    if (!phone || !validatePhone(phone)) {
        showError('phone', 'Please enter a valid phone number');
        return;
    }
    
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].name = name;
        users[userIndex].phone = phone;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update session storage
        currentUser.name = name;
        currentUser.phone = phone;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update display
        document.getElementById('user-initial').textContent = name.charAt(0).toUpperCase();
        document.getElementById('display-name').textContent = name;
        
        showSuccess('Profile updated successfully!');
    }
}

function updatePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate inputs
    if (!currentPassword) {
        showError('current-password', 'Please enter your current password');
        return;
    }
    
    if (!newPassword || newPassword.length < 6) {
        showError('new-password', 'New password must be at least 6 characters long');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('confirm-password', 'Passwords do not match');
        return;
    }
    
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Verify current password
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === currentUser.id);
    
    if (user && user.password === currentPassword) {
        // Update password
        user.password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Clear form
        document.getElementById('password-form').reset();
        
        showSuccess('Password updated successfully!');
    } else {
        showError('current-password', 'Current password is incorrect');
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${sectionId}-section`).style.display = 'block';
}

function validatePhone(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove any existing error message
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    field.parentElement.appendChild(errorDiv);
    field.classList.add('error');
}

function showSuccess(message) {
    alert(message); // You can replace this with a better notification system
}

// Add this to your user-profile.js file

// Fetch user bookings
async function fetchUserBookings() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = 'login.html';
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/user/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const bookings = await response.json();
      displayBookings(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      document.getElementById('bookings-container').innerHTML = 
        '<p class="error-message">Failed to load bookings. Please try again later.</p>';
    }
  }
  
  // Display bookings in the UI
  function displayBookings(bookings) {
    const container = document.getElementById('bookings-container');
    
    if (bookings.length === 0) {
      container.innerHTML = '<p>You have no bookings yet.</p>';
      return;
    }
    
    const bookingsHTML = bookings.map(booking => `
      <div class="booking-card">
        <div class="booking-header">
          <h3>${booking.package_name}</h3>
          <span class="booking-status ${booking.status.toLowerCase()}">${booking.status}</span>
        </div>
        <div class="booking-details">
          <p><strong>Booking ID:</strong> ${booking.booking_id}</p>
          <p><strong>Travel Date:</strong> ${new Date(booking.travel_date).toLocaleDateString()}</p>
          <p><strong>Duration:</strong> ${booking.duration} days</p>
          <p><strong>Travelers:</strong> ${booking.travelers}</p>
          <p><strong>Total Amount:</strong> ₹${booking.total_amount}</p>
        </div>
        <div class="booking-actions">
          <button onclick="viewBookingDetails(${booking.id})" class="btn-details">View Details</button>
          ${booking.status === 'UPCOMING' ? 
            `<button onclick="cancelBooking(${booking.id})" class="btn-cancel">Cancel Booking</button>` : ''}
        </div>
      </div>
    `).join('');
    
    container.innerHTML = bookingsHTML;
  }
  
  // View booking details
  function viewBookingDetails(bookingId) {
    // Implement modal or redirect to booking details page
    window.location.href = `booking-details.html?id=${bookingId}`;
  }
  
  // Cancel booking
  async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking? Cancellation fees may apply.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel booking');
      }
      
      alert('Booking cancelled successfully');
      fetchUserBookings(); // Refresh bookings list
    } catch (error) {
      alert(error.message);
    }
  }
  
  // Add account settings functionality
  function setupAccountSettings() {
    const updateProfileForm = document.getElementById('update-profile-form');
    
    updateProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(updateProfileForm);
      const userData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address')
      };
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/user/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
        
        alert('Profile updated successfully');
        loadUserProfile(); // Refresh profile data
      } catch (error) {
        alert(error.message);
      }
    });
  }
  
  // Initialize dashboard
  document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    fetchUserBookings();
    setupAccountSettings();
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.dashboard-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show selected tab content
        tabContents.forEach(content => {
          content.style.display = content.id === target ? 'block' : 'none';
        });
      });
    });
  });
  