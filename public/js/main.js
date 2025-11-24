document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  function applyTheme(theme) {
    if (theme === 'dark') {
      body.classList.add('dark');
      if (themeToggle) themeToggle.textContent = '☀️'; 
    } else {
      body.classList.remove('dark');
      if (themeToggle) themeToggle.textContent = '🌙'; 
    }
  }

  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    applyTheme(currentTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark');
      
      let newTheme = 'light';
      if (body.classList.contains('dark')) {
        newTheme = 'dark';
      }
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme); 
    });
  }

  const navToggleBtn = document.getElementById('nav-toggle-btn');
  const navbar = document.querySelector('.navbar');

  if (navToggleBtn && navbar) {
    navToggleBtn.addEventListener('click', () => {
      navbar.classList.toggle('nav-open');
    });
  }
});