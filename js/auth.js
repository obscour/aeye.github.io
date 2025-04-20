const testAccounts = {
    "test": "test",
    "studentA": "test1",
    "teacher": "test2",
    "admin": "admin"
  };
  
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const id = document.getElementById("deviceId").value;
    const pw = document.getElementById("devicePassword").value;
  
    if (testAccounts[id] && testAccounts[id] === pw) {
      window.location.href = "dashboard.html";
    } else {
      alert("Invalid ID or password.");
    }
  });
  