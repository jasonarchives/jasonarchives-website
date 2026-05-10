// ==========================================
// SYSTEM BOOT PROTOCOL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const bootOverlay = document.getElementById("boot-sequence");
  const bootText = document.getElementById("boot-text");

  if (!bootOverlay || !bootText) return;

  // 1. Check the browser's short-term memory
  const hasBooted = sessionStorage.getItem("jasonArchiveBoot");

  // If they already booted up, kill the overlay instantly to prevent a flash
  if (hasBooted) {
    bootOverlay.style.display = "none";
    return;
  }

  // 2. Lock the user's ability to scroll while the system boots
  document.body.style.overflow = "hidden";

  const stringToType = "Loading Archive...";
  let i = 0;

  // 3. The mechanical typing engine
  function typeWriter() {
    if (i < stringToType.length) {
      bootText.innerHTML += stringToType.charAt(i);
      i++;

      // Randomize the typing speed between 30ms and 90ms for realism
      const speed = Math.floor(Math.random() * 60) + 30;
      setTimeout(typeWriter, speed);
    } else {
      // Once typing finishes, pause for 600ms, then initiate the blur
      setTimeout(initiateFade, 600);
    }
  }

  // 4. The Dissolve Sequence
  function initiateFade() {
    bootOverlay.classList.add("is-hidden");

    // Wait for the 1.2s CSS blur transition to finish, then clean up the DOM
    setTimeout(() => {
      bootOverlay.style.display = "none";
      document.body.style.overflow = ""; // Unlock scrolling

      // Save a note in the browser so this never plays again this session
      sessionStorage.setItem("jasonArchiveBoot", "true");
    }, 1200);
  }

  // Start the typing effect 300ms after the page loads for dramatic pacing
  setTimeout(typeWriter, 300);
});// ==========================================
// SYSTEM BOOT PROTOCOL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const bootOverlay = document.getElementById("boot-sequence");
  const bootText = document.getElementById("boot-text");

  if (!bootOverlay || !bootText) return;

  // 1. Check the browser's short-term memory
  const hasBooted = sessionStorage.getItem("jasonArchiveBoot");

  // If they already booted up, kill the overlay instantly to prevent a flash
  if (hasBooted) {
    bootOverlay.style.display = "none";
    return;
  }

  // 2. Lock the user's ability to scroll while the system boots
  document.body.style.overflow = "hidden";

const stringToType = "Loading Archive...";
  let i = 0;

  // THE FIX: Forcefully wipe the HTML blank before we start typing
  bootText.innerHTML = "";

  // 3. The mechanical typing engine
  function typeWriter() {
    if (i < stringToType.length) {
      // We use textContent instead of innerHTML here—it's safer and prevents weird rendering bugs!
      bootText.textContent += stringToType.charAt(i);
      i++;

      const speed = Math.floor(Math.random() * 80) + 60;
      setTimeout(typeWriter, speed);
    } else {
      setTimeout(initiateFade, 1500);
    }
  }

  // 4. The Dissolve Sequence
  function initiateFade() {
    bootOverlay.classList.add("is-hidden");

    // THE TWEAK: Wait 2500ms (2.5s) to match the new CSS transition time!
    setTimeout(() => {
      bootOverlay.style.display = "none";
      document.body.style.overflow = "";
      sessionStorage.setItem("jasonArchiveBoot", "true");
    }, 2500);
  }

  // THE TWEAK: Wait a full 800ms before the first letter even types (was 300ms)
  setTimeout(typeWriter, 800);

  // Start the typing effect 300ms after the page loads for dramatic pacing
  setTimeout(typeWriter, 300);
});





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
