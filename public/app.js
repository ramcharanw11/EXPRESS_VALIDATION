const API_BASE_URL = '/api/users';

// DOM Elements - will be initialized after DOM loads
let form;
let formTitle;
let submitBtn;
let cancelBtn;
let clearBtn;
let messageDiv;
let usersList;
let searchInput;
let userIdInput;

let isEditMode = false;
let currentUserId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    form = document.getElementById('registration-form');
    formTitle = document.getElementById('form-title');
    submitBtn = document.getElementById('submit-btn');
    cancelBtn = document.getElementById('cancel-btn');
    clearBtn = document.getElementById('clear-btn');
    messageDiv = document.getElementById('message');
    usersList = document.getElementById('users-list');
    searchInput = document.getElementById('search-input');
    userIdInput = document.getElementById('user-id');

    // Check if all elements exist
    if (!form || !formTitle || !submitBtn || !cancelBtn || !clearBtn || 
        !messageDiv || !usersList || !searchInput || !userIdInput) {
        console.error('Some DOM elements are missing. Please check the HTML.');
        return;
    }

    loadUsers();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    if (form) form.addEventListener('submit', handleFormSubmit);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);
    if (clearBtn) clearBtn.addEventListener('click', clearForm);
    if (searchInput) searchInput.addEventListener('input', handleSearch);
}

// Load all users
async function loadUsers() {
    try {
        const response = await fetch(API_BASE_URL);
        const result = await response.json();
        
        if (result.success) {
            displayUsers(result.data);
        } else {
            showMessage('Error loading users: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('Error loading users: ' + error.message, 'error');
        if (usersList) {
            usersList.innerHTML = '<p class="empty-state">Error loading users. Please try again.</p>';
        }
    }
}

// Display users
function displayUsers(users) {
    if (!usersList) return;
    
    if (users.length === 0) {
        usersList.innerHTML = '<p class="empty-state">No users registered yet. Register your first user above!</p>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <div class="user-card" data-id="${user.id}">
            <h3>${escapeHtml(user.firstName || '')} ${escapeHtml(user.lastName || '')}</h3>
            <div class="user-info">
                <p><strong>Email:</strong> ${escapeHtml(user.email || '')}</p>
                ${user.phone ? `<p><strong>Phone:</strong> ${escapeHtml(user.phone)}</p>` : ''}
                ${user.address ? `<p><strong>Address:</strong> ${escapeHtml(user.address)}</p>` : ''}
                ${user.dateOfBirth ? `<p><strong>Date of Birth:</strong> ${formatDate(user.dateOfBirth)}</p>` : ''}
                <p><strong>Registered:</strong> ${formatDate(user.createdAt || new Date().toISOString())}</p>
            </div>
            <div class="user-actions">
                <button class="btn btn-edit" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!form) return;
    
    const formData = new FormData(form);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        dateOfBirth: formData.get('dateOfBirth')
    };

    try {
        let response;
        if (isEditMode && currentUserId) {
            // Update existing user
            response = await fetch(`${API_BASE_URL}/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        } else {
            // Create new user
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        }

        const result = await response.json();

        if (result.success) {
            showMessage(
                isEditMode 
                    ? 'User updated successfully!' 
                    : 'User registered successfully!',
                'success'
            );
            clearForm();
            loadUsers();
        } else {
            showMessage('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Edit user
async function editUser(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const result = await response.json();

        if (result.success) {
            const user = result.data;
            isEditMode = true;
            currentUserId = id;

            // Populate form
            const firstNameEl = document.getElementById('firstName');
            const lastNameEl = document.getElementById('lastName');
            const emailEl = document.getElementById('email');
            const phoneEl = document.getElementById('phone');
            const addressEl = document.getElementById('address');
            const dateOfBirthEl = document.getElementById('dateOfBirth');

            if (firstNameEl) firstNameEl.value = user.firstName || '';
            if (lastNameEl) lastNameEl.value = user.lastName || '';
            if (emailEl) emailEl.value = user.email || '';
            if (phoneEl) phoneEl.value = user.phone || '';
            if (addressEl) addressEl.value = user.address || '';
            if (dateOfBirthEl) dateOfBirthEl.value = user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '';
            if (userIdInput) userIdInput.value = user.id;

            // Update UI
            if (formTitle) formTitle.textContent = 'Edit User';
            if (submitBtn) submitBtn.textContent = 'Update';
            if (cancelBtn) cancelBtn.style.display = 'inline-block';

            // Scroll to form
            const formSection = document.querySelector('.form-section');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            showMessage('Error loading user: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Delete user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showMessage('User deleted successfully!', 'success');
            loadUsers();
            
            // If deleting the user being edited, cancel edit mode
            if (isEditMode && currentUserId === id) {
                cancelEdit();
            }
        } else {
            showMessage('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Cancel edit mode
function cancelEdit() {
    isEditMode = false;
    currentUserId = null;
    clearForm();
    if (formTitle) formTitle.textContent = 'Register New User';
    if (submitBtn) submitBtn.textContent = 'Register';
    if (cancelBtn) cancelBtn.style.display = 'none';
}

// Clear form
function clearForm() {
    if (form) form.reset();
    if (userIdInput) userIdInput.value = '';
    hideMessage();
}

// Handle search
function handleSearch() {
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const userCards = document.querySelectorAll('.user-card');

    userCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// Show message
function showMessage(message, type) {
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(hideMessage, 5000);
}

// Hide message
function hideMessage() {
    if (!messageDiv) return;
    messageDiv.style.display = 'none';
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// Make functions globally available for onclick handlers
window.editUser = editUser;
window.deleteUser = deleteUser;
