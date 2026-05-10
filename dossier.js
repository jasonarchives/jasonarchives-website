// dossier.js - The Evidence Examiner

document.addEventListener("DOMContentLoaded", () => {
  const examinableImages = document.querySelectorAll(".examinable-image");
  const overlay = document.getElementById("examiner-overlay");
  let isExamining = false;

  examinableImages.forEach(img => {
    img.addEventListener("click", () => {
      overlay.innerHTML = '';
      
      const highResClone = img.cloneNode();
      highResClone.style.cursor = "zoom-out"; 
      
      overlay.appendChild(highResClone);
      overlay.classList.add("active");
      isExamining = true;
      
      // Lock the scroll
      document.body.style.overflow = "hidden";
    });
  });

  overlay.addEventListener("click", () => {
    if (isExamining) {
      overlay.classList.remove("active");
      isExamining = false;
      
      // THE FIX: Clear the inline style so core.css takes over again
      document.body.style.overflow = ""; 
      
      setTimeout(() => {
        overlay.innerHTML = '';
      }, 300);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isExamining) {
      overlay.click();
    }
  });
});






// ==========================================
// FULL-SCREEN HORIZONTAL SLIDESHOW ENGINE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("horizontal-track");
  const strip = document.getElementById("horizontal-strip");
  
  if (!track || !strip) return;

  let maxTranslate = 0;
  let targetTranslate = 0;
  let currentTranslate = 0;

  // 1. Calculate Track Dimensions
  const calculateDimensions = () => {
    // Total physical width of the film strip minus one screen width
    const stripWidth = strip.scrollWidth;
    const windowWidth = window.innerWidth;
    maxTranslate = stripWidth - windowWidth;
    
    // Makes the vertical track perfectly proportional to the horizontal width
    track.style.height = `${maxTranslate + window.innerHeight}px`;
  };

  calculateDimensions();
  window.addEventListener("resize", calculateDimensions);

  // 2. Map Vertical Scroll to Horizontal Position
  window.addEventListener("scroll", () => {
    const trackRect = track.getBoundingClientRect();
    
    // Calculates how far the user has scrolled past the top of the camera
    const scrollDistance = -trackRect.top;
    const maxScroll = track.offsetHeight - window.innerHeight;
    
    let progress = scrollDistance / maxScroll;
    
    // Clamp values so it doesn't break boundaries
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;
    
    targetTranslate = progress * maxTranslate;
  });

  // 3. The Animation Loop (Linear Interpolation for butter-smooth gliding)
  const lerpScroll = () => {
    currentTranslate += (targetTranslate - currentTranslate) * 0.08;
    strip.style.transform = `translateX(-${currentTranslate}px)`;
    requestAnimationFrame(lerpScroll);
  };
  
  lerpScroll();

  // 4. UI Hiding Observer (Fades out Navbar, Ledger, Footer)
  const uiObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Trigger the fade-out when 5% of the section is on screen
      if (entry.isIntersecting) {
        document.body.classList.add("hide-ui-mode");
      } else {
        document.body.classList.remove("hide-ui-mode");
      }
    });
  }, { threshold: 0.05 });
  
  uiObserver.observe(track);

  // 5. Back to Top Mechanism
  const btnReturnTop = document.getElementById("btn-return-top");
  if (btnReturnTop) {
    btnReturnTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});


// ==========================================
// DARKROOM DEVELOPMENT PROTOCOL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const darkroomPhotos = document.querySelectorAll('.darkroom-photo');

  darkroomPhotos.forEach(photo => {
    // If the image is already downloaded (cached by the browser), develop it immediately
    if (photo.complete) {
      photo.classList.add('is-developed');
    } else {
      // Otherwise, wait for it to finish downloading, then develop it
      photo.addEventListener('load', () => {
        photo.classList.add('is-developed');
      });
    }
  });
});
