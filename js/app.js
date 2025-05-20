const testAccounts = {
    "test": "test",
    "studentA": "test1",
    "teacher": "test2",
    "admin": "admin"
};
  
    // Login form submission handling
    document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
  
    // Get input values
    const deviceId = document.getElementById('deviceId').value;
    const devicePassword = document.getElementById('devicePassword').value;

    // logs
    console.log("Attempting login with Device ID: " + deviceId + " and Password: " + devicePassword);
  
    // Simple login validation (replace with your actual validation logic)
    if (testAccounts[deviceId] && testAccounts[deviceId] === devicePassword) {
        // Redirect to dashboard if valid
        window.location.href = 'dashboard.html';
    } else {
        // Show the error message
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = 'block'; // Make the error message visible
    }});