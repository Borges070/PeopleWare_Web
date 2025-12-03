// Initial sample contacts
const initialContacts = [
    {
        id: '1',
        name: 'Exemplary Contact',
        initials: 'EC',
        workplace: 'Uniceub',
        email: 'example.here@gmail.com',
        phone: '+55 (61) 9 9999-9999',
        dateOfBirth: '15-10-2005',
        interests: ['AI', 'Machine Learning', 'Security ops'],
        portfolio: 'https://linkedin.com/in/lucas-borges-9723b8309/',
        preferredContact: 'WhatsApp',
        customFields: [
            { label: 'Github', value: 'https://github.com/Borges070/' },
            { label: 'Role', value: 'Senior Software Engineer' }
        ],
        notes:'This is an exemplary contact used to demonstrate the features of the contact management application. You can edit or remove this contact as needed.'
    },
    {
        id: '2',
        name: 'Bob Martinez',
        initials: 'BM',
        workplace: 'Creative Studios',
        email: 'bob.martinez@creativestudios.com',
        phone: '+1 (555) 234-5678',
        dateOfBirth: '1988-11-22',
        interests: ['Design', 'UX Research', 'Gaming'],
        portfolio: 'https://bobmartinez.design',
        preferredContact: 'Phone',
        customFields: [
            { label: 'Twitter', value: '@bobmartinez' }
        ],
        notes:'Bob is a creative professional with a passion for design and user experience. He enjoys gaming in his free time and is always looking for new design trends to explore.'
    },
    {
        id: '3',
        name: 'Carol Chen',
        initials: 'CC',
        workplace: 'DataFlow Analytics',
        email: 'carol.chen@dataflow.com',
        phone: '+1 (555) 345-6789',
        dateOfBirth: '1992-03-08',
        interests: ['Data Science', 'Running', 'Cooking'],
        portfolio: 'https://carolchen.com',
        preferredContact: 'Email'
    }
    // {
    //     id: '4',
    //     name: 'David Park',
    //     initials: 'DP',
    //     workplace: 'Green Energy Solutions',
    //     email: 'david.park@greenenergy.com',
    //     phone: '+1 (555) 456-7890',
    //     interests: ['Sustainability', 'Hiking', 'Music'],
    //     preferredContact: 'WhatsApp',
    //     customFields: [
    //         { label: 'GitHub', value: 'github.com/davidpark' },
    //         { label: 'Specialty', value: 'Renewable Energy Engineering' }
    //     ]
    // }
];

// State
let contacts = [];
let selectedContactId = null;
let isEditing = false;
let editingContact = null;
let isNewContact = false;
let isDarkMode = false;

// Temporary form data
let tempInterests = [];
let tempCustomFields = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadContacts();
    initializeEventListeners();
    renderContactList();
    renderContactGrid();
    updateUI();
});

// Load contacts from localStorage or use initial data
function loadContacts() {
    const saved = localStorage.getItem('contacts');
    contacts = saved ? JSON.parse(saved) : initialContacts;
}

// Save contacts to localStorage
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Generate initials from name
function generateInitials(name) {
    const parts = name.trim().split(' ');
    return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
}

// Event Listeners
function initializeEventListeners() {
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);

    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    // Action buttons
    document.getElementById('addContactBtn').addEventListener('click', handleAddContact);
    document.getElementById('addContactBtnCollapsed').addEventListener('click', handleAddContact);
    document.getElementById('editContactBtn').addEventListener('click', handleEditContact);
    document.getElementById('editContactBtnCollapsed').addEventListener('click', handleEditContact);
    document.getElementById('removeContactBtn').addEventListener('click', handleRemoveContact);

    // Edit form buttons
    document.getElementById('closeFormBtn').addEventListener('click', handleCancelEdit);
    document.getElementById('cancelFormBtn').addEventListener('click', handleCancelEdit);
    document.getElementById('contactForm').addEventListener('submit', handleSaveContact);

    // Form interest and custom field buttons
    document.getElementById('addInterestBtn').addEventListener('click', addInterest);
    document.getElementById('inputInterest').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addInterest();
        }
    });

    document.getElementById('addCustomFieldBtn').addEventListener('click', addCustomField);
    document.getElementById('inputFieldValue').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomField();
        }
    });

    // Expanded view buttons
    document.getElementById('closeExpandedBtn').addEventListener('click', () => {
        selectedContactId = null;
        updateUI();
    });
    document.getElementById('editExpandedBtn').addEventListener('click', handleEditContact);
    document.getElementById('removeExpandedBtn').addEventListener('click', handleRemoveContact);

    // Empty state button
    document.getElementById('addFirstContactBtn').addEventListener('click', handleAddContact);
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarContent = document.getElementById('sidebarContent');
    const sidebarCollapsed = document.getElementById('sidebarCollapsed');
    
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        sidebarContent.style.display = 'none';
        sidebarCollapsed.style.display = 'flex';
    } else {
        sidebarContent.style.display = 'flex';
        sidebarCollapsed.style.display = 'none';
    }
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    const appContainer = document.querySelector('.app-container');
    const toggle = document.getElementById('darkModeToggle');
    const icon = document.getElementById('darkModeIcon');
    
    if (isDarkMode) {
        appContainer.classList.add('dark-mode');
        toggle.classList.add('active');
        // Change icon to moon
        icon.innerHTML = `
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        `;
    } else {
        appContainer.classList.remove('dark-mode');
        toggle.classList.remove('active');
        // Change icon to sun
        icon.innerHTML = `
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        `;
    }
}

// Handle add contact
function handleAddContact() {
    isNewContact = true;
    isEditing = true;
    editingContact = null;
    tempInterests = [];
    tempCustomFields = [];
    
    document.getElementById('formTitle').textContent = 'New Contact';
    document.getElementById('submitFormBtn').textContent = 'Create Contact';
    
    clearForm();
    updateUI();
}

// Handle edit contact
function handleEditContact() {
    if (!selectedContactId) return;
    
    const contact = contacts.find(c => c.id === selectedContactId);
    if (!contact) return;
    
    isNewContact = false;
    isEditing = true;
    editingContact = contact;
    tempInterests = [...(contact.interests || [])];
    tempCustomFields = [...(contact.customFields || [])];
    
    document.getElementById('formTitle').textContent = 'Edit Contact';
    document.getElementById('submitFormBtn').textContent = 'Save Changes';
    
    populateForm(contact);
    updateUI();
}

// Handle remove contact
function handleRemoveContact() {
    if (!selectedContactId) return;
    
    if (confirm('Are you sure you want to remove this contact?')) {
        contacts = contacts.filter(c => c.id !== selectedContactId);
        selectedContactId = null;
        isEditing = false;
        
        saveContacts();
        renderContactList();
        renderContactGrid();
        updateUI();
    }
}

// Handle save contact
function handleSaveContact(e) {
    e.preventDefault();
    
    const name = document.getElementById('inputName').value.trim();
    if (!name) return;
    
    // Get the notes input value
    const notesValue = document.getElementById('inputNotes').value.trim();
    
    const contact = {
        id: isNewContact ? Date.now().toString() : editingContact.id,
        name: name,
        initials: generateInitials(name),
        workplace: document.getElementById('inputWorkplace').value.trim(),
        email: document.getElementById('inputEmail').value.trim(),
        phone: document.getElementById('inputPhone').value.trim(),
        dateOfBirth: document.getElementById('inputDateOfBirth').value,
        portfolio: document.getElementById('inputPortfolio').value.trim(),
        preferredContact: document.getElementById('inputPreferredContact').value,
        interests: [...tempInterests],
        customFields: [...tempCustomFields],
        notes: notesValue
    };
    
    if (isNewContact) {
        contacts.push(contact);
        selectedContactId = contact.id;
    } else {
        const index = contacts.findIndex(c => c.id === contact.id);
        if (index !== -1) {
            contacts[index] = contact;
        }
    }
    
    saveContacts();
    handleCancelEdit();
    renderContactList();
    renderContactGrid();
    updateExpandedView();
    updateUI();
}

// Handle cancel edit
function handleCancelEdit() {
    isEditing = false;
    isNewContact = false;
    editingContact = null;
    tempInterests = [];
    tempCustomFields = [];
    clearForm();
    updateUI();
}

// Clear form
function clearForm() {
    document.getElementById('inputName').value = '';
    document.getElementById('inputWorkplace').value = '';
    document.getElementById('inputEmail').value = '';
    document.getElementById('inputPhone').value = '';
    document.getElementById('inputDateOfBirth').value = '';
    document.getElementById('inputPortfolio').value = '';
    document.getElementById('inputPreferredContact').value = '';
    document.getElementById('inputInterest').value = '';
    document.getElementById('inputFieldLabel').value = '';
    document.getElementById('inputFieldValue').value = '';
    document.getElementById('inputNotes').value = '';
    renderFormInterests();
    renderFormCustomFields();
}

// Populate form with contact data
function populateForm(contact) {
    document.getElementById('inputName').value = contact.name || '';
    document.getElementById('inputWorkplace').value = contact.workplace || '';
    document.getElementById('inputEmail').value = contact.email || '';
    document.getElementById('inputPhone').value = contact.phone || '';
    document.getElementById('inputDateOfBirth').value = contact.dateOfBirth || '';
    document.getElementById('inputPortfolio').value = contact.portfolio || '';
    document.getElementById('inputPreferredContact').value = contact.preferredContact || '';
    document.getElementById('inputNotes').value = contact.notes || '';
    
    renderFormInterests();
    renderFormCustomFields();
}

// Add interest
function addInterest() {
    const input = document.getElementById('inputInterest');
    const interest = input.value.trim();
    
    if (interest) {
        tempInterests.push(interest);
        input.value = '';
        renderFormInterests();
    }
}

// Remove interest
function removeInterest(index) {
    tempInterests.splice(index, 1);
    renderFormInterests();
}

// Render form interests
function renderFormInterests() {
    const container = document.getElementById('interestsList');
    
    if (tempInterests.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = tempInterests.map((interest, index) => `
        <span class="tag">
            ${interest}
            <button type="button" onclick="removeInterest(${index})">
                <svg class="icon" style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </span>
    `).join('');
}

// Add custom field
function addCustomField() {
    const labelInput = document.getElementById('inputFieldLabel');
    const valueInput = document.getElementById('inputFieldValue');
    
    const label = labelInput.value.trim();
    const value = valueInput.value.trim();
    
    if (label && value) {
        tempCustomFields.push({ label, value });
        labelInput.value = '';
        valueInput.value = '';
        renderFormCustomFields();
    }
}

// Remove custom field
function removeCustomField(index) {
    tempCustomFields.splice(index, 1);
    renderFormCustomFields();
}

// Render form custom fields
function renderFormCustomFields() {
    const container = document.getElementById('customFieldsList');
    
    if (tempCustomFields.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = tempCustomFields.map((field, index) => `
        <div class="custom-field">
            <div class="custom-field-content">
                <p>${field.label}</p>
                <p>${field.value}</p>
            </div>
            <button type="button" onclick="removeCustomField(${index})">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// Render contact list in sidebar
function renderContactList() {
    const container = document.getElementById('contactList');
    const countElement = document.getElementById('contactCount');
    
    countElement.textContent = `All Contacts (${contacts.length})`;
    
    if (contacts.length === 0) {
        container.innerHTML = '<p style="color: #9ca3af; font-size: 0.875rem; padding: 8px;">No contacts yet</p>';
        return;
    }
    
    container.innerHTML = contacts.map(contact => `
        <button 
            class="contact-list-item ${selectedContactId === contact.id ? 'selected' : ''}"
            onclick="selectContact('${contact.id}')"
        >
            ${contact.name}
        </button>
    `).join('');
}

// Render contact grid
function renderContactGrid() {
    const grid = document.getElementById('contactGrid');
    const emptyState = document.getElementById('emptyState');
    const subtitle = document.getElementById('contentSubtitle');
    
    subtitle.textContent = `Manage your professional connections • ${contacts.length} contacts`;
    
    if (contacts.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    grid.innerHTML = contacts.map(contact => `
        <div 
            class="contact-card ${selectedContactId === contact.id ? 'selected' : ''}"
            onclick="selectContact('${contact.id}')"
        >
            <div class="contact-avatar">${contact.initials}</div>
            <div class="contact-info">
                <h3>${contact.name}</h3>
                ${contact.workplace ? `<p>${contact.workplace}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Select contact
function selectContact(id) {
    selectedContactId = id;
    isEditing = false;
    renderContactList();
    renderContactGrid();
    updateExpandedView();
    updateUI();
}

// Update expanded view
function updateExpandedView() {
    const expandedView = document.getElementById('expandedView');
    
    if (!selectedContactId) {
        expandedView.style.display = 'none';
        return;
    }
    
    const contact = contacts.find(c => c.id === selectedContactId);
    if (!contact) {
        expandedView.style.display = 'none';
        return;
    }
    
    expandedView.style.display = 'block';
    
    document.getElementById('expandedAvatar').textContent = contact.initials;
    document.getElementById('expandedName').textContent = contact.name;
    document.getElementById('expandedWorkplace').textContent = contact.workplace || '';
    
    const details = document.getElementById('expandedDetails');
    let html = '';
    
    // Contact Information Section
    const hasContactInfo = contact.email || contact.phone || contact.dateOfBirth || contact.workplace;
    if (hasContactInfo) {
        html += `
            <div class="detail-section">
                <div class="detail-section-header">
                    <div class="section-bar"></div>
                    <h3>CONTACT INFORMATION</h3>
                </div>
        `;
        
        if (contact.email) {
            html += `
                <div class="detail-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <div class="detail-item-content">
                        <p>Email</p>
                        <p class="text-break-word" >${contact.email}</p>
                    </div>
                </div>
            `;
        }
        
        if (contact.phone) {
            html += `
                <div class="detail-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <div class="detail-item-content">
                        <p>Phone</p>
                        <p class="text-break-word" >${contact.phone}</p>
                    </div>
                </div>
            `;
        }
        
        if (contact.dateOfBirth) {
            html += `
                <div class="detail-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <div class="detail-item-content">
                        <p>Date of Birth</p>
                        <p class="text-break-word" >${contact.dateOfBirth}</p>
                    </div>
                </div>
            `;
        }
        
        if (contact.workplace) {
            html += `
                <div class="detail-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <div class="detail-item-content">
                        <p>Workplace</p>
                        <p class="text-break-word" >${contact.workplace}</p>
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
    }
    
    // Interests Section
    if (contact.interests && contact.interests.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-section-header">
                    <div class="section-bar"></div>
                    <h3>INTERESTS</h3>
                </div>
                <div class="detail-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <div class="detail-interests">
                        ${contact.interests.map(interest => `
                            <span class="interest-tag">${interest}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Portfolio Section
    if (contact.portfolio) {
        html += `
            <div class="detail-section">
                <div class="detail-section-header">
                    <div class="section-bar"></div>
                    <h3>PORTFOLIO</h3>
                </div>
                <div class="detail-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <div class="detail-item-content">
                        <p>Website</p>
                        <p><a href="${contact.portfolio}" target="_blank" class="text-break-word" rel="noopener noreferrer">${contact.portfolio}</a></p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Preferences Section
    if (contact.preferredContact) {
        html += `
            <div class="detail-section">
                <div class="detail-section-header">
                    <div class="section-bar"></div>
                    <h3>PREFERENCES</h3>
                </div>
                <div class="detail-item">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <div class="detail-item-content">
                        <p>Preferred Contact Method</p>
                        <p>${contact.preferredContact}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Custom Fields Section
    if (contact.customFields && contact.customFields.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-section-header">
                    <div class="section-bar"></div>
                    <h3>ADDITIONAL INFORMATION</h3>
                </div>
                ${contact.customFields.map(field => `
                    <div class="detail-custom-field">
                        <div class="dot"></div>
                        <div class="detail-custom-field-content">
                            <p class="text-break-word" >${field.label}</p>
                            <p class="text-break-word" >${field.value}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    // Notes Section
    if (contact.notes) {
        html += `
            <div class="detail-section">
                <div class="detail-section-header">
                    <div class="section-bar"></div>
                    <h3>NOTES</h3>
                </div>
                <div class="detail-custom-field">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <div class="detail-item-content">
                        <p>Detailed Notes</p>
                        <p style="white-space: pre-wrap;" class="text-break-word">${contact.notes}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    details.innerHTML = html;
}

// Update UI
function updateUI() {
    const sidebar = document.getElementById('sidebar');
    const editForm = document.getElementById('editForm');
    const mainContent = document.getElementById('mainContent');
    const expandedView = document.getElementById('expandedView');
    
    // Update button states
    const editBtn = document.getElementById('editContactBtn');
    const editBtnCollapsed = document.getElementById('editContactBtnCollapsed');
    const removeBtn = document.getElementById('removeContactBtn');
    
    
    if (selectedContactId) {
        editBtn.disabled = false;
        editBtnCollapsed.disabled = false;
        removeBtn.disabled = false;
        
    } else {
        editBtn.disabled = true;
        editBtnCollapsed.disabled = true;
        removeBtn.disabled = true;
        
    }
    
    // Show/hide panels
    if (isEditing) {
        sidebar.style.display = 'none';
        editForm.style.display = 'block';
        expandedView.style.display = 'none';
    } else {
        sidebar.style.display = 'flex';
        editForm.style.display = 'none';
        
        if (selectedContactId) {
            expandedView.style.display = 'block';
        } else {
            expandedView.style.display = 'none';
        }
    }
}

// Make functions globally accessible for onclick handlers
window.selectContact = selectContact;
window.removeInterest = removeInterest;
window.removeCustomField = removeCustomField;
