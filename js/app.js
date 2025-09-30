// Supabase client init *THIS IS AN ANON KEY*
const SUPABASE_URL = "https://wkdkpwidvgcjkimureew.supabase.co/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZGtwd2lkdmdjamtpbXVyZWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTA4MzksImV4cCI6MjA3MzM2NjgzOX0.6GNKe9fxq5xmWiKw5x7eyX3fASgG2q2avfyJZQWJI_s";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Function to generate QR code (larger)
async function generateQRCode({ onlyMobile = false } = {}) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw error || new Error('No user logged in');

    // Encode user id, email, and full_name in the QR code
    const qrPayload = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || ""
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
          height: 260
        });
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
        height: isMobile ? 190 : 160
      });
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
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw error || new Error('No user logged in');

    // Fetch profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, first_name, last_name')
      .eq('id', user.id)
      .single();

    const welcomeText = profile
      ? `Welcome! <strong>${profile.username}</strong> (${profile.last_name}, ${profile.first_name})`
      : `Welcome! <strong>${user.email}</strong>`;

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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = 'index.html';
  } catch (error) {
    alert('Logout failed: ' + (error.message || error));
    console.error('Error signing out:', error.message || error);
  }
}
window.logout = logout;

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
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw error || new Error('No user logged in');

    // Fetch the stats JSON data from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stats')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Parse the JSON stats and transform to table format
    let statsArray = [];
    if (profile && profile.stats) {
      try {
        const statsJson = typeof profile.stats === 'string' ? JSON.parse(profile.stats) : profile.stats;
        
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