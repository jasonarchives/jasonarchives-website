document.addEventListener("DOMContentLoaded", () => {
  // Use absolute path to ensure it fetches from root
  fetch('/archive-map.json')
    .then(response => response.json())
    .then(data => {
      // 1. Identify the current page ID to exclude it
      const currentRecordId = "PHO-01";

      // 2. Filter out Supernodes, Tags, and the current page itself
      let records = data.nodes.filter(n => n.group === 'record' && n.id !== currentRecordId);

      // 3. Shuffle the array and select 4 random records
      records = records.sort(() => 0.5 - Math.random()).slice(0, 4);

      const container = document.getElementById('dynamic-records-container');
      if (!container) return;

      // 4. Generate the HTML cards dynamically
      records.forEach(record => {

        // --- TAG EXTRACTION ENGINE ---
        // Find all links where this record is either the source or the target
        const recordLinks = data.links.filter(l => l.source === record.id || l.target === record.id);

        const tags = [];
        recordLinks.forEach(link => {
          // Identify the node at the other end of the connection
          const connectedId = link.source === record.id ? link.target : link.source;
          const connectedNode = data.nodes.find(n => n.id === connectedId);

          // If the connected node is classified as a "tag", add it to our array
          if (connectedNode && connectedNode.group === 'tag') {
            tags.push(connectedNode.id);
          }
        });

        // Convert the tags array into HTML spans
        const tagsHTML = tags.map(tag => `<span class="card-tag">${tag}</span>`).join('');
        // -----------------------------

        // --- STYLING LOGIC ---
        // Check if the record is external (Medium)
        const isExternal = record.external === true;
        const externalClass = isExternal ? "external-card" : "";
        const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';

        // Adjust the call-to-action button text
        const buttonText = isExternal ? '[ OPEN ON MEDIUM ↗ ]' : '[ OPEN RECORD ↗ ]';
        // ---------------------

        // Inject the formulated card HTML
        const cardHTML = `
          <a href="${record.url}" class="record-card ${externalClass}" ${targetAttr}>
            <span class="card-id">${record.id}</span>
            <h4 class="card-title">${record.label || record.id}</h4>
            <p class="card-desc">${record.desc || ''}</p>
            <div class="card-tags">
              ${tagsHTML}
            </div>
            <div class="card-footer">
              ${buttonText}
            </div>
          </a>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
      });
    })
    .catch(error => console.error("Failed to load recommended records:", error));
});
