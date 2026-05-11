// ==========================================
// SYSTEM BOOT PROTOCOL: TYPEWRITER + ASCII BAR
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const bootOverlay = document.getElementById("boot-sequence");
  const bootText = document.getElementById("boot-text");
  const bootProgress = document.getElementById("boot-progress");

  if (!bootOverlay || !bootText || !bootProgress) return;

  // 1. The Safety Lock (Prevents double-running and jumbled text)
  if (bootOverlay.hasAttribute("data-booting")) return;
  bootOverlay.setAttribute("data-booting", "true");

  // 2. Check memory
  const hasBooted = sessionStorage.getItem("jasonArchiveBoot");
  if (hasBooted) {
    bootOverlay.style.display = "none";
    return;
  }

  // Lock scrolling
  document.body.style.overflow = "hidden";
  document.body.classList.add("is-booting"); // For Z-Axis scale effect

  // 3. Variables
  const stringToType = "loading jasonarchives.online";
  let charIndex = 0;

  // Progress Bar Variables
  let progressPercent = 0;
  const totalBlocks = 20; // The physical length of the bar

  bootText.textContent = "";
  bootProgress.textContent = "";

  // 4. The Mechanical Typing Engine
  function typeWriter() {
    bootProgress.style.opacity = "0.7"; // Reveal the progress bar

    if (charIndex < stringToType.length) {
      bootText.textContent += stringToType.charAt(charIndex);
      charIndex++;

      const speed = Math.floor(Math.random() * 80) + 60;
      setTimeout(typeWriter, speed);
    } else {
      // When typing finishes, lock the cursor and force bar to 100%
      document.querySelector(".boot-cursor").classList.add("is-solid");
      updateProgressBar(100);

      setTimeout(initiateFade, 1500);
    }
  }

  // 5. The ASCII Progress Bar Engine
  function fillProgressBar() {
    // Only fill while the text is still typing
    if (progressPercent < 100 && charIndex < stringToType.length) {
      // Jump by random amounts (1% to 6%)
      const jump = Math.floor(Math.random() * 6) + 1;
      progressPercent = Math.min(progressPercent + jump, 99); // Hold at 99% max

      updateProgressBar(progressPercent);

      const speed = Math.floor(Math.random() * 70) + 30;
      setTimeout(fillProgressBar, speed);
    }
  }

  // Helper function to draw the raw ASCII blocks
  function updateProgressBar(percent) {
    const filledCount = Math.floor((percent / 100) * totalBlocks);
    const emptyCount = totalBlocks - filledCount;

    const filledStr = "█".repeat(filledCount);
    const emptyStr = "░".repeat(emptyCount);

    bootProgress.textContent = `[${filledStr}${emptyStr}] ${percent.toString().padStart(3, '0')}%`;
  }

  // 6. The Dissolve Sequence (Asset-Aware)
  function initiateFade() {
    // Hold here until all images on the page load
    if (document.readyState !== "complete") {
      setTimeout(initiateFade, 100);
      return;
    }

    bootOverlay.classList.add("is-hidden");
    document.body.classList.remove("is-booting");

    setTimeout(() => {
      bootOverlay.style.display = "none";
      document.body.style.overflow = "";
      sessionStorage.setItem("jasonArchiveBoot", "true");
    }, 2500);
  }

  // Start BOTH engines simultaneously 800ms after load
  setTimeout(() => {
    typeWriter();
    fillProgressBar();
  }, 800);
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
