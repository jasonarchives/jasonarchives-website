// obsidian.js - Force-Directed Graph Engine

document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("graph-lines");
  const wrapper = document.getElementById("graph-canvas");
  const nodeElements = document.querySelectorAll(".node");

  // Physics Tuning Variables (Tweak these to change how the web "feels")
  const REPULSION = 4000;      // How hard nodes push away from each other
  const SPRING_LENGTH = 120;   // The ideal resting distance of a link
  const SPRING_STIFFNESS = 0.02; // How snappy the rubber bands are
  const GRAVITY = 0.005;       // Pulls everything toward the center
  const FRICTION = 0.85;       // Slows things down so they don't bounce forever

  let nodes = [];
  let links = [];

  // 1. Initialize Physics Data from HTML
  nodeElements.forEach(el => {
    // Randomize initial starting positions near the center
    nodes.push({
      id: el.id,
      el: el,
      x: (window.innerWidth / 2) + (Math.random() * 200 - 100),
      y: (window.innerHeight / 2) + (Math.random() * 200 - 100),
      vx: 0,
      vy: 0,
      isDragging: false
    });
  });

  // 2. Build Links (Edges)
  nodeElements.forEach(el => {
    const targets = el.getAttribute("data-links");
    if (targets) {
      targets.split(",").forEach(targetId => {
        if (targetId.trim() !== "") {
          const sourceNode = nodes.find(n => n.id === el.id);
          const targetNode = nodes.find(n => n.id === targetId.trim());
          if (sourceNode && targetNode) {
            // Create the SVG line
            const lineEl = document.createElementNS("http://www.w3.org/2000/svg", "line");
            lineEl.setAttribute("data-source", sourceNode.id);
            lineEl.setAttribute("data-target", targetNode.id);
            svg.appendChild(lineEl);
            
            links.push({ source: sourceNode, target: targetNode, el: lineEl });
          }
        }
      });
    }
  });

  // 3. The 60FPS Physics Simulation Loop
  function simulate() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Apply Forces
    for (let i = 0; i < nodes.length; i++) {
      let n1 = nodes[i];
      if (n1.isDragging) continue;

      // A. Center Gravity (pulls drifters back to the middle)
      n1.vx += (centerX - n1.x) * GRAVITY;
      n1.vy += (centerY - n1.y) * GRAVITY;

      // B. Repulsion (All nodes push each other away)
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        let n2 = nodes[j];
        let dx = n1.x - n2.x;
        let dy = n1.y - n2.y;
        let distSq = dx * dx + dy * dy || 1; // Prevent division by zero
        let dist = Math.sqrt(distSq);
        
        let force = REPULSION / distSq;
        n1.vx += (dx / dist) * force;
        n1.vy += (dy / dist) * force;
      }
    }

    // C. Spring Attraction (Linked nodes pull each other)
    links.forEach(link => {
      let dx = link.target.x - link.source.x;
      let dy = link.target.y - link.source.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      let force = (dist - SPRING_LENGTH) * SPRING_STIFFNESS;
      let fx = (dx / dist) * force;
      let fy = (dy / dist) * force;

      if (!link.source.isDragging) { link.source.vx += fx; link.source.vy += fy; }
      if (!link.target.isDragging) { link.target.vx -= fx; link.target.vy -= fy; }
    });

    // Apply Velocity to Position & Friction
    nodes.forEach(n => {
      if (!n.isDragging) {
        n.vx *= FRICTION;
        n.vy *= FRICTION;
        n.x += n.vx;
        n.y += n.vy;
      }
      
      // Update DOM Element Position
      n.el.style.left = `${n.x}px`;
      n.el.style.top = `${n.y}px`;
    });

    // Update SVG Lines
    links.forEach(link => {
      link.el.setAttribute("x1", link.source.x);
      link.el.setAttribute("y1", link.source.y);
      link.el.setAttribute("x2", link.target.x);
      link.el.setAttribute("y2", link.target.y);
    });

    requestAnimationFrame(simulate);
  }

  // Kick off the physics engine
  simulate();

    // 4. Drag vs. Click Interaction Logic
  let draggedNode = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let isClickAction = true;

  nodeElements.forEach(el => {
    // A. Stop the browser from creating a native "ghost" image when dragging links
    el.addEventListener("dragstart", (e) => e.preventDefault());

    // B. Mouse Down: Record the exact starting coordinates
    el.addEventListener("mousedown", (e) => {
      draggedNode = nodes.find(n => n.id === el.id);
      draggedNode.isDragging = true;
      
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      isClickAction = true; // Default assumption is a click
    });

    // C. The Click Gatekeeper
    el.addEventListener("click", (e) => {
      // If the physics engine flagged this as a drag, block the link navigation
      if (!isClickAction) {
        e.preventDefault();
      }
    });

    // Obsidian style Hover Highlighting
    el.addEventListener("mouseenter", () => {
      wrapper.classList.add("is-interacting");
      el.classList.add("highlight-node");

      links.forEach(link => {
        if (link.source.id === el.id || link.target.id === el.id) {
          link.el.classList.add("highlight-line");
          link.source.el.classList.add("highlight-node");
          link.target.el.classList.add("highlight-node");
        }
      });
    });

    el.addEventListener("mouseleave", () => {
      if (!draggedNode) {
        wrapper.classList.remove("is-interacting");
        nodeElements.forEach(n => n.classList.remove("highlight-node"));
        links.forEach(l => l.el.classList.remove("highlight-line"));
      }
    });
  });

  // D. Global Mouse Movement Tracking
  document.addEventListener("mousemove", (e) => {
    if (draggedNode) {
      // The Delta Threshold: If moved > 5 pixels, it is officially a drag
      const moveX = Math.abs(e.clientX - dragStartX);
      const moveY = Math.abs(e.clientY - dragStartY);
      if (moveX > 5 || moveY > 5) {
        isClickAction = false;
      }

      // Update physical position
      draggedNode.x = e.clientX;
      draggedNode.y = e.clientY;
      draggedNode.vx = 0; // Kills momentum while held
      draggedNode.vy = 0;
    }
  });

  // E. Global Mouse Release
  document.addEventListener("mouseup", () => {
    if (draggedNode) {
      draggedNode.isDragging = false;
      draggedNode = null;
      
      // Cleanup visual state if released outside the node
      wrapper.classList.remove("is-interacting");
      nodeElements.forEach(n => n.classList.remove("highlight-node"));
      links.forEach(l => l.el.classList.remove("highlight-line"));
    }
  });
});
