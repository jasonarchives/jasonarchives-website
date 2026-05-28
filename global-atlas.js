// global-atlas.js

let atlasSimulation;
let isAtlasLoaded = false;
let initialContextNode = null; // 🟢 NEW: Stores the requested node

window.closePeek = function() {
  document.getElementById('atlas-container').dispatchEvent(new Event('click'));
};

// 🟢 UPGRADE: Now accepts a Context ID
window.openAtlasOverlay = function(contextId = null) {
  if (window.innerWidth <= 1100) return;

  document.getElementById('global-atlas-overlay').classList.add('is-active');
  document.body.style.overflow = 'hidden';

  if (!isAtlasLoaded) {
    initialContextNode = contextId; // Store it for when D3 finishes loading
    initAtlas();
  } else {
    if(atlasSimulation) atlasSimulation.alpha(0.8).restart();

    // If map is already loaded, jump directly to the context node
    if (contextId && window.atlasNodesData && window.atlasTriggerNode) {
      const targetNode = window.atlasNodesData.find(n => n.id === contextId);
      if (targetNode) window.atlasTriggerNode(targetNode);
    }
  }
};

window.closeAtlasOverlay = function() {
  document.getElementById('global-atlas-overlay').classList.remove('is-active');
  document.body.style.overflow = 'auto';
  if(atlasSimulation) atlasSimulation.stop();
};

function initAtlas() {
  isAtlasLoaded = true;
  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = d3.select("#atlas-container").attr("viewBox", [0, 0, width, height]);
  const radarSvg = d3.select("#radar-svg").attr("viewBox", [0, 0, width, height]);
  const radarViewport = radarSvg.append("rect").attr("class", "radar-viewport");
  const g = svg.append("g");
  let activeNode = null;
  let trailHistory = [];

  const zoom = d3.zoom()
    .scaleExtent([0.2, 3])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
      document.getElementById("zoom-percent").innerText = Math.round(event.transform.k * 100) + "%";
      radarViewport
        .attr("x", -event.transform.x / event.transform.k)
        .attr("y", -event.transform.y / event.transform.k)
        .attr("width", width / event.transform.k)
        .attr("height", height / event.transform.k);
    });

  svg.call(zoom);

  d3.select("#zoom-in").on("click", () => svg.transition().duration(400).call(zoom.scaleBy, 1.4));
  d3.select("#zoom-out").on("click", () => svg.transition().duration(400).call(zoom.scaleBy, 0.7));

  d3.json("/archive-map.json").then(data => {

    // 🟢 NEW: Expose data globally so the overlay function can find nodes
    window.atlasNodesData = data.nodes;

    const supernodes = data.nodes.filter(n => n.group === 'supernode');

    const numSupernodes = supernodes.length;
    const orbitRadius = Math.min(width, height) * 0.35;

    supernodes.forEach((sn, i) => {
      const angle = (i / numSupernodes) * 2 * Math.PI;
      sn.targetX = (width / 2) + orbitRadius * Math.cos(angle);
      sn.targetY = (height / 2) + orbitRadius * Math.sin(angle);
    });

    atlasSimulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(d => d.type === "main" ? 120 : 180))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => d.group === "supernode" ? 50 : 20).iterations(1))
      .force("x", d3.forceX(d => d.group === "supernode" ? d.targetX : width / 2).strength(d => d.group === "supernode" ? 0.12 : 0))
      .force("y", d3.forceY(d => d.group === "supernode" ? d.targetY : height / 2).strength(d => d.group === "supernode" ? 0.12 : 0));

    const link = g.append("g").selectAll("line").data(data.links).join("line")
      .attr("class", d => d.type === "main" ? "link-main" : "link-sub");

    const node = g.append("g").selectAll("g").data(data.nodes).join("g")
      .attr("class", "node-group").style("cursor", "pointer").call(drag(atlasSimulation));

    node.each(function(d) {
      const el = d3.select(this);
      if (d.group === "supernode") {
        el.append("circle").attr("r", 35).attr("class", "node-super");
        el.append("text").text(d.id).attr("dy", -2).attr("text-anchor", "middle").attr("class", "label-super");
        if (d.desc) { el.append("text").text(d.desc).attr("dy", 16).attr("text-anchor", "middle").attr("class", "label-desc"); }
      } else if (d.group === "record") {
        el.append("circle").attr("r", 6).attr("class", "node-record");
        el.append("text").text(d.label).attr("dx", 12).attr("dy", 4).attr("class", "label-record");
        if (d.desc) { el.append("text").text(d.desc).attr("dx", 12).attr("dy", 18).attr("class", "label-desc"); }
      } else if (d.group === "tag") {
        el.append("text").text(`[ ${d.id.toUpperCase()} ]`).attr("dy", 4).attr("text-anchor", "middle").attr("class", "label-tag");
      }
    });

    const radarNodes = radarSvg.append("g").selectAll("circle").data(data.nodes).join("circle")
      .attr("class", d => d.group === "supernode" ? "radar-node super" : "radar-node")
      .attr("r", d => d.group === "supernode" ? 150 : (d.group === "record" ? 45 : 20));

    function getNeighbors(nodeData) {
      return data.links.filter(l => l.source.id === nodeData.id || l.target.id === nodeData.id)
                       .map(l => l.source.id === nodeData.id ? l.target.id : l.source.id);
    }

    const tagSidebar = document.getElementById("tag-sidebar");
    const allTags = data.nodes.filter(n => n.group === "tag").sort((a, b) => a.id.localeCompare(b.id));

    allTags.forEach(tagNode => {
      const btn = document.createElement("button");
      btn.className = "tag-sidebar-btn";
      btn.innerText = `[ ${tagNode.id.toUpperCase()} ]`;
      btn.dataset.id = tagNode.id;
      btn.addEventListener("click", (event) => { event.stopPropagation(); triggerNode(tagNode); });
      tagSidebar.appendChild(btn);
    });

    function renderTrail() {
      const trailContainer = document.getElementById("execution-trail");
      trailContainer.innerHTML = `<span class="trail-link" data-id="root">PATH: ~/atlas</span>`;
      trailHistory.forEach(step => {
        trailContainer.innerHTML += `<span class="trail-separator">/</span>`;
        const formattedName = step.id.replace(/\s+/g, '-').toLowerCase();
        trailContainer.innerHTML += `<span class="trail-link" data-id="${step.id}">${formattedName}</span>`;
      });
      document.querySelectorAll('.trail-link').forEach(link => {
        link.addEventListener('click', (event) => {
          event.stopPropagation();
          const clickedId = link.dataset.id;
          if (clickedId === 'root') { resetGraph(); }
          else {
            if (clickedId === activeNode) return;
            const targetNode = data.nodes.find(n => n.id === clickedId);
            const stepIndex = trailHistory.findIndex(t => t.id === clickedId);
            if (stepIndex !== -1) { trailHistory = trailHistory.slice(0, stepIndex); }
            triggerNode(targetNode);
          }
        });
      });
    }

    renderTrail();

    function resetGraph() {
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      if (!activeNode) return;
      const prevNode = data.nodes.find(n => n.id === activeNode);
      if (prevNode) { prevNode.fx = null; prevNode.fy = null; }
      activeNode = null;
      trailHistory = []; renderTrail();
      document.getElementById('quick-peek').classList.remove('is-open');

      node.classed("is-hover-dimmed", false).classed("is-active-dimmed", false);
      link.classed("is-hover-dimmed", false).classed("is-active-dimmed", false);
      node.selectAll("circle").classed("is-highlighted", false);
      node.selectAll(".label-record").style("opacity", 0);
      node.selectAll(".label-desc").style("opacity", 0);
      node.selectAll(".label-tag").style("opacity", 0.5);
      document.querySelectorAll(".tag-sidebar-btn").forEach(btn => btn.classList.remove("active-tag"));

      atlasSimulation.force("link").distance(d => d.type === "main" ? 120 : 180);
      atlasSimulation.force("charge").strength(-300);
      atlasSimulation.force("collide", d3.forceCollide().radius(d => d.group === "supernode" ? 50 : 20).iterations(1));
      atlasSimulation.force("x", d3.forceX(d => d.group === "supernode" ? d.targetX : width / 2).strength(d => d.group === "supernode" ? 0.12 : 0));
      atlasSimulation.force("y", d3.forceY(d => d.group === "supernode" ? d.targetY : height / 2).strength(d => d.group === "supernode" ? 0.12 : 0));
      atlasSimulation.alpha(0.8).restart();
    }

    svg.on("click", resetGraph);
    d3.select("#zoom-reset").on("click", resetGraph);

    node.on("mouseover", function(event, d) {
      if (activeNode) return;
      const neighbors = getNeighbors(d);
      node.classed("is-hover-dimmed", n => n.id !== d.id && !neighbors.includes(n.id));
      link.classed("is-hover-dimmed", l => l.source.id !== d.id && l.target.id !== d.id);
      d3.select(this).select("circle").classed("is-highlighted", true);
      node.selectAll(".label-record").style("opacity", n => (n.id === d.id || neighbors.includes(n.id)) ? 1 : 0);
    })
    .on("mouseout", function() {
      if (activeNode) return;
      node.classed("is-hover-dimmed", false); link.classed("is-hover-dimmed", false);
      node.selectAll("circle").classed("is-highlighted", false);
      node.selectAll(".label-record").style("opacity", 0);
    });

    node.on("click", function(event, d) { event.stopPropagation(); triggerNode(d); });

    function triggerNode(d) {
      if (activeNode === d.id) { resetGraph(); return; }
      if (activeNode) {
        const prevNode = data.nodes.find(n => n.id === activeNode);
        if (prevNode) { prevNode.fx = null; prevNode.fy = null; }
      }

      activeNode = d.id;
      const neighbors = getNeighbors(d);
      d.fx = d.x; d.fy = d.y;

      const peekType = document.getElementById('peek-type');
      const peekTitle = document.getElementById('peek-title');
      const peekDesc = document.getElementById('peek-desc');
      const peekMetaTitle = document.getElementById('peek-meta-title');
      const peekMetaContent = document.getElementById('peek-meta-content');
      const executeBtn = document.getElementById('peek-execute');

      peekMetaContent.innerHTML = '';

      if (d.group === 'supernode') {
        peekType.innerText = '[ ARCHIVE ]'; peekTitle.innerText = d.id; peekDesc.innerText = d.desc || "Root archive folder.";
        peekMetaTitle.innerText = 'INDEXED RECORDS:'; peekMetaContent.classList.remove('row');
        const childRecords = data.nodes.filter(n => n.group === 'record' && neighbors.includes(n.id));
        childRecords.forEach(r => { peekMetaContent.innerHTML += `<span class="peek-record-text">↳ ${r.label || r.id}</span>`; });
        executeBtn.innerText = '[ OPEN ARCHIVE ↗ ]'; executeBtn.classList.remove('hidden');
      } else if (d.group === 'record') {
        peekType.innerText = '[ RECORD ]'; peekTitle.innerText = d.label || d.id; peekDesc.innerText = d.desc || "Archival record data.";
        peekMetaTitle.innerText = 'TAGS:'; peekMetaContent.classList.add('row');
        const attachedTags = data.nodes.filter(n => n.group === 'tag' && neighbors.includes(n.id));
        attachedTags.forEach(t => { peekMetaContent.innerHTML += `<span class="peek-tag">${t.id}</span>`; });
        executeBtn.innerText = '[ EXECUTE RECORD ↗ ]'; executeBtn.classList.remove('hidden');
      } else if (d.group === 'tag') {
        peekType.innerText = '[ TAG ]'; peekTitle.innerText = d.id.toUpperCase(); peekDesc.innerText = "Tags connect related records together based on a theme or location.";
        peekMetaTitle.innerText = 'CONNECTED RECORDS:'; peekMetaContent.classList.remove('row');
        const taggedRecords = data.nodes.filter(n => n.group === 'record' && neighbors.includes(n.id));
        taggedRecords.forEach(r => { peekMetaContent.innerHTML += `<span class="peek-record-text">↳ ${r.label || r.id}</span>`; });
        executeBtn.classList.add('hidden');
      }

      if (d.url) {
        executeBtn.onclick = () => {
          if (d.external) window.open(d.url, '_blank');
          else {
            document.body.style.transition = "opacity 0.4s ease"; document.body.style.opacity = 0;
            setTimeout(() => window.location.href = d.url, 400);
          }
        };
      }

      document.getElementById('quick-peek').classList.add('is-open');

      const existingIndex = trailHistory.findIndex(step => step.id === d.id);
      if (existingIndex !== -1) { trailHistory = trailHistory.slice(0, existingIndex + 1); }
      else {
        const isSibling = trailHistory.length > 0 && trailHistory[trailHistory.length - 1].group === 'record' && d.group === 'record';
        if (isSibling) { trailHistory[trailHistory.length - 1] = d; } else { trailHistory.push(d); }
      }
      renderTrail();

      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate((width / 2) - 130, height / 2).scale(1).translate(-d.x, -d.y)
      );

      node.classed("is-hover-dimmed", false); link.classed("is-hover-dimmed", false);
      node.classed("is-active-dimmed", n => n.id !== d.id && !neighbors.includes(n.id));
      link.classed("is-active-dimmed", l => l.source.id !== d.id && l.target.id !== d.id);
      node.selectAll("circle").classed("is-highlighted", n => n.id === d.id);
      node.selectAll(".label-record").style("opacity", n => (n.id === d.id || neighbors.includes(n.id)) ? 1 : 0);
      node.selectAll(".label-desc").style("opacity", n => n.id === d.id ? 0.6 : 0);
      node.selectAll(".label-tag").style("opacity", n => n.id === d.id ? 1 : 0.5);

      document.querySelectorAll(".tag-sidebar-btn").forEach(btn => {
        if (btn.dataset.id === d.id) { btn.classList.add("active-tag"); } else { btn.classList.remove("active-tag"); }
      });

      atlasSimulation.force("x").strength(0); atlasSimulation.force("y").strength(0);
      atlasSimulation.force("link").distance(l => (l.source.id === d.id || l.target.id === d.id) ? 140 : 250);
      atlasSimulation.force("charge").strength(n => (n.id === d.id || neighbors.includes(n.id)) ? -150 : -1000);

      atlasSimulation.force("collide", d3.forceCollide().radius(n => {
        if (n.id === d.id || neighbors.includes(n.id)) {
           if (n.group === "record" || n.group === "tag") { return 20 + ((n.label || n.id || "").length * 3.5); }
           return 65;
        }
        return n.group === "supernode" ? 50 : 20;
      }).iterations(3));

      atlasSimulation.alpha(0.8).restart();
    }

    // 🟢 NEW: Expose the trigger function globally
    window.atlasTriggerNode = triggerNode;

    // 🟢 NEW: If a context node was requested during boot-up, trigger it instantly
    if (initialContextNode) {
      setTimeout(() => {
        const targetNode = data.nodes.find(n => n.id === initialContextNode);
        if (targetNode) triggerNode(targetNode);
      }, 100); // 100ms delay ensures the nodes physically exist before jumping
    }

    atlasSimulation.on("tick", () => {
      link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
      radarNodes.attr("cx", d => d.x).attr("cy", d => d.y);
    });

    function drag(sim) {
      return d3.drag()
        .on("start", (event) => { if (!event.active) sim.alphaTarget(0.3).restart(); event.subject.fx = event.subject.x; event.subject.fy = event.subject.y; })
        .on("drag", (event) => { event.subject.fx = event.x; event.subject.fy = event.y; })
        .on("end", (event) => { if (!event.active) sim.alphaTarget(0); if (event.subject.id !== activeNode) { event.subject.fx = null; event.subject.fy = null; } });
    }
  }).catch(error => console.error("Failed to load JSON:", error));
}
