document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const desktopToggle = document.getElementById('desktop-theme-toggle');
  const mobileToggle = document.getElementById('mobile-theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const desktopBtns = document.querySelectorAll('.theme-btn');

  // 1. Initialize Theme from User Memory or OS Preference
  function initTheme() {
    const savedTheme = localStorage.getItem('os-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let currentTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');
    applyTheme(currentTheme);
  }

  // 2. The Core Application Logic
  function applyTheme(theme) {
    // Inject the theme data-tag into the HTML
    root.setAttribute('data-theme', theme);
    // Save to browser memory
    localStorage.setItem('os-theme', theme);

    // Update Desktop UI Label
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? '[ MODE: DARK ]' : '[ MODE: LIGHT ]';
    }

    // Update Desktop Buttons (Fills the active one)
    desktopBtns.forEach(btn => {
      if (btn.getAttribute('data-set-theme') === theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Mobile UI (Shape-shifts the icon)
    if (mobileToggle) {
      mobileToggle.textContent = theme === 'dark' ? '[ ◯ ]' : '[ ◐ ]';
    }
  }

  // 3. Event Listeners

  // Desktop Buttons Click
  desktopBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedTheme = e.target.getAttribute('data-set-theme');
      applyTheme(selectedTheme);
    });
  });

  // Mobile Toggle Click (One-tap swap)
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      let currentTheme = root.getAttribute('data-theme');

      // Failsafe in case attribute isn't registered yet
      if (!currentTheme) {
         currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }

  // Boot the engine on page load
  initTheme();
});
