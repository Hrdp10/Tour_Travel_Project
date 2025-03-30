document.addEventListener('DOMContentLoaded', function() {
    // Retrieve confirmation data from session storage
    const confirmationDataString = sessionStorage.getItem('confirmationData');
    if (!confirmationDataString) {
        window.location.href = 'package.html';
        return;
    }
    
    const confirmationData = JSON.parse(confirmationDataString);
    
    // Format date for display
    const travelDate = new Date(confirmationData.travelDate);
    const formattedTravelDate = travelDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const paymentDate = new Date(confirmationData.paymentDate);
    const formattedPaymentDate = paymentDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Format payment method for display
    let paymentMethodDisplay = '';
    switch(confirmationData.paymentMethod) {
        case 'credit-card':
            paymentMethodDisplay = 'Credit/Debit Card';
            break;
        case 'upi':
            paymentMethodDisplay = 'UPI';
            break;
        case 'net-banking':
            paymentMethodDisplay = 'Net Banking';
            break;
        default:
            paymentMethodDisplay = confirmationData.paymentMethod;
    }
    
    // Update confirmation details
    document.getElementById('confirmation-number').textContent = confirmationData.confirmationNumber;
    document.getElementById('package-name').textContent = confirmationData.packageName;
    document.getElementById('travel-date').textContent = formattedTravelDate;
    document.getElementById('travelers-count').textContent = confirmationData.travelers;
    document.getElementById('total-amount').textContent = `₹${confirmationData.totalPrice.toLocaleString('en-IN')}`;
    document.getElementById('payment-method').textContent = paymentMethodDisplay;
    document.getElementById('payment-date').textContent = formattedPaymentDate;
    
    // Update traveler information
    document.getElementById('traveler-name').textContent = confirmationData.fullName;
    document.getElementById('traveler-email').textContent = confirmationData.email;
    document.getElementById('traveler-phone').textContent = confirmationData.phone;
    
    // Handle download button
    document.getElementById('download-btn').addEventListener('click', function(e) {
        e.preventDefault();
        generatePDF();
    });
    
    // Clear session storage after displaying confirmation
    // This prevents users from refreshing the confirmation page
    // Comment this out during development/testing
    // sessionStorage.removeItem('confirmationData');
});

function generatePDF() {
    alert('PDF download functionality would be implemented here.\nIn a real application, this would generate a PDF with all booking details.');
    
    // In a real application, you would use a library like jsPDF or 
    // make an API call to generate a PDF server-side
}
