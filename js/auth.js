// Supabase client init
const SUPABASE_URL = "https://wkdkpwidvgcjkimureew.supabase.co/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZGtwd2lkdmdjamtpbXVyZWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTA4MzksImV4cCI6MjA3MzM2NjgzOX0.6GNKe9fxq5xmWiKw5x7eyX3fASgG2q2avfyJZQWJI_s";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function toggleForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const formTitle = document.getElementById('formTitle');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';
  successMessage.style.display = 'none';
  successMessage.textContent = '';
  if (loginForm.style.display === 'none') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    formTitle.textContent = 'Login';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    formTitle.textContent = 'Register';
  }
}
window.toggleForms = toggleForms;

document.addEventListener('DOMContentLoaded', function() {
  // LOGIN
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = document.getElementById('loginIdentifier').value.trim();
      const password = document.getElementById('password').value;
      const errorMessage = document.getElementById('error-message');
      const successMessage = document.getElementById('success-message');
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';
      successMessage.style.display = 'none';
      successMessage.textContent = '';
      try {
        // Custom login logic - check users table directly
        let userData;
        
        console.log('Attempting login with:', identifier);
        
        if (identifier.includes('@')) {
          // Login with email
          console.log('Looking up user by email:', identifier);
          const { data, error } = await supabase
            .from('users')
            .select('uuid, email, username, password')
            .eq('email', identifier)
            .single();
          
          console.log('Email lookup result:', { data, error });
          
          if (error || !data) {
            throw new Error('No user found with that email');
          }
          userData = data;
        } else {
          // Login with username
          console.log('Looking up user by username:', identifier);
          const { data, error } = await supabase
            .from('users')
            .select('uuid, email, username, password')
            .eq('username', identifier)
            .single();
          
          console.log('Username lookup result:', { data, error });
          
          if (error || !data) {
            throw new Error('No user found with that username');
          }
          userData = data;
        }
        
        console.log('Found user data:', userData);
        console.log('Checking password. Provided:', password, 'Stored:', userData.password);
        
        // Check password (simple comparison for now)
        if (userData.password !== password) {
          throw new Error('Invalid password');
        }
        
        console.log('Password match! Storing user session...');
        
        // Store user session in localStorage (simple approach)
        localStorage.setItem('user', JSON.stringify({
          id: userData.uuid,
          email: userData.email,
          username: userData.username
        }));
        
        console.log('User session stored, redirecting to dashboard...');
        window.location.href = 'dashboard.html';
      } catch (error) {
        console.error('Login error:', error);
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  // REGISTER
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const errorMessage = document.getElementById('error-message');
      const successMessage = document.getElementById('success-message');
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';
      successMessage.style.display = 'none';
      successMessage.textContent = '';
      if (password !== confirmPassword) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Passwords do not match';
        return;
      }
      try {
        // Check if username or email already exists
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('username, email')
          .or(`username.eq.${username},email.eq.${email}`)
          .single();
        
        if (existingUser) {
          if (existingUser.username === username) {
            throw new Error('Username already exists');
          }
          if (existingUser.email === email) {
            throw new Error('Email already exists');
          }
        }

        // Create initial stats JSON structure for A-Z
        const initialStats = {};
        for (let char of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
          initialStats[char] = {
            streak: 0,
            correct: 0,
            mastery: 0,
            attempts: 0
          };
        }

        // Generate a UUID for the new user
        const uuid = crypto.randomUUID();

        // Insert directly into users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ 
            uuid: uuid,
            email, 
            username, 
            password: password,
            stats: initialStats
          }]);
        
        if (insertError) throw insertError;

        errorMessage.style.display = 'none';
        successMessage.style.display = 'block';
        successMessage.textContent = 'Registration successful! Please login.';
        document.getElementById('registerForm').reset();
        setTimeout(() => { toggleForms(); }, 2000);
      } catch (error) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = error.message || 'Registration failed.';
      }
    });
  }
});
