const fs = require('fs');
const path = require('path');

// 1. Define the core architecture and external links
const supernodes = [
  { id: "Design Archive", desc: "UX Research and Experience Design case studies.", group: "supernode", url: "/design.html" },
  { id: "Photos Archive", desc: "A visual ledger and photography archive.", group: "supernode", url: "/photos.html" },
  { id: "Community Archive", desc: "Building communities where I go.", group: "supernode", url: "/community.html" },
  { id: "Writings Archive", desc: "Essays on design, UX, and culture.", group: "supernode", url: "/writings.html" }
];

const externalRecords = [
  { id: "WRT-01", label: "Slowing Down with Resistance", desc: "Thoughts on production culture.", group: "record", url: "https://medium.com", external: true, parent: "Writings Archive", tags: ["Medium"] },
  { id: "WRT-02", label: "A Seat on Skåne Expressen", desc: "Observational travel writing.", group: "record", url: "https://medium.com", external: true, parent: "Writings Archive", tags: ["Medium", "Sweden"] }
  // Add the rest of your Medium links here...
];

// Folders to scan for local HTML records
const foldersToScan = ['designrec', 'photorec', 'communityrec'];

let nodes = [...supernodes];
let links = [];
let uniqueTags = new Set();

// 2. The Extraction Engine
function extractMeta(html, name) {
  const regex = new RegExp(`<meta\\s+(?:name|property)=["']${name}["']\\s+content=["']([^"']+)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

function processFile(filePath, urlPath) {
  const html = fs.readFileSync(filePath, 'utf8');

  // Look for the custom Atlas tags
  const parent = extractMeta(html, 'atlas-parent');
  if (!parent) return; // Skip files that aren't meant to be on the map

  // Grab the data
  const id = path.basename(filePath, '.html');
  let rawTitle = extractMeta(html, 'title') || extractMeta(html, 'og:title') || id;
  const label = rawTitle.split('|')[0].trim(); // Removes the " | Jason Mendes" part
  const desc = extractMeta(html, 'description') || "";
  const tagsString = extractMeta(html, 'atlas-tags') || "";

  // Build the Record Node
  nodes.push({ id, label, desc, group: "record", url: urlPath });

  // Build the Main Link to its Archive
  links.push({ source: parent, target: id, type: "main" });

  // Process Tags
  if (tagsString) {
    const tags = tagsString.split(',').map(t => t.trim());
    tags.forEach(tag => {
      uniqueTags.add(tag);
      links.push({ source: id, target: tag, type: "sub" });
    });
  }
}

// 3. Scan the Directories
foldersToScan.forEach(folder => {
  const dirPath = path.join(__dirname, folder);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
    files.forEach(file => {
      processFile(path.join(dirPath, file), `/${folder}/${file}`);
    });
  }
});

// 4. Inject External Records
externalRecords.forEach(record => {
  nodes.push({ id: record.id, label: record.label, desc: record.desc, group: record.group, url: record.url, external: record.external });
  links.push({ source: record.parent, target: record.id, type: "main" });
  record.tags.forEach(tag => {
    uniqueTags.add(tag);
    links.push({ source: record.id, target: tag, type: "sub" });
  });
});

// 5. Inject Tag Nodes
uniqueTags.forEach(tag => {
  nodes.push({ id: tag, group: "tag" });
});

// 6. Compile and Save the Database
const db = { nodes, links };
fs.writeFileSync(path.join(__dirname, 'archive-map.json'), JSON.stringify(db, null, 2));

console.log(`[SYSTEM] Atlas map compiled successfully! Found ${nodes.length} nodes and ${links.length} connections.`);
