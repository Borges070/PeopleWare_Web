// State
let darkMode = false;
let mode = 'view';
let nodes = [
    { id: '1', x: 200, y: 100, label: 'Node 1' },
    { id: '2', x: 400, y: 150, label: 'Node 2' },
    { id: '3', x: 600, y: 100, label: 'Node 3' },
    { id: '4', x: 300, y: 250, label: 'Node 4' },
    { id: '5', x: 500, y: 300, label: 'Node 5' },
    { id: '6', x: 700, y: 250, label: 'Node 6' },
    { id: '7', x: 250, y: 400, label: 'Node 7' },
    { id: '8', x: 450, y: 450, label: 'Node 8' },
    { id: '9', x: 650, y: 400, label: 'Node 9' },
    { id: '10', x: 350, y: 550, label: 'Node 10' },
    { id: '11', x: 550, y: 550, label: 'Node 11' },
    { id: '12', x: 450, y: 650, label: 'Node 12' },
];
let edges = [
    { id: 'e1', from: '1', to: '2' },
    { id: 'e2', from: '2', to: '3' },
    { id: 'e3', from: '1', to: '4' },
    { id: 'e4', from: '4', to: '5' },
    { id: 'e5', from: '5', to: '6' },
    { id: 'e6', from: '3', to: '6' },
    { id: 'e7', from: '7', to: '8' },
    { id: 'e8', from: '8', to: '9' },
    { id: 'e9', from: '10', to: '11' },
    { id: 'e10', from: '11', to: '12' },
];
let selectedNode = null;
let connectingFrom = null;
let editingNode = null;
let draggingNode = null;
let dragOffset = { x: 0, y: 0 };
const MIN_DISTANCE = 100; // Minimum distance between node centers
let detailNodeId = null;

// Check for collision with other nodes
function checkCollision(x, y, excludeNodeId = null) {
    return nodes.some(node => {
        if (node.id === excludeNodeId) return false;
        const dx = node.x - x;
        const dy = node.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < MIN_DISTANCE;
    });
}

// DOM Elements
const app = document.querySelector('.app');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const modeButtons = document.querySelectorAll('.sidebar-btn');
const canvas = document.getElementById('canvas');
const nodesContainer = document.getElementById('nodes-container');
const svgCanvas = document.getElementById('svg-canvas');
const cardsList = document.getElementById('cards-list');
const modeIndicator = document.getElementById('mode-indicator');
const btnSave = document.getElementById('btn-save');
const contactPanel = document.getElementById('contact-panel');
const panelTitle = document.getElementById('panel-title');
const panelSubtitle = document.getElementById('panel-subtitle');
const panelNodeId = document.getElementById('panel-node-id');
const panelNodeConnections = document.getElementById('panel-node-connections');
const panelConnectionsList = document.getElementById('panel-connections-list');
const panelClose = document.getElementById('panel-close');

// Initialize
// Initialize
function init() {
    setupEventListeners();
    loadGraph(); // Load graph on startup
    renderNodes();
    renderEdges();
    renderCardsList();
    renderContactPanel();
    updateModeIndicator();
}

// Save Graph
// Save Graph
function saveGraph(isAutoSave = false) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        if (!isAutoSave) {
            alert('Você precisa estar logado para salvar o gráfico.');
            window.location.href = '/pages/login.html';
        }
        return;
    }

    const data = { nodes, edges, darkMode };

    // 1. Save to Local Cache (Instant)
    localStorage.setItem(`graph_cache_${user.id}`, JSON.stringify(data));

    // 2. Save to Server (Async)
    fetch('http://localhost:3000/graph', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id, data })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error saving graph:', data.error);
                if (!isAutoSave) alert('Erro ao salvar: ' + data.error);
            } else {
                console.log('Graph saved successfully');
                if (!isAutoSave) alert('Gráfico salvo com sucesso!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (!isAutoSave) alert('Erro ao conectar com o servidor.');
        });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedSaveGraph = debounce(() => saveGraph(true), 1000);

// Load Graph
function loadGraph() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return; // If not logged in, keep default or empty

    // 1. Load from Local Cache (Instant)
    const cachedData = localStorage.getItem(`graph_cache_${user.id}`);
    if (cachedData) {
        console.log('Loading from local cache...');
        applyGraphData(JSON.parse(cachedData));
    }

    // 2. Fetch from Server (Sync/Update)
    fetch(`http://localhost:3000/graph/${user.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.data) {
                console.log('Synced with server data');
                // Update cache with server data (source of truth)
                localStorage.setItem(`graph_cache_${user.id}`, JSON.stringify(data.data));
                // Apply server data (optional: check for diffs to avoid flicker)
                applyGraphData(data.data);
            }
        })
        .catch(error => {
            console.error('Error loading graph:', error);
        });
}

// Helper to apply data to state and render
function applyGraphData(data) {
    nodes = data.nodes || [];
    edges = data.edges || [];
    darkMode = data.darkMode || false;

    // Apply dark mode
    app.classList.toggle('dark-mode', darkMode);
    if (darkModeToggle) {
        darkModeToggle.checked = darkMode;
    }

    renderNodes();
    renderEdges();
    renderCardsList();
    renderContactPanel();
}

// Event Listeners
function setupEventListeners() {
    // Dark mode toggle
    darkModeToggle.addEventListener('change', (e) => {
        darkMode = e.target.checked;
        app.classList.toggle('dark-mode', darkMode);
        debouncedSaveGraph();
    });

    // Mode buttons
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (mode === btn.dataset.mode) {
                mode = 'view'; // Toggle off if already active
            } else {
                mode = btn.dataset.mode;
            }
            updateModeButtons();
            updateModeIndicator();
            selectedNode = null;
            connectingFrom = null;
            editingNode = null;
            renderNodes();
        });
    });

    // Save button
    if (btnSave) {
        btnSave.addEventListener('click', () => saveGraph(false));
    }

    if (panelClose) {
        panelClose.addEventListener('click', () => {
            detailNodeId = null;
            renderContactPanel();
        });
    }

    // Canvas click
    canvas.addEventListener('click', (e) => {
        if (e.target !== canvas && e.target !== nodesContainer) return;
        detailNodeId = null;
        renderContactPanel();

        if (mode === 'add') {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            addNode(x, y);
        } else {
            selectedNode = null;
            connectingFrom = null;

            // Switch to view mode if clicking on canvas (unless adding)
            if (mode !== 'view') {
                mode = 'view';
                updateModeButtons();
                updateModeIndicator();
            }

            renderNodes();
        }
    });

    // Mouse move for dragging
    document.addEventListener('mousemove', (e) => {
        if (draggingNode) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - dragOffset.x;
            const y = e.clientY - rect.top - dragOffset.y;
            updateNodePosition(draggingNode, x, y);
        }
    });

    // Mouse up
    document.addEventListener('mouseup', () => {
        if (draggingNode) {
            resolveCollisions(draggingNode);
            draggingNode = null;
            debouncedSaveGraph();
        }
    });
}

// Resolve collisions for a specific node
function resolveCollisions(nodeId) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    let attempts = 0;
    const maxAttempts = 300; // Allow more steps for smoother movement
    let hasCollision = checkCollision(node.x, node.y, nodeId);

    if (hasCollision) {
        // Add animating class for smooth transition
        const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeEl) nodeEl.classList.add('animating');

        while (hasCollision && attempts < maxAttempts) {
            let moveX = 0;
            let moveY = 0;
            let collisionCount = 0;

            // Calculate combined repulsion vector from all colliding nodes
            nodes.forEach(other => {
                if (other.id === nodeId) return;

                let dx = node.x - other.x;
                let dy = node.y - other.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < MIN_DISTANCE) {
                    collisionCount++;

                    // Handle exact overlap
                    if (distance === 0) {
                        dx = Math.random() - 0.5;
                        dy = Math.random() - 0.5;
                        distance = Math.sqrt(dx * dx + dy * dy);
                    }

                    // Repulsion vector (inversely proportional to distance?)
                    // Simple normalized vector works well for "sliding" out
                    moveX += dx / distance;
                    moveY += dy / distance;
                }
            });

            if (collisionCount === 0) {
                hasCollision = false;
                break;
            }

            // Normalize combined vector and apply small step
            const moveLen = Math.sqrt(moveX * moveX + moveY * moveY);
            if (moveLen > 0) {
                const stepSize = 2; // Small step for precision
                node.x += (moveX / moveLen) * stepSize;
                node.y += (moveY / moveLen) * stepSize;
            }

            // Re-check collision status
            hasCollision = checkCollision(node.x, node.y, nodeId);
            attempts++;
        }

        renderNodes();
        renderEdges();

        // Remove animating class after transition
        setTimeout(() => {
            const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
            if (nodeEl) nodeEl.classList.remove('animating');
        }, 600);
    }
}

// Update mode buttons
function updateModeButtons() {
    modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
}

// Update mode indicator
function updateModeIndicator() {
    modeIndicator.classList.toggle('visible', mode !== 'view');
    modeIndicator.classList.toggle('remove', mode === 'remove');

    const messages = {
        add: 'Click anywhere to add a node',
        edit: 'Click a node to edit its label',
        connect: connectingFrom ? 'Click second node to connect to' : 'Click first node to connect from',
        remove: 'Click a node to remove it'
    };

    modeIndicator.textContent = messages[mode] || '';
}

// Add node
function addNode(x, y) {
    // Find valid position if colliding
    let finalX = x;
    let finalY = y;
    let angle = 0;
    let radius = 50;
    let attempts = 0;

    while (checkCollision(finalX, finalY) && attempts < 100) {
        finalX = x + Math.cos(angle) * radius;
        finalY = y + Math.sin(angle) * radius;
        angle += 1; // Increment angle
        radius += 5; // Spiral out
        attempts++;
    }

    const newNode = {
        id: Date.now().toString(),
        x: finalX,
        y: finalY,
        label: `Node ${nodes.length + 1}`
    };
    nodes.push(newNode);
    renderNodes();
    renderCardsList();
    debouncedSaveGraph();
}

// Update node position
function updateNodePosition(nodeId, x, y) {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
        // Allow overlap during drag (will resolve on drop)
        node.x = x;
        node.y = y;
        renderNodes();
        renderEdges();
    }
}

// Update node label
function updateNodeLabel(nodeId, label) {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
        node.label = label;
        renderNodes();
        renderCardsList();
        renderContactPanel();
        debouncedSaveGraph();
    }
}

// Remove node
function removeNode(nodeId) {
    nodes = nodes.filter(n => n.id !== nodeId);
    edges = edges.filter(e => e.from !== nodeId && e.to !== nodeId);
    if (detailNodeId === nodeId) {
        detailNodeId = null;
    }
    renderNodes();
    renderEdges();
    renderCardsList();
    renderContactPanel();
    debouncedSaveGraph();
}

// Connect nodes
function connectNodes(fromId, toId) {
    const newEdge = {
        id: `e${Date.now()}`,
        from: fromId,
        to: toId
    };
    edges.push(newEdge);
    renderEdges();
    renderContactPanel();
    debouncedSaveGraph();
}

// Handle node click
function handleNodeClick(nodeId) {
    if (mode === 'remove') {
        removeNode(nodeId);
    } else if (mode === 'connect') {
        if (!connectingFrom) {
            connectingFrom = nodeId;
            renderNodes();
            updateModeIndicator();
        } else if (connectingFrom !== nodeId) {
            connectNodes(connectingFrom, nodeId);
            connectingFrom = null;
            renderNodes();
            updateModeIndicator();
        }
    } else if (mode === 'edit') {
        editingNode = nodeId;
        renderNodes();
        setTimeout(() => {
            const input = document.querySelector(`[data-node-id="${nodeId}"] .node-input`);
            if (input) {
                input.focus();
                input.select();
            }
        }, 0);
    } else {
        selectedNode = nodeId;
        renderNodes();
    }
}

// Handle node mouse down
function handleNodeMouseDown(nodeId, e) {
    if (mode === 'view' || mode === 'edit') {
        e.stopPropagation();
        draggingNode = nodeId;
        const node = nodes.find(n => n.id === nodeId);
        const rect = canvas.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left - node.x;
        dragOffset.y = e.clientY - rect.top - node.y;
    }
}

// Render nodes
function renderNodes() {
    nodesContainer.innerHTML = '';

    nodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'node';
        nodeEl.dataset.nodeId = node.id;
        nodeEl.style.left = `${node.x}px`;
        nodeEl.style.top = `${node.y}px`;

        if (selectedNode === node.id) {
            nodeEl.classList.add('selected');
        }
        if (connectingFrom === node.id) {
            nodeEl.classList.add('connecting');
        }
        if (mode === 'remove') {
            nodeEl.classList.add('remove-mode');
        }

        const nodeContent = document.createElement('div');
        nodeContent.className = 'node-content';

        if (editingNode === node.id) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'node-input';
            input.value = node.label;
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    updateNodeLabel(node.id, input.value);
                    editingNode = null;
                    renderNodes();
                } else if (e.key === 'Escape') {
                    editingNode = null;
                    renderNodes();
                }
            });
            input.addEventListener('blur', () => {
                updateNodeLabel(node.id, input.value);
                editingNode = null;
            });
            nodeContent.appendChild(input);
        } else {
            nodeContent.textContent = node.label;
        }

        if (selectedNode === node.id) {
            const badge = document.createElement('div');
            badge.className = 'node-badge';
            nodeContent.appendChild(badge);
        }

        if (selectedNode === node.id || connectingFrom === node.id) {
            const overlay = document.createElement('div');
            overlay.className = 'node-overlay';
            nodeContent.appendChild(overlay);
        }

        nodeEl.appendChild(nodeContent);

        nodeEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!draggingNode) {
                handleNodeClick(node.id);
            }
        });

        nodeEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            detailNodeId = node.id;
            renderContactPanel();
        });

        nodeEl.addEventListener('mousedown', (e) => {
            handleNodeMouseDown(node.id, e);
        });

        nodesContainer.appendChild(nodeEl);
    });
}

// Render edges
function renderEdges() {
    // Clear existing SVG content
    svgCanvas.innerHTML = '';

    // Add gradient definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'edgeGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#dc9c80');
    stop1.setAttribute('stop-opacity', '0.6');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#e8b59a');
    stop2.setAttribute('stop-opacity', '0.6');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svgCanvas.appendChild(defs);

    // Draw edges
    edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);

        if (fromNode && toNode) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'edge-line');
            line.setAttribute('x1', fromNode.x);
            line.setAttribute('y1', fromNode.y);
            line.setAttribute('x2', toNode.x);
            line.setAttribute('y2', toNode.y);
            svgCanvas.appendChild(line);
        }
    });
}

// Render cards list
function renderCardsList() {
    cardsList.innerHTML = '';

    nodes.forEach(node => {
        const cardItem = document.createElement('button');
        cardItem.className = 'card-item';
        cardItem.textContent = node.label;
        cardItem.addEventListener('click', () => {
            selectedNode = node.id;
            mode = 'view';
            updateModeButtons();
            updateModeIndicator();
            renderNodes();
        });
        cardsList.appendChild(cardItem);
    });
}

function renderContactPanel() {
    if (!contactPanel) return;
    const node = nodes.find(n => n.id === detailNodeId);
    if (!node) {
        contactPanel.classList.remove('visible');
        return;
    }

    const connected = edges
        .filter(e => e.from === node.id || e.to === node.id)
        .map(e => e.from === node.id ? e.to : e.from)
        .map(id => nodes.find(n => n.id === id))
        .filter(Boolean);

    panelTitle.textContent = node.label;
    panelSubtitle.textContent = `ID ${node.id}`;
    panelNodeId.textContent = node.id;
    panelNodeConnections.textContent = `${connected.length} ${connected.length === 1 ? 'conexão' : 'conexões'}`;

    panelConnectionsList.innerHTML = '';
    if (connected.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Sem conexões';
        panelConnectionsList.appendChild(li);
    } else {
        connected.forEach(n => {
            const li = document.createElement('li');
            li.textContent = n.label;
            panelConnectionsList.appendChild(li);
        });
    }

    contactPanel.classList.add('visible');
}

// Start the app
init();
