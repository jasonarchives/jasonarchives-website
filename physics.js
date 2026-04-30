// ==========================================
// MAGNETIC UI PHYSICS ENGINE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const magnets = document.querySelectorAll(".magnetic-btn");

  magnets.forEach((magnet) => {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    // Physics Tuning Variables
    const triggerDistance = 80;   // The radius of the invisible magnetic field
    const pullStrength = 0.4;     // How far the button stretches toward the mouse
    const friction = 0.15;        // The inertia/weight of the snap 

    const getCenter = () => {
      const rect = magnet.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    window.addEventListener("mousemove", (e) => {
      const center = getCenter();
      const distX = e.clientX - center.x;
      const distY = e.clientY - center.y;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < triggerDistance) {
        targetX = distX * pullStrength;
        targetY = distY * pullStrength;
      } else {
        targetX = 0;
        targetY = 0;
      }
    });

    const render = () => {
      currentX += (targetX - currentX) * friction;
      currentY += (targetY - currentY) * friction;
      magnet.style.transform = `translate(${currentX}px, ${currentY}px)`;
      requestAnimationFrame(render);
    };

    render();
  });
});