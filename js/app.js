// Supabase client init *THIS IS AN ANON KEY*
const SUPABASE_URL = "https://wkdkpwidvgcjkimureew.supabase.co/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZGtwd2lkdmdjamtpbXVyZWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTA4MzksImV4cCI6MjA3MzM2NjgzOX0.6GNKe9fxq5xmWiKw5x7eyX3fASgG2q2avfyJZQWJI_s";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to generate QR code (larger)
async function generateQRCode({ onlyMobile = false } = {}) {
  try {
    // Get user from localStorage (custom auth)
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('No user logged in');
    
    const user = JSON.parse(userStr);

    // Encode user id, email, and username in the QR code
    const qrPayload = {
      id: user.id,
      email: user.email,
      username: user.username
    };

    const qrData = JSON.stringify(qrPayload);
    if (!onlyMobile) {
      // Desktop sidebar
      const qrcodeDiv = document.getElementById('qrcode');
      if (qrcodeDiv) {
        qrcodeDiv.innerHTML = '';
        new QRCode(qrcodeDiv, {
          text: qrData,
          width: 260,
          height: 260,
          title: '', // Remove hover tooltip
          correctLevel: QRCode.CorrectLevel.M
        });
        
        // Aggressively remove tooltip after QR code is generated
        setTimeout(() => {
          const qrImg = qrcodeDiv.querySelector('img');
          const qrCanvas = qrcodeDiv.querySelector('canvas');
          const qrElement = qrImg || qrCanvas;
          
          if (qrElement) {
            qrElement.removeAttribute('title');
            qrElement.removeAttribute('data-original-title');
            qrElement.style.pointerEvents = 'none';
            qrElement.style.cursor = 'default';
            
            // Remove any event listeners that might show tooltips
            qrElement.onmouseover = null;
            qrElement.onmouseenter = null;
            qrElement.onmouseleave = null;
          }
          
          // Also remove from the container div
          qrcodeDiv.removeAttribute('title');
          qrcodeDiv.style.pointerEvents = 'none';
          
          // Set up a MutationObserver to watch for any changes and remove tooltips
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
                mutation.target.removeAttribute('title');
                mutation.target.removeAttribute('data-original-title');
              }
            });
          });
          
          observer.observe(qrcodeDiv, {
            attributes: true,
            attributeFilter: ['title', 'data-original-title']
          });
        }, 100);
      }
    }
    // Mobile offcanvas
    const qrcodeMobileDiv = document.getElementById('qrcodeMobile');
    if (qrcodeMobileDiv) {
      qrcodeMobileDiv.innerHTML = '';
      // Use larger QR code on mobile
      const isMobile = window.innerWidth < 768;
      new QRCode(qrcodeMobileDiv, {
        text: qrData,
        width: isMobile ? 190 : 160,
        height: isMobile ? 190 : 160,
        title: '', // Remove hover tooltip
        correctLevel: QRCode.CorrectLevel.M
      });
      
      // Aggressively remove tooltip after QR code is generated
      setTimeout(() => {
        const qrImgMobile = qrcodeMobileDiv.querySelector('img');
        const qrCanvasMobile = qrcodeMobileDiv.querySelector('canvas');
        const qrElementMobile = qrImgMobile || qrCanvasMobile;
        
        if (qrElementMobile) {
          qrElementMobile.removeAttribute('title');
          qrElementMobile.removeAttribute('data-original-title');
          qrElementMobile.style.pointerEvents = 'none';
          qrElementMobile.style.cursor = 'default';
          
          // Remove any event listeners that might show tooltips
          qrElementMobile.onmouseover = null;
          qrElementMobile.onmouseenter = null;
          qrElementMobile.onmouseleave = null;
        }
        
        // Also remove from the container div
        qrcodeMobileDiv.removeAttribute('title');
        qrcodeMobileDiv.style.pointerEvents = 'none';
        
        // Set up a MutationObserver to watch for any changes and remove tooltips
        const observerMobile = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
              mutation.target.removeAttribute('title');
              mutation.target.removeAttribute('data-original-title');
            }
          });
        });
        
        observerMobile.observe(qrcodeMobileDiv, {
          attributes: true,
          attributeFilter: ['title', 'data-original-title']
        });
      }, 100);
    }
  } catch (error) {
    const qrcodeDiv = document.getElementById('qrcode');
    if (qrcodeDiv) {
      qrcodeDiv.innerHTML = `<div class='text-danger'>QR code error: ${error?.message || error}</div>`;
    }
    const qrcodeMobileDiv = document.getElementById('qrcodeMobile');
    if (qrcodeMobileDiv) {
      qrcodeMobileDiv.innerHTML = `<div class='text-danger'>QR code error: ${error?.message || error}</div>`;
    }
    console.error('Error generating QR code:', error?.message || error);
  }
}

// Function to display current user
async function displayCurrentUser() {
  try {
    // Get user from localStorage (custom auth)
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('No user logged in');
    
    const user = JSON.parse(userStr);
    const welcomeText = `Welcome! <strong>${user.username}</strong>`;

    // Desktop sidebar
    const currentUserDiv = document.getElementById('currentUser');
    if (currentUserDiv) currentUserDiv.innerHTML = welcomeText;
    // Mobile offcanvas
    const currentUserMobileDiv = document.getElementById('currentUserMobile');
    if (currentUserMobileDiv) currentUserMobileDiv.innerHTML = welcomeText;
  } catch (error) {
    console.error('Error getting user:', error?.message || error);
    const currentUserDiv = document.getElementById('currentUser');
    if (currentUserDiv) currentUserDiv.textContent = 'Welcome, Guest';
    const currentUserMobileDiv = document.getElementById('currentUserMobile');
    if (currentUserMobileDiv) currentUserMobileDiv.textContent = 'Welcome, Guest';
  }
}

// Function to handle logout
async function logout() {
  try {
    // Get user info before clearing
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    // Log logout activity
    if (user && window.auditLog) {
      await window.auditLog.logActivity('logout', `Student ${user.username} logged out`, user.id);
    }
    
    // Clear user from localStorage (custom auth)
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  } catch (error) {
    alert('Logout failed: ' + (error.message || error));
    console.error('Error signing out:', error.message || error);
  }
}
window.logout = logout;

// Function to log quiz activity (can be called from external quiz systems)
async function logQuizActivity(letter, result, responseTime) {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && window.auditLog) {
      const user = JSON.parse(userStr);
      const details = `Quiz for letter ${letter}: ${result ? 'Correct' : 'Incorrect'} (${responseTime}ms)`;
      await window.auditLog.logActivity('quiz', details, user.id);
    }
  } catch (error) {
    console.error('Error logging quiz activity:', error);
  }
}
window.logQuizActivity = logQuizActivity;

let statsData = [];
let currentSort = { column: null, asc: true };

// Function to render stats table
function renderStatsTable(stats) {
  const tbody = document.getElementById('userStatsBody');
  tbody.innerHTML = '';
  if (stats && stats.length > 0) {
    stats.forEach(row => {
      tbody.innerHTML += `<tr>
        <td>${row.alphanumeric_char}</td>
        <td>${row.attempts}</td>
        <td>${row.mastery_score}</td>
        <td>${row.correct_count}</td>
        <td>${row.avg_response_time}</td>
        <td>${row.streak || 0}</td>
      </tr>`;
    });
  } else {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No data found.</td></tr>';
  }
  // Do NOT re-attach sorting event listeners here
}

// Function to sort and render
function sortAndRender(column) {
  if (currentSort.column === column) {
    currentSort.asc = !currentSort.asc;
  } else {
    currentSort.column = column;
    currentSort.asc = true;
  }
  statsData.sort((a, b) => {
    if (a[column] == null) return 1;
    if (b[column] == null) return -1;
    if (typeof a[column] === 'number' && typeof b[column] === 'number') {
      return currentSort.asc ? a[column] - b[column] : b[column] - a[column];
    }
    return currentSort.asc
      ? String(a[column]).localeCompare(String(b[column]))
      : String(b[column]).localeCompare(String(a[column]));
  });
  renderStatsTable(statsData);
  updateSortIndicators();
}

// Update sort indicators
function updateSortIndicators() {
  document.querySelectorAll('#userStatsTable th.sortable').forEach(th => {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.column === currentSort.column) {
      th.classList.add(currentSort.asc ? 'sorted-asc' : 'sorted-desc');
    }
  });
}

// Function to fetch and display user stats
async function displayUserStats() {
  try {
    // Get user from localStorage (custom auth)
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('No user logged in');
    
    const user = JSON.parse(userStr);

    // Fetch the stats JSON data from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stats')
      .eq('uuid', user.id)
      .single();

    if (userError) throw userError;

    // Parse the JSON stats and transform to table format
    let statsArray = [];
    if (userData && userData.stats) {
      try {
        const statsJson = typeof userData.stats === 'string' ? JSON.parse(userData.stats) : userData.stats;
        
        // Transform the JSON object into an array for table display
        statsArray = Object.entries(statsJson).map(([char, data]) => ({
          alphanumeric_char: char,
          attempts: data.attempts || 0,
          mastery_score: data.mastery || 0,
          correct_count: data.correct || 0,
          avg_response_time: 0, // Not available in current JSON structure
          streak: data.streak || 0
        }));
      } catch (parseError) {
        console.error('Error parsing stats JSON:', parseError);
        statsArray = [];
      }
    }

    statsData = statsArray;
    renderStatsTable(statsData);
    updateSortIndicators();
  } catch (error) {
    const tbody = document.getElementById('userStatsBody');
    tbody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Error: ${error?.message || error}</td></tr>`;
    console.error('Error fetching user stats:', error?.message || error);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  displayCurrentUser();
  generateQRCode();
  displayUserStats();
  
  // Log dashboard access
  if (window.auditLog) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      window.auditLog.logActivity('dashboard_access', 'Student accessed dashboard', user.id);
    }
  }

  // Regenerate QR code for mobile every time offcanvas is shown
  const sidebarOffcanvas = document.getElementById('sidebarOffcanvas');
  if (sidebarOffcanvas) {
    sidebarOffcanvas.addEventListener('shown.bs.offcanvas', function () {
      generateQRCode({ onlyMobile: true });
    });
  }

  // Attach sorting event listeners ONCE
  document.querySelectorAll('#userStatsTable th.sortable').forEach(th => {
    th.addEventListener('click', function() {
      sortAndRender(th.dataset.column);
    });
  });
});

// Add CSS for sort indicators
const style = document.createElement('style');
style.innerHTML = `
  th.sortable { cursor: pointer; user-select: none; }
  th.sortable.sorted-asc:after { content: ' \\25B2'; color: #007bff; }
  th.sortable.sorted-desc:after { content: ' \\25BC'; color: #007bff; }
`;
document.head.appendChild(style);