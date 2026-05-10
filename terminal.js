document.addEventListener("DOMContentLoaded", () => {

  // 🟢 NEW: 0. SESSION TELEMETRY TRACKER
  // This runs immediately to record the user's current page visit
  let sessionLedger = JSON.parse(sessionStorage.getItem("jasonSessionLedger")) || [];
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour12: false });
  let pageName = document.title.split('|')[0].trim(); // Grabs clean page title

  const newEntry = { time: timeString, action: "VIEW", target: pageName, url: window.location.href };
  const lastEntry = sessionLedger[sessionLedger.length - 1];

  if (!lastEntry || lastEntry.target !== newEntry.target) {
    sessionLedger.push(newEntry);
    if (sessionLedger.length > 8) sessionLedger.shift(); // Keep max 8 items
    sessionStorage.setItem("jasonSessionLedger", JSON.stringify(sessionLedger));
  }


  // 1. Establish the absolute baseline
  const base = window.location.origin;

  // 2. The Archive Master Map
  const archiveMap = [
    { cmd: "/home", url: `${base}/index.html`, desc: "Return to home page" },
    { cmd: "/design", url: `${base}/design.html`, desc: "Archive: My designs and research" },
    { cmd: "/photos", url: `${base}/photos.html`, desc: "Archive: My photography over 7 years" },
    { cmd: "/writings", url: `${base}/writings.html`, desc: "Archive: Blogging about Design, UX and Community" },
    { cmd: "/community", url: `${base}/community.html`, desc: "Archive: Building communities where I go" },  
      
    { cmd: "/photosrec/PHO-01", url: `${base}/photorec/PHO-01.html`, desc: "Record: Midnight in Uppsala" },
    { cmd: "/photosrec/PHO-02", url: `${base}/photorec/PHO-02.html`, desc: "Record: Expressions at 8mm" },
      
    { cmd: "/designrec/DES-01", url: `${base}/designrec/DES-01.html`, desc: "Record: Creatives for Collectives" },
    { cmd: "/designrec/DES-02", url: `${base}/designrec/DES-02.html`, desc: "Record: Reimagining a Duty-Free Experience" },  
    { cmd: "/designrec/DES-03", url: `${base}/designrec/DES-03.html`, desc: "Record: Bicyle Parking at Uppsala Centralstation" },  
    { cmd: "/designrec/DES-04", url: `${base}/designrec/DES-04.html`, desc: "Record: Journey Mapping with Hunters" },  
    { cmd: "/designrec/DES-05", url: `${base}/designrec/DES-05.html`, desc: "Record: OST & Manual Redesign" }, 
    
    { cmd: "/communityrec/localthreadscollective", url: `${base}/communityrec/localthreadscollective.html`, desc: "Record: Local Threads Collective" },  
    { cmd: "/communityrec/vdalanation", url: `${base}/communityrec/vdalanation.html`, desc: "Record: Västmanlands Dalarna Nation" }, 

  
    { cmd: "clear", url: "ACTION_CLEAR", desc: "Clear terminal input" },
    // 🟢 NEW: Added the burn notice command!
    { cmd: "burn", url: "ACTION_BURN", desc: "Purge active session telemetry" },
  ];

  // 2. Build and Inject the HTML
  const terminalHTML = `
    <div id="terminal-overlay">
      <div class="terminal-container">
        <div class="terminal-input-wrapper">
          <span class="terminal-prompt">GUEST@JASONARCHIVES:~ $</span>
          <input type="text" id="terminal-input" autocomplete="off" spellcheck="false" placeholder="Type a path... (e.g., /photos)">
        </div>
        <ul id="terminal-suggestions"></ul>
      </div>
      
      <div class="terminal-exit-hint">[PRESS ⌘K OR ⌃K TO EXIT]</div>
      
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', terminalHTML);

  // 3. Select the injected elements
  const overlay = document.getElementById("terminal-overlay");
  const input = document.getElementById("terminal-input");
  const suggestionsList = document.getElementById("terminal-suggestions");
  
  let selectedIndex = -1; 

  let commandHistory = JSON.parse(sessionStorage.getItem("jasonTerminalMemory")) || [];
  let historyIndex = commandHistory.length;

  // 4. Toggle Logic (Cmd+K or Ctrl+K)
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      toggleTerminal();
    }
    if (e.key === "Escape" && overlay.classList.contains("is-active")) {
      toggleTerminal();
    }
  });

  let terminalScrollPos = 0;

  function toggleTerminal() {
    overlay.classList.toggle("is-active");
    
    if (overlay.classList.contains("is-active")) {
      if (window.innerWidth < 900) {
        document.body.classList.add("scroll-lock");
      }
      
      input.value = ""; 
      // 🟢 NEW: Calls the history instead of an empty array when terminal opens
      renderSessionHistory();
      setTimeout(() => input.focus(), 100); 
      
    } else {
      input.blur();

      setTimeout(() => {
        document.body.classList.remove("scroll-lock");
      }, 400);
    }
  }

  // 5. The Autocomplete Engine
  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    selectedIndex = -1; 
    
    if (query === "") {
      // 🟢 NEW: Shows history if user deletes their search query
      renderSessionHistory();
      return;
    }

    const matches = archiveMap.filter(item => 
      item.cmd.toLowerCase().includes(query) || 
      item.desc.toLowerCase().includes(query)
    );

    renderSuggestions(matches);
  });

  function renderSuggestions(matches) {
    suggestionsList.innerHTML = "";
    matches.forEach((match, index) => {
      const li = document.createElement("li");
      li.className = "suggestion-item";
      li.innerHTML = `
        <span class="suggestion-cmd">${match.cmd}</span>
        <span class="suggestion-desc">${match.desc}</span>
      `;
      li.addEventListener("click", () => executeCommand(match));
      suggestionsList.appendChild(li);
    });
  }

// 🟢 UPDATED: The Minimalist History Renderer
  function renderSessionHistory() {
    const ledger = JSON.parse(sessionStorage.getItem("jasonSessionLedger")) || [];
    suggestionsList.innerHTML = "";

    if (ledger.length === 0) return;

    // 1. A much quieter, cleaner header
    suggestionsList.innerHTML += `
      <li style="opacity: 0.3; font-family: 'iA Writer Duospace', monospace; font-size: 0.65rem; margin-bottom: 0.8rem; letter-spacing: 0.1em; pointer-events: none;">
        RECENTLY ACCESSED
      </li>
    `;

    // 2. Only grab the last 4 items so it doesn't flood the screen
    const recentItems = ledger.slice().reverse().slice(0, 4);

    recentItems.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "suggestion-item";

      // Inline styles to override the default heavy search result look
      li.style.padding = "0.3rem 0";
      li.style.opacity = "0.4"; // Keep it dim
      li.style.transition = "opacity 0.2s ease";

      // 3. Strip away the time and action, just show a dash and the title
      li.innerHTML = `
        <span style="font-family: 'iA Writer Duospace', monospace; font-size: 0.8rem; margin-right: 0.5rem; opacity: 0.5;">—</span>
        <span style="font-family: 'SF Pro Display', sans-serif; font-size: 1rem; color: var(--text-color);">${entry.target}</span>
      `;

      // Route back to the page on click
      li.addEventListener("click", () => {
        input.value = `[ RETURNING TO: ${entry.target} ]...`;
        setTimeout(() => window.location.href = entry.url, 300);
      });

      // Brighten up smoothly when the user hovers over it with their mouse
      li.addEventListener("mouseenter", () => li.style.opacity = "1");
      li.addEventListener("mouseleave", () => li.style.opacity = "0.4");

      suggestionsList.appendChild(li);
    });
  }


  // 6. Smart Keyboard Navigation (Up, Down, Enter)
  input.addEventListener("keydown", (e) => {
    const items = document.querySelectorAll(".suggestion-item");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (items.length > 0) {
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateHighlight(items);
      }
      else if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        input.value = "";
      }
    } 

    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (items.length > 0) {
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateHighlight(items);
      }
      else if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
    } 

    else if (e.key === "Enter") {
      e.preventDefault();

      const typedCmd = input.value.trim();
      if (typedCmd !== "" && commandHistory[commandHistory.length - 1] !== typedCmd) {
        commandHistory.push(typedCmd);
        sessionStorage.setItem("jasonTerminalMemory", JSON.stringify(commandHistory));
      }
      historyIndex = commandHistory.length; 

      if (selectedIndex >= 0 && items.length > 0) {
        const cmdText = items[selectedIndex].querySelector(".suggestion-cmd")?.innerText;

        // 🟢 NEW: Quick safety check to allow clicking history items via keyboard
        if (!cmdText) {
            items[selectedIndex].click();
            return;
        }

        const match = archiveMap.find(m => m.cmd === cmdText);
        if (match) executeCommand(match);
      } else {
        const exactMatch = archiveMap.find(m => m.cmd.toLowerCase() === typedCmd.toLowerCase());
        if (exactMatch) executeCommand(exactMatch);
      }
    }
  });
  
  function updateHighlight(items) {
    items.forEach(item => item.classList.remove("is-highlighted"));
    if (selectedIndex >= 0 && items[selectedIndex]) {
      const activeItem = items[selectedIndex];
      activeItem.classList.add("is-highlighted");
      activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
  
  // 7. Execution Logic
  function executeCommand(match) {
    if (match.url === "ACTION_CLEAR") {
      input.value = "";
      renderSessionHistory(); // 🟢 NEW: Render history when cleared

    // 🟢 NEW: The Burn Notice action
    } else if (match.url === "ACTION_BURN") {
      sessionStorage.removeItem("jasonSessionLedger");
      input.value = "[ TELEMETRY PURGED ]";
      setTimeout(() => {
          input.value = "";
          renderSessionHistory();
      }, 1000);

    } else {
      input.value = `[ ROUTING TO: ${match.cmd} ]...`;
      setTimeout(() => {
        window.location.href = match.url;
      }, 400);
    }
  }

});
