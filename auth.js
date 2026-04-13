// Authentication and Edit System
const AUTHORIZED_USERS = ['Wesley Song', 'Taejoon Kang'];
const STORAGE_KEY = 'steamProjectAuth';
const EDITS_STORAGE_KEY = 'steamProjectEdits';

class AuthSystem {
    constructor() {
        this.user = this.loadAuth();
        this.isEditMode = false;
        this.initializeAuth();
    }

    loadAuth() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    saveAuth(user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.user = user;
    }

    clearAuth() {
        localStorage.removeItem(STORAGE_KEY);
        this.user = null;
    }

    isAuthorized() {
        return this.user && AUTHORIZED_USERS.includes(this.user.name);
    }

    login(name) {
        const user = {
            name: name,
            role: 'guest', // Default to guest
            loginTime: new Date().toISOString()
        };

        // If trying to access as Wesley Song or Taejoon Kang, ask for password
        if (AUTHORIZED_USERS.includes(name)) {
            const password = prompt(`Enter password for "${name}" editor access:`);
            if (password === 'wowfactor33') {
                user.role = 'editor';
                alert('✓ Editor access granted!');
            } else {
                alert('✗ Incorrect password. Logging in as guest.');
                user.role = 'guest';
            }
        }

        this.saveAuth(user);
        return user;
    }

    logout() {
        this.clearAuth();
        this.disableEditMode();
    }

    initializeAuth() {
        if (!this.user) {
            this.showAuthModal();
        } else {
            this.setupPageUI();
            this.loadEditedContent();
        }
    }

    showAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <h2>Welcome to The Light Box</h2>
                <p>Please identify yourself to continue</p>
                <div class="auth-form">
                    <input 
                        type="text" 
                        id="auth-input" 
                        placeholder="Type your name..." 
                        autocomplete="off"
                    />
                    <button id="auth-submit">Enter</button>
                </div>
                <div class="quick-access">
                    <button class="quick-btn guest-btn" data-name="guest">I'm a Guest</button>
                    <button class="quick-btn" data-name="Wesley Song">Wesley Song</button>
                    <button class="quick-btn" data-name="Taejoon Kang">Taejoon Kang</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const input = document.getElementById('auth-input');
        const submitBtn = document.getElementById('auth-submit');

        submitBtn.addEventListener('click', () => {
            const name = input.value.trim();
            if (name) {
                this.login(name);
                modal.remove();
                this.setupPageUI();
                this.loadEditedContent();
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });

        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.login(btn.dataset.name);
                modal.remove();
                this.setupPageUI();
                this.loadEditedContent();
            });
        });

        input.focus();
    }

    setupPageUI() {
        this.createHeader();
        if (this.isAuthorized()) {
            this.createEditControls();
        }
    }

    createHeader() {
        const header = document.querySelector('header');
        if (!header) return;

        const userBanner = document.createElement('div');
        userBanner.className = 'user-banner';
        userBanner.innerHTML = `
            <div class="user-info">
                <span class="user-name">${this.user.name}</span>
                <span class="user-role">${this.user.role === 'editor' ? '✓ Editor' : '👁 Viewer'}</span>
            </div>
            <button id="logout-btn" class="logout-btn">Logout</button>
        `;
        header.appendChild(userBanner);

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
            window.location.reload();
        });
    }

    createEditControls() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        const editControls = document.createElement('div');
        editControls.className = 'edit-controls';
        editControls.innerHTML = `
            <button id="toggle-edit-btn" class="toggle-edit-btn">✏️ Enable Edit Mode</button>
            <button id="save-edits-btn" class="save-edits-btn" style="display:none;">💾 Save Changes</button>
            <button id="discard-edits-btn" class="discard-edits-btn" style="display:none;">✕ Discard</button>
        `;
        nav.appendChild(editControls);

        document.getElementById('toggle-edit-btn').addEventListener('click', () => {
            this.toggleEditMode();
        });

        document.getElementById('save-edits-btn').addEventListener('click', () => {
            this.saveEdits();
        });

        document.getElementById('discard-edits-btn').addEventListener('click', () => {
            this.disableEditMode();
        });
    }

    toggleEditMode() {
        if (this.isEditMode) {
            this.disableEditMode();
        } else {
            this.enableEditMode();
        }
    }

    enableEditMode() {
        this.isEditMode = true;
        document.body.classList.add('edit-mode');

        const toggleBtn = document.getElementById('toggle-edit-btn');
        const saveBtn = document.getElementById('save-edits-btn');
        const discardBtn = document.getElementById('discard-edits-btn');

        toggleBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        discardBtn.style.display = 'inline-block';

        // Make content editable
        const content = document.querySelector('.content');
        if (content) {
            this.makeEditable(content);
        }
    }

    disableEditMode() {
        this.isEditMode = false;
        document.body.classList.remove('edit-mode');

        const toggleBtn = document.getElementById('toggle-edit-btn');
        const saveBtn = document.getElementById('save-edits-btn');
        const discardBtn = document.getElementById('discard-edits-btn');

        toggleBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        discardBtn.style.display = 'none';

        // Disable contentEditable
        document.querySelectorAll('[contenteditable]').forEach(el => {
            el.contentEditable = false;
        });

        this.loadEditedContent();
    }

    makeEditable(element) {
        // Make text editable
        element.querySelectorAll('h2, h3, p, li, span').forEach(el => {
            if (!el.closest('nav') && !el.closest('.user-banner') && !el.closest('.edit-controls')) {
                el.contentEditable = true;
                el.classList.add('editable');
                el.title = 'Click to edit';
            }
        });

        // Make cards content editable
        element.querySelectorAll('.card h3, .card p, .team-member h3, .team-member p').forEach(el => {
            el.contentEditable = true;
            el.classList.add('editable');
            el.title = 'Click to edit';
        });

        // Make images editable (with alt text replacement)
        element.querySelectorAll('img').forEach(img => {
            img.classList.add('editable-image');
            img.style.cursor = 'pointer';
            img.title = 'Click to change image URL';
            
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editImage(img);
            });
        });
    }

    editImage(img) {
        const newUrl = prompt('Enter new image URL:', img.src);
        if (newUrl && newUrl.trim()) {
            img.src = newUrl.trim();
            img.style.border = '2px solid var(--accent-orange)';
        }
    }

    saveEdits() {
        const content = document.querySelector('.content');
        if (!content) return;

        const edits = {
            page: window.location.pathname.split('/').pop() || 'index.html',
            html: content.innerHTML,
            timestamp: new Date().toISOString()
        };

        let allEdits = JSON.parse(localStorage.getItem(EDITS_STORAGE_KEY)) || {};
        allEdits[edits.page] = edits;
        localStorage.setItem(EDITS_STORAGE_KEY, JSON.stringify(allEdits));

        this.disableEditMode();
        alert('✓ Changes saved successfully!');
    }

    loadEditedContent() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const allEdits = JSON.parse(localStorage.getItem(EDITS_STORAGE_KEY)) || {};

        if (allEdits[page]) {
            const content = document.querySelector('.content');
            if (content) {
                content.innerHTML = allEdits[page].html;
            }
        }
    }
}

// Initialize auth system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});

// Auto-logout after 2 hours of inactivity (optional)
let inactivityTimer;
function resetInactivityTimer() {
    if (window.authSystem && !window.authSystem.isAuthorized()) return;
    
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (window.authSystem) {
            window.authSystem.logout();
            alert('Session expired due to inactivity');
        }
    }, 2 * 60 * 60 * 1000); // 2 hours
}

document.addEventListener('mousedown', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
