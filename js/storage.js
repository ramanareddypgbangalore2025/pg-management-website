// ============================================
// Storage & Backup Module
// ============================================

let allGuests = [];
let allBackups = [];

// Initialize page actions and load data
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadStorageData();
        checkAutoBackup();
    }, 500);

    // Setup file input listener for restore
    const restoreInput = document.getElementById('restoreInput');
    if (restoreInput) {
        restoreInput.addEventListener('change', restoreBackup);
    }
});

// Load guest data and backups from DB, update UI
async function loadStorageData() {
    try {
        allGuests = await DB.getGuests();
        allBackups = await DB.getBackups();

        updateStorageInfo();
        renderArchives();
    } catch (error) {
        console.error('Error loading storage data:', error);
        alert('Failed to load storage data. See console for details.');
    }
}

// Update UI summary info
function updateStorageInfo() {
    const totalRecordsElem = document.getElementById('totalRecords');
    const totalArchivesElem = document.getElementById('totalArchives');
    const lastBackupElem = document.getElementById('lastBackup');

    if (totalRecordsElem) totalRecordsElem.textContent = allGuests.length;
    if (totalArchivesElem) totalArchivesElem.textContent = allBackups.length;

    if (lastBackupElem && allBackups.length > 0) {
        const lastBackupDate = new Date(allBackups[0].backup_date);
        lastBackupElem.textContent = lastBackupDate.toLocaleString();
    } else if (lastBackupElem) {
        lastBackupElem.textContent = 'Never';
    }
}

// Render list of backup archives with download/restore buttons
function renderArchives() {
    const archivesList = document.getElementById('archivesList');
    if (!archivesList) return;

    if (allBackups.length === 0) {
        archivesList.innerHTML = '<p class="text-center text-muted">No backups available</p>';
        return;
    }

    let html = '';
    allBackups.forEach(backup => {
        const backupDate = new Date(backup.backup_date);
        const recordCount = backup.data ? JSON.parse(backup.data).length : 0;

        html += `
            <div class="archive-item" style="display:flex;justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div>
                    <strong>${backupDate.toLocaleDateString()} ${backupDate.toLocaleTimeString()}</strong>
                    <br>
                    <small style="color: var(--text-secondary);">
                        <i class="fas fa-database"></i> ${recordCount} records | 
                        <i class="fas fa-tag"></i> ${backup.type || 'manual'} backup
                    </small>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-sm btn-primary" onclick="downloadBackup('${backup.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="restoreFromBackup('${backup.id}')">
                        <i class="fas fa-undo"></i> Restore
                    </button>
                </div>
            </div>
        `;
    });

    archivesList.innerHTML = html;
}

// Create new backup and save to DB
async function createBackup() {
    if (!confirm('Create a backup of all current guest data?')) return;

    try {
        const backupData = JSON.stringify(allGuests);
        const result = await DB.saveBackup(backupData);

        if (result.success) {
            alert('Backup created successfully!');
            await loadStorageData();
        } else {
            alert('Error creating backup: ' + result.error);
        }
    } catch (error) {
        console.error('Backup error:', error);
        alert('Error creating backup!');
    }
}

// Export guest data to downloadable JSON file
function exportData() {
    const dataStr = JSON.stringify(allGuests, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pg-guests-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Restore backup from user-selected JSON file upload
function restoreBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm('WARNING: This will replace all current data with the backup. Are you sure?')) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (!Array.isArray(data)) {
                alert('Invalid backup file format!');
                return;
            }

            // Implement DB replacement logic here to sync restored data
            alert(`Backup loaded with ${data.length} records. Please implement restoring data to database.`);

            // Optionally refresh UI data
            // await loadStorageData();

        } catch (error) {
            console.error('Restore error:', error);
            alert('Error restoring backup: Invalid file format');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Download backup archive as JSON file by id
function downloadBackup(backupId) {
    const backup = allBackups.find(b => b.id === backupId);
    if (!backup) {
        alert('Backup data not found!');
        return;
    }

    const dataBlob = new Blob([backup.data], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date(backup.backup_date).toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Restore DB from an existing backup archive by ID
async function restoreFromBackup(backupId) {
    if (!confirm('WARNING: This will replace all current data with the selected backup. Are you sure?')) return;

    const backup = allBackups.find(b => b.id === backupId);
    if (!backup) {
        alert('Backup data not found!');
        return;
    }

    // Implement your database restore logic here
    alert('Restore from backup archive requires implementation of DB data replacement.');
}

// Create automatic monthly backup on the 5th day
async function checkAutoBackup() {
    const today = new Date();
    if (today.getDate() !== 5) return;

    const lastAutoBackup = localStorage.getItem('lastAutoBackup');
    const currentMonth = `${today.getFullYear()}-${today.getMonth()}`;

    if (lastAutoBackup === currentMonth) return; // Already backed up this month

    try {
        const backupData = JSON.stringify(allGuests);
        await DB.saveBackup(backupData);
        localStorage.setItem('lastAutoBackup', currentMonth);
        console.log('Automatic monthly backup created.');
    } catch (error) {
        console.error('Auto backup error:', error);
    }
}

// Expose functions globally
window.createBackup = createBackup;
window.exportData = exportData;
window.restoreBackup = restoreBackup;
window.downloadBackup = downloadBackup;
window.restoreFromBackup = restoreFromBackup;
