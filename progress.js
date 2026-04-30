// ==========================================
// 1. Read Time and Scroll Percentage Tracker
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const pctText = document.getElementById("read-pct");
  const timeText = document.getElementById("read-time");
  
  // Detects both standard UX Case Studies and the new Photo Dossiers
  const contentBody = document.querySelector(".article-body, .dossier-body");
  
  if (!pctText || !timeText || !contentBody) return;
  
  const text = contentBody.innerText || contentBody.textContent;
  const wordCount = text.trim().split(/\s+/).length;
  const totalReadTimeMinutes = Math.ceil(wordCount / 200); 
  
  timeText.textContent = totalReadTimeMinutes.toString().padStart(2, '0');

  window.addEventListener("scroll", () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    let scrolled = (winScroll / height) * 100;
    if (scrolled > 100) scrolled = 100;
    if (scrolled < 0) scrolled = 0;
    
    pctText.textContent = Math.round(scrolled).toString().padStart(2, '0');
    
    const percentRemaining = 100 - scrolled;
    const timeRemaining = Math.ceil((totalReadTimeMinutes * percentRemaining) / 100);
    
    timeText.textContent = timeRemaining.toString().padStart(2, '0');
  });
});

// ==========================================
// 2. Universal Intersection Observer for Sticky Ledger
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".ledger-link, .hud-link"); // Tracks both Desktop and Mobile links
  if (navLinks.length === 0) return;

  const sections = [];
  navLinks.forEach(link => {
    const targetId = link.getAttribute("href");
    if (targetId && targetId.startsWith("#")) {
      const targetElement = document.querySelector(targetId);
      if (targetElement && !sections.includes(targetElement)) {
        sections.push(targetElement);
      }
    }
  });

  if (sections.length === 0) return;

  // 1. Pause tracking during manual clicks to prevent menu flickering
  let isClickScrolling = false;
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      // THE FIX: Kill the native instant HTML jump
      e.preventDefault(); 
      
      isClickScrolling = true;

      // Find the target section and glide to it smoothly
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      
      // Instantly highlight the clicked link
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // Re-enable the scroll tracker after the smooth scroll finishes (approx 800ms)
      setTimeout(() => {
        isClickScrolling = false;
      }, 800);
    });
  });

  // 2. Expanded Detection Zone (The upper 50% of the screen)
  const observerOptions = {
    root: null,
    rootMargin: "-10% 0px -50% 0px", 
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    if (isClickScrolling) return; // Ignores intersections if the user is currently clicking/teleporting

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove("active"));
        
        const id = entry.target.getAttribute("id");
        // Highlight BOTH the desktop ledger and mobile HUD links
        const activeLinks = document.querySelectorAll(`a[href="#${id}"]`);
        activeLinks.forEach(link => link.classList.add("active"));
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));

  // 3. The "Bottom of Page" Failsafe
  // Ensures the very last item highlights even if it can't reach the middle of the screen
  window.addEventListener("scroll", () => {
    if (isClickScrolling) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.body.offsetHeight;

    // If the user hits the absolute bottom of the page
    if (scrollPosition >= documentHeight - 50) {
      navLinks.forEach(link => link.classList.remove("active"));
      
      // Force the final section link to be active
      const lastSectionId = sections[sections.length - 1].getAttribute("id");
      const activeLinks = document.querySelectorAll(`a[href="#${lastSectionId}"]`);
      activeLinks.forEach(link => link.classList.add("active"));
    }
  });
});

// ==========================================
// 3. Mobile HUD Ledger Logic
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const hudBtn = document.getElementById("mobile-ledger-btn");
  const closeBtn = document.getElementById("close-hud-btn");
  const overlay = document.getElementById("mobile-ledger-overlay");
  const hudLinks = document.querySelectorAll(".hud-link");

  // Safety check
  if (!hudBtn || !overlay) return;

  // Open the HUD
  hudBtn.addEventListener("click", () => {
    overlay.classList.add("active");
    // Prevent the background body from scrolling while the menu is open
    document.body.style.overflow = "hidden";
  });

  // Close the HUD
  const closeHUD = () => {
    overlay.classList.remove("active");
    // Restore scrolling
    document.body.style.overflow = "";
  };

  if (closeBtn) closeBtn.addEventListener("click", closeHUD);

  // Close the HUD immediately when a link is tapped
  hudLinks.forEach(link => {
    link.addEventListener("click", closeHUD);
  });

  // Hide HUD Button when reaching the pipeline block to prevent overlap
  const pipelineBlock = document.querySelector(".project-pipeline");
  
  if (pipelineBlock) {
    const pipelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          hudBtn.classList.add("hidden-by-scroll");
        } else {
          hudBtn.classList.remove("hidden-by-scroll");
        }
      });
    }, { 
      root: null, 
      threshold: 0.1 
    });

    pipelineObserver.observe(pipelineBlock);
  }
});

// ==========================================
// 4. Dynamic Distribution & Clipboard Links
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);

  const lnkLinkedIn = document.getElementById("share-linkedin");
  const lnkWhatsApp = document.getElementById("share-whatsapp");
  const lnkEmail = document.getElementById("share-email");
  const btnCopy = document.getElementById("share-copy");

  // LinkedIn Intent
  if (lnkLinkedIn) {
    lnkLinkedIn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
  }
  
  // WhatsApp Intent
  if (lnkWhatsApp) {
    lnkWhatsApp.href = `https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}`;
  }
  
  // Email Client Trigger
  if (lnkEmail) {
    lnkEmail.href = `mailto:?subject=${pageTitle}&body=Check out this record: ${pageUrl}`;
  }

  // Clipboard Function (For Slack, Discord, etc.)
  if (btnCopy) {
    btnCopy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        
        const originalText = btnCopy.textContent;
        btnCopy.textContent = "[ copied! ]";
        btnCopy.style.color = "var(--accent-color)";
        
        setTimeout(() => {
          btnCopy.textContent = originalText;
          btnCopy.style.color = "var(--text-color)";
        }, 2000);
      } catch (err) {
        console.error("Failed to copy!", err);
      }
    });
  }
});


// ==========================================
// 5. Mobile Footnote & Edge-Detection Logic
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const footnotes = document.querySelectorAll(".footnote");

  // The Edge Detection Math
  const adjustTooltipPosition = (note) => {
    const rect = note.getBoundingClientRect();
    const tooltipMaxWidth = 260; // Matches your CSS max-width
    const screenWidth = window.innerWidth;
    
    // Find the exact center of the highlighted word
    const wordCenter = rect.left + (rect.width / 2);
    const halfTooltip = tooltipMaxWidth / 2;
    
    let offset = 0;
    const safeMargin = 15; // 15px breathing room from screen edges

    // Check if it bleeds off the left edge
    if (wordCenter - halfTooltip < safeMargin) {
      offset = safeMargin - (wordCenter - halfTooltip);
    } 
    // Check if it bleeds off the right edge
    else if (wordCenter + halfTooltip > screenWidth - safeMargin) {
      offset = (screenWidth - safeMargin) - (wordCenter + halfTooltip);
    }

    // Send the correction to CSS
    note.style.setProperty('--x-offset', `${offset}px`);
  };

  footnotes.forEach(note => {
    // Desktop Hover Check
    note.addEventListener("mouseenter", () => {
      adjustTooltipPosition(note);
    });

    // Mobile Tap Check
    note.addEventListener("click", (e) => {
      e.stopPropagation(); 
      adjustTooltipPosition(note); // Calculate safe position before opening
      
      const wasActive = note.classList.contains("is-active");

      document.querySelectorAll(".footnote.is-active").forEach(n => {
        n.classList.remove("is-active");
      });

      if (!wasActive) {
        note.classList.add("is-active");
      }
    });
  });

  // Clicking anywhere else on the screen closes open footnotes
  document.addEventListener("click", () => {
    document.querySelectorAll(".footnote.is-active").forEach(n => {
      n.classList.remove("is-active");
    });
  });
  
  // Recalculate if the user rotates their phone
  window.addEventListener("resize", () => {
    document.querySelectorAll(".footnote.is-active").forEach(n => {
      adjustTooltipPosition(n);
    });
  });
});