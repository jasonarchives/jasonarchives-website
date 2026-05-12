// ==========================================
// SYSTEM BOOT PROTOCOL: TYPEWRITER + ASCII BAR (OPTIMIZED)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const bootOverlay = document.getElementById("boot-sequence");
  const bootText = document.getElementById("boot-text");
  const bootProgress = document.getElementById("boot-progress");

  if (!bootOverlay || !bootText || !bootProgress) return;

  // 1. The Safety Lock
  if (bootOverlay.hasAttribute("data-booting")) return;
  bootOverlay.setAttribute("data-booting", "true");

  // 2. Check memory (Instant bypass)
  const hasBooted = sessionStorage.getItem("jasonArchiveBoot");
  if (hasBooted) {
    bootOverlay.style.display = "none";
    document.body.classList.remove("is-booting");
    document.body.style.overflow = "";
    return;
  }

  // Lock scrolling
  document.body.style.overflow = "hidden";
  document.body.classList.add("is-booting");

  // 3. Variables
  const stringToType = "loading jasonarchives.online";
  let charIndex = 0;
  let progressPercent = 0;
  const totalBlocks = 20;

  bootText.textContent = "";
  bootProgress.textContent = "";

  // 4. The Mechanical Typing Engine (Sped up)
  function typeWriter() {
    bootProgress.style.opacity = "0.7";

    if (charIndex < stringToType.length) {
      bootText.textContent += stringToType.charAt(charIndex);
      charIndex++;

      // ⚡ Faster typing (20ms - 60ms)
      const speed = Math.floor(Math.random() * 40) + 20;
      setTimeout(typeWriter, speed);
    } else {
      document.querySelector(".boot-cursor").classList.add("is-solid");
      updateProgressBar(100);

      // ⚡ Shorter pause before fading (400ms)
      setTimeout(initiateFade, 400);
    }
  }

  // 5. The ASCII Progress Bar Engine
  function fillProgressBar() {
    if (progressPercent < 100 && charIndex < stringToType.length) {
      // ⚡ Slightly larger jumps so it keeps pace with the faster text
      const jump = Math.floor(Math.random() * 8) + 2;
      progressPercent = Math.min(progressPercent + jump, 99);

      updateProgressBar(progressPercent);

      const speed = Math.floor(Math.random() * 40) + 20;
      setTimeout(fillProgressBar, speed);
    }
  }

  function updateProgressBar(percent) {
    const filledCount = Math.floor((percent / 100) * totalBlocks);
    const emptyCount = totalBlocks - filledCount;

    const filledStr = "█".repeat(filledCount);
    const emptyStr = "░".repeat(emptyCount);

    bootProgress.textContent = `[${filledStr}${emptyStr}] ${percent.toString().padStart(3, '0')}%`;
  }

  // 6. The Dissolve Sequence (Now completely independent of images)
  function initiateFade() {
    bootOverlay.classList.add("is-hidden");
    document.body.classList.remove("is-booting");

    // ⚡ Matches the 0.8s CSS transition time perfectly
    setTimeout(() => {
      bootOverlay.style.display = "none";
      document.body.style.overflow = "";
      sessionStorage.setItem("jasonArchiveBoot", "true");
    }, 800);
  }

  // 7. ⚡ THE HARD FAILSAFE
  // Mathematically forces the screen to clear after 2.5s maximum, no matter what happens
  setTimeout(() => {
    if (!bootOverlay.classList.contains("is-hidden")) {
      initiateFade();
    }
  }, 2500);

  // Start BOTH engines almost instantly after DOM loads (100ms)
  setTimeout(() => {
    typeWriter();
    fillProgressBar();
  }, 100);
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
