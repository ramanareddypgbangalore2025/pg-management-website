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

  // Setup file input listener for restore-from-file
  const restoreInput = document.getElementById('restoreInput');
  if (restoreInput) {
    restoreInput.addEventListener('change', restoreBackupFromFile);
  }
});

// Load guest data and backups from DB, update UI
async function loadStorageData() {
  try {
    allGuests = await DB.getGuests();
    allBackups = await DB.getBackups(); // returns latest 1 backup in your DB helper[file:125]

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
    archivesList.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;padding:16px;">
          No backups available
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  allBackups.forEach((backup, index) => {
    const backupDate = new Date(backup.backup_date);
    const recordCount = backup.data ? JSON.parse(backup.data).length : 0;

    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${backupDate.toLocaleString()}</td>
        <td>${recordCount}</td>
        <td>
          <button class="btn-small" onclick="downloadBackup('${backup.id}')">
            ⬇️ Download
          </button>
          <button class="btn-small" onclick="restoreBackup('${backup.id}')">
            ↩️ Restore
          </button>
        </td>
      </tr>
    `;
  });

  archivesList.innerHTML = html;
}

// Create immediate backup of current guests
async function backupNow() {
  try {
    const guests = await DB.getGuests();
    if (!guests || guests.length === 0) {
      alert('No guest data to backup');
      return;
    }

    const backupJson = JSON.stringify(guests);

    // DB.saveBackup(backupData) is already defined in supabase-client.js[file:125]
    const result = await DB.saveBackup(backupJson);

    if (!result || !result.success) {
      alert('Failed to save backup');
      return;
    }

    alert(`Backup created with ${guests.length} records`);
    await loadStorageData();
  } catch (error) {
    console.error('Backup error:', error);
    alert('Backup failed: ' + error.message);
  }
}

// Download a backup from DB as JSON file
function downloadBackup(backupId) {
  const backup = allBackups.find(b => b.id === backupId);
  if (!backup) {
    alert('Backup not found');
    return;
  }

  const data = backup.data ? JSON.parse(backup.data) : [];
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `pg-backup-${new Date(backup.backup_date).toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Restore data from a backup stored in DB
async function restoreBackup(backupId) {
  const confirmed = confirm('This will replace all current guests with the selected backup. Continue?');
  if (!confirmed) return;

  try {
    const backup = allBackups.find(b => b.id === backupId);
    if (!backup || !backup.data) {
      alert('Backup data not found');
      return;
    }

    const data = JSON.parse(backup.data);
    if (!Array.isArray(data)) {
      alert('Backup format invalid');
      return;
    }

    // Delete all current guests
    const current = await DB.getGuests();
    for (const g of current) {
      await DB.deleteGuest(g.id);
    }

    // Insert guests from backup
    for (const g of data) {
      await DB.addGuest(g);
    }

    alert(`Restored ${data.length} records from backup`);
    await loadStorageData();
  } catch (error) {
    console.error('Restore error:', error);
    alert('Restore failed: ' + error.message);
  }
}

// Restore from uploaded JSON file
async function restoreBackupFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const confirmed = confirm('This will replace all current guests with data from the file. Continue?');
  if (!confirmed) {
    event.target.value = '';
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data)) {
      alert('Invalid backup file format');
      event.target.value = '';
      return;
    }

    const current = await DB.getGuests();
    for (const g of current) {
      await DB.deleteGuest(g.id);
    }

    for (const g of data) {
      await DB.addGuest(g);
    }

    alert(`Restored ${data.length} records from file`);
    event.target.value = '';
    await loadStorageData();
  } catch (error) {
    console.error('File restore error:', error);
    alert('File restore failed: ' + error.message);
    event.target.value = '';
  }
}

// Download current guests directly (not from backups)
async function downloadCurrentGuests() {
  try {
    const guests = await DB.getGuests();
    const blob = new Blob([JSON.stringify(guests, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'pg-current-guests.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download guests error:', error);
    alert('Failed to download guests: ' + error.message);
  }
}

// Auto backup once per day (optional)
async function checkAutoBackup() {
  try {
    const backups = await DB.getBackups();
    if (!backups || backups.length === 0) {
      await backupNow();
      return;
    }

    const last = new Date(backups[0].backup_date);
    const now = new Date();
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

    if (diffDays >= 1) {
      await backupNow();
    }
  } catch (error) {
    console.error('Auto-backup check error:', error);
  }
}

// Expose to global for HTML buttons
window.backupNow = backupNow;
window.downloadBackup = downloadBackup;
window.restoreBackup = restoreBackup;
window.restoreBackupFromFile = restoreBackupFromFile;
window.downloadCurrentGuests = downloadCurrentGuests;
window.loadStorageData = loadStorageData;
