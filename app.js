/**
 * ============================================================================
 * MAIN APPLICATION MODULE — JURNAL MENGAJAR (WITH EXTRA SPARKLES)
 * ============================================================================
 * The central nervous system for journals. It stores entries, displays
 * them in tables, and remembers which human is currently logged in.
 * All behavior is intentionally helpful and mildly dramatic.
 * ============================================================================
 */

// Global data storage - all journals are stored here and in localStorage
let jurnalData = JSON.parse(localStorage.getItem('jurnalData')) || [];

// Track which journal is being edited (null if creating new)
let editingId = null;

// Store current logged-in user information
let currentUser = null;

/**
 * DOM element references (cached for performance)
 */
const form = document.getElementById('jurnalForm');
const tableBody = document.getElementById('jurnalTableBody');
const totalJurnal = document.getElementById('totalJurnal');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const filterKelas = document.getElementById('filterKelas');
const filterBulan = document.getElementById('filterBulan');
const searchMateri = document.getElementById('searchMateri');

/**
 * Initialize the application when page loads
 * - Load user information from session
 * - Display all journals
 * - Set up event listeners for form and filters
 */
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    renderTable();
    setupEventListeners();
});

/**
 * Load user information from session storage and display in header
 * Retrieves user data set during login, shows name and role
 */
function loadUserInfo() {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        // Parse stored session data
        currentUser = JSON.parse(userSession);
        
        // Get DOM elements for displaying user info
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const teacherName = document.getElementById('teacherName');
        
        // Display user's full name (or username if name not set)
        if (userName) {
            userName.textContent = currentUser.fullName || currentUser.username;
        }
        
        // Display user's role with icon
        if (userRole) {
            const roleDisplay = currentUser.role === 'admin' ? 'Admin' : 'Guru';
            userRole.textContent = roleDisplay;
        }
        
        // Display teacher name in header
        if (teacherName) {
            teacherName.textContent = `Guru Mapel ${currentUser.fullName || currentUser.username}`;
        }
    }
}

/**
 * Set up event listeners for form submission and filter changes
 * Attaches handlers to form, buttons, and filter/search inputs
 */
function setupEventListeners() {
    if (form) form.addEventListener('submit', handleSubmit);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);
    if (filterKelas) filterKelas.addEventListener('change', renderTable);
    if (filterBulan) filterBulan.addEventListener('change', renderTable);
    if (searchMateri) searchMateri.addEventListener('input', renderTable);
}

/**
 * Handle form submission - Create new journal or update existing one
 * Collects form data, validates, saves to localStorage, and refreshes display
 */
function handleSubmit(e) {
    e.preventDefault();

    // Collect form data from all input fields — this is our journal entry
        const formData = {
        id: editingId || Date.now(),                  // Use existing ID if editing, else create new
        hari: document.getElementById('hari').value,
        tanggal: document.getElementById('tanggal').value,
        jamKe: document.getElementById('jamKe').value,
        kelas: document.getElementById('kelas').value,
        siswaHadir: parseInt(document.getElementById('siswaHadir').value) || 0,
        siswaTidakHadir: parseInt(document.getElementById('siswaTidakHadir').value) || 0,
        namaSiswaTidakHadir: document.getElementById('namaSiswaTidakHadir').value,
        uraianMateri: document.getElementById('uraianMateri').value,
        createdAt: editingId ? jurnalData.find(j => j.id === editingId).createdAt : new Date().toISOString()
    };

    // If editing existing journal, update it; otherwise, add new one
    if (editingId) {
        const index = jurnalData.findIndex(j => j.id === editingId);
        jurnalData[index] = formData;
        showNotification('Jurnal berhasil diperbarui!', 'success');
    } else {
        jurnalData.push(formData);
        showNotification('Jurnal berhasil ditambahkan!', 'success');
    }

    // Persist to localStorage, reset form, refresh table
    saveData();
    resetForm();
    renderTable();
}

/**
 * Load a journal entry into the form for editing
 * @param {number} id - The journal ID to edit
 */
function editJurnal(id) {
    // Find the journal by ID and load it into the form so the user can edit it
    const jurnal = jurnalData.find(j => j.id === id);
    if (!jurnal) return;

    // Set editingId so form knows we're updating, not creating
    editingId = id;
    
    // Populate form fields with journal data
    document.getElementById('hari').value = jurnal.hari;
    document.getElementById('tanggal').value = jurnal.tanggal;
    document.getElementById('jamKe').value = jurnal.jamKe;
    document.getElementById('kelas').value = jurnal.kelas;
    document.getElementById('siswaHadir').value = jurnal.siswaHadir;
    document.getElementById('siswaTidakHadir').value = jurnal.siswaTidakHadir;
    document.getElementById('namaSiswaTidakHadir').value = jurnal.namaSiswaTidakHadir;
    document.getElementById('uraianMateri').value = jurnal.uraianMateri;

    // Update button text to reflect editing mode
    submitBtn.innerHTML = 'Update Jurnal';
    cancelBtn.style.display = 'block';
    
    // Scroll to form so user can see what they're editing
    document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Delete a journal entry after user confirmation
 * @param {number} id - The journal ID to delete
 */
function deleteJurnal(id) {
    // Ask the user for confirmation before permanently deleting the journal
    if (!confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) return;
    
    // Remove the journal from array
    jurnalData = jurnalData.filter(j => j.id !== id);
    
    // Persist changes and refresh display
    saveData();
    renderTable();
    showNotification('Jurnal berhasil dihapus!', 'success');
}

/**
 * Cancel editing and reset form to empty state
 */
function cancelEdit() {
    // User clicked Cancel — forget about editing and go back to blank form
    resetForm();
}

/**
 * Clear form fields and exit edit mode
 */
function resetForm() {
    form.reset();
    editingId = null;
    submitBtn.innerHTML = 'Simpan Jurnal';
    cancelBtn.style.display = 'none';
}

/**
 * Render the journal table with filtered/sorted data
 * Applies all filters (class, month, search) and displays results
 */
function renderTable() {
    // Start with all journals
    let filteredData = [...jurnalData];

    // Apply filter by class (kelas)
    if (filterKelas.value) {
        filteredData = filteredData.filter(j => j.kelas === filterKelas.value);
    }
    
    // Apply filter by month
    if (filterBulan.value) {
        filteredData = filteredData.filter(j => j.tanggal.substring(5, 7) === filterBulan.value);
    }
    
    // Apply search filter on material description (uraianMateri)
    if (searchMateri.value) {
        filteredData = filteredData.filter(j => 
            j.uraianMateri.toLowerCase().includes(searchMateri.value.toLowerCase())
        );
    }

    // Sort by date (newest first)
    filteredData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    // Update total count
    totalJurnal.textContent = filteredData.length;

    // Show "no results" message if no journals match filters
    if (filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                    <div class="text-4xl mb-4"></div>
                    <p>Tidak ada jurnal yang ditemukan</p>
                    <p class="text-sm mt-2">Coba ubah filter atau tambahkan jurnal baru</p>
                </td>
            </tr>
        `;
        return;
    }

    // Build table HTML with all journals
    tableBody.innerHTML = filteredData.map((jurnal, index) => `
        <tr class="hover:bg-gray-50 transition-colors duration-200">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="font-medium">${jurnal.hari}</div>
                <div class="text-gray-500">${formatDate(jurnal.tanggal)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Jam ke-${jurnal.jamKe}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ${jurnal.kelas}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="text-green-600 font-medium">${jurnal.siswaHadir} hadir</div>
                <div class="text-red-600">${jurnal.siswaTidakHadir} tidak hadir</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
                <div class="truncate" title="${jurnal.namaSiswaTidakHadir}">
                    ${jurnal.namaSiswaTidakHadir || '-'}
                </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
                <div class="truncate" title="${jurnal.uraianMateri}">
                    ${jurnal.uraianMateri}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button data-id="${jurnal.id}" class="edit-btn text-indigo-600 hover:text-indigo-900 mr-3 transition-colors duration-200">Edit</button>
                <button data-id="${jurnal.id}" class="delete-btn text-red-600 hover:text-red-900 transition-colors duration-200">Hapus</button>
            </td>
        </tr>
    `).join('');

    // Attach event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => 
        btn.addEventListener('click', e => editJurnal(Number(e.currentTarget.dataset.id)))
    );
    document.querySelectorAll('.delete-btn').forEach(btn => 
        btn.addEventListener('click', e => deleteJurnal(Number(e.currentTarget.dataset.id)))
    );
}

/**
 * Format a date string into readable Indonesian format
 * @param {string} dateString - ISO format date string (YYYY-MM-DD)
 * @returns {string} - Formatted date (e.g., "17 November 2025")
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

/**
 * Save all journal data to localStorage
 * Called after any changes to ensure data persists across sessions
 */
function saveData() {
    localStorage.setItem('jurnalData', JSON.stringify(jurnalData));
}

/**
 * Show a temporary notification message to the user
 * Auto-hides after 3 seconds
 * @param {string} message - Message to display
 * @param {string} type - Type of notification: 'success', 'error', or 'info'
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    const typeClass = type === 'success' 
        ? 'bg-green-500 text-white' 
        : type === 'error' 
        ? 'bg-red-500 text-white' 
        : 'bg-blue-500 text-white';
    
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${typeClass}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in (slide from right)
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // Animate out and remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Make functions available globally for HTML onclick handlers
 */
window.editJurnal = editJurnal;
window.deleteJurnal = deleteJurnal;
window.showNotification = showNotification;

/**
 * Initialize localStorage with empty journal data
 * Useful for resetting the system during development
 * Call this from browser console: initLocalStorage()
 */
function initLocalStorage() {
    // Reset journals to empty array (fresh start)
    localStorage.setItem('jurnalData', JSON.stringify([]));
    
    // Optionally clear user session (uncomment if you want auto-logout)
    // localStorage.removeItem('userSession');
    
    showNotification('Local storage diinisialisasi - jurnal direset!', 'success');
    renderTable();
}
window.initLocalStorage = initLocalStorage;
