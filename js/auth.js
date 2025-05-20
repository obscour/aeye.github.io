// Supabase client init
const SUPABASE_URL = "https://rucanbnwcjqkqjtrfnan.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1Y2FuYm53Y2pxa3FqdHJmbmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTY4MDQsImV4cCI6MjA2MjY3MjgwNH0.M_hApPRLueaT3CyQKcuj01plUeE6jg_TU2661dSlOGA";
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
        let emailToUse = identifier;
        // If not an email, try to look up by username
        if (!identifier.includes('@')) {
          const { data: userProfile, error: userProfileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', identifier)
            .single();
          if (userProfile && userProfile.email) {
            emailToUse = userProfile.email;
          } else {
            throw new Error('No user found with that username');
          }
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email: emailToUse, password });
        if (error) throw error;
        window.location.href = 'dashboard.html';
      } catch (error) {
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
        // Register with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName, last_name: lastName, username } }
        });
        if (error) throw error;

        // Insert into profiles table (with id, email, username, first_name, last_name)
        if (data.user) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, email, username, first_name: firstName, last_name: lastName }]);
          if (insertError) throw insertError;

          // Insert into user_stats table (one row for each alphanumeric_char A-Z, 0-9)
          const chars = [
            ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
          ];
          const statsRows = chars.map(char => ({
            user_id: data.user.id,
            alphanumeric_char: char,
            correct_count: 0,
            attempts: 0,
            avg_response_time: 0,
            mastery_score: 0
          }));
          const { error: statsError } = await supabase
            .from('user_stats')
            .insert(statsRows);
          if (statsError) throw statsError;
        }

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
