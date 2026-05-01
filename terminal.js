document.addEventListener("DOMContentLoaded", () => {
  // 1. The Archive Master Map
  // NOTE: If testing locally on your computer, these links may break. 
  // They will work perfectly once uploaded to your live server.
// 1. Establish the absolute baseline
  // This detects your exact environment (e.g., https://jasonarchives.online or http://localhost:5500)
  const base = window.location.origin;

  // 2. The Archive Master Map (Now using absolute routing)
  const archiveMap = [
    { cmd: "/index", url: `${base}/index.html`, desc: "Return to home page" },
    { cmd: "/design", url: `${base}/design.html`, desc: "Archive: My designs and research" },
    { cmd: "/photos", url: `${base}/photos.html`, desc: "Archive: My photography over 7 years" },
    { cmd: "/writings", url: `${base}/writings.html`, desc: "Archive: Blogging about Design, UX and Community" },
    { cmd: "/about", url: `${base}/about.html`, desc: "More about me" },  
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
  
  // THE FIX: Pull history from the browser's hard drive so it survives page loads!
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

  
  
// Variables to store memory and layout math
let terminalScrollPos = 0;

function toggleTerminal() {
    overlay.classList.toggle("is-active");
    
    if (overlay.classList.contains("is-active")) {
      // THE FIX: Mobile-only scroll lock
      if (window.innerWidth < 900) {
        document.body.classList.add("scroll-lock");
      }
      
      input.value = ""; 
      renderSuggestions([]); 
      setTimeout(() => input.focus(), 100); 
      
    } else {
      input.blur();
      
      // Wait for the terminal to fade out before unlocking
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
      renderSuggestions([]);
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

// 6. Smart Keyboard Navigation (Up, Down, Enter)
  input.addEventListener("keydown", (e) => {
    const items = document.querySelectorAll(".suggestion-item");
    
    // A. THE DOWN ARROW
    if (e.key === "ArrowDown") {
      e.preventDefault();
      
      // If suggestions are visible, navigate the list
      if (items.length > 0) {
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateHighlight(items);
      } 
      // If no suggestions, navigate command history forward
      else if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        input.value = ""; // Clear input if we hit the bottom of history
      }
    } 
    
    // B. THE UP ARROW
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      
      // If suggestions are visible, navigate the list
      if (items.length > 0) {
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateHighlight(items);
      } 
      // If no suggestions, navigate command history backward
      else if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
    } 
    
// C. THE ENTER KEY
    else if (e.key === "Enter") {
      e.preventDefault();
      
      // 1. Save whatever they typed into the memory bank
      const typedCmd = input.value.trim();
      if (typedCmd !== "" && commandHistory[commandHistory.length - 1] !== typedCmd) {
        commandHistory.push(typedCmd);
        
        // THE FIX: Save the updated memory to the browser before routing away!
        sessionStorage.setItem("jasonTerminalMemory", JSON.stringify(commandHistory));
      }
      historyIndex = commandHistory.length; 

      // 2. Execute the command
      if (selectedIndex >= 0 && items.length > 0) {
        const cmdText = items[selectedIndex].querySelector(".suggestion-cmd").innerText;
        const match = archiveMap.find(m => m.cmd === cmdText);
        if (match) executeCommand(match);
      } else {
        const exactMatch = archiveMap.find(m => m.cmd.toLowerCase() === typedCmd.toLowerCase());
        if (exactMatch) executeCommand(exactMatch);
      }
    }
  });
  
  // Helper: Updates the visual highlight on the list
function updateHighlight(items) {
    items.forEach(item => item.classList.remove("is-highlighted"));
    if (selectedIndex >= 0 && items[selectedIndex]) {
      const activeItem = items[selectedIndex];
      activeItem.classList.add("is-highlighted");
      
      // Force scrollbar to follow the highlight
      activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
  
  // 7. Execution Logic
  function executeCommand(match) {
    if (match.url === "ACTION_CLEAR") {
      input.value = "";
      renderSuggestions([]);
    } else {
      input.value = `[ ROUTING TO: ${match.cmd} ]...`;
      setTimeout(() => {
        window.location.href = match.url;
      }, 400);
    }
  }

 
});
