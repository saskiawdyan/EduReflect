document.addEventListener('DOMContentLoaded', () => {

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
  }

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
  }
});

async function handleRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries()); 
  
  const errorMessageEl = document.getElementById('register-error-message');
  errorMessageEl.textContent = ''; 

  try {
      const result = await apiFetch('/api/auth/register', {
          method: 'POST',
          body: data,
      });

      console.log(result.message); 
      
      window.location.href = 'learnstyle.html'; 

  } catch (error) {
      errorMessageEl.textContent = error.message;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries()); 
  
  const errorMessageEl = document.getElementById('login-error-message');
  errorMessageEl.textContent = '';

  try {
      const result = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: data,
      });
      console.log(result.message); 
      
      if (result.data.hasQuizResult) {
          window.location.href = 'dashboard.html';
      } else {
          window.location.href = 'learnstyle.html';
      }

  } catch (error) {
      errorMessageEl.textContent = error.message; 
  }
}

async function handleLogout(e) {
  e.preventDefault();
  try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      window.location.href = 'index.html'; 
  } catch (error) {
      console.error('Logout Gagal:', error.message);
      window.location.href = 'index.html';
  }
}