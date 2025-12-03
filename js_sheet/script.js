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

// DOM Elements
const app = document.querySelector('.app');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const modeButtons = document.querySelectorAll('.sidebar-btn');
const canvas = document.getElementById('canvas');
const nodesContainer = document.getElementById('nodes-container');
const svgCanvas = document.getElementById('svg-canvas');
const cardsList = document.getElementById('cards-list');
const modeIndicator = document.getElementById('mode-indicator');

// Initialize
function init() {
    setupEventListeners();
    renderNodes();
    renderEdges();
    renderCardsList();
    updateModeIndicator();
}

// Event Listeners
function setupEventListeners() {
    // Dark mode toggle
    darkModeToggle.addEventListener('change', (e) => {
        darkMode = e.target.checked;
        app.classList.toggle('dark-mode', darkMode);
    });

    // Mode buttons
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            mode = btn.dataset.mode;
            updateModeButtons();
            updateModeIndicator();
            selectedNode = null;
            connectingFrom = null;
            editingNode = null;
            renderNodes();
        });
    });

    // Canvas click
    canvas.addEventListener('click', (e) => {
        if (e.target !== canvas && e.target !== nodesContainer) return;

        if (mode === 'add') {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            addNode(x, y);
        } else {
            selectedNode = null;
            connectingFrom = null;
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
        draggingNode = null;
    });
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
    const newNode = {
        id: Date.now().toString(),
        x,
        y,
        label: `Node ${nodes.length + 1}`
    };
    nodes.push(newNode);
    renderNodes();
    renderCardsList();
}

// Update node position
function updateNodePosition(nodeId, x, y) {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
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
    }
}

// Remove node
function removeNode(nodeId) {
    nodes = nodes.filter(n => n.id !== nodeId);
    edges = edges.filter(e => e.from !== nodeId && e.to !== nodeId);
    renderNodes();
    renderEdges();
    renderCardsList();
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

// Start the app
init();
