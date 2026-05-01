// overlay.js - Centralized Overlay Controller

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-toggle');
  const overlay = document.getElementById('index-overlay');
  const body = document.body;
  const navbar = document.querySelector('.navbar');
  const closeBtn = document.getElementById('overlay-close-btn');

 function openOverlay() {
    overlay.classList.add('active');

    // THE FIX: Only lock the scroll on mobile devices (under 900px).
    // This mathematically guarantees your desktop sidebars and scrollbars remain untouched.
    if (window.innerWidth < 900) {
      body.classList.add('scroll-lock');
    }
    
    // Fade out navbar to prevent bleed-through
    if (navbar) {
      navbar.style.opacity = '0';
      navbar.style.pointerEvents = 'none';
      navbar.style.transition = 'opacity 0.2s ease';
    }
  }

  function closeOverlay() {
    overlay.classList.remove('active');
    
    // Fade navbar back in
    if (navbar) {
      navbar.style.opacity = '1';
      navbar.style.pointerEvents = 'auto';
    }
    
    // Wait for the 0.4s CSS glass fade to finish before unlocking the screen
    setTimeout(() => {
      // It's safe to run the remove command globally; if it's not there, it does nothing.
      body.classList.remove('scroll-lock'); 
    }, 400);
  }

  if(menuBtn) menuBtn.addEventListener('click', openOverlay);
  if(closeBtn) closeBtn.addEventListener('click', closeOverlay);
});
