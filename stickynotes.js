// ==========================================
// Participatory Sticky Note & Shake Engine
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const noteImages = ['yellow.webp', 'green.webp', 'blue.webp', 'red.webp'];
  
  // Silently preload images into browser memory cache
  const preloadCache = () => {
    noteImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  };
  preloadCache(); // Execute immediately

  // 1. The Dynamic Destinations Array
  // Each note now has its own text, specific URL, and custom prompt label.
  const archiveLinks = [
    {
      text: "My Visual Ledger: Snapshots over 7 years.",
      url: "photos.html",
      promptLabel: "View Photos ↗"
    },
    {
      text: "Latest Blog: Slowing Down with Resistance, Leisure and Community",
      url: "https://medium.com/@local.threads.collective/slowing-down-with-resistance-leisure-and-community-local-threads-collective-organises-a-picnic-76fa96052afd", // <-- INSERT YOUR MEDIUM LINK HERE
      promptLabel: "Medium.com ↗"
    },
    {
      text: "UX: Smartphone Duty-Free Experience.",
      url: "design.html#project-2", // <-- UPDATE IF YOUR PROJECT HAS A SPECIFIC ID/LINK
      promptLabel: "View RECORD ↗"
    },
    {
      text: "UX: Journey Mapping with Hunters",
      url: "design.html#project-4", // <-- UPDATE IF YOUR PROJECT HAS A SPECIFIC ID/LINK
      promptLabel: "View RECORD ↗"
    },
    {
      text: "Community building at Local Threads Collective",
      url: "https://localthreadscollective.org",
      promptLabel: "Join Us ↗"
    },
    {
      text: "Download and use my photos for free!",
      url: "https://unsplash.com/@jasemendess", // <-- INSERT YOUR MEDIUM LINK HERE
      promptLabel: "Unsplash.com ↗"
    },
    {
      text: "Find me on Instagram",
      url: "https://www.instagram.com/jasemendess/", // <-- INSERT YOUR MEDIUM LINK HERE
      promptLabel: "@jasemendess ↗"
    },
    {
      text: "I'm having a Fika!",
      url: "about.html", // <-- INSERT YOUR MEDIUM LINK HERE
      promptLabel: "More About Me ↗"
    }
  ];

  // The Miro-style SVG Icon (A folded note with a '+' sign)
  const stickyIcon = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" style="display: block; flex-shrink: 0;">
      <path d="M12 17v5"></path>
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path>
    </svg>
  `;

  const prompt = document.getElementById('sticky-cursor-prompt');
  
  // Shake detection variables
  let prevX = 0;
  let shakeDirection = 0;
  let shakeCount = 0;
  let shakeTimeout;

  // ==========================================
  // 1. Cursor Follower & Shake Detector
  // ==========================================
  document.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 900) return; // Ignore on mobile

    const activeNotes = document.querySelectorAll('.sticky-note:not(.falling-note)');

    // --- Dynamic Prompt Text & Visibility ---
    if (prompt) {
      prompt.style.left = `${e.clientX}px`;
      prompt.style.top = `${e.clientY}px`;

      // Hide the prompt if hovering over a link, nav, or existing note
      if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.navbar')) {
        prompt.style.opacity = '0';
      } else {
        prompt.style.opacity = '1';
        
        // If notes are on the wall, show Icon + Shake Text. Otherwise, just the Icon.
        if (activeNotes.length > 0) {
          prompt.innerHTML = `${stickyIcon} <span style="font-family: 'iA Writer Duospace', monospace; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; padding-top: 2px; white-space: nowrap;">[ WIGGLE TO CLEAR ]</span>`;
        } else {
          prompt.innerHTML = stickyIcon;
        }
      }
    }

    // --- Shake Detection ---
    if (activeNotes.length > 0) {
      const deltaX = e.clientX - prevX;
      
      if (Math.abs(deltaX) > 15) {
        const currentDirection = Math.sign(deltaX);
        
        if (currentDirection !== shakeDirection) {
          shakeCount++;
          shakeDirection = currentDirection;
          
          clearTimeout(shakeTimeout);
          shakeTimeout = setTimeout(() => { shakeCount = 0; }, 300);

          if (shakeCount >= 4) {
            activeNotes.forEach(note => note.classList.add('falling-note'));
            
            setTimeout(() => {
              activeNotes.forEach(note => note.remove());
            }, 600);
            
            shakeCount = 0; 
          }
        }
      }
    }
    prevX = e.clientX;
  });

  // ==========================================
  // 2. Click to Stick Engine
  // ==========================================
  document.addEventListener('click', function(e) {
    if (window.innerWidth < 900) return;

    if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.navbar')) return;

    const activeNotes = document.querySelectorAll('.sticky-note:not(.falling-note)');
    if (activeNotes.length >= 7) {
      activeNotes[0].classList.add('falling-note');
      setTimeout(() => activeNotes[0].remove(), 600);
    }

    // Grab a random object from the new archiveLinks array
    const selectedNote = archiveLinks[Math.floor(Math.random() * archiveLinks.length)];
    const randomImg = noteImages[Math.floor(Math.random() * noteImages.length)];
    const randomRotation = Math.floor(Math.random() * 30) - 15;

    const note = document.createElement('a');
    
    // 3. New Tab Logic 
    note.href = selectedNote.url; 
    note.target = '_blank'; // Forces the link to open in a new tab
    note.rel = 'noopener noreferrer'; // Security best practice when using target="_blank"
    note.className = 'sticky-note';

    // We store the rotation in a CSS variable (--rot) so the falling animation knows where to start
    note.style.backgroundImage = `url('${randomImg}')`;
    note.style.transform = `rotate(${randomRotation}deg)`;
    note.style.setProperty('--rot', `${randomRotation}deg`);
    
    // Position it perfectly centered on the mouse click
    note.style.left = `${e.pageX - 90}px`;
    note.style.top = `${e.pageY - 90}px`;

    // Inject the dynamic text and the dynamic label
    note.innerHTML = `
      <span class="note-text">"${selectedNote.text}"</span>
      <span class="note-link-prompt">${selectedNote.promptLabel}</span>
    `;

    document.body.appendChild(note);
  });
});