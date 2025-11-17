// App logic extracted from index.html and organized in a single file

let jurnalData = JSON.parse(localStorage.getItem('jurnalData')) || [];
let editingId = null;
let currentUser = null;

// DOM elements
const form = document.getElementById('jurnalForm');
const tableBody = document.getElementById('jurnalTableBody');
const totalJurnal = document.getElementById('totalJurnal');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const filterKelas = document.getElementById('filterKelas');
const filterBulan = document.getElementById('filterBulan');
const searchMateri = document.getElementById('searchMateri');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    renderTable();
    setupEventListeners();
});

function loadUserInfo() {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        currentUser = JSON.parse(userSession);
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const teacherName = document.getElementById('teacherName');
        
        if (userName) {
            userName.textContent = currentUser.fullName || currentUser.username;
        }
        if (userRole) {
            const roleDisplay = currentUser.role === 'admin' ? '👨‍💼 Admin' : '👨‍🏫 Guru';
            userRole.textContent = roleDisplay;
        }
        if (teacherName) {
            teacherName.textContent = `Guru Mapel ${currentUser.fullName || currentUser.username}`;
        }
    }
}

function setupEventListeners() {
    if (form) form.addEventListener('submit', handleSubmit);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);
    if (filterKelas) filterKelas.addEventListener('change', renderTable);
    if (filterBulan) filterBulan.addEventListener('change', renderTable);
    if (searchMateri) searchMateri.addEventListener('input', renderTable);
}

function handleSubmit(e) {
    e.preventDefault();

    const formData = {
        id: editingId || Date.now(),
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

    if (editingId) {
        const index = jurnalData.findIndex(j => j.id === editingId);
        jurnalData[index] = formData;
        showNotification('Jurnal berhasil diperbarui!', 'success');
    } else {
        jurnalData.push(formData);
        showNotification('Jurnal berhasil ditambahkan!', 'success');
    }

    saveData();
    resetForm();
    renderTable();
}

function editJurnal(id) {
    const jurnal = jurnalData.find(j => j.id === id);
    if (!jurnal) return;

    editingId = id;
    document.getElementById('hari').value = jurnal.hari;
    document.getElementById('tanggal').value = jurnal.tanggal;
    document.getElementById('jamKe').value = jurnal.jamKe;
    document.getElementById('kelas').value = jurnal.kelas;
    document.getElementById('siswaHadir').value = jurnal.siswaHadir;
    document.getElementById('siswaTidakHadir').value = jurnal.siswaTidakHadir;
    document.getElementById('namaSiswaTidakHadir').value = jurnal.namaSiswaTidakHadir;
    document.getElementById('uraianMateri').value = jurnal.uraianMateri;

    submitBtn.innerHTML = '✏️ Update Jurnal';
    cancelBtn.style.display = 'block';
    document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
}

function deleteJurnal(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) return;
    jurnalData = jurnalData.filter(j => j.id !== id);
    saveData();
    renderTable();
    showNotification('Jurnal berhasil dihapus!', 'success');
}

function cancelEdit() { resetForm(); }

function resetForm() {
    form.reset();
    editingId = null;
    submitBtn.innerHTML = '💾 Simpan Jurnal';
    cancelBtn.style.display = 'none';
}

function renderTable() {
    let filteredData = [...jurnalData];

    if (filterKelas.value) filteredData = filteredData.filter(j => j.kelas === filterKelas.value);
    if (filterBulan.value) filteredData = filteredData.filter(j => j.tanggal.substring(5, 7) === filterBulan.value);
    if (searchMateri.value) filteredData = filteredData.filter(j => j.uraianMateri.toLowerCase().includes(searchMateri.value.toLowerCase()));

    // Sort newest first
    filteredData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    totalJurnal.textContent = filteredData.length;

    if (filteredData.length === 0) {
        tableBody.innerHTML = `\n            <tr>\n                <td colspan="8" class="px-6 py-12 text-center text-gray-500">\n                    <div class="text-4xl mb-4">🔍</div>\n                    <p>Tidak ada jurnal yang ditemukan</p>\n                    <p class="text-sm mt-2">Coba ubah filter atau tambahkan jurnal baru</p>\n                </td>\n            </tr>\n        `;
        return;
    }

    tableBody.innerHTML = filteredData.map((jurnal, index) => `\n        <tr class="hover:bg-gray-50 transition-colors duration-200">\n            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>\n            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">\n                <div class="font-medium">${jurnal.hari}</div>\n                <div class="text-gray-500">${formatDate(jurnal.tanggal)}</div>\n            </td>\n            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">\n                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">\n                    Jam ke-${jurnal.jamKe}\n                </span>\n            </td>\n            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">\n                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">\n                    ${jurnal.kelas}\n                </span>\n            </td>\n            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">\n                <div class="text-green-600 font-medium">✅ ${jurnal.siswaHadir} hadir</div>\n                <div class="text-red-600">❌ ${jurnal.siswaTidakHadir} tidak hadir</div>\n            </td>\n            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">\n                <div class="truncate" title="${jurnal.namaSiswaTidakHadir}">\n                    ${jurnal.namaSiswaTidakHadir || '-'}\n                </div>\n            </td>\n            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">\n                <div class="truncate" title="${jurnal.uraianMateri}">\n                    ${jurnal.uraianMateri}\n                </div>\n            </td>\n            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">\n                <button data-id="${jurnal.id}" class="edit-btn text-indigo-600 hover:text-indigo-900 mr-3 transition-colors duration-200">✏️ Edit</button>\n                <button data-id="${jurnal.id}" class="delete-btn text-red-600 hover:text-red-900 transition-colors duration-200">🗑️ Hapus</button>\n            </td>\n        </tr>\n    `).join('');

    // Rebind events for new buttons
    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', e => editJurnal(Number(e.currentTarget.dataset.id))));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', e => deleteJurnal(Number(e.currentTarget.dataset.id))));
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

function saveData() { localStorage.setItem('jurnalData', JSON.stringify(jurnalData)); }

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${type === 'success' ? 'bg-green-500 text-white' : type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // show
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // hide
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 300);
    }, 3000);
}

// Expose functions used by inline handlers if any
window.editJurnal = editJurnal;
window.deleteJurnal = deleteJurnal;
window.showNotification = showNotification;

