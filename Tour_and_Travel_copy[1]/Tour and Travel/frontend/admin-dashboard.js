document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize dashboard
    initializeDashboard();
    setupEventListeners();
    loadDashboardData();
    
    // Show overview section by default
    showSection('overview');
});

function initializeDashboard() {
    // Initialize sample data if not exists
    initializeSampleData();
}

function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.admin-nav a');
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
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Package form
    document.getElementById('add-package-btn').addEventListener('click', function() {
        openPackageModal();
    });
    
    document.getElementById('package-form').addEventListener('submit', function(e) {
        e.preventDefault();
        savePackage();
    });
    
    document.getElementById('cancel-package').addEventListener('click', function() {
        closePackageModal();
    });
    
    // Booking form
    document.getElementById('booking-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateBookingStatus();
    });
    
    document.getElementById('cancel-booking').addEventListener('click', function() {
        closeBookingModal();
    });
    
    // User form
    document.getElementById('user-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveUser();
    });
    
    document.getElementById('cancel-user').addEventListener('click', function() {
        closeUserModal();
    });
    
    // Settings form
    document.getElementById('settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
    
    // Close modals when clicking on X
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Booking filters
    document.getElementById('booking-status-filter').addEventListener('change', function() {
        loadBookings();
    });
    
    document.getElementById('booking-search').addEventListener('input', function() {
        loadBookings();
    });
    
    // User filters
    document.getElementById('user-role-filter').addEventListener('change', function() {
        loadUsers();
    });
    
    document.getElementById('user-search').addEventListener('input', function() {
        loadUsers();
    });
}

function loadDashboardData() {
    loadOverviewStats();
    loadRecentBookings();
    loadPackages();
    loadBookings();
    loadUsers();
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${sectionId}-section`).style.display = 'block';
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Overview functions
function loadOverviewStats() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const packages = JSON.parse(localStorage.getItem('packages')) || [];
    
    // Calculate total revenue
    const totalRevenue = bookings
        .filter(booking => booking.status === 'confirmed')
        .reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Update stats
    document.getElementById('total-bookings').textContent = bookings.length;
    document.getElementById('total-users').textContent = users.filter(user => !user.isAdmin).length;
    document.getElementById('active-packages').textContent = packages.filter(pkg => pkg.status === 'active').length;
    document.getElementById('total-revenue').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
}

function loadRecentBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    // Sort bookings by date (newest first) and take only 5
    const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
        .slice(0, 5);
    
    const tableBody = document.getElementById('recent-bookings-table');
    tableBody.innerHTML = '';
    
    if (recentBookings.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">No bookings found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    recentBookings.forEach(booking => {
        const row = document.createElement('tr');
        
        const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        row.innerHTML = `
            <td>${booking.id.substring(0, 8)}</td>
            <td>${booking.packageName}</td>
            <td>${booking.fullName}</td>
            <td>${bookingDate}</td>
            <td>₹${booking.totalPrice.toLocaleString('en-IN')}</td>
            <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Package functions
function loadPackages() {
    const packages = JSON.parse(localStorage.getItem('packages')) || [];
    
    const tableBody = document.getElementById('packages-table');
    tableBody.innerHTML = '';
    
    if (packages.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">No packages found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    packages.forEach(pkg => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${pkg.id.substring(0, 8)}</td>
            <td>${pkg.name}</td>
            <td>${pkg.destination}</td>
            <td>${pkg.duration} days</td>
            <td>₹${pkg.price.toLocaleString('en-IN')}</td>
            <td><span class="status-badge status-${pkg.status}">${pkg.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${pkg.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${pkg.id}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('#packages-table .edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const packageId = this.getAttribute('data-id');
            editPackage(packageId);
        });
    });
    
    document.querySelectorAll('#packages-table .delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const packageId = this.getAttribute('data-id');
            deletePackage(packageId);
        });
    });
}

function openPackageModal(packageId = null) {
    const modal = document.getElementById('package-modal');
    const modalTitle = document.getElementById('package-modal-title');
    const form = document.getElementById('package-form');
    
    // Reset form
    form.reset();
    
    if (packageId) {
        // Edit mode
        modalTitle.textContent = 'Edit Package';
        
        const packages = JSON.parse(localStorage.getItem('packages')) || [];
        const pkg = packages.find(p => p.id === packageId);
        
        if (pkg) {
            document.getElementById('package-id').value = pkg.id;
            document.getElementById('package-name').value = pkg.name;
            document.getElementById('package-destination').value = pkg.destination;
            document.getElementById('package-duration').value = pkg.duration;
            document.getElementById('package-price').value = pkg.price;
            document.getElementById('package-description').value = pkg.description;
            document.getElementById('package-image').value = pkg.image;
            document.getElementById('package-status').value = pkg.status;
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Package';
        document.getElementById('package-id').value = '';
    }
    
    modal.style.display = 'block';
}

function closePackageModal() {
    document.getElementById('package-modal').style.display = 'none';
}

function savePackage() {
    const packageId = document.getElementById('package-id').value;
    const name = document.getElementById('package-name').value;
    const destination = document.getElementById('package-destination').value;
    const duration = parseInt(document.getElementById('package-duration').value);
    const price = parseInt(document.getElementById('package-price').value);
    const description = document.getElementById('package-description').value;
    const image = document.getElementById('package-image').value;
    const status = document.getElementById('package-status').value;
    
    // Validate inputs
    if (!name || !destination || !duration || !price || !description || !image) {
        alert('Please fill all required fields');
        return;
    }
    
    const packages = JSON.parse(localStorage.getItem('packages')) || [];
    
    if (packageId) {
        // Update existing package
        const index = packages.findIndex(p => p.id === packageId);
        if (index !== -1) {
            packages[index] = {
                ...packages[index],
                name,
                destination,
                duration,
                price,
                description,
                image,
                status
            };
        }
    } else {
        // Add new package
        const newPackage = {
            id: Date.now().toString(),
            name,
            destination,
            duration,
            price,
            description,
            image,
            status
        };
        
        packages.push(newPackage);
    }
    
    localStorage.setItem('packages', JSON.stringify(packages));
    closePackageModal();
    loadPackages();
    loadOverviewStats();
    
    alert(packageId ? 'Package updated successfully!' : 'Package added successfully!');
}

function editPackage(packageId) {
    openPackageModal(packageId);
}

function deletePackage(packageId) {
    if (confirm('Are you sure you want to delete this package?')) {
        const packages = JSON.parse(localStorage.getItem('packages')) || [];
        const filteredPackages = packages.filter(pkg => pkg.id !== packageId);
        
        localStorage.setItem('packages', JSON.stringify(filteredPackages));
        loadPackages();
        loadOverviewStats();
        
        alert('Package deleted successfully!');
    }
}

// Booking functions
function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const statusFilter = document.getElementById('booking-status-filter').value;
    const searchQuery = document.getElementById('booking-search').value.toLowerCase();
    
    // Apply filters
    let filteredBookings = [...bookings];
    
    if (statusFilter !== 'all') {
        filteredBookings = filteredBookings.filter(booking => booking.status.toLowerCase() === statusFilter);
    }
    
    if (searchQuery) {
        filteredBookings = filteredBookings.filter(booking => 
            booking.id.toLowerCase().includes(searchQuery) ||
            booking.fullName.toLowerCase().includes(searchQuery) ||
            booking.packageName.toLowerCase().includes(searchQuery)
        );
    }
    
    const tableBody = document.getElementById('bookings-table');
    tableBody.innerHTML = '';
    
    if (filteredBookings.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" class="text-center">No bookings found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    filteredBookings.forEach(booking => {
        const row = document.createElement('tr');
        
        const travelDate = new Date(booking.travelDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        row.innerHTML = `
            <td>${booking.id.substring(0, 8)}</td>
            <td>${booking.packageName}</td>
            <td>${booking.fullName}</td>
            <td>${travelDate}</td>
            <td>${booking.travelers}</td>
            <td>₹${booking.totalPrice.toLocaleString('en-IN')}</td>
            <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${booking.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${booking.id}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('#bookings-table .edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            openBookingModal(bookingId);
        });
    });
    
    document.querySelectorAll('#bookings-table .delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            deleteBooking(bookingId);
        });
    });
}

function openBookingModal(bookingId) {
    const modal = document.getElementById('booking-modal');
    
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
        document.getElementById('booking-id').value = booking.id;
        document.getElementById('booking-status').value = booking.status.toLowerCase();
        document.getElementById('booking-notes').value = booking.notes || '';
        
        modal.style.display = 'block';
    }
}

function closeBookingModal() {
    document.getElementById('booking-modal').style.display = 'none';
}

function updateBookingStatus() {
    const bookingId = document.getElementById('booking-id').value;
    const status = document.getElementById('booking-status').value;
    const notes = document.getElementById('booking-notes').value;
    
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const index = bookings.findIndex(b => b.id === bookingId);
    
    if (index !== -1) {
        bookings[index].status = status;
        bookings[index].notes = notes;
        
        localStorage.setItem('bookings', JSON.stringify(bookings));
        closeBookingModal();
        loadBookings();
        loadRecentBookings();
        loadOverviewStats();
        
        alert('Booking status updated successfully!');
    }
}

function deleteBooking(bookingId) {
    if (confirm('Are you sure you want to delete this booking?')) {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        const filteredBookings = bookings.filter(booking => booking.id !== bookingId);
        
        localStorage.setItem('bookings', JSON.stringify(filteredBookings));
        loadBookings();
        loadRecentBookings();
        loadOverviewStats();
        
        alert('Booking deleted successfully!');
    }
}

// User functions
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const roleFilter = document.getElementById('user-role-filter').value;
    const searchQuery = document.getElementById('user-search').value.toLowerCase();
    
    // Apply filters
    let filteredUsers = [...users];
    
    if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
            (roleFilter === 'admin' && user.isAdmin) || 
            (roleFilter === 'user' && !user.isAdmin)
        );
    }
    
    if (searchQuery) {
        filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchQuery) ||
            user.email.toLowerCase().includes(searchQuery)
        );
    }
    
    const tableBody = document.getElementById('users-table');
    tableBody.innerHTML = '';
    
    if (filteredUsers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">No users found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // Get bookings to count user bookings
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        
        // Count user bookings
        const userBookingsCount = bookings.filter(booking => booking.userId === user.id).length;
        
        row.innerHTML = `
            <td>${user.id.substring(0, 8)}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${user.isAdmin ? 'Admin' : 'User'}</td>
            <td>${userBookingsCount}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${user.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('#users-table .edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            editUser(userId);
        });
    });
    
    document.querySelectorAll('#users-table .delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            deleteUser(userId);
        });
    });
}

function editUser(userId) {
    const modal = document.getElementById('user-modal');
    const modalTitle = document.getElementById('user-modal-title');
    
    modalTitle.textContent = 'Edit User';
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (user) {
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-phone').value = user.phone || '';
        document.getElementById('user-role').value = user.isAdmin ? 'admin' : 'user';
        
        modal.style.display = 'block';
    }
}

function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

function saveUser() {
    const userId = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const phone = document.getElementById('user-phone').value;
    const role = document.getElementById('user-role').value;
    
    // Validate inputs
    if (!name || !email) {
        alert('Please fill all required fields');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        users[index].name = name;
        users[index].email = email;
        users[index].phone = phone;
        users[index].isAdmin = role === 'admin';
        
        localStorage.setItem('users', JSON.stringify(users));
        closeUserModal();
        loadUsers();
        
        alert('User updated successfully!');
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const filteredUsers = users.filter(user => user.id !== userId);
        
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        loadOverviewStats();
        
        alert('User deleted successfully!');
    }
}

// Settings functions
function saveSettings() {
    const siteName = document.getElementById('site-name').value;
    const siteTagline = document.getElementById('site-tagline').value;
    const contactEmail = document.getElementById('contact-email').value;
    const contactPhone = document.getElementById('contact-phone').value;
    
    // Validate inputs
    if (!siteName || !contactEmail) {
        alert('Please fill all required fields');
        return;
    }
    
    const settings = {
        siteName,
        siteTagline,
        contactEmail,
        contactPhone
    };
    
    localStorage.setItem('site_settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
}

// Initialize sample data for testing
function initializeSampleData() {
    // Check if sample data already exists
    if (!localStorage.getItem('packages')) {
        const samplePackages = [
            {
                id: '1001',
                name: 'Enchanting Goa',
                destination: 'Goa',
                duration: 5,
                price: 15000,
                description: 'Enjoy the beautiful beaches and vibrant nightlife of Goa.',
                image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
                status: 'active'
            },
            {
                id: '1002',
                name: 'Majestic Rajasthan',
                destination: 'Jaipur, Udaipur, Jodhpur',
                duration: 7,
                price: 25000,
                description: 'Explore the royal heritage and culture of Rajasthan.',
                image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
                status: 'active'
            },
            {
                id: '1003',
                name: 'Himalayan Adventure',
                destination: 'Manali, Shimla',
                duration: 6,
                price: 20000,
                description: 'Experience the thrill of adventure in the Himalayas.',
                image: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
                status: 'active'
            }
        ];
        
        localStorage.setItem('packages', JSON.stringify(samplePackages));
    }
    
    if (!localStorage.getItem('users')) {
        const sampleUsers = [
            {
                id: '2001',
                name: 'Admin User',
                email: 'admin@wonderlust.com',
                password: 'admin123',
                isAdmin: true
            },
            {
                id: '2002',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '9876543210',
                password: 'password',
                isAdmin: false
            },
            {
                id: '2003',
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '8765432109',
                password: 'password',
                isAdmin: false
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(sampleUsers));
    }
    
    if (!localStorage.getItem('bookings')) {
        const sampleBookings = [
            {
                id: '3001',
                userId: '2002',
                packageId: '1001',
                packageName: 'Enchanting Goa',
                fullName: 'John Doe',
                email: 'john@example.com',
                phone: '9876543210',
                travelers: 2,
                travelDate: '2023-12-15',
                totalPrice: 30000,
                status: 'confirmed',
                bookingDate: '2023-10-05',
                paymentMethod: 'credit-card'
            },
            {
                id: '3002',
                userId: '2003',
                packageId: '1002',
                packageName: 'Majestic Rajasthan',
                fullName: 'Jane Smith',
                email: 'jane@example.com',
                phone: '8765432109',
                travelers: 3,
                travelDate: '2023-11-20',
                totalPrice: 75000,
                status: 'pending',
                bookingDate: '2023-10-10',
                paymentMethod: 'upi'
            }
        ];
        
        localStorage.setItem('bookings', JSON.stringify(sampleBookings));
    }
}
