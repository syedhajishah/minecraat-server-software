/* ============================================
   MINECRAFT SERVER PANEL - FRONTEND APP
   ============================================ */

// ============================================
// DOM Elements
// ============================================

const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const pageContents = document.querySelectorAll('.page-content');

// Server Control
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const restartBtn = document.getElementById('restartBtn');

// Dashboard
const statusIndicator = document.getElementById('statusIndicator');
const serverStatusText = document.getElementById('serverStatusText');
const uptimeText = document.getElementById('uptimeText');
const memoryText = document.getElementById('memoryText');
const memoryBar = document.getElementById('memoryBar');
const cpuText = document.getElementById('cpuText');
const cpuBar = document.getElementById('cpuBar');
const diskText = document.getElementById('diskText');
const diskBar = document.getElementById('diskBar');
const serverVersion = document.getElementById('serverVersion');
const playerCount = document.getElementById('playerCount');
const lastBackup = document.getElementById('lastBackup');
const pluginList = document.getElementById('pluginList');
const sidebarStatus = document.getElementById('sidebarStatus');

// Console
const consoleOutput = document.getElementById('consoleOutput');
const commandForm = document.getElementById('commandForm');
const commandInput = document.getElementById('commandInput');
const consoleTabs = document.querySelectorAll('.tab-btn');
const clearConsoleBtn = document.getElementById('clearConsoleBtn');
const copyConsoleBtn = document.getElementById('copyConsoleBtn');
const consoleLoading = document.getElementById('consoleLoading');

// File Manager
const fileList = document.getElementById('fileList');
const fileSearch = document.getElementById('fileSearch');
const refreshFilesBtn = document.getElementById('refreshFilesBtn');
const uploadFilesBtn = document.getElementById('uploadFilesBtn');
const createFolderBtn = document.getElementById('createFolderBtn');
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const breadcrumb = document.getElementById('breadcrumb');

// Modals
const editorModal = document.getElementById('editorModal');
const editorTitle = document.getElementById('editorTitle');
const editorContent = document.getElementById('editorContent');
const saveFileBtn = document.getElementById('saveFileBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const createFolderModal = document.getElementById('createFolderModal');
const folderName = document.getElementById('folderName');
const createFolderConfirmBtn = document.getElementById('createFolderConfirmBtn');
const cancelFolderBtn = document.getElementById('cancelFolderBtn');
const renameModal = document.getElementById('renameModal');
const newFileName = document.getElementById('newFileName');
const confirmRenameBtn = document.getElementById('confirmRenameBtn');
const cancelRenameBtn = document.getElementById('cancelRenameBtn');

// Other
const logoutBtn = document.getElementById('logoutBtn');
const toastContainer = document.getElementById('toastContainer');
const loadingOverlay = document.getElementById('loadingOverlay');

// ============================================
// State
// ============================================

let currentPath = '.';
let activeFilePath = null;
let filterMode = 'all';
let consoleLogs = [];
let serverStartTime = null;

// ============================================
// Socket.io Setup
// ============================================

const socket = io();

socket.on('connect', () => {
    showToast('Connected to server', 'info');
});

socket.on('disconnect', () => {
    showToast('Disconnected from server', 'warning');
});

socket.on('console', (data) => {
    const { text = data, level = 'INFO' } = typeof data === 'string' ? { text: data } : data;
    addConsoleLog(text, level);
});

socket.on('status', (payload) => {
    updateServerStatus(payload);
});

// ============================================
// Utility Functions
// ============================================

async function requestJson(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || response.statusText);
        }
        return response.json();
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date) {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

function pathJoin(base, segment) {
    if (base === '.' || base === '') return segment;
    return `${base.replace(/\\/g, '/')}/${segment}`;
}

function pathDir(path) {
    const parts = path.split('/');
    parts.pop();
    return parts.length === 0 ? '.' : parts.join('/');
}

function getFileIcon(name, isDirectory) {
    if (isDirectory) return '📁';
    const ext = name.split('.').pop().toLowerCase();
    const icons = {
        'jar': '🧩',
        'yml': '⚙️',
        'yaml': '⚙️',
        'json': '📄',
        'txt': '📝',
        'properties': '⚙️',
        'md': '📖',
        'log': '📋'
    };
    return icons[ext] || '📄';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showLoading(show = true) {
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

// ============================================
// Page Navigation
// ============================================

function switchPage(page) {
    pageContents.forEach(p => p.classList.add('hidden'));
    document.getElementById(`${page}-page`).classList.remove('hidden');

    navItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Server overview and statistics' },
        console: { title: 'Console', subtitle: 'Server logs and commands' },
        files: { title: 'File Manager', subtitle: 'Manage server files' }
    };

    const { title, subtitle } = titles[page];
    pageTitle.textContent = title;
    pageSubtitle.textContent = subtitle;

    if (page === 'console' && consoleLogs.length > 0) {
        displayConsole();
    }
}

// ============================================
// Console Management
// ============================================

function addConsoleLog(text, level = 'INFO') {
    consoleLogs.push({
        text,
        level,
        timestamp: new Date().toLocaleTimeString()
    });

    if (consoleLogs.length > 5000) {
        consoleLogs.shift();
    }
}

function filterConsoleByLevel(logs, level) {
    if (level === 'all') return logs;
    return logs.filter(log => log.level.toUpperCase() === level.toUpperCase());
}

function displayConsole() {
    const filtered = filterConsoleByLevel(consoleLogs, filterMode);
    consoleOutput.innerHTML = filtered.map(log => {
        const color = {
            'INFO': '#7ee787',
            'WARN': '#ffd700',
            'WARNING': '#ffd700',
            'ERROR': '#ff6b6b',
            'SUCCESS': '#22c55e'
        }[log.level.toUpperCase()] || '#7ee787';

        return `<span style="color: ${color}">[${log.timestamp}] ${log.level}: ${escapeHtml(log.text)}</span>`;
    }).join('');

    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Server Control
// ============================================

async function updateServerStatus(payload) {
    const { running } = payload;
    const state = running ? 'online' : 'offline';

    statusIndicator.setAttribute('data-state', state);
    sidebarStatus.setAttribute('data-state', state);
    serverStatusText.textContent = running ? 'Running' : 'Offline';
    sidebarStatus.innerHTML = `<span class="status-dot"></span><span>${running ? 'Online' : 'Offline'}</span>`;

    startBtn.disabled = running;
    stopBtn.disabled = !running;
    restartBtn.disabled = !running;

    if (running) {
        serverStartTime = Date.now();
        startMonitoring();
    } else {
        serverStartTime = null;
        serverStartTime = null;
    }
}

function startMonitoring() {
    const interval = setInterval(async () => {
        try {
            const status = await requestJson('/api/status');
            if (status.uptime) {
                uptimeText.textContent = formatUptime(status.uptime);
            }

            if (status.memory) {
                const used = Math.round(status.memory.heapUsed / 1024 / 1024);
                const max = Math.round(status.memory.heapTotal / 1024 / 1024);
                memoryText.textContent = `${used}/${max} MB`;
                memoryBar.style.width = `${(used / max) * 100}%`;
            }

            // Simple CPU estimation (would need os-utils for real CPU usage)
            cpuText.textContent = '0%';
            cpuBar.style.width = '0%';

            // Disk usage estimation
            diskText.textContent = 'N/A';
            diskBar.style.width = '50%';
        } catch (error) {
            clearInterval(interval);
        }
    }, 2000);
}

// ============================================
// File Manager
// ============================================

async function refreshFiles(path = '.') {
    try {
        showLoading(true);
        currentPath = path;
        const data = await requestJson(`/api/files?path=${encodeURIComponent(path)}`);

        // Update breadcrumb
        updateBreadcrumb(path);

        // Render files
        fileList.innerHTML = '';
        if (data.items.length === 0) {
            fileList.innerHTML = '<div class="empty-state">No files in this directory</div>';
            showLoading(false);
            return;
        }

        // Sort: directories first, then alphabetical
        const sorted = data.items.sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) {
                return b.isDirectory - a.isDirectory;
            }
            return a.name.localeCompare(b.name);
        });

        sorted.forEach(item => {
            const row = document.createElement('div');
            row.className = 'file-item';
            const fullPath = pathJoin(currentPath, item.name);
            const size = formatBytes(item.size);
            const date = formatDate(item.modified);

            row.innerHTML = `
                <div class="file-name" data-path="${fullPath}" data-is-dir="${item.isDirectory}">
                    <span class="file-icon">${getFileIcon(item.name, item.isDirectory)}</span>
                    <span class="file-name-text">${escapeHtml(item.name)}</span>
                </div>
                <div class="file-size">${size}</div>
                <div class="file-date">${date}</div>
                <div class="file-actions">
                    <button class="file-action-btn" title="Edit">✏️</button>
                    <button class="file-action-btn" title="Download">⬇️</button>
                    <button class="file-action-btn" title="Rename">↪️</button>
                    <button class="file-action-btn" title="Delete">🗑️</button>
                </div>
            `;

            // File name click - open folder or edit
            const fileName = row.querySelector('.file-name');
            fileName.addEventListener('dblclick', () => {
                if (item.isDirectory) {
                    refreshFiles(fullPath);
                } else {
                    openFile(fullPath);
                }
            });

            // Action buttons
            const buttons = row.querySelectorAll('.file-action-btn');
            buttons[0].addEventListener('click', () => openFile(fullPath)); // Edit
            buttons[1].addEventListener('click', () => downloadFile(fullPath)); // Download
            buttons[2].addEventListener('click', () => showRenameModal(fullPath, item.name)); // Rename
            buttons[3].addEventListener('click', () => deleteFile(fullPath)); // Delete

            fileList.appendChild(row);
        });

        showLoading(false);
    } catch (error) {
        showLoading(false);
        showToast('Failed to load files', 'error');
    }
}

function updateBreadcrumb(path) {
    breadcrumb.innerHTML = '';
    const parts = path === '.' ? [] : path.split('/');

    const root = document.createElement('span');
    root.className = 'breadcrumb-item' + (path === '.' ? ' active' : '');
    root.textContent = 'Root';
    root.addEventListener('click', () => refreshFiles('.'));
    breadcrumb.appendChild(root);

    parts.forEach((part, index) => {
        const fullPath = parts.slice(0, index + 1).join('/');
        const item = document.createElement('span');
        item.className = 'breadcrumb-item' + (fullPath === path ? ' active' : '');
        item.textContent = part;
        item.addEventListener('click', () => refreshFiles(fullPath));
        breadcrumb.appendChild(item);
    });
}

async function openFile(path) {
    try {
        const data = await requestJson('/api/files/read', {
            method: 'POST',
            body: JSON.stringify({ path })
        });
        activeFilePath = path;
        editorTitle.textContent = path;
        editorContent.value = data.content;
        openModal(editorModal);
        editorContent.focus();
    } catch (error) {
        showToast('Failed to open file', 'error');
    }
}

async function saveFile() {
    try {
        if (!activeFilePath) return;
        showLoading(true);
        await requestJson('/api/files/write', {
            method: 'POST',
            body: JSON.stringify({ path: activeFilePath, content: editorContent.value })
        });
        closeModal(editorModal);
        refreshFiles(currentPath);
        showToast('File saved successfully', 'success');
    } catch (error) {
        showToast('Failed to save file', 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteFile(path) {
    if (!confirm(`Are you sure you want to delete this file?`)) return;

    try {
        showLoading(true);
        await requestJson('/api/files/delete', {
            method: 'POST',
            body: JSON.stringify({ path })
        });
        refreshFiles(currentPath);
        showToast('File deleted', 'success');
    } catch (error) {
        showToast('Failed to delete file', 'error');
    } finally {
        showLoading(false);
    }
}

function downloadFile(path) {
    window.location.href = `/api/files/download?path=${encodeURIComponent(path)}`;
}

function showRenameModal(path, name) {
    activeFilePath = path;
    newFileName.value = name;
    openModal(renameModal);
    newFileName.focus();
}

async function renameFile() {
    try {
        const newName = newFileName.value.trim();
        if (!newName) return;

        const newPath = pathJoin(pathDir(activeFilePath), newName);
        showLoading(true);
        await requestJson('/api/files/rename', {
            method: 'POST',
            body: JSON.stringify({ oldPath: activeFilePath, newPath })
        });
        closeModal(renameModal);
        refreshFiles(currentPath);
        showToast('File renamed', 'success');
    } catch (error) {
        showToast('Failed to rename file', 'error');
    } finally {
        showLoading(false);
    }
}

async function createFolder() {
    try {
        const name = folderName.value.trim();
        if (!name) return;

        const newPath = pathJoin(currentPath, name);
        showLoading(true);
        await requestJson('/api/files/mkdir', {
            method: 'POST',
            body: JSON.stringify({ path: newPath })
        });
        closeModal(createFolderModal);
        folderName.value = '';
        refreshFiles(currentPath);
        showToast('Folder created', 'success');
    } catch (error) {
        showToast('Failed to create folder', 'error');
    } finally {
        showLoading(false);
    }
}

async function uploadFiles(files) {
    try {
        for (const file of files) {
            showLoading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', currentPath);

            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Failed to upload ${file.name}`);
            }
        }

        showToast(`${files.length} file(s) uploaded`, 'success');
        refreshFiles(currentPath);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ============================================
// Server Commands
// ============================================

async function startServer() {
    try {
        startBtn.disabled = true;
        showToast('Starting server...', 'info');
        await requestJson('/api/server/start', { method: 'POST' });
    } catch (error) {
        startBtn.disabled = false;
    }
}

async function stopServer() {
    try {
        stopBtn.disabled = true;
        showToast('Stopping server...', 'info');
        await requestJson('/api/server/stop', { method: 'POST' });
    } catch (error) {
        stopBtn.disabled = false;
    }
}

async function restartServer() {
    try {
        restartBtn.disabled = true;
        showToast('Restarting server...', 'info');
        await requestJson('/api/server/stop', { method: 'POST' });
        setTimeout(() => requestJson('/api/server/start', { method: 'POST' }), 2000);
    } catch (error) {
        restartBtn.disabled = false;
    }
}

async function sendCommand() {
    const command = commandInput.value.trim();
    if (!command) return;

    try {
        await requestJson('/api/server/command', {
            method: 'POST',
            body: JSON.stringify({ command })
        });
        commandInput.value = '';
        showToast('Command sent', 'success');
    } catch (error) {
        showToast('Failed to send command', 'error');
    }
}

// ============================================
// Event Listeners
// ============================================

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', () => {
        switchPage(item.getAttribute('data-page'));
    });
});

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Server Control
startBtn.addEventListener('click', startServer);
stopBtn.addEventListener('click', stopServer);
restartBtn.addEventListener('click', restartServer);

// Console
commandForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendCommand();
});

consoleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        consoleTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filterMode = tab.getAttribute('data-filter');
        displayConsole();
    });
});

clearConsoleBtn.addEventListener('click', () => {
    consoleLogs = [];
    consoleOutput.innerHTML = '';
});

copyConsoleBtn.addEventListener('click', () => {
    const text = consoleLogs.map(log => `[${log.timestamp}] ${log.level}: ${log.text}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard', 'success');
    });
});

// File Manager
refreshFilesBtn.addEventListener('click', () => refreshFiles(currentPath));
uploadFilesBtn.addEventListener('click', () => fileInput.click());
createFolderBtn.addEventListener('click', () => openModal(createFolderModal));

fileInput.addEventListener('change', (e) => {
    uploadFiles(Array.from(e.target.files));
    fileInput.value = '';
});

fileSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.file-item').forEach(item => {
        const name = item.querySelector('.file-name-text').textContent.toLowerCase();
        item.style.display = name.includes(term) ? '' : 'none';
    });
});

// Drag and drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    uploadFiles(Array.from(e.dataTransfer.files));
});

uploadZone.addEventListener('click', () => fileInput.click());

// Editor Modal
saveFileBtn.addEventListener('click', saveFile);
cancelEditBtn.addEventListener('click', () => closeModal(editorModal));

// Create Folder Modal
createFolderConfirmBtn.addEventListener('click', createFolder);
cancelFolderBtn.addEventListener('click', () => closeModal(createFolderModal));

// Rename Modal
confirmRenameBtn.addEventListener('click', renameFile);
cancelRenameBtn.addEventListener('click', () => closeModal(renameModal));

// Modal close buttons
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        closeModal(e.target.closest('.modal'));
    });
});

// Auth
logoutBtn.addEventListener('click', async () => {
    try {
        await requestJson('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    } catch (error) {
        showToast('Logout failed', 'error');
    }
});

// ============================================
// Initialization
// ============================================

(async () => {
    try {
        showLoading(true);
        const auth = await requestJson('/api/auth/status');
        if (!auth.authenticated) {
            window.location.href = '/login';
            return;
        }

        const status = await requestJson('/api/status');
        updateServerStatus(status);

        refreshFiles();
        displayConsole();

        showLoading(false);
    } catch (error) {
        showToast('Failed to initialize', 'error');
        showLoading(false);
    }
})();

