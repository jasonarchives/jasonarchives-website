// Global Cursor Logic
document.addEventListener('DOMContentLoaded', () => {
  
  // Only run if the device has a physical mouse
  if (window.matchMedia("(pointer: fine)").matches) {
    
    // Auto-inject the cursor HTML
    const cursor = document.createElement('div');
    cursor.id = 'crosshair-cursor';
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;

    // Track the mouse
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Animate smoothly at 60fps (Using translate3d to force GPU rendering)
    const animateCursor = () => {
      // Subtract 10px to perfectly center the 20x20 crosshair on the mouse tip
      cursor.style.transform = `translate3d(${mouseX - 10}px, ${mouseY - 10}px, 0)`;
      requestAnimationFrame(animateCursor);
    };
    
    animateCursor();

    // Attach hover effects to all links and buttons
    const interactiveElements = document.querySelectorAll('a, button');
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovered');
      });
    });
  }
});


