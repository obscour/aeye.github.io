const testAccounts = {
    "test": "test",
    "studentA": "test1",
    "teacher": "test2",
    "admin": "admin"
};
  
    // Theme toggle logic
    document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('themeToggle');
  
    // Toggle the theme on button click
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            // Toggle between dark and light classes
            document.body.classList.toggle('dark');
            document.body.classList.toggle('light');
  
            // Save the selected theme in localStorage
            localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        });
    }
  
    // Apply the saved theme from localStorage on page load
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    }});
  
    // Login form submission handling
    document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
  
    // Get input values
    const deviceId = document.getElementById('deviceId').value;
    const devicePassword = document.getElementById('devicePassword').value;
  
    // Simple login validation (replace with your actual validation logic)
    if (testAccounts[deviceId] && testAccounts[deviceId] === devicePassword) {
        // Redirect to dashboard if valid
        window.location.href = 'dashboard.html';
    } else {
        // Show the error message
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = 'block'; // Make the error message visible
    }});